import { useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Upload, X } from "lucide-react";
import { supabase } from "../lib/supabase";

const REQUIRED_HEADERS = ["name", "category", "description", "price", "stock_quantity"];
const TEMPLATE_HEADERS = [...REQUIRED_HEADERS, "image_url", "image_urls", "featured", "is_active"];
const MAX_FILE_SIZE = 1024 * 1024;
const MAX_ROWS = 250;

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error("The CSV contains an unclosed quoted value.");
  row.push(field);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function parseBoolean(value, fallback) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return fallback;
  if (["true", "yes", "1"].includes(normalized)) return true;
  if (["false", "no", "0"].includes(normalized)) return false;
  return null;
}

function isWebUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function quoteCsv(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export default function BulkProductImport({ categories, existingProducts, onImported }) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [importing, setImporting] = useState(false);

  const validCount = useMemo(() => preview.filter((row) => !row.errors.length).length, [preview]);
  const invalidCount = preview.length - validCount;

  function reset() {
    setFileName("");
    setPreview([]);
    setError("");
    setSuccess("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function downloadTemplate() {
    const exampleCategory = categories[0] || "Cookware";
    const content = [
      TEMPLATE_HEADERS.join(","),
      [
        "Example cooking pot",
        exampleCategory,
        "A durable everyday cooking pot.",
        "250",
        "12",
        "https://example.com/pot.jpg",
        "https://example.com/pot-side.jpg|https://example.com/pot-lid.jpg",
        "false",
        "true",
      ].map(quoteCsv).join(","),
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "dorisware-product-import-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function readFile(file) {
    reset();
    if (!file) return;
    setFileName(file.name);
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Choose a CSV file created from the DorisWare template.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("The CSV must be 1 MB or smaller.");
      return;
    }

    try {
      const parsed = parseCsv((await file.text()).replace(/^\uFEFF/, ""));
      if (parsed.length < 2) throw new Error("The CSV does not contain any product rows.");
      if (parsed.length - 1 > MAX_ROWS) throw new Error(`Import up to ${MAX_ROWS} products at a time.`);

      const headers = parsed[0].map((header) => header.trim().toLowerCase());
      const missingHeaders = REQUIRED_HEADERS.filter((header) => !headers.includes(header));
      const duplicateHeaders = headers.filter((header, index) => header && headers.indexOf(header) !== index);
      if (missingHeaders.length) throw new Error(`Missing required columns: ${missingHeaders.join(", ")}.`);
      if (duplicateHeaders.length) throw new Error(`Duplicate columns: ${[...new Set(duplicateHeaders)].join(", ")}.`);

      const headerIndex = Object.fromEntries(headers.map((header, index) => [header, index]));
      const categoryMap = new Map(categories.map((category) => [category.toLowerCase(), category]));
      const unavailableIds = new Set(existingProducts.map((product) => product.id));
      const fileIds = new Set();

      const rows = parsed.slice(1).map((values, index) => {
        const value = (header) => (values[headerIndex[header]] ?? "").trim();
        const name = value("name");
        const id = slugify(name);
        const categoryInput = value("category");
        const category = categoryMap.get(categoryInput.toLowerCase());
        const description = value("description");
        const price = Number(value("price"));
        const stock = Number(value("stock_quantity"));
        const imageUrl = value("image_url");
        const imageUrls = value("image_urls").split("|").map((url) => url.trim()).filter(Boolean);
        const featured = parseBoolean(value("featured"), false);
        const isActive = parseBoolean(value("is_active"), true);
        const errors = [];

        if (!name) errors.push("Name is required");
        if (!id) errors.push("Name must contain letters or numbers");
        if (unavailableIds.has(id)) errors.push("A product with this name already exists");
        if (fileIds.has(id)) errors.push("Duplicate product name in this file");
        if (!category) errors.push(`Category must be one of: ${categories.join(", ") || "create an active category first"}`);
        if (!description) errors.push("Description is required");
        if (!Number.isFinite(price) || price < 0) errors.push("Price must be 0 or more");
        if (!Number.isInteger(stock) || stock < 0) errors.push("Stock must be a whole number of 0 or more");
        if (!isWebUrl(imageUrl) || imageUrls.some((url) => !isWebUrl(url))) errors.push("Image links must be valid http or https URLs");
        if (featured === null) errors.push("Featured must be true or false");
        if (isActive === null) errors.push("Active must be true or false");
        if (id) fileIds.add(id);

        const allImages = [...new Set([imageUrl, ...imageUrls].filter(Boolean))];
        return {
          rowNumber: index + 2,
          errors,
          data: {
            id,
            name,
            category: category || categoryInput,
            description,
            price,
            stock_quantity: stock,
            image_url: allImages[0] || null,
            image_urls: allImages,
            featured: featured ?? false,
            is_active: isActive ?? true,
          },
        };
      });
      setPreview(rows);
    } catch (fileError) {
      setError(fileError.message || "The CSV could not be read.");
    }
  }

  async function importProducts() {
    if (!preview.length || invalidCount) return;
    setImporting(true);
    setError("");
    setSuccess("");
    const { data, error: insertError } = await supabase
      .from("products")
      .insert(preview.map((row) => row.data))
      .select("id, name, category, description, price, stock_quantity, image_url, image_urls, featured, is_active");
    setImporting(false);
    if (insertError) {
      setError(insertError.message || "Products could not be imported.");
      return;
    }
    onImported(data || []);
    setSuccess(`${data?.length || preview.length} products imported successfully.`);
    setPreview([]);
    setFileName("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <section className="mt-6 rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm dark:border-emerald-950/60 dark:bg-stone-900 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"><FileSpreadsheet size={19} /></span>
          <div><p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-700 dark:text-emerald-400">Product catalogue</p><h2 className="mt-1 text-xl font-semibold text-stone-900 dark:text-stone-100">Bulk product import</h2><p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Add up to {MAX_ROWS} products from a CSV. Nothing is saved until every row passes validation.</p></div>
        </div>
        <button type="button" onClick={downloadTemplate} className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950/30"><Download size={16} /> Download template</button>
      </div>

      <div className="mt-5 rounded-2xl border border-dashed border-stone-300 bg-stone-50/70 p-5 text-center dark:border-stone-700 dark:bg-stone-800/40">
        <input ref={inputRef} id="bulk-product-csv" type="file" accept=".csv,text/csv" onChange={(event) => readFile(event.target.files?.[0])} className="sr-only" />
        <Upload className="mx-auto text-stone-400" size={24} />
        <p className="mt-2 text-sm font-semibold text-stone-800 dark:text-stone-100">{fileName || "Choose your completed CSV"}</p>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Image columns accept public image links; separate extra images with |</p>
        <label htmlFor="bulk-product-csv" className="mt-4 inline-flex cursor-pointer rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white">Choose CSV</label>
      </div>

      {error && <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300"><AlertCircle className="mt-0.5 shrink-0" size={17} /> {error}</p>}
      {success && <p role="status" className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"><CheckCircle2 size={17} /> {success}</p>}

      {preview.length > 0 && <div className="mt-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Preview: <span className="text-emerald-700 dark:text-emerald-400">{validCount} valid</span>{invalidCount > 0 && <span className="text-red-600 dark:text-red-400"> · {invalidCount} need attention</span>}</p><button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-white"><X size={15} /> Clear file</button></div>
        <div className="mt-3 max-h-96 overflow-auto rounded-2xl border border-stone-200 dark:border-stone-700"><table className="w-full min-w-[720px] text-left text-sm"><thead className="sticky top-0 bg-stone-100 text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-800 dark:text-stone-400"><tr><th className="px-4 py-3">Row</th><th className="px-4 py-3">Product</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-stone-100 dark:divide-stone-800">{preview.map((row) => <tr key={row.rowNumber} className={row.errors.length ? "bg-red-50/60 dark:bg-red-950/10" : ""}><td className="px-4 py-3 text-stone-500">{row.rowNumber}</td><td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-100">{row.data.name || "—"}</td><td className="px-4 py-3 text-stone-600 dark:text-stone-300">{row.data.category || "—"}</td><td className="px-4 py-3 text-stone-600 dark:text-stone-300">{Number.isFinite(row.data.price) ? `₵${row.data.price.toFixed(2)}` : "—"}</td><td className="px-4 py-3 text-stone-600 dark:text-stone-300">{Number.isFinite(row.data.stock_quantity) ? row.data.stock_quantity : "—"}</td><td className="max-w-xs px-4 py-3">{row.errors.length ? <span className="text-xs text-red-600 dark:text-red-400">{row.errors.join(" · ")}</span> : <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400"><CheckCircle2 size={14} /> Ready</span>}</td></tr>)}</tbody></table></div>
        <button type="button" onClick={importProducts} disabled={importing || invalidCount > 0} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"><Upload size={16} /> {importing ? "Importing products…" : invalidCount ? "Fix CSV errors before importing" : `Import ${validCount} product${validCount === 1 ? "" : "s"}`}</button>
      </div>}
    </section>
  );
}

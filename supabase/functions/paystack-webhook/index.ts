import { createClient } from "npm:@supabase/supabase-js@2";

function getDefaultKey(variableName: string, legacyVariableName: string) {
  const configuredKeys = Deno.env.get(variableName);
  if (configuredKeys) return JSON.parse(configuredKeys).default;
  return Deno.env.get(legacyVariableName);
}

function hexToBytes(value: string) {
  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < value.length; index += 2) {
    bytes[index / 2] = Number.parseInt(value.slice(index, index + 2), 16);
  }
  return bytes;
}

Deno.serve(async (request) => {
  try {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = getDefaultKey("SUPABASE_SECRET_KEYS", "SUPABASE_SERVICE_ROLE_KEY");
    const signature = request.headers.get("x-paystack-signature");
    const rawBody = await request.text();

    if (!paystackSecretKey || !supabaseUrl || !serviceKey || !signature) {
      return new Response("Unauthorized", { status: 401 });
    }

    const signingKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(paystackSecretKey),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["verify"],
    );
    const signatureIsValid = await crypto.subtle.verify(
      "HMAC",
      signingKey,
      hexToBytes(signature),
      new TextEncoder().encode(rawBody),
    );
    if (!signatureIsValid) return new Response("Invalid signature", { status: 401 });

    const event = JSON.parse(rawBody);
    if (event.event !== "charge.success") {
      return Response.json({ received: true });
    }

    const reference = event.data?.reference;
    if (!reference) return new Response("Missing reference", { status: 400 });

    const verificationResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${paystackSecretKey}` } },
    );
    const verification = await verificationResponse.json();
    if (!verificationResponse.ok || !verification.status || verification.data?.status !== "success") {
      return new Response("Payment could not be verified", { status: 400 });
    }

    const database = createClient(supabaseUrl, serviceKey);
    const { error } = await database.rpc("complete_paid_order", {
      p_payment_reference: reference,
    });
    if (error) throw error;

    return Response.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook processing failed.";
    console.error(message);
    return new Response("Webhook processing failed", { status: 500 });
  }
});

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getDefaultKey(variableName: string, legacyVariableName: string) {
  const configuredKeys = Deno.env.get(variableName);
  return configuredKeys ? JSON.parse(configuredKeys).default : Deno.env.get(legacyVariableName);
}

function clientAddress(request: Request) {
  return request.headers.get("cf-connecting-ip")
    || request.headers.get("x-real-ip")
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return Response.json({ error: "Method not allowed." }, { status: 405, headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = getDefaultKey("SUPABASE_SECRET_KEYS", "SUPABASE_SERVICE_ROLE_KEY");
    const turnstileSecret = Deno.env.get("TURNSTILE_SECRET_KEY");
    if (!supabaseUrl || !serviceKey || !turnstileSecret) throw new Error("Public form service is not configured.");

    const { formType, turnstileToken, payload } = await request.json();
    if (!turnstileToken || !payload || !["newsletter", "support"].includes(formType)) {
      return Response.json({ error: "Complete the security check and try again." }, { status: 400, headers: corsHeaders });
    }

    const address = clientAddress(request);
    const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: turnstileSecret, response: turnstileToken, remoteip: address }),
    });
    const verificationResult = await verification.json();
    if (!verification.ok || !verificationResult.success) {
      return Response.json({ error: "The security check expired. Please complete it again." }, { status: 400, headers: corsHeaders });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const rpc = formType === "newsletter" ? "submit_verified_newsletter" : "submit_verified_support_message";
    const params = formType === "newsletter"
      ? { p_email: String(payload.email || ""), p_client_address: address }
      : {
          p_first_name: String(payload.first_name || ""), p_last_name: String(payload.last_name || ""),
          p_email: String(payload.email || ""), p_phone: String(payload.phone || ""),
          p_subject: String(payload.subject || ""), p_message: String(payload.message || ""),
          p_message_type: String(payload.message_type || "support"), p_client_address: address,
        };
    const { error } = await admin.rpc(rpc, params);
    if (error) {
      const message = error.message?.includes("Too many requests") ? "Too many attempts. Please wait and try again." : "We could not save your submission. Please check the details and try again.";
      return Response.json({ error: message }, { status: 400, headers: corsHeaders });
    }

    return Response.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "We could not process your submission.";
    return Response.json({ error: message }, { status: 500, headers: corsHeaders });
  }
});

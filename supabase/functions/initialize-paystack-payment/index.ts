import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getDefaultKey(variableName: string, legacyVariableName: string) {
  const configuredKeys = Deno.env.get(variableName);
  if (configuredKeys) {
    return JSON.parse(configuredKeys).default;
  }
  return Deno.env.get(legacyVariableName);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = getDefaultKey("SUPABASE_SECRET_KEYS", "SUPABASE_SERVICE_ROLE_KEY");
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    const authorization = request.headers.get("Authorization");

    if (!supabaseUrl || !serviceKey || !paystackSecretKey) {
      throw new Error("Payment service is not configured.");
    }
    if (!authorization) {
      return Response.json({ error: "Sign in before paying." }, { status: 401, headers: corsHeaders });
    }

    const authenticatedClient = createClient(supabaseUrl, serviceKey, {
      global: { headers: { Authorization: authorization } },
    });
    const { data: { user }, error: userError } = await authenticatedClient.auth.getUser();
    if (userError || !user) {
      return Response.json({ error: "Your session has expired. Please sign in again." }, { status: 401, headers: corsHeaders });
    }

    const { orderId } = await request.json();
    if (!orderId) {
      return Response.json({ error: "An order is required." }, { status: 400, headers: corsHeaders });
    }

    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: order, error: orderError } = await adminClient
      .from("orders")
      .select("id, order_number, user_id, contact_email, total, currency, payment_status")
      .eq("id", orderId)
      .single();

    if (orderError || !order || order.user_id !== user.id) {
      return Response.json({ error: "Order not found." }, { status: 404, headers: corsHeaders });
    }
    if (order.payment_status === "paid") {
      return Response.json({ error: "This order has already been paid." }, { status: 409, headers: corsHeaders });
    }

    const reference = `DW-${order.order_number}-${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`;
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: order.contact_email,
        amount: Math.round(Number(order.total) * 100),
        currency: order.currency,
        reference,
        channels: ["card", "mobile_money"],
        metadata: { order_id: order.id, order_number: order.order_number },
      }),
    });
    const payment = await paystackResponse.json();
    if (!paystackResponse.ok || !payment.status) {
      throw new Error(payment.message || "Paystack could not start the payment.");
    }

    const { error: updateError } = await adminClient
      .from("orders")
      .update({ payment_reference: reference })
      .eq("id", order.id);
    if (updateError) throw updateError;

    return Response.json({
      authorizationUrl: payment.data.authorization_url,
      reference,
    }, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment could not start.";
    return Response.json({ error: message }, {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

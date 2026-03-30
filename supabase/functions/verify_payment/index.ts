import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { reference } = await req.json();

    if (!reference) {
      return new Response(
        JSON.stringify({ error: "Reference is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      throw new Error("PAYSTACK_SECRET_KEY not configured");
    }

    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok) {
      console.error("Paystack verification error:", paystackData);
      throw new Error(paystackData.message || "Payment verification failed");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (paystackData.data.status === "success") {
      const { order_id } = paystackData.data.metadata;

      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "paid",
          payment_reference: reference,
          paid_at: new Date().toISOString(),
        })
        .eq("id", order_id);

      if (updateError) {
        console.error("Error updating order:", updateError);
        throw new Error("Failed to update order status");
      }
    }

    return new Response(
      JSON.stringify({
        success: paystackData.data.status === "success",
        status: paystackData.data.status,
        amount: paystackData.data.amount / 100,
        reference: paystackData.data.reference,
        message: paystackData.message,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

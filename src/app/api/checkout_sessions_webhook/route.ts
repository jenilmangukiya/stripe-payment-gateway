import Stripe from "stripe";

export async function POST(request: Request) {
  const payload = await request.json();

  try {
    if (payload.type === "checkout.session.completed") {
      const session = payload.data.object as Stripe.Checkout.Session;

      // Save the transaction in the database
      await saveTransactionToDatabase({
        sessionId: session.id,
        email: session.customer_details?.email,
        amount: session.amount_total,
        status: session.payment_status, // "paid" or "unpaid"
        payment_intent: session.payment_intent,
      });
    }

    return new Response("Success", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Webhook error", { status: 400 });
  }
}

async function saveTransactionToDatabase(transaction: {
  sessionId: string;
  email?: string | null;
  amount: number | null;
  status: string | null;
  payment_intent?: unknown;
}) {
  console.log("Saving transaction to the database:", transaction);
  // Add your DB logic here
}

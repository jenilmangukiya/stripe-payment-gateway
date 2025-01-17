import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

export async function POST(request: Request) {
  try {
    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of
          // the product you want to sell
          price_data: {
            currency: "usd", // or dynamically set the currency
            product_data: {
              name: "product.name", // Product name from your database
              description: "product.description", // Optional: Description
            },
            unit_amount: 10 * 100, // Stripe requires the price in cents
          },
          quantity: 1,
        },
      ],

      mode: "payment",
      return_url: `${request.headers.get(
        "origin"
      )}/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    return Response.json({ clientSecret: session.client_secret });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";
    return new Response(errorMessage, {
      status: 500,
    });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id");
    const session = await stripe.checkout.sessions.retrieve(sessionId!);
    return Response.json({
      status: session.status,
      customer_email: session.customer_details?.email,
    });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";
    return new Response(errorMessage, {
      status: 500,
    });
  }
}

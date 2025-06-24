import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import { backendClient } from "@/sanity/lib/backendClient";
import Stripe from "stripe";

// Helper to read the raw body as a buffer
async function buffer(readable: ReadableStream<Uint8Array>) {
  const reader = readable.getReader();
  const chunks = []; // changed from let to const
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks);
}

// Define the type for Stripe session metadata
type OrderMetadata = {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    clerkUserId: string;
};

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  let bodyBuffer: Buffer;

  try {
    bodyBuffer = await buffer(req.body as ReadableStream<Uint8Array>);
    event = stripe.webhooks.constructEvent(bodyBuffer, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await createOrderInSanity(session);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

async function createOrderInSanity(session: Stripe.Checkout.Session) {
    const {
        id,
        amount_total,
        payment_intent,
        customer,
        total_details,
        metadata,
    } = session;

    const { orderNumber, customerName, customerEmail, clerkUserId } = metadata as OrderMetadata;

    const lineItems = await stripe.checkout.sessions.listLineItems(
        id, {
        expand: ["data.price.product"],
    });

    const orderItems = lineItems.data.map((item) => {
      return {
        _key: crypto.randomUUID(),
        product: {
          _type: "reference",
          _ref: (item.price?.product as Stripe.Product).metadata?.id,
        },
        quantity: item.quantity || 0,
      };
    });

    const order = await backendClient.create({
        _type: "order",
        orderNumber,
        stripeCheckoutSessionId: id,
        StripePaymentIntentId: payment_intent,
        customerName,
        StripeCustomerId: customer,
        clerkUserId,
        email: customerEmail,
        amountDiscount: total_details?.amount_discount 
         ? total_details.amount_discount / 100
         : 0,
         products: orderItems,
        totalPrice: amount_total ? amount_total / 100 : 0,
        status: "paid",
        orderDate: new Date().toISOString(),

    });

    return order;
}
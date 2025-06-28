import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import {headers} from "next/headers";
import Stripe from "stripe";
import { Metadata } from "@/actions/createCheckOutSession";
import { serverClient } from "@/sanity/lib/serverClient";


export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Stripe webhook secret is not set");
    return NextResponse.json({ error: "Missing Stripe webhook secret" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  }
  catch (err) {
    console.error("Error constructing Stripe event:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const order = await createOrderInSanity(session);
      console.log("Order created successfully:", order);
    } catch (error) {
      console.error("Error creating order in Sanity:", error);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });

}

async function createOrderInSanity(session: Stripe.Checkout.Session) {
    const {
        id,
        amount_total,
        metadata,
        payment_intent,
        customer,
        total_details,
    } = session;

    const { orderNumber, customerName, customerEmail, clerkUserId } = metadata as Metadata;

    const lineItems = await stripe.checkout.sessions.listLineItems(
        id, {
        expand: ["data.price.product"],
    });

    // Build order items with owner info (only include owner if present)
    const orderItems = lineItems.data.map((item) => {
      const productId = (item.price?.product as Stripe.Product)?.metadata?.id;
      return {
        _key: crypto.randomUUID(),
        product: {
          _type: "reference",
          _ref: productId,
        },
        quantity: item.quantity || 0,
      };
    });

    const order = await serverClient.create({
        _type: "order",
        orderNumber,
        stripeCheckoutSessionId: id,
        StripePaymentIntentId: payment_intent,
        customerName,
        StripeCustomerId: customer,
        clerkUserId: clerkUserId,
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
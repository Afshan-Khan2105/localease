import { Metadata } from "@/actions/createCheckOutSession";
import stripe from "@/lib/stripe";
import { backendClient } from "@/sanity/lib/backendClient";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
    const body = await req.text();
    const headersList = await headers();
    const sig = headersList.get("stripe-signature");

    if (!sig) {
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
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
        return NextResponse.json(
            { error: "Webhook handler failed" },
            { status: 500 }
        );
    }
}

async function createOrderInSanity(session: Stripe.Checkout.Session) {
    if (!session?.metadata) {
        throw new Error("No session metadata");
    }

    const metadata = session.metadata as Metadata;
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        expand: ["data.price.product"],
    });

    const orderItems = lineItems.data.map((item) => {
        const product = item.price?.product as Stripe.Product;
        return {
            _key: crypto.randomUUID(),
            product: {
                _type: "reference",
                _ref: product.metadata.id,
            },
            quantity: item.quantity,
            price: item.price?.unit_amount ? item.price.unit_amount / 100 : 0,
            productName: product.name,
            productImage: null, // Will be populated through product reference
        };
    });

    const order = await backendClient.create({
        _type: "order",
        orderNumber: metadata.orderNumber,
        customerName: metadata.customerName,
        customerEmail: metadata.customerEmail,
        clerkUserId: metadata.clerkUserId,
        items: orderItems,
        totalAmount: session.amount_total ? session.amount_total / 100 : 0,
        paymentStatus: "paid",
        status: "completed",
        createdAt: new Date().toISOString(),
    });

    return order;
}
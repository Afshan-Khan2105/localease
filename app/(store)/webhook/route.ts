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

    if(!sig){
        return NextResponse.json({error: "No Signature" }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if(!webhookSecret){
        console.log("! Stripe webhook secret is not set.");
        return NextResponse.json(
               {error: "Stripe webhook secret is not set."},
               {status: 400}
        );
    }

    let event: Stripe.Event;

    try{
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

    }catch(err){
        console.error("Webhook signature verification failed: ", err);

        return NextResponse.json(
            {error: `Webhook ERROR: ${err}`},
            {status: 400}
        );
    }

    if(event.type === "checkout.session.completed"){
        const session = event.data.object as Stripe.Checkout.Session;
        try{
            const order = await createOrderInSanity(session);
            console.log("Order created inm Sanity ", order);
        }catch(err) {
            console.log("Error creating order in Sanity: ", err);
            return NextResponse.json(
                { error: "Error creating order"},
                { status: 500}
            );
        }
    }
 
    return NextResponse.json({received: true});
}

async function createOrderInSanity(session: Stripe.Checkout.Session) {
    const {
        id,
        amount_total,
        metadata,
    } = session;

    const { orderNumber, customerName, customerEmail, clerkUserId } = metadata as Metadata;

    // Get line items with expanded product info
    const lineItemsWithProduct = await stripe.checkout.sessions.listLineItems(
        id,
        { expand: ["data.price.product"] }
    );

    // Map line items to Sanity order items
    const sanityItems = lineItemsWithProduct.data.map((item) => {
        let sanityProductId: string | undefined = undefined;

        // If expanded, get from metadata
        if (
            typeof item.price?.product === "object" &&
            item.price?.product &&
            "metadata" in item.price.product &&
            (item.price.product as Stripe.Product).metadata?.id
        ) {
            sanityProductId = (item.price.product as Stripe.Product).metadata.id;
        }

        return {
            _key: crypto.randomUUID(),
            product: sanityProductId
                ? {
                      _type: "reference",
                      _ref: sanityProductId,
                  }
                : undefined,
            quantity: item.quantity || 0,
            price: item.price?.unit_amount ? item.price.unit_amount / 100 : 0,
        };
    });
        
    console.log("Sanity items to be created:", sanityItems);

    // Create order in Sanity
    const order = await backendClient.create({
        _type: "order",
        orderNumber,
        customerEmail,
        customerName,
        clerkUserId,
        items: sanityItems,
        totalAmount: amount_total ? amount_total / 100 : 0,
        status: "completed",
        createdAt: new Date().toISOString(),
    });

    return order;
}
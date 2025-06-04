import type { NextApiRequest, NextApiResponse } from "next";
import { backendClient } from "@/sanity/lib/backendClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { orderData } = req.body;

  try {
    const order = await backendClient.create({
      _type: "order",
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return res.status(200).json({ order });
  } catch (error) {
    const err = error as Error;
    console.error("Error creating order:", err);
    return res.status(500).json({ error: err.message });
  }
}
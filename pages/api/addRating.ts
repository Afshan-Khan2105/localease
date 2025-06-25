import type { NextApiRequest, NextApiResponse } from "next";
import { serverClient } from "@/sanity/lib/serverClient";

// Helper to generate a random key
function randomKey() {
  return Math.random().toString(36).substr(2, 10);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { productId, rating } = req.body;

  try {
    // Add a unique _key to the rating
    const ratingWithKey = { ...rating, _key: randomKey() };

    const updatedProduct = await serverClient
      .patch(productId)
      .setIfMissing({ ratings: [] })
      .append("ratings", [ratingWithKey])
      .commit({ returnDocuments: true });

    res.status(200).json({ ratings: updatedProduct.ratings || [] });
  } catch {
    res.status(500).json({ error: "Failed to add rating" });
  }
}
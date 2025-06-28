import type { NextApiRequest, NextApiResponse } from "next";
import { serverClient } from "@/sanity/lib/serverClient";


// Helper to generate a random key
function randomKey() {
  return Math.random().toString(36).substr(2, 10);
}

function toBlockContent(text: string) {
  return [
    {
      _type: "block",
      _key: randomKey(),
      style: "normal",
      children: [
        {
          _type: "span",
          _key: randomKey(),
          text,
          marks: [],
        },
      ],
      markDefs: [],
    },
  ];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const {
      name,
      slug,
      image,
      images,
      description,
      price,
      stock,
      categories,
      ratings,
      location,
      owner,
    } = req.body;

    // Upload main image if it's a base64 or file object (client should send as base64 or URL)
    let imageAsset = null;
    if (image && image.startsWith("data:")) {
      imageAsset = await serverClient.assets.upload("image", Buffer.from(image.split(",")[1], "base64"));
    }

    // Upload multiple images
    let imagesAssets: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
    if (images && Array.isArray(images)) {
      for (const img of images) {
        if (img && img.startsWith("data:")) {
          const asset = await serverClient.assets.upload("image", Buffer.from(img.split(",")[1], "base64"));
          imagesAssets.push({ _type: "image", asset: { _type: "reference", _ref: asset._id } });
        }
      }
    }

    // Prepare categories as references with _key
    const categoryRefs = (categories || []).map((catId: string) => ({
      _type: "reference",
      _key: randomKey(),
      _ref: catId,
    }));

    // Prepare images with _key (after upload)
    imagesAssets = imagesAssets.map((imgAsset: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
      ...imgAsset,
      _key: randomKey(),
    }));

    // Prepare ratings with _key
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ratingsWithKey = (ratings || []).map((r: any) => ({
      ...r,
      _key: r._key || randomKey(),
    }));

    // Prepare description as blockContent
    const descriptionBlock = Array.isArray(description)
      ? description.map((block: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
          ...block,
          _key: block._key || randomKey(),
          children: (block.children || []).map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (child: any) => ({
              ...child,
              _key: child._key || randomKey(),
            })
          ),
        }))
      : toBlockContent(description);

    // Create product document
    const productDoc = {
      _type: "product",
      name,
      slug: { _type: "slug", current: slug },
      image: imageAsset
        ? { _type: "image", asset: { _type: "reference", _ref: imageAsset._id } }
        : undefined,
      images: imagesAssets, // ensure each has _key
      description: descriptionBlock,
      price: Number(price),
      stock: Number(stock),
      categories: categoryRefs,
      ratings: ratingsWithKey,
      location: location || {},
      owner: owner || {},
    };

    const created = await serverClient.create(productDoc);

    res.status(200).json({ product: created });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add product" });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // Increase to 10MB
    },
  },
};
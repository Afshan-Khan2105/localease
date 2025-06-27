import { NextRequest, NextResponse } from "next/server";
import { getAllProducts } from "@/sanity/lib/products/getAllProducts";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ownerId = searchParams.get("ownerId");
  const ownerEmail = searchParams.get("ownerEmail");
  if (!ownerId && !ownerEmail) {
    return NextResponse.json({ error: "Missing ownerId or ownerEmail" }, { status: 400 });
  }
  const all = await getAllProducts();
  const filtered = all.filter(
    
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (p: any) => 
      (ownerId && p.owner?.id === ownerId) ||
      (ownerEmail && p.owner?.email === ownerEmail)
  );
  return NextResponse.json(filtered);
}
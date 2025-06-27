import { NextRequest, NextResponse } from "next/server";
import { serverClient } from "@/sanity/lib/serverClient";

export async function DELETE(
  req: NextRequest,
  
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any // <-- Use any to bypass the type error
) {
  try {
    await serverClient.delete(context.params.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
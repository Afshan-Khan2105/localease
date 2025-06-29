// File: /app/api/orders/[orderId]/remove-product/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { serverClient } from '@/sanity/lib/serverClient';

// Note: Next.js provides params as a Promise to satisfy type-generated checks
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  // Await the params promise to extract orderId
  const { orderId } = await context.params;
  const { productId } = await req.json();

  if (!orderId || !productId) {
    return NextResponse.json(
      { message: 'orderId and productId are required' },
      { status: 400 }
    );
  }

  try {
    // 1️⃣ Fetch the order’s products array
    const order: { products: Array<{ product: { _ref: string } }> } | null =
      await serverClient.fetch(
        `*[_type == "order" && _id == $orderId][0]{ products }`,
        { orderId }
      );

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    // 2️⃣ Remove the matching product reference
    const updatedProducts = order.products.filter(
      (item) => item.product._ref !== productId
    );

    // 3️⃣ If no products remain, delete the entire document
    if (updatedProducts.length === 0) {
      await serverClient.delete(orderId);
      return NextResponse.json({ deletedOrder: true });
    }

    // 4️⃣ Otherwise, patch the order’s products array
    await serverClient
      .patch(orderId)
      .set({ products: updatedProducts })
      .commit();

    return NextResponse.json({ deletedOrder: false });
  } catch (err) {
    console.error('Error removing product from order:', err);
    return NextResponse.json(
      { message: `Failed to update order: ${(err as Error).message}` },
      { status: 500 }
    );
  }
}

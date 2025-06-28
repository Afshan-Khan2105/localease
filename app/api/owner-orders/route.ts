// /app/api/orders/user/route.ts or similar

import { NextRequest, NextResponse } from "next/server";
import { serverClient } from "@/sanity/lib/serverClient";
import { getAllProducts } from "@/sanity/lib/products/getAllProducts";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ownerId = searchParams.get("ownerId");
  const ownerEmail = searchParams.get("ownerEmail");

  if (!ownerId && !ownerEmail) {
    return NextResponse.json({ error: "Missing ownerId or ownerEmail" }, { status: 400 });
  }

  // ✅ Step 1: Fetch all products from Sanity
  const allProducts = await getAllProducts();

  // ✅ Step 2: Filter products owned by the current user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userProducts = allProducts.filter((p: any) => {  
    const matchId = ownerId && p.owner?.id === ownerId;
    const matchEmail = ownerEmail && p.owner?.email === ownerEmail;
    return matchId || matchEmail;
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userProductIds = new Set(userProducts.map((p: any) => p._id));  

  // ✅ Step 3: Fetch all orders
  const MY_ORDER_QUERY = `
    *[_type == "order"] | order(orderDate desc) {
      _id,
      orderNumber,
      customerName,
      email,
      products[] {
        product-> {
          _id,
          name,
          image { asset->{url} },
          price
        },
        quantity
      },
      amountDiscount,
      totalPrice,
      status,
      orderDate
    }
  `;
  const allOrders = await serverClient.fetch(MY_ORDER_QUERY);

  // ✅ Step 4: Filter orders based on user-owned product IDs
  const filteredOrders = allOrders
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((order: any) => {  
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filteredProducts = order.products?.filter((p: any) => 
        userProductIds.has(p.product?._id)
      ) || [];

      return {
        ...order,
        products: filteredProducts,
      };
    })
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((order: any) => order.products.length > 0);
  // ✅ Step 5: Return the filtered orders
  return NextResponse.json({ orders: filteredOrders });
}

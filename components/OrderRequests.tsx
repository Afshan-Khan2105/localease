import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

type Product = {
  product: { _id?: string; name: string; price: number; image?: { asset?: { url: string } } };
  quantity: number;
};

type DeletionResult = {
  success: boolean;
  product?: Product['product'];
  productName?: string;
  productId?: string;
  error?: string;
};

type Order = {
  _id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  products: Product[];
  amountDiscount?: number;
  totalPrice: number;
  orderDate: string;
  status: string;
};

function formatCurrency(amount: number) {
  return "₹" + amount.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

function OrderCard({
  order,
  onOrderUpdate,
}: {
  order: Order;
  onOrderUpdate: (updatedOrder: Order | null) => void;
}) {
   const [isDeleting, setIsDeleting] = useState<{ [key: string]: boolean }>({});
   const [orderState, setOrderState] = useState<Order>(order);
   const [confirmId, setConfirmId] = useState<string | null>(null);
   const [deletionResult, setDeletionResult] = useState<DeletionResult | null>(null);

  // Inside OrderCard component, after products rendering
    const totalMRP = orderState.products.reduce(
      (sum, p) => sum + p.product.price * p.quantity,
      0
    );
    const discountPercent = orderState.amountDiscount
      ? (orderState.amountDiscount / (orderState.totalPrice + orderState.amountDiscount)) * 100
      : 0;

    const effectiveDiscount = (totalMRP * discountPercent) / 100;
    const finalAmount = totalMRP - effectiveDiscount;

      // Remove product handler
    const handleRemove = async (productId: string) => {
    setIsDeleting((prev) => ({ ...prev, [productId]: true }));
    try {
      const res = await fetch(`/api/orders/${orderState._id}/remove-product`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to remove product');
      const removedProd = orderState.products.find(p => p.product._id === productId)?.product;
       if (data.deletedOrder) {
        setDeletionResult({ success: true, productName: removedProd?.name });
        onOrderUpdate(null);
      } else {
        const updated = { ...orderState, products: orderState.products.filter(p => p.product._id !== productId) };
        setOrderState(updated);
        setDeletionResult({ success: true, productName: removedProd?.name });
        onOrderUpdate(updated);
      }
      } catch (error) {
        setDeletionResult({ success: false, error: (error as Error).message });
      } finally {
        setIsDeleting((prev) => ({ ...prev, [productId]: false }));
        setConfirmId(null);
      }
      };

    // If card should no longer render
    if (!orderState.products.length) {
      return null;
    }
  return (
    <>
    <div className="bg-white rounded-lg shadow p-4 border">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 sm:text-sm text-xs">
        <div>
          <span className="font-semibold text-zinc-700">Order #</span>{' '}
          <span className="ml-1 animate-pulse duration-800 text-orange-400">{orderState.orderNumber}</span>
        </div>
        <div className="text-sm text-zinc-500">
          {new Date(orderState.orderDate).toLocaleString()}
        </div>
      </div>
      <div className="mb-2 sm:text-sm text-xs">
        <span className="font-semibold">Customer:</span>{" "}
        <span className="text-zinc-800">{orderState.customerName}</span> (
        <span className="text-zinc-800">{orderState.email}</span>)
      </div>
      <div className="mb-2">
        <span className="font-semibold">Products:</span>
        <div className="flex flex-wrap gap-4 mt-2">
          {orderState.products.map((p, idx) => (
            <div className="flex items-center justify-between w-full" key={idx}>
            <div
              className="flex items-center shadow-sm gap-2 bg-white rounded p-2 border"
            >
              {p.product?.image?.asset?.url && (
                <Image
                  src={p.product.image.asset.url}
                  alt={p.product.name}
                  width={60}
                  height={60}
                  className="rounded w-8 h-8 object-cover"
                />
              )}
              <div>
                <div className="font-medium text-sm mb-1">{p.product.name}</div>
                <div className="text-xs text-zinc-700">
                  Qty: {p.quantity} &nbsp;|&nbsp; Price:{" "}
                  {formatCurrency(p.product.price)}
                </div>
              </div>
            </div>
             <div className="flex items-center gap-2">
              {confirmId === p.product._id ? (
                <>
                  <button
                    onClick={() => handleRemove(p.product._id!)}
                    disabled={isDeleting[p.product._id!]}
                    className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                  >
                    {isDeleting[p.product._id!] ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      'Confirm'
                    )}
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    disabled={isDeleting[p.product._id!]}
                    className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-black rounded text-xs"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmId(p.product._id!)}
                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-900 text-white rounded text-xs"
                >
                  Remove
                </button>
              )}
            </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs sm:text-sm">
          <div className="bg-gray-100 px-3 py-1 rounded text-gray-700 ">
          Total: {formatCurrency(totalMRP)}
          </div>
          {orderState.amountDiscount ? (
            <div className="bg-green-100 px-3 py-1 rounded text-green-600 ">
              OFF {discountPercent.toFixed(0)}%: {formatCurrency(effectiveDiscount)}
            </div>
          ) : null}
          <div className="bg-blue-50 px-3 py-1 rounded text-blue-600">
            Net Amount: {formatCurrency(finalAmount)}
          </div>
          <div>
        </div>
        <div className="flex items-center sm:text-sm text-xs">
        <span>Status:</span>
          <span
            className={`ml-1 px-2 py-1 rounded ${
              orderState.status === "paid"
                ? "bg-green-100 text-green-600"
                : orderState.status === "Pending"
                ? "bg-yellow-100 text-yellow-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {orderState.status}
          </span>
          </div>
          <div>
          </div>
        </div>  
      </div>
        
      {deletionResult && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-xs">
              {deletionResult.success ? (
                <>
                  <h3 className="text-green-700 font-bold mb-2">Deleted!</h3>
                  <p className="mb-4">“{deletionResult.productName}” has been deleted.</p>
                </>
              ) : (
                <>
                  <h3 className="text-red-700 font-bold mb-2">Deletion Failed</h3>
                  <p className="mb-4">{deletionResult.error}</p>
                </>
              )}
              <button
                onClick={() => setDeletionResult(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-900 text-white rounded"
              >
                OK
              </button>
            </div>
          </div>
        )}
    </>
    );
 }

export default function OrderRequests() {
  const { user, isSignedIn } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn || !user) return;
    const fetchOrders = async () => {
      setLoading(true);
      console.log("Fetching orders for user:", user.id, user.primaryEmailAddress?.emailAddress);
      const res = await fetch(
        `/api/owner-orders?ownerId=${encodeURIComponent(user.id)}&ownerEmail=${encodeURIComponent(user.primaryEmailAddress?.emailAddress || "")}`
      );
      const data = await res.json();
      console.log("Fetched orders:", data);
      setOrders(data.orders || []);
      setLoading(false);
    };
    fetchOrders();
  }, [isSignedIn, user]);

  const handleOrderUpdate = (orderId: string, updated: Order | null) => {
    setOrders((prev) =>
      prev
        .map((o) => (o._id === orderId ? updated : o))
        .filter(Boolean) as Order[]
    );
  };

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center sm:h-[80vh] h-[72vh]">
        <p className="sm:text-lg text-base font-semibold mb-2">Please log in to view your order requests.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className=" flex justify-center items-center sm:h-[80vh] h-[72vh] flex-col space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="text-zinc-700 font-semibold">Loading orders...</span>
    </div>
     
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center sm:h-[80vh] h-[72vh]">
        <span className="text-zinc-500">No Orders Received!</span>
      </div>
    );
  }
  if (orders.length > 0 && !Array.isArray(orders)) {
    return (
      <div className="flex flex-col items-center justify-center sm:h-[80vh] h-[72vh]">
        <span className="text-red-500">Error: Orders data is not in expected format.</span>
      </div>
    );
  } 
  return (
    <div className=" max-w-4xl mx-auto px-2 py-4">
      <h2 className="sm:text-2xl text-lg font-bold mb-6 text-center">Orders Received</h2>
      <div className="space-y-6">
        {orders.map(order => (
          <OrderCard
             key={order._id}
             order={order}
             onOrderUpdate={(upd) => handleOrderUpdate(order._id, upd)}
          />
        ))}
      </div>
    </div>
  );
}
"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { getAllProductsClient } from "@/sanity/lib/products/getAllProductsClient";
import { useRouter } from "next/navigation";
import { MdDelete } from "react-icons/md";

export default function ProductInventory() {
  const { user, isSignedIn } = useUser();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn) return;
    setLoading(true);
    getAllProductsClient({
      ownerId: user.id,
      ownerEmail: user.primaryEmailAddress?.emailAddress,
    })
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [isSignedIn, user]);

  const handleRemove = async (productId: string) => {
    setRemoving(productId);
    setError(null);
    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete product");
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      setConfirmId(null);
    } catch {
      setError("Failed to delete product. It may exist in orders.");
    } finally {
      setRemoving(null);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="sm:text-xl text-base text-zinc-800 mb-12">Please sign in to view your listed products.</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <h1 className="sm:text-2xl text-lg font-bold mb-8 text-center text-zinc-800">Your Listed Products</h1>
      {loading ? (
        <div className="flex justify-center flex-col gap-2 items-center max-h-screen min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-zinc-800">Loading...</span>
         </div>
      ) : products.length === 0 ? (
        <div className="text-center text-zinc-500 mt-12">No products found for this owner.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-xl shadow border border-gray-200 p-4 flex flex-col cursor-pointer hover:shadow-lg transition min-w-0"
              onClick={() => {
                if (!removing && !confirmId) {
                  router.push(`/product/${product.slug?.current || product._id}`);
                }
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center">
                  {product.image?.asset?.url ? (
                    <Image
                      src={product.image.asset.url}
                      alt={product.name}
                      width={96}
                      height={96}
                      className="object-contain w-full h-full"
                    />
                  ) : (
                    <span className="text-xs text-zinc-400">No Image</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-zinc-800 truncate">{product.name}</h2>
                  <div className="text-zinc-600 text-sm mt-1 truncate">
                    <span className="font-medium">₹{product.price}</span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-2 break-words">
                    <div>Owner ID: <span className="font-mono break-all">{product.owner?.id}</span></div>
                    <div>Owner Email: <span className="font-mono break-all">{product.owner?.email}</span></div>
                  </div>
                </div>
              </div>
              <button
                className={`mt-4 px-4 py-2 flex items-center gap-2 rounded-md bg-zinc-800 text-white hover:bg-zinc-900 transition w-fit self-end ${
                  removing === product._id ? "opacity-60 cursor-not-allowed" : ""
                }`}
                disabled={removing === product._id}
                onClick={e => {
                  e.stopPropagation();
                  setConfirmId(product._id);
                }}
              >
                <MdDelete className="w-5 h-5" />
                Remove
              </button>
              {/* Confirmation Modal/Card */}
              {confirmId === product._id && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                  <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center max-w-md">
                    <h3 className="text-lg  mb-2 text-red-600">Remove Product?</h3>
                    <div className="mb-2 font-semibold">{product.name}</div>
                    <div className="mb-2 text-xs text-zinc-600">Are you sure you want to delete this product?</div>
                    {error && <div className="text-red-500  text-center mb-2">{error}</div>}
                    <div className="flex gap-4 mt-4">
                      <button
                        className="px-4 py-2 rounded bg-zinc-800 text-white hover:bg-zinc-900"
                        onClick={() => handleRemove(product._id)}
                        disabled={removing === product._id}
                      >
                        {removing === product._id ? "Removing..." : "Confirm"}
                      </button>
                      <button
                        className="px-4 py-2 rounded bg-gray-200 text-zinc-800 hover:bg-gray-300"
                        onClick={() => setConfirmId(null)}
                        disabled={removing === product._id}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
"use client";
import { createCheckoutSession, Metadata } from "@/actions/createCheckOutSession";
import AddToBasketButton from "@/components/AddToBasketButton";
import Loader from "@/components/Loader";
import { imageUrl } from "@/lib/imageUrl";
import useBasketStore from "@/store/store";
import { SignInButton, useAuth, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";

function BasketPage() {
  const groupedItems = useBasketStore((state) => state.getGroupedItems());
  const totalPrice = useBasketStore((state) => state.getTotalPrice());
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  // Calculate total items using useMemo
  const totalItems = useMemo(
    () => groupedItems.reduce((total, item) => total + item.quantity, 0),
    [groupedItems]
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <Loader />;
  }

  if (!groupedItems || groupedItems.length === 0) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Your Cart</h1>
        <p className="text-gray-600 text-lg">Your cart is empty.</p>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to checkout");
      return;
    }

    
    setIsLoading(true);

    try {
      const metadata: Metadata = {
        orderNumber: crypto.randomUUID(),
        customerName: user?.fullName ?? "Unknown",
        customerEmail: user?.emailAddresses[0].emailAddress ?? "Unknown",
        clerkUserId: user!.id,
      };

      const checkoutUrl = await createCheckoutSession(groupedItems, metadata);

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        toast.error("Could not create checkout session");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-grow">
          {groupedItems.map((item, idx) => {
            if (!item.product || !item.product._id) {
              // Show a warning if product data is missing
              return (
                <div key={idx} className="mb-4 p-4 border rounded bg-red-50 text-red-700">
                  Product data missing or corrupted.
                </div>
              );
            }
            return (
              <div
                key={item.product._id}
                className="mb-4 p-4 border rounded flex items-center justify-between"
              >
                <div
                  className="flex items-center cursor-pointer flex-1 min-w-0"
                  onClick={() => router.push(`/product/${item.product.slug?.current}`)}
                >
                  <div className="w-20 h-20 sm-w-24 sm:h-24 flex-shrink-0 mr-4">
                    {item.product.image ? (
                      <Image
                        src={imageUrl(item.product.image).url()}
                        alt={item.product.name ?? "Product image"}
                        className="object-cover rounded"
                        width={96}
                        height={96}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded">
                        <span className="text-gray-500 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-semibold truncate">
                      {item.product.name ?? "No Name"}
                    </h2>
                    <p className="text-sm sm:text-base">
                      Price: &#8377;{((item.product.price ?? 0) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center ml-4 flex-shrink-0">
                  <AddToBasketButton product={item.product} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="w-full lg:w-80 lg:sticky lg:top-4 h-fit bg-white p-6 border rounded order-first lg:order-last fixed bottom-0 left-0 lg:left-auto">
          <h3 className="text-lg font-semibold">Order Summary</h3>
          <div className="mt-4 space-y-2">
            <p className="flex justify-between">
              <span>Items:</span>
              <span>{totalItems}</span>
            </p>
            <p className="flex justify-between text-xl font-bold border-t pt-2">
              <span>Total:</span>
              <span>&#8377;{totalPrice.toFixed(2)}</span>
            </p>
          </div>
          {isSignedIn ? (
            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isLoading ? "Processing..." : "Checkout"}
            </button>
          ) : (
            <SignInButton mode="modal">
              <button className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Sign in to Checkout
              </button>
            </SignInButton>
          )}
        </div>
        <div className="h-64 lg:h-0" />
      </div>
    </div>
  );
}

export default BasketPage;
import { useState } from "react";
import useBasketStore from "@/store/store";
import { Product } from "@/sanity.types";
import { toast } from "react-hot-toast"; // Add toast for notifications

type Props = {
  product: Product;
  isOutOfStock: boolean;
};

export default function AddToCartSection({ product, isOutOfStock }: Props) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useBasketStore();

  // Ensure stock is a valid number
  const maxQty = Math.max(0, product.stock ?? 99);

  const handleAddToCart = () => {
    if (!product._id || isOutOfStock || quantity < 1) {
      toast.error("Cannot add out of stock or invalid items");
      return;
    }
    addItem(product, quantity);
    toast.success(`Added ${quantity} item(s) to cart`);
    setQuantity(1);
  };

  const handleInc = () => {
    if (quantity < maxQty) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDec = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newQuantity = Number(e.target.value);
    if (!isNaN(newQuantity) && newQuantity >= 1 && newQuantity <= maxQty) {
      setQuantity(newQuantity);
    }
  };

  if (!product._id || !product.name) {
    return null; // Don't render if product data is invalid
  }

  return (
    <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4 w-full">
      {/* Quantity Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
        <div className="flex items-center gap-2 w-full sm:w-auto">
        <label className="text-sm font-medium mb-1 sm:mb-0 mr-2">Quantity:</label>
          <button
            onClick={handleDec}
            className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-zinc-800 hover:bg-zinc-900 text-white text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isOutOfStock || quantity <= 1}
            type="button"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <select
            value={quantity}
            onChange={handleSelect}
            className="border rounded px-2 py-2 sm:py-1 text-center disabled:opacity-50 disabled:cursor-not-allowed w-20 sm:w-auto"
            disabled={isOutOfStock}
          >
            {Array.from({ length: maxQty }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
          <button
            onClick={handleInc}
            className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-zinc-800 hover:bg-zinc-900 text-white text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isOutOfStock || quantity >= maxQty}
            type="button"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Add to Basket Button */}
      <button
        onClick={handleAddToCart}
        className={`w-full sm:w-auto bg-zinc-800 text-white px-4 py-3 sm:py-2 rounded hover:bg-zinc-950 transition-colors ${
          isOutOfStock ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={isOutOfStock}
        type="button"
      >
        {isOutOfStock ? "Out of Stock" : "Add to Basket"}
      </button>
    </div>
  );
}
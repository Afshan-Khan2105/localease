"use client";

import { Product } from "@/sanity.types";
import useBasketStore from "@/store/store";
import { IoMdAdd } from "react-icons/io";
import { RiSubtractFill } from "react-icons/ri";

interface AddToBasketButtonProps {
    product: Product;
    disabled?: boolean;
}

function AddToBasketButton({ product, disabled }: AddToBasketButtonProps) {
    const addItem = useBasketStore((state) => state.addItem);
    const removeItem = useBasketStore((state) => state.removeItem);
    const itemCount = useBasketStore((state) =>
        product?._id ? state.getItemCount(product._id) : 0
    );

    if (!product?._id) {
        return null;
    }

    const handleAdd = () => {
        if (product && product._id) {
            addItem(product);
        }
    };
    const handleRemove = () => {
        if (product && product._id) {
            removeItem(product._id);
        }
    };

    return (
        <div className="flex flex-row items-center justify-center gap-6">
            <div className="flex items-center justify-center space-x-2">
                <button
                    onClick={handleRemove}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
                        itemCount === 0
                            ? "bg-gray-100 cursor-not-allowed"
                            : "bg-gray-200 hover:bg-gray-300"
                    }`}
                    disabled={itemCount === 0 || disabled}
                >
                    <span className={`text-xl font-bold ${itemCount === 0 ? "text-gray-400" : "text-gray-600"}`}>
                        <RiSubtractFill />
                    </span>
                </button>

                <span className="w-8 text-center font-semibold">{itemCount}</span>

                <button
                    onClick={handleAdd}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
                        disabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                    }`}
                    disabled={disabled}
                >
                    <span className="text-xl font-bold text-white">
                        <IoMdAdd />
                    </span>
                </button>
            </div>
        </div>
    );
}

export default AddToBasketButton;

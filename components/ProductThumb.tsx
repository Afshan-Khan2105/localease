import { imageUrl } from "@/lib/imageUrl";
import { Product } from "@/sanity.types";
import Image from "next/image";
import Link from "next/link";

function ProductThumb({ product }: { product: Product }) {
  const isOutOfStock = product.stock != null && product.stock <= 0;

  const ratings = product.ratings ?? [];
  const ratingCount = ratings.length;
  const avgRating =
    ratingCount > 0
      ? (
          ratings.reduce((sum, r) => sum + (r.score ?? 0), 0) / ratingCount
        ).toFixed(1)
      : 0;

  return (
    <Link
      href={`/product/${product.slug?.current}`}
      className={`
        group flex flex-col bg-white rounded-2xl border border-zinc-200
        shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden
        hover:-translate-y-1
        ${isOutOfStock ? "opacity-60 pointer-events-none" : ""}
        w-full max-w-xs sm:max-w-sm md:max-w-md
      `}
    >
      <div className="relative aspect-square w-full my-2 overflow-visible">
        {product.image ? (
          <Image
            className="object-scale-down transition-transform duration-300 group-hover:scale-105"
            src={imageUrl(product.image).url()}
            alt={product.name || "Product image"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 32vw"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-lg">
            No Image
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between p-4">
        <h2 className="text-md md:text-lg font-semibold text-black truncate mb-1">
          {product.name}
        </h2>

        <p className="mb-2 text-xs md:text-sm text-gray-700 line-clamp-2 min-h-[2.5em]">
          {product.description
            ?.map((block) =>
              block._type === "block"
                ? block.children?.map((child) => child.text).join("")
                : ""
            )
            .join(" ") || "No description available"}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-sm lg:text-xl font-bold text-black">
            ₹{product.price?.toFixed(2)}
          </span>
          <div className="flex items-center ml-2">
            {/* Show only one star and rating on small screens, all stars on md+ */}
            <div className="flex items-center">
              {/* Hidden on small screens, visible on md+ */}
              <div className="hidden min-[500px]:flex">
                {[1, 2, 3, 4, 5].map((star) => {
                  const numericAvgRating =
                    typeof avgRating === "string"
                      ? parseFloat(avgRating)
                      : avgRating;
                  const filled = numericAvgRating >= star;
                  const half =
                    numericAvgRating >= star - 0.5 && numericAvgRating < star;
                  return (
                    <svg
                      key={star}
                      className="w-3 h-3 md:w-4 md:h-4 mr-0.5"
                      fill={filled ? "#facc15" : half ? "url(#half)" : "#e5e7eb"}
                      viewBox="0 0 20 20"
                    >
                      <defs>
                        <linearGradient id="half">
                          <stop offset="50%" stopColor="#facc15" />
                          <stop offset="50%" stopColor="#e5e7eb" />
                        </linearGradient>
                      </defs>
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.176 0l-3.385 2.46c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
                    </svg>
                  );
                })}
              </div>
              {/* Visible only on small screens */}
              <svg
                className="w-4 h-4 mr-1 min-[500px]:hidden"
                fill="#facc15"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.176 0l-3.385 2.46c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
              </svg>
              <span className="text-xs md:text-sm font-medium text-black ml-1">
                {avgRating}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ProductThumb;
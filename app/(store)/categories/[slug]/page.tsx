
import ProductsView from "@/components/ProductsView";
import { getAllCategories } from "@/sanity/lib/products/getAllCategories";
import { getProductsByCategory } from "@/sanity/lib/products/getProductsByCategory";
import type { ALL_PRODUCTS_QUERYResult, ALL_CATEGORIES_QUERYResult, Product } from "@/sanity.types";

async function CategoryPage(
    {params}: { params: Promise<{slug: string}>}
) {
    const {slug} = await params;
    const rawProducts: ALL_PRODUCTS_QUERYResult = await getProductsByCategory(slug);
    const rawCategories: ALL_CATEGORIES_QUERYResult = await getAllCategories();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products: Product[] = rawProducts.map((p: any) => ({
      _id: p._id,
      name: p.name,
      slug: p.slug,
      image: p.image,
      images: p.images,
      price: p.price,
      details: p.details,
      category: p.category,
      ratings: p.ratings,
      _type: p._type ?? "product",
      _createdAt: p._createdAt ?? "",
      _updatedAt: p._updatedAt ?? "",
      _rev: p._rev ?? "",
    }));

    // Map rawCategories to Category[] by ensuring all required fields are present
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categories = rawCategories.map((c: any) => ({
      _id: c._id,
      title: c.title,
      slug: c.slug,
      description: c.description,
      _type: c._type ?? "category",
      _createdAt: c._createdAt ?? "",
      _updatedAt: c._updatedAt ?? "",
      _rev: c._rev ?? "",
    }));

  return (
    <div className="flex flex-col items-center justify-top min-h-screen bg-zinc-100 py-4 px-2">
      <div className=" bg-white p-4 rounded-lg shadow-md w-full max-w-6xl">
        <h1 className="sm:text-3xl text-xl font-bold mb-6 text-center">
            {slug
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}{" "}
            Collections
        </h1>
        <ProductsView products={products} categories={categories}/>
        </div>
    </div>
  )
}

export default CategoryPage;

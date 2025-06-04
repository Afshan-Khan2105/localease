import ProductsView from "@/components/ProductsView";
import SaleBanner from "@/components/SaleBanner";
import { getAllCategories } from "@/sanity/lib/products/getAllCategories";
import { getAllProducts } from "@/sanity/lib/products/getAllProducts";

export const dynamic = "force-static";
export const revalidate = 60;

export default async function Home() {
  const rawProducts = await getAllProducts();
  const rawCategories = await getAllCategories();

  // Ensure each category has the required Category fields
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categories = rawCategories.map((c: any) => ({
    _type: c._type ?? "category",
    _createdAt: c._createdAt ?? "",
    _updatedAt: c._updatedAt ?? "",
    _rev: c._rev ?? "",
    ...c,
  }));

  // Ensure each product has the required Product fields
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = rawProducts.map((p: any) => ({
    _type: p._type ?? "product",
    _createdAt: p._createdAt ?? "",
    _updatedAt: p._updatedAt ?? "",
    _rev: p._rev ?? "",
    ...p,
  }));

  return (
    <div>
      <SaleBanner />
       {/* render all the products */}

       <div className=" flex flex-col items-center justify-top min-h-screen bg-zinc-100 p-4">
        <ProductsView products={products} categories={categories} />
       </div>
    </div>
  );
}

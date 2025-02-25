import ProductsView from "@/components/ProductsView";
import SaleBanner from "@/components/SaleBanner";
import { getAllCategories } from "@/sanity/lib/products/getAllCategories";
import { getAllProducts } from "@/sanity/lib/products/getAllProducts";

export const dynamic = "force-static";
export const revalidate = 60;

export default async function Home() {
  const products = await getAllProducts();
  const categories = await getAllCategories();

  
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

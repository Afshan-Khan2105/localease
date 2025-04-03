
import GeopLocationPage from "@/components/GeopLocationPage";
import { getAllCategories } from "@/sanity/lib/products/getAllCategories";
import { getAllProducts } from "@/sanity/lib/products/getAllProducts";

export default async function Page() {
  const categories = await getAllCategories(); // Fetch on the server
  const products = await getAllProducts();

  return <GeopLocationPage products={products} categories={categories} />;
}

import GeopLocationPage from "@/components/GeopLocationPage";
import { getAllCategories } from "@/sanity/lib/products/getAllCategories";
import { getAllProducts } from "@/sanity/lib/products/getAllProducts";

export default async function Page() {
  const categoriesRaw = await getAllCategories(); // Fetch on the server
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categories = categoriesRaw.map((cat: any) => ({
    ...cat,
    _type: cat._type ?? "category",
    _createdAt: cat._createdAt ?? "",
    _updatedAt: cat._updatedAt ?? "",
    _rev: cat._rev ?? "",
  }));
  const productsRaw = await getAllProducts();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = productsRaw.map((product: any) => ({
    ...product,
    slug: product.slug
      ? { current: product.slug.current ?? undefined }
      : undefined,
  }));

  return <GeopLocationPage products={products} categories={categories} />;
}
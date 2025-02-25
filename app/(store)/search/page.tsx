import ProductGrid from "@/components/ProductGrid";
import { searchProductByName } from "@/sanity/lib/products/searchProductByName";

async function SearchPage({ 
    searchParams,
}:{
    searchParams: Promise<{
      query : string;
    }>;
}) {
    const {query} = await searchParams;
    const products = await searchProductByName(query);
  
    if(!products.length){
      return(
        <div className="flex flex-col items-center justify-top min-h-screen bg-zinc-100 p-4">
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-center">   
                No products found for: {query}
            </h1>
            <p className="text-gray-600 text-center">
            Try to serch with different keyword
          </p>
          </div>
        </div>
      );
    }
  return (
    <div className="flex flex-col items-center justify-top min-h-screen bg-zinc-100">
      <div className="text-3xl font-bold mb-6 text-center">
        Search result for {query}
        <h1>
          <ProductGrid products={products}/>
        </h1>
      </div>
    </div>
  )
}

export default SearchPage;
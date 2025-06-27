/**
 * Fetch all products for a user from the API route.
 * @param params ownerId and/or ownerEmail
 * @returns Promise<Product[]>
 */
export async function getAllProductsClient({
  ownerId,
  ownerEmail,
}: { ownerId?: string; ownerEmail?: string }) {
  let url = "/api/userProducts";
  const params = [];
  if (ownerId) params.push(`ownerId=${encodeURIComponent(ownerId)}`);
  if (ownerEmail) params.push(`ownerEmail=${encodeURIComponent(ownerEmail)}`);
  if (params.length) url += "?" + params.join("&");

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch products");
  return await res.json();
}
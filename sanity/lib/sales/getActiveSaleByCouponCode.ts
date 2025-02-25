import { defineQuery } from "next-sanity";
import { COUPON_CODES, CouponCode } from "./couponCode";
import { sanityFetch } from "../live";

export const getActiveSaleByCouponCode = async (couponCode: (typeof COUPON_CODES)[keyof typeof COUPON_CODES]) => {
    const ACTIVE_SALE_BY_COUPON_QUERY = defineQuery(`
        *[
            _type == "sale"
            && isActive == true
            && couponCode == $couponCode
        ] | order(validFrom desc)[0]
        `);

        try{
            const activeSale = await sanityFetch({
                query: ACTIVE_SALE_BY_COUPON_QUERY,
                params: {
                    couponCode,
                },
            });

            return activeSale ? activeSale.data : null;

        } catch(error) {
            console.error("Error Fetching sale by coupon code:", error);
            return null;
        }
};
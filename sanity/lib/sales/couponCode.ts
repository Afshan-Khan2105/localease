export const COUPON_CODES = {
    WINTER_END: "WTSL54",
    SUMMER: "SUM33R",
    XMAS: "X1M1S",
} as const;

export type CouponCode = keyof typeof COUPON_CODES;
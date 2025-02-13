export const COUPON_CODES = {
  EASTER: "EASTER",
  XMAS: "XMAS",
} as const;

export type CouponCode = keyof typeof COUPON_CODES;

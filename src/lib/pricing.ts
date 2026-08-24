export const PARTIAL_BOOK_SLOT_AMOUNT_RUPEES = 1500
export const PARTIAL_BOOK_SLOT_AMOUNT_PAISE = PARTIAL_BOOK_SLOT_AMOUNT_RUPEES * 100

export const FULL_BOOK_SLOT_AMOUNT_RUPEES = 10000
export const FULL_BOOK_SLOT_AMOUNT_PAISE = FULL_BOOK_SLOT_AMOUNT_RUPEES * 100

// Keeping label for places where just a simple string is needed
export const BOOK_SLOT_AMOUNT_LABEL = `₹${FULL_BOOK_SLOT_AMOUNT_RUPEES}`

export function calculateBootcampPriceRupees(promoCode?: string | null): number {
  if (!promoCode) return 10000;
  
  const code = promoCode.trim().toUpperCase();
  if (code === "TOP60") return 8500;
  if (code === "TOP80") return 7800;
  
  return 10000;
}

export function calculateBootcampPricePaise(promoCode?: string | null): number {
  return calculateBootcampPriceRupees(promoCode) * 100;
}

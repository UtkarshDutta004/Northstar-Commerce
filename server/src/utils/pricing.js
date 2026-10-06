const SHIPPING_CENTS = 800;
const FREE_SHIPPING_CENTS = 10000;

export function calculateTotalCents(subtotalCents) {
  return subtotalCents + (subtotalCents >= FREE_SHIPPING_CENTS ? 0 : SHIPPING_CENTS);
}

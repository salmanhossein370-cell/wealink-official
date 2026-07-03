export async function trackOrder(
  total: number,
  items: Array<{ name: string; quantity: number; price: number }>,
  customerName: string,
  deliveryMethod: string
) {
  console.log("Order tracked:", { total, items, customerName, deliveryMethod });
  return Promise.resolve();
}

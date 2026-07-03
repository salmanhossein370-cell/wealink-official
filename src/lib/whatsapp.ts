export function openWhatsApp(message: string, phone: string = "") {
  const encodedText = encodeURIComponent(message);
  const url = phone 
    ? `https://wa.me/${phone}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;
  window.open(url, '_blank');
}

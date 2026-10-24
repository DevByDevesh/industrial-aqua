// Shared WhatsApp enquiry link builder.
//
// The number below is the client's own business WhatsApp number, supplied
// by the client for the Industrial Aqua website (confirmed by Dev on
// 24 Oct 2026). It belongs in the site content; Dev's personal numbers
// must never be used here. Change it only here — every enquiry link on
// the site is built from this one place.
const BUSINESS_WHATSAPP_NUMBER = '919689757239';

export function whatsappEnquiryLink(topic: string): string {
  return (
    'https://wa.me/' +
    BUSINESS_WHATSAPP_NUMBER +
    '?text=' +
    encodeURIComponent(
      'Hello Industrial Aqua, I would like to enquire about ' + topic + '. Please share details and a quotation.',
    )
  );
}

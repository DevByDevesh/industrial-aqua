// Shared WhatsApp enquiry link builder.
//
// NOTE: no business phone number is configured yet — the client has not
// supplied one, and none may be invented. The links therefore use the
// generic wa.me share endpoint, exactly as the site has done so far.
// When the client provides their business number, set it once here and
// every enquiry link across the site will target that business chat.
export function whatsappEnquiryLink(topic: string): string {
  return (
    'https://wa.me/?text=' +
    encodeURIComponent(
      'Hello Industrial Aqua, I would like to enquire about ' + topic + '. Please share details and a quotation.',
    )
  )
}

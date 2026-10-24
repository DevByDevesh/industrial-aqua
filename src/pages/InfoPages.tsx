import { useState } from 'react';
import { ArrowRight, ArrowUpRight, MessageCircle, Package, Search, Send, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { whatsappEnquiryLink } from '../lib/enquiry';

const WHATSAPP_DISPLAY = '+91 96897 57239';

function InfoShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div className="shop-page">
      <section className="shop-intro">
        <nav className="shop-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link><span>/</span><span>{title}</span>
        </nav>
        <p className="eyebrow"><span className="eyebrow-dot" /> {eyebrow}</p>
        <h1>{title}</h1>
        <p className="shop-intro-copy">{intro}</p>
      </section>
      <section className="info-body">{children}</section>
    </div>
  );
}

export function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const sendLink =
    'https://wa.me/919689757239?text=' +
    encodeURIComponent(
      'Hello Industrial Aqua, my name is ' + (name.trim() || '—') + ' (' + (phone.trim() || 'no phone given') + '). ' +
        (message.trim() || 'I have a question about your products.'),
    );

  return (
    <InfoShell
      eyebrow="CONTACT"
      title="Contact us"
      intro="The fastest way to reach Industrial Aqua is WhatsApp — send a message and the team will reply with product details, pricing and availability."
    >
      <div className="info-grid">
        <div className="info-card">
          <h2><MessageCircle size={17} /> WhatsApp the store</h2>
          <p>Business WhatsApp: <strong>{WHATSAPP_DISPLAY}</strong></p>
          <p>Share a product name or model code (for example 004A) and the team can confirm the exact part, its price and delivery options.</p>
          <a href={whatsappEnquiryLink('a product enquiry')} target="_blank" rel="noreferrer" className="button button-dark">
            Chat on WhatsApp <ArrowUpRight size={14} />
          </a>
        </div>
        <form className="admin-card admin-login info-form" onSubmit={(event) => event.preventDefault()}>
          <h2>Send a message</h2>
          <label>
            Your name
            <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
          </label>
          <label>
            Your phone number
            <input value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" inputMode="tel" />
          </label>
          <label>
            Message
            <textarea rows={4} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Product name, model code, or what you are looking for…" />
          </label>
          <a href={sendLink} target="_blank" rel="noreferrer" className="button button-dark">
            <Send size={15} /> Send via WhatsApp
          </a>
          <p className="admin-muted">This opens WhatsApp with your message ready — nothing is sent until you press send there.</p>
        </form>
      </div>
    </InfoShell>
  );
}

export function SupportPage() {
  return (
    <InfoShell
      eyebrow="SUPPORT"
      title="Support & ordering help"
      intro="How ordering works at Industrial Aqua, and how to find the right part for your system."
    >
      <div className="info-stack">
        <div className="info-card">
          <h2><ShoppingBag size={17} /> How to order</h2>
          <ol className="info-steps">
            <li><strong>Find your part</strong> — browse the <Link to="/shop">shop</Link>, open a <Link to="/category/filters">category</Link>, or search by product name or model code.</li>
            <li><strong>Add to bag or enquire</strong> — add items to your bag, or tap Enquire on any product to ask about it directly.</li>
            <li><strong>Place the order on WhatsApp</strong> — checkout prepares your order and opens WhatsApp; the team confirms availability, final pricing (including any price-on-request items) and delivery.</li>
            <li><strong>Delivery & payment</strong> — arranged personally with the store team on WhatsApp. This website never takes payment online.</li>
          </ol>
        </div>
        <div className="info-card">
          <h2><Search size={17} /> Finding the right part</h2>
          <p>Model codes are printed on most fittings and components — search the exact code (like 004A) in the shop for the fastest match. If you are not sure which part fits your system, message the team on WhatsApp with your system model or a photo of the old part, and they will help identify it. We only confirm compatibility when it can be verified — no guesses.</p>
          <Link to="/find-parts" className="button secondary">Find parts <ArrowRight size={15} /></Link>
        </div>
        <div className="info-card">
          <h2><Package size={17} /> Prices & availability</h2>
          <p>Some products show "Price on request" while the store team finishes updating the catalogue. Those prices are confirmed on enquiry before you pay anything, and stock is confirmed at the same time.</p>
          <a href={whatsappEnquiryLink('support')} target="_blank" rel="noreferrer" className="button button-dark">
            Ask on WhatsApp <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </InfoShell>
  );
}

export function ShippingPage() {
  return (
    <InfoShell
      eyebrow="POLICIES"
      title="Shipping & delivery"
      intro="How delivery works for orders placed with Industrial Aqua."
    >
      <div className="info-stack">
        <div className="info-card">
          <h2>Delivery is confirmed with your order</h2>
          <p>Industrial Aqua confirms every order personally on WhatsApp before dispatch. Delivery charges, timelines and courier options for your address are confirmed at that point — before you pay — because they depend on the items ordered and your location.</p>
          <p>Orders are dispatched only after confirmation. When your order ships, the store team shares the dispatch details with you on WhatsApp.</p>
          <p>If you need an order urgently, mention it while placing the order and the team will tell you what is possible.</p>
        </div>
      </div>
    </InfoShell>
  );
}

export function ReturnsPage() {
  return (
    <InfoShell
      eyebrow="POLICIES"
      title="Returns & replacements"
      intro="What to do if something arrives damaged, incorrect or faulty."
    >
      <div className="info-stack">
        <div className="info-card">
          <h2>Damaged or wrong item</h2>
          <p>If an item arrives damaged or different from what you ordered, contact the store on WhatsApp with your order reference and a photo of the item. The team will arrange a replacement or refund for genuine cases, as confirmed with you on WhatsApp.</p>
          <h2>Changed your mind</h2>
          <p>For unused items in their original condition, message the team on WhatsApp to ask about a return — acceptance is confirmed by the store team case by case before you ship anything back. Please do not send returns without confirming first.</p>
          <a href={whatsappEnquiryLink('a return or replacement')} target="_blank" rel="noreferrer" className="button button-dark">
            Contact the store <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </InfoShell>
  );
}

export function PrivacyPage() {
  return (
    <InfoShell
      eyebrow="POLICIES"
      title="Privacy policy"
      intro="What information this website handles and why. This page describes how the site actually works today."
    >
      <div className="info-stack">
        <div className="info-card">
          <h2>Information we handle</h2>
          <p><strong>Enquiries:</strong> when you tap an enquiry or order button, WhatsApp opens with a pre-filled message. That conversation happens on WhatsApp between you and the store.</p>
          <p><strong>Accounts:</strong> if you create an account, your email address and sign-in are handled by Firebase Authentication (Google). We use it only to sign you in and show your orders.</p>
          <p><strong>Orders:</strong> orders placed while signed in are stored in the store's database together with the name, phone number and delivery address you provide, so the store can fulfil them and you can see your order history.</p>
          <p><strong>Your bag:</strong> your shopping bag is stored only in your own browser on this device.</p>
          <h2>What we do not do</h2>
          <p>This website does not take online payments and never asks for card or banking details. We do not sell your information. Account and order data is used only to run the store and respond to you.</p>
          <h2>Questions</h2>
          <p>For anything about your information, contact the store on WhatsApp ({WHATSAPP_DISPLAY}).</p>
        </div>
      </div>
    </InfoShell>
  );
}

export function TermsPage() {
  return (
    <InfoShell
      eyebrow="POLICIES"
      title="Terms & conditions"
      intro="The basics that apply when you browse and order from Industrial Aqua through this website."
    >
      <div className="info-stack">
        <div className="info-card">
          <h2>Catalogue & pricing</h2>
          <p>Product names, model codes and specifications are published from the store's catalogue. Prices marked "Price on request" — and any pricing — are confirmed by the store team on WhatsApp before an order is final; the confirmed price is the one that applies.</p>
          <h2>Orders</h2>
          <p>An order is placed when the store confirms it with you on WhatsApp, including items, prices and delivery. This website itself does not take payment; payment is arranged with the store team as confirmed in that conversation.</p>
          <h2>Product use</h2>
          <p>Replacement parts should be matched to your system carefully. Where compatibility matters, confirm with the store team before ordering — the team confirms compatibility only when it can be verified.</p>
          <h2>Changes</h2>
          <p>The catalogue and these terms may be updated as the store's range and policies are published; the version confirmed with your order applies to that order.</p>
        </div>
      </div>
    </InfoShell>
  );
}

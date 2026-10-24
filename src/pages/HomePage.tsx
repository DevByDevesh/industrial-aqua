import {ArrowDownRight,ArrowRight,ArrowUpRight,Check, Droplets, Filter, Gauge, Waves, Factory, ShieldCheck, Zap, Thermometer, Wind, MessageCircle, Layers3, Settings2, type LucideIcon} from 'lucide-react';
import {Link} from 'react-router-dom';
import {motion} from 'motion/react';
import {sectionReveal,staggerItem} from '../motion/tokens';
import {categoryPath, homeCategories} from '../data/catalogue';
import {whatsappEnquiryLink as whatsapp} from '../lib/enquiry';

const categoryIcons: Record<string, LucideIcon> = {
  'domestic-ro': Droplets,
  'commercial-ro': Waves,
  '500-1000-lph': Gauge,
  'industrial-ro': Factory,
  'filters': Filter,
  'membranes': Layers3,
  'pumps-valves': Settings2,
  'tanks': ShieldCheck,
};

const categoryCaptions: Record<string, string> = {
  'domestic-ro': 'RO SYSTEMS',
  'commercial-ro': 'RO SYSTEMS',
  '500-1000-lph': 'LPH CAPACITY',
  'industrial-ro': 'INDUSTRIAL',
  'filters': 'FILTRATION',
  'membranes': 'MEMBRANES',
  'pumps-valves': 'FLOW CONTROL',
  'tanks': 'STORAGE',
};

const categories = homeCategories.map((category, index) => ({
  number: String(index + 1).padStart(2, '0'),
  title: category.title,
  description: category.description,
  to: categoryPath(category),
  icon: categoryIcons[category.slug] ?? Droplets,
  caption: categoryCaptions[category.slug] ?? category.tag,
}));

const solutions = [
  {title:'ETP Systems',description:'Effluent treatment solutions for industrial wastewater applications.',icon:Factory},
  {title:'STP Systems',description:'Sewage treatment solutions for buildings and facilities.',icon:Wind},
  {title:'Water Softeners',description:'Solutions designed to reduce hardness in water.',icon:Waves},
  {title:'UV Systems',description:'UV disinfection options for suitable water treatment setups.',icon:Zap},
  {title:'UF Systems',description:'Ultrafiltration solutions for relevant treatment requirements.',icon:Filter},
  {title:'Water Chillers',description:'Water chilling equipment for process and commercial needs.',icon:Thermometer},
];

const benefits = [
  {title:'Solutions for different scales',description:'From domestic RO systems to industrial plant enquiries.'},
  {title:'Clear product information',description:'Specifications and compatibility should be confirmed before ordering.'},
  {title:'Talk to the team',description:'Ask about requirements, available options and quotations through WhatsApp.'},
];

export function HomePage(){
  return <div className="home-page">
    <section className="home-hero">
      <motion.div className="home-hero-copy" variants={sectionReveal} initial="hidden" animate="visible">
        <motion.p className="eyebrow" variants={staggerItem}><span className="eyebrow-dot"/> WATER TREATMENT · RO SYSTEMS · SPARE PARTS</motion.p>
        <motion.h1 variants={staggerItem}>Water solutions for <em>every scale.</em></motion.h1>
        <motion.p className="home-hero-description" variants={staggerItem}>Industrial Aqua brings together RO plants, water treatment systems and essential components for domestic, commercial and industrial requirements.</motion.p>
        <motion.div className="home-hero-actions" variants={staggerItem}>
          <Link to="/shop" className="button button-dark">Explore products <ArrowRight size={16}/></Link>
          <a href={whatsapp('water treatment solutions')} target="_blank" rel="noreferrer" className="home-secondary-link"><MessageCircle size={16}/> Enquire on WhatsApp <ArrowUpRight size={15}/></a>
        </motion.div>
        <motion.div className="home-proof" variants={staggerItem}>
          <span><Check size={14}/> Domestic to industrial</span>
          <span><Check size={14}/> Enquiry-led support</span>
        </motion.div>
      </motion.div>
      <motion.div className="home-hero-visual home-hero-photo" initial={{opacity:0,scale:.97}} animate={{opacity:1,scale:1}} transition={{duration:.65,ease:'easeOut'}}>
        <div className="hero-visual-top"><span>INDUSTRIAL AQUA / WATER SYSTEMS</span><span>01 — 08</span></div>
        <div className="hero-photo-overlay"/>
        <div className="hero-visual-note"><span className="visual-note-mark"><Droplets size={18}/></span><span><strong>Designed around your water needs.</strong><small>Systems · Solutions · Components</small></span></div>
        <span className="hero-vertical-label">FILTRATION · TREATMENT · FLOW</span>
      </motion.div>
      <div className="home-scroll-cue"><span>EXPLORE OUR PRODUCTS & SOLUTIONS</span><ArrowDownRight size={15}/></div>
    </section>

    <section className="home-intro-band">
      <div><p className="eyebrow">ABOUT INDUSTRIAL AQUA</p><h2>One place for <em>water treatment needs.</em></h2></div>
      <p>From domestic purification to industrial water treatment, explore system categories and connect with our team to discuss your application. Product specifications, availability and quotations can be confirmed during enquiry.</p>
      <a className="button button-dark" href={whatsapp('a water treatment requirement')} target="_blank" rel="noreferrer">Talk to our team <MessageCircle size={16}/></a>
    </section>

    <section className="home-category-section">
      <div className="section-heading">
        <div><p className="eyebrow">PRODUCT RANGE</p><h2>Find the right <em>system or component.</em></h2></div>
        <Link to="/shop" className="section-link">View all products <ArrowRight size={15}/></Link>
      </div>
      <div className="category-grid category-grid-eight">
        {categories.map((category,index)=>{const Icon=category.icon;return <motion.article className="category-card" key={category.number} initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.2}} transition={{duration:.4,delay:(index%4)*.05}}>
          <div className="category-card-top"><span>{category.number} / PRODUCT RANGE</span><Link to={category.to} aria-label={'Explore '+category.title}><ArrowUpRight size={17}/></Link></div>
          <div className={'category-illustration category-illustration-'+String((index%3)+1).padStart(2,'0')}><div className="category-orbit"/><div className="category-icon"><Icon size={34} strokeWidth={1.15}/></div><span className="category-illustration-caption">{category.caption}</span></div>
          <h3>{category.title}</h3><p>{category.description}</p><Link to={category.to} className="category-card-link">Explore category <ArrowRight size={15}/></Link>
          <a className="category-whatsapp-link" href={whatsapp(category.title)} target="_blank" rel="noreferrer"><MessageCircle size={14}/> Ask on WhatsApp</a>
        </motion.article>})}
      </div>
      <p className="catalogue-note"><span/> Product details, specifications, pricing and availability are confirmed on enquiry while the catalogue is being completed.</p>
    </section>

    <section className="home-industrial-showcase">
      <div className="industrial-showcase-copy"><p className="eyebrow">INDUSTRIAL WATER TREATMENT</p><h2>Built for demanding <em>water requirements.</em></h2><p>Explore industrial RO plant enquiries and treatment options for your site, process or facility. Share your water source, required capacity and application so the team can guide the next step.</p><a href={whatsapp('industrial RO plant requirements')} target="_blank" rel="noreferrer" className="button button-light">Discuss your requirement <MessageCircle size={16}/></a></div>
      <div className="industrial-photo-grid">
        <div className="industrial-photo industrial-photo-one"><span>RO PLANT SYSTEMS</span></div>
        <div className="industrial-photo industrial-photo-two"><span>WATER TREATMENT</span></div>
        <div className="industrial-photo industrial-photo-three"><span>FILTRATION & FLOW</span></div>
      </div>
    </section>

    <section className="home-solutions-section">
      <div className="section-heading"><div><p className="eyebrow">WATER TREATMENT SOLUTIONS</p><h2>More than <em>RO systems.</em></h2></div><a className="section-link" href={whatsapp('water treatment solutions')} target="_blank" rel="noreferrer">Discuss a solution <ArrowRight size={15}/></a></div>
      <div className="solutions-grid">{solutions.map((solution,index)=>{const Icon=solution.icon;return <article className="solution-card" key={solution.title}><span className="solution-index">0{index+1}</span><span className="solution-icon"><Icon size={23} strokeWidth={1.4}/></span><h3>{solution.title}</h3><p>{solution.description}</p><a href={whatsapp(solution.title)} target="_blank" rel="noreferrer">Enquire <ArrowUpRight size={14}/></a></article>})}</div>
    </section>

    <section className="home-finder">
      <div className="finder-orb"><Droplets size={44} strokeWidth={1.1}/><span>YOUR REQUIREMENT</span></div>
      <div className="finder-copy"><p className="eyebrow">NEED HELP CHOOSING?</p><h2>Let’s work out <em>what fits.</em></h2><p>Tell us your application, water source and approximate capacity. Our team can help you discuss suitable options and next steps.</p></div>
      <a href={whatsapp('help selecting a water treatment system')} target="_blank" rel="noreferrer" className="button button-light">Chat on WhatsApp <MessageCircle size={16}/></a>
    </section>

    <section className="home-values">
      <div className="values-heading"><p className="eyebrow">WHY INDUSTRIAL AQUA</p><h2>Practical guidance.<br/><em>Clear next steps.</em></h2></div>
      <div className="values-list">{benefits.map((benefit,index)=><div className="value-row" key={benefit.title}><span className="value-index">0{index+1}</span><div><h3>{benefit.title}</h3><p>{benefit.description}</p></div><ArrowUpRight size={17}/></div>)}</div>
    </section>

    <section className="home-bottom-cta"><div><p className="eyebrow">INDUSTRIAL AQUA</p><h2>Tell us what your water system <em>needs.</em></h2></div><a href={whatsapp('a product or plant quotation')} target="_blank" rel="noreferrer" className="button button-dark">Request an enquiry <MessageCircle size={16}/></a></section>
  </div>;
}

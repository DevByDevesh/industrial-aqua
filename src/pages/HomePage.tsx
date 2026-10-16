import {ArrowDownRight,ArrowRight,ArrowUpRight,Check, Droplets, Filter, Gauge, Waves} from 'lucide-react';
import {Link} from 'react-router-dom';
import {motion} from 'motion/react';
import {sectionReveal,staggerItem} from '../motion/tokens';

const categories = [
  {number:'01',title:'Filters & cartridges',description:'Replacement filtration essentials for routine RO maintenance.',to:'/category/filters',icon:Filter},
  {number:'02',title:'RO membranes',description:'Explore membrane options and identify the right fit for your system.',to:'/category/membranes',icon:Waves},
  {number:'03',title:'Pumps & valves',description:'Core components for RO systems, organised to make discovery easier.',to:'/category/pumps-valves',icon:Gauge},
];

const benefits = [
  {title:'Find the right part',description:'Use a guided path to narrow down the component you need.'},
  {title:'Clear product information',description:'Specifications and compatibility belong together, not buried in fine print.'},
  {title:'Built for confident upkeep',description:'A focused catalogue for home and commercial RO water systems.'},
];

export function HomePage(){
  return <div className="home-page">
    <section className="home-hero">
      <motion.div className="home-hero-copy" variants={sectionReveal} initial="hidden" animate="visible">
        <motion.p className="eyebrow" variants={staggerItem}><span className="eyebrow-dot"/> RO SPARE PARTS, MADE SIMPLER</motion.p>
        <motion.h1 variants={staggerItem}>Better water starts with <em>the right part.</em></motion.h1>
        <motion.p className="home-hero-description" variants={staggerItem}>Discover RO filters, membranes, pumps and essential replacement components for the systems you rely on every day.</motion.p>
        <motion.div className="home-hero-actions" variants={staggerItem}>
          <Link to="/shop" className="button button-dark">Explore the catalogue <ArrowRight size={16}/></Link>
          <Link to="/find-parts" className="home-secondary-link">Help me find a part <ArrowUpRight size={15}/></Link>
        </motion.div>
        <motion.div className="home-proof" variants={staggerItem}>
          <span><Check size={14}/> Parts-first discovery</span>
          <span><Check size={14}/> Clear, practical guidance</span>
        </motion.div>
      </motion.div>
      <motion.div className="home-hero-visual" initial={{opacity:0,scale:.97}} animate={{opacity:1,scale:1}} transition={{duration:.65,ease:'easeOut'}} aria-label="Abstract water-inspired illustration">
        <div className="hero-visual-top"><span>INDUSTRIAL AQUA / RO</span><span>01 — 03</span></div>
        <div className="hero-water-ring ring-a"/><div className="hero-water-ring ring-b"/><div className="hero-water-ring ring-c"/>
        <div className="hero-drop"><Droplets size={72} strokeWidth={1}/></div>
        <div className="hero-visual-note"><span className="visual-note-mark"><Waves size={16}/></span><span><strong>Water care, considered.</strong><small>Parts for everyday maintenance</small></span></div>
        <span className="hero-vertical-label">FILTRATION · FLOW · FUNCTION</span>
      </motion.div>
      <div className="home-scroll-cue"><span>BUILT AROUND WHAT YOU NEED</span><ArrowDownRight size={15}/></div>
    </section>

    <section className="home-category-section">
      <div className="section-heading">
        <div><p className="eyebrow">EXPLORE BY COMPONENT</p><h2>A clearer way to find <em>your essentials.</em></h2></div>
        <Link to="/shop" className="section-link">View all categories <ArrowRight size={15}/></Link>
      </div>
      <div className="category-grid">
        {categories.map((category,index)=>{const Icon=category.icon;return <motion.article className="category-card" key={category.number} initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.2}} transition={{duration:.4,delay:index*.08}}>
          <div className="category-card-top"><span>{category.number} / COMPONENTS</span><Link to={category.to} aria-label={'Explore '+category.title}><ArrowUpRight size={17}/></Link></div>
          <div className={'category-illustration category-illustration-'+category.number}><div className="category-orbit"/><div className="category-icon"><Icon size={38} strokeWidth={1.15}/></div><span className="category-illustration-caption">{category.number === '01' ? 'FILTRATION' : category.number === '02' ? 'MEMBRANE SYSTEMS' : 'FLOW CONTROL'}</span></div>
          <h3>{category.title}</h3><p>{category.description}</p><Link to={category.to} className="category-card-link">Explore category <ArrowRight size={15}/></Link>
        </motion.article>})}
      </div>
      <p className="catalogue-note"><span/> Catalogue setup is in progress. Product availability and compatibility will be shown once verified product data is published.</p>
    </section>

    <section className="home-finder">
      <div className="finder-orb"><Droplets size={44} strokeWidth={1.1}/><span>FIND YOUR FIT</span></div>
      <div className="finder-copy"><p className="eyebrow">NOT SURE WHERE TO START?</p><h2>Let’s narrow it down <em>together.</em></h2><p>Start with the kind of component you need and work toward a more confident match for your RO system.</p></div>
      <Link to="/find-parts" className="button button-light">Find the right part <ArrowRight size={16}/></Link>
    </section>

    <section className="home-values">
      <div className="values-heading"><p className="eyebrow">A MORE THOUGHTFUL CATALOGUE</p><h2>Practical details.<br/><em>Less guesswork.</em></h2></div>
      <div className="values-list">{benefits.map((benefit,index)=><div className="value-row" key={benefit.title}><span className="value-index">0{index+1}</span><div><h3>{benefit.title}</h3><p>{benefit.description}</p></div><ArrowUpRight size={17}/></div>)}</div>
    </section>

    <section className="home-bottom-cta"><div><p className="eyebrow">INDUSTRIAL AQUA</p><h2>Make your next replacement <em>a little simpler.</em></h2></div><Link to="/shop" className="button button-dark">Browse parts <ArrowRight size={16}/></Link></section>
  </div>;
}

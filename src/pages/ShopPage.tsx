import {useMemo,useState} from 'react';
import {ArrowRight,ArrowUpRight,Check,Filter,Search,SlidersHorizontal, X, MessageCircle} from 'lucide-react';
import {Link,useSearchParams} from 'react-router-dom';
import {motion} from 'motion/react';

const whatsapp = (topic:string) => 'https://wa.me/?text=' + encodeURIComponent('Hello Industrial Aqua, I would like to enquire about ' + topic + '. Please share details and a quotation.');

const categories=[
 {id:'all',label:'All products',count:'Browse all'},
 {id:'domestic-ro',label:'Domestic RO',count:'RO systems'},
 {id:'commercial-ro',label:'Commercial RO',count:'RO systems'},
 {id:'500-1000-lph',label:'500–1000 LPH RO Plants',count:'RO plants'},
 {id:'industrial-ro',label:'Industrial RO Plants',count:'RO plants'},
 {id:'filters',label:'Filters & cartridges',count:'Components'},
 {id:'membranes',label:'RO membranes',count:'Components'},
 {id:'pumps-valves',label:'Pumps & valves',count:'Components'},
 {id:'tanks',label:'Storage tanks',count:'Components'},
 {id:'solutions',label:'Water treatment solutions',count:'Solutions'},
];
const guides=[
 {number:'01',title:'Domestic RO Systems',description:'Water purification systems and components for home use.',to:'/category/domestic-ro',tag:'DOMESTIC RO',art:'filter'},
 {number:'02',title:'Commercial RO Systems',description:'RO system options for offices, hospitality and commercial sites.',to:'/category/commercial-ro',tag:'COMMERCIAL RO',art:'membrane'},
 {number:'03',title:'500–1000 LPH RO Plants',description:'Mid-capacity plant options for business and institutional needs.',to:'/category/500-1000-lph',tag:'RO PLANTS',art:'pump'},
 {number:'04',title:'Industrial RO Plants',description:'Discuss capacity, feed water and application for industrial plant needs.',to:'/category/industrial-ro',tag:'INDUSTRIAL',art:'fittings'},
 {number:'05',title:'Filters & Cartridges',description:'Filtration components for maintenance and treatment systems.',to:'/category/filters',tag:'FILTRATION',art:'filter'},
 {number:'06',title:'RO Membranes',description:'Membrane options; verify system model and compatibility before purchase.',to:'/category/membranes',tag:'MEMBRANES',art:'membrane'},
 {number:'07',title:'Pumps & Valves',description:'Components for flow, pressure and system control.',to:'/category/pumps-valves',tag:'FLOW CONTROL',art:'pump'},
 {number:'08',title:'Storage Tanks',description:'Storage options for RO systems and water treatment installations.',to:'/category/tanks',tag:'STORAGE',art:'fittings'},
 {number:'09',title:'Water Treatment Solutions',description:'ETP, STP, water softeners, UV, UF and water chillers.',to:'/category/solutions',tag:'TREATMENT',art:'membrane'},
];

export function ShopPage(){
 const [searchParams,setSearchParams]=useSearchParams();
 const [query,setQuery]=useState(searchParams.get('q')??'');
 const [active,setActive]=useState('all');
 const visible=useMemo(()=>guides.filter(item=>(active==='all'||item.to.endsWith('/'+active)|| (active==='solutions'&&item.to.endsWith('/solutions')))&&(!query.trim()||(item.title+' '+item.description+' '+item.tag).toLowerCase().includes(query.trim().toLowerCase()))),[active,query]);
 const updateQuery=(value:string)=>{setQuery(value);if(value.trim())setSearchParams({q:value},{replace:true});else setSearchParams({}, {replace:true});};
 return <div className="shop-page">
  <section className="shop-intro">
   <div className="shop-breadcrumb"><Link to="/">Home</Link><span>/</span><span>Products</span></div>
   <p className="eyebrow"><span className="eyebrow-dot"/> THE INDUSTRIAL AQUA RANGE</p>
   <h1>Systems for <em>every scale.</em></h1>
   <p className="shop-intro-copy">Explore domestic and commercial RO systems, industrial RO plants, replacement components and water treatment solutions. Ask our team to confirm specifications, availability and pricing.</p>
   <form className="shop-search" onSubmit={event=>event.preventDefault()}>
    <Search size={19}/><input aria-label="Search product categories" value={query} onChange={event=>updateQuery(event.target.value)} placeholder="Search RO plants, filters, ETP, UV..."/>
    {query&&<button type="button" aria-label="Clear search" onClick={()=>updateQuery('')}><X size={16}/></button>}
    <button type="submit" className="shop-search-submit">Search <ArrowRight size={15}/></button>
   </form>
   <div className="shop-intro-meta"><span><Check size={14}/> Domestic to industrial</span><span><Check size={14}/> Enquiry-led product details</span></div>
  </section>
  <section className="shop-catalogue">
   <aside className="shop-sidebar">
    <div className="shop-sidebar-heading"><SlidersHorizontal size={16}/><span>Product categories</span></div>
    <div className="shop-category-list">{categories.map(item=><button type="button" key={item.id} className={active===item.id?'active':''} onClick={()=>setActive(item.id)}><span>{item.label}</span>{active===item.id&&<Check size={14}/>}</button>)}</div>
    <div className="shop-sidebar-note"><span className="shop-note-icon"><Filter size={17}/></span><strong>Need help choosing?</strong><p>Share your application and capacity requirement with our team.</p><a href={whatsapp('product selection help')} target="_blank" rel="noreferrer">Ask on WhatsApp <ArrowUpRight size={14}/></a></div>
   </aside>
   <div className="shop-results">
    <div className="shop-results-heading"><div><p className="eyebrow">PRODUCT DIRECTORY</p><h2>{active==='all'?'Explore our range':categories.find(item=>item.id===active)?.label}</h2></div><span className="shop-result-count">{visible.length} {visible.length===1?'category':'categories'}</span></div>
    {visible.length>0?<div className="shop-category-grid">{visible.map((item,index)=><motion.article key={item.number} className="shop-category-card" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:.28,delay:index*.035}}><Link to={item.to} className="shop-card-art" aria-label={'Open '+item.title}><span className="shop-card-number">{item.number} / PRODUCT</span><div className={'shop-art-symbol shop-art-'+item.art}><span className="shop-art-ring"/><span className="shop-art-core">{item.art==='filter'?'F':item.art==='membrane'?'M':item.art==='pump'?'P':'+'}</span></div><span className="shop-card-tag">{item.tag}</span></Link><div className="shop-card-copy"><h3>{item.title}</h3><p>{item.description}</p><Link to={item.to} className="shop-card-link">View category <ArrowRight size={15}/></Link><a href={whatsapp(item.title)} target="_blank" rel="noreferrer" className="shop-card-whatsapp"><MessageCircle size={14}/> Enquire on WhatsApp <ArrowUpRight size={14}/></a></div></motion.article>)}</div>:<div className="shop-empty"><span className="shop-empty-icon"><Search size={22}/></span><h3>No matching categories</h3><p>Try a broader search term or clear your search to explore all products.</p><button className="button button-dark" onClick={()=>{updateQuery('');setActive('all')}}>Clear filters <X size={15}/></button></div>}
    <div className="shop-catalogue-status"><span className="shop-status-dot"/><div><strong>Product catalogue in progress</strong><p>These are product categories, not individual stock listings. Upload your catalogue to add verified models, specifications, prices and product photos.</p></div></div>
   </div>
  </section>
 </div>;
}

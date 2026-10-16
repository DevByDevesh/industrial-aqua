import {useMemo,useState} from 'react';
import {ArrowRight,ArrowUpRight,Check,Filter,Search,SlidersHorizontal, X} from 'lucide-react';
import {Link,useSearchParams} from 'react-router-dom';
import {motion} from 'motion/react';

const categories=[
 {id:'all',label:'All components',count:'Browse all'},
 {id:'filters',label:'Filters & cartridges',count:'Filtration'},
 {id:'membranes',label:'RO membranes',count:'Membrane systems'},
 {id:'pumps-valves',label:'Pumps & valves',count:'Flow control'},
 {id:'fittings',label:'Fittings & tubing',count:'Connections'},
];
const guides=[
 {number:'01',title:'Filters & cartridges',description:'Explore replacement filtration components for routine maintenance.',to:'/category/filters',tag:'FILTRATION',art:'filter'},
 {number:'02',title:'RO membranes',description:'Learn about membrane options and check system requirements before choosing.',to:'/category/membranes',tag:'MEMBRANE SYSTEMS',art:'membrane'},
 {number:'03',title:'Pumps & valves',description:'Find the components that support pressure, flow and control.',to:'/category/pumps-valves',tag:'FLOW CONTROL',art:'pump'},
 {number:'04',title:'Fittings & tubing',description:'Browse connection essentials for RO water systems.',to:'/category/fittings',tag:'CONNECTIONS',art:'fittings'},
];

export function ShopPage(){
 const [searchParams,setSearchParams]=useSearchParams();
 const [query,setQuery]=useState(searchParams.get('q')??'');
 const [active,setActive]=useState('all');
 const visible=useMemo(()=>guides.filter(item=>(active==='all'||item.to.endsWith('/'+active))&&(!query.trim()||(item.title+' '+item.description+' '+item.tag).toLowerCase().includes(query.trim().toLowerCase()))),[active,query]);
 const updateQuery=(value:string)=>{setQuery(value);if(value.trim())setSearchParams({q:value},{replace:true});else setSearchParams({}, {replace:true});};
 return <div className="shop-page">
  <section className="shop-intro">
   <div className="shop-breadcrumb"><Link to="/">Home</Link><span>/</span><span>Shop</span></div>
   <p className="eyebrow"><span className="eyebrow-dot"/> THE INDUSTRIAL AQUA CATALOGUE</p>
   <h1>Find your next <em>essential.</em></h1>
   <p className="shop-intro-copy">Explore the components behind everyday RO maintenance. Start with a category or search for the part you have in mind.</p>
   <form className="shop-search" onSubmit={event=>event.preventDefault()}>
    <Search size={19}/><input aria-label="Search catalogue categories" value={query} onChange={event=>updateQuery(event.target.value)} placeholder="Search filters, membranes, pumps..."/>
    {query&&<button type="button" aria-label="Clear search" onClick={()=>updateQuery('')}><X size={16}/></button>}
    <button type="submit" className="shop-search-submit">Search <ArrowRight size={15}/></button>
   </form>
   <div className="shop-intro-meta"><span><Check size={14}/> Category-led discovery</span><span><Check size={14}/> No unverified product claims</span></div>
  </section>
  <section className="shop-catalogue">
   <aside className="shop-sidebar">
    <div className="shop-sidebar-heading"><SlidersHorizontal size={16}/><span>Categories</span></div>
    <div className="shop-category-list">{categories.map(item=><button type="button" key={item.id} className={active===item.id?'active':''} onClick={()=>setActive(item.id)}><span>{item.label}</span>{active===item.id&&<Check size={14}/>}</button>)}</div>
    <div className="shop-sidebar-note"><span className="shop-note-icon"><Filter size={17}/></span><strong>Need help choosing?</strong><p>Use the guided finder to narrow down the component you need.</p><Link to="/find-parts">Find a part <ArrowUpRight size={14}/></Link></div>
   </aside>
   <div className="shop-results">
    <div className="shop-results-heading"><div><p className="eyebrow">COMPONENT DIRECTORY</p><h2>{active==='all'?'Explore categories':categories.find(item=>item.id===active)?.label}</h2></div><span className="shop-result-count">{visible.length} {visible.length===1?'category':'categories'}</span></div>
    {visible.length>0?<div className="shop-category-grid">{visible.map((item,index)=><motion.article key={item.number} className="shop-category-card" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:.28,delay:index*.05}}><Link to={item.to} className="shop-card-art" aria-label={'Open '+item.title}><span className="shop-card-number">{item.number} / COMPONENT</span><div className={'shop-art-symbol shop-art-'+item.art}><span className="shop-art-ring"/><span className="shop-art-core">{item.art==='filter'?'F':item.art==='membrane'?'M':item.art==='pump'?'P':'+'}</span></div><span className="shop-card-tag">{item.tag}</span></Link><div className="shop-card-copy"><h3>{item.title}</h3><p>{item.description}</p><Link to={item.to} className="shop-card-link">Explore category <ArrowRight size={15}/></Link></div></motion.article>)}</div>:<div className="shop-empty"><span className="shop-empty-icon"><Search size={22}/></span><h3>No matching categories</h3><p>Try a broader search term or clear your search to explore all components.</p><button className="button button-dark" onClick={()=>{updateQuery('');setActive('all')}}>Clear filters <X size={15}/></button></div>}
    <div className="shop-catalogue-status"><span className="shop-status-dot"/><div><strong>Product catalogue in progress</strong><p>Individual products, verified prices, stock and compatibility will appear here after the catalogue data is configured.</p></div></div>
   </div>
  </section>
 </div>;
}

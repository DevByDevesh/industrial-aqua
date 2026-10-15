import {createContext,useCallback,useContext,useEffect,useRef,useState,type PropsWithChildren} from 'react';
import {Check,X} from 'lucide-react';
type ToastInput={title:string;description?:string;actionLabel?:string;onAction?:()=>void};
type ToastItem=ToastInput&{id:number};
type ToastApi={showToast:(toast:ToastInput)=>void;dismissToast:(id:number)=>void};
const ToastContext=createContext<ToastApi|null>(null);
export function useToast(){const value=useContext(ToastContext);if(!value)throw new Error('useToast must be used inside ToastProvider');return value}
export function ToastProvider({children}:PropsWithChildren){const [items,setItems]=useState<ToastItem[]>([]);const nextId=useRef(0);const timers=useRef<number[]>([]);
 const dismissToast=useCallback((id:number)=>setItems(current=>current.filter(item=>item.id!==id)),[]);
 const showToast=useCallback((toast:ToastInput)=>{const id=++nextId.current;setItems(current=>[...current.slice(-2),{...toast,id}]);const timer=window.setTimeout(()=>setItems(current=>current.filter(item=>item.id!==id)),4500);timers.current.push(timer)},[]);
 useEffect(()=>()=>timers.current.forEach(window.clearTimeout),[]);
 return <ToastContext.Provider value={{showToast,dismissToast}}>{children}<div className="toast-region" aria-live="polite" aria-relevant="additions text">{items.map(item=><section className="toast-card" key={item.id} role="status"><span className="toast-icon"><Check size={16}/></span><div className="toast-copy"><strong>{item.title}</strong>{item.description&&<p>{item.description}</p>}{item.actionLabel&&item.onAction&&<button className="toast-action" onClick={item.onAction}>{item.actionLabel} <span aria-hidden="true">→</span></button>}</div><button className="toast-dismiss" aria-label="Dismiss notification" onClick={()=>dismissToast(item.id)}><X size={16}/></button></section>)}</div></ToastContext.Provider>
}

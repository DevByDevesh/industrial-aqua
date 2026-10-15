import type { Transition, Variants } from 'motion/react';
export const motionTokens={duration:{fast:.16,standard:.32,reveal:.56,hero:.78},ease:{standard:[.22,1,.36,1] as const,entrance:[.16,1,.3,1] as const},distance:{subtle:8,standard:18,hero:30}} as const;
export const transitions={fast:{duration:motionTokens.duration.fast,ease:motionTokens.ease.standard},standard:{duration:motionTokens.duration.standard,ease:motionTokens.ease.standard},reveal:{duration:motionTokens.duration.reveal,ease:motionTokens.ease.entrance},hero:{duration:motionTokens.duration.hero,ease:motionTokens.ease.entrance},drawer:{duration:.28,ease:motionTokens.ease.standard},modal:{duration:.22,ease:motionTokens.ease.standard},image:{duration:.4,ease:motionTokens.ease.standard}} satisfies Record<string,Transition>;
export const sectionReveal:Variants={hidden:{opacity:0,y:motionTokens.distance.standard},visible:{opacity:1,y:0,transition:{...transitions.reveal,when:'beforeChildren',staggerChildren:.075}}};
export const staggerItem:Variants={hidden:{opacity:0,y:motionTokens.distance.subtle},visible:{opacity:1,y:0,transition:transitions.standard}};
export const heroSequence:Variants={hidden:{opacity:0,y:motionTokens.distance.hero},visible:(index:number=0)=>({opacity:1,y:0,transition:{...transitions.hero,delay:index*.1}})};
export const drawerVariants:Variants={closed:{x:'100%',transition:transitions.drawer},open:{x:0,transition:transitions.drawer}};
export const modalVariants:Variants={hidden:{opacity:0,scale:.985,y:8,transition:transitions.modal},visible:{opacity:1,scale:1,y:0,transition:transitions.modal}};
export const imageTransition=transitions.image;

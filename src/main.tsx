import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { App } from './app/App';
import { LenisProvider } from './app/LenisProvider';
import './styles/index.css';
createRoot(document.getElementById('root')!).render(<StrictMode><MotionConfig reducedMotion="user"><BrowserRouter><LenisProvider><App/></LenisProvider></BrowserRouter></MotionConfig></StrictMode>);

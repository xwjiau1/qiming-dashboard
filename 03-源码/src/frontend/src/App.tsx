import { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from './components/Toast';

// Lazy load pages — 按路由拆分代码
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Departments = lazy(() => import('./pages/Departments'));
const Projects = lazy(() => import('./pages/Projects'));
const Documents = lazy(() => import('./pages/Documents'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Todos = lazy(() => import('./pages/Todos'));

// Loading fallback
function PageLoading() {
  return (
    <div className="flex items-center justify-center h-screen bg-bg">
      <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <>
      <ToastContainer />
      <Suspense fallback={<PageLoading />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/todos" element={<Todos />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </>
  );
}

import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import Dashboard from './pages/Dashboard';
import Departments from './pages/Departments';
import Projects from './pages/Projects';
import Documents from './pages/Documents';
import Tasks from './pages/Tasks';

export default function App() {
  const location = useLocation();

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#141418',
            border: '1px solid #1E1E24',
            color: '#fff',
          },
        }}
      />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/tasks" element={<Tasks />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

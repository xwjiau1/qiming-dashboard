import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Departments from './pages/Departments';
import Projects from './pages/Projects';
import Documents from './pages/Documents';
import Tasks from './pages/Tasks';

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/tasks" element={<Tasks />} />
      </Routes>
    </AnimatePresence>
  );
}

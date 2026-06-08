import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.33, 1, 0.68, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: [0.33, 1, 0.68, 1] as const,
    },
  },
};

export default function PageLayout({ children, title, subtitle }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-black">
      <Sidebar />
      <div className="lg:ml-[72px] xl:ml-60">
        <Topbar title={title} subtitle={subtitle} />
        <main className="pt-14 min-h-screen">
          <motion.div
            key={title}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="p-4 lg:p-6"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

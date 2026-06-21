import { motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-deep-blue-950 bg-grid-pattern bg-grid">
      <div className="fixed inset-0 bg-gradient-radial from-tech-indigo-600/5 via-transparent to-transparent pointer-events-none" />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 p-6 relative"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}

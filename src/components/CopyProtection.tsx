import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

export const CopyProtection: React.FC = () => {
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      // Prevent the copy action
      e.preventDefault();
      // Show our custom alert
      setShowAlert(true);
      
      // Clear clipboard to be extra safe
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', 'Copying is disabled on this website.');
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      // Optional: Disable right-click to make copying harder
      // e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+C, Ctrl+U, Ctrl+S, Ctrl+Shift+I (DevTools)
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'u' || e.key === 's')) ||
        (e.ctrlKey && e.shiftKey && e.key === 'I')
      ) {
        e.preventDefault();
        setShowAlert(true);
      }
    };

    window.addEventListener('copy', handleCopy);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <AnimatePresence>
      {showAlert && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop that blocks interaction */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="relative w-full max-w-md bg-zinc-900 border border-red-500/30 rounded-[2.5rem] shadow-[0_0_50px_rgba(239,68,68,0.2)] overflow-hidden p-8 text-center"
          >
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500 mb-6">
              <ShieldAlert size={40} />
            </div>
            
            <h3 className="text-2xl font-black text-white tracking-tighter mb-4 uppercase">
              Content Protected
            </h3>
            
            <p className="text-white/60 mb-8 leading-relaxed">
              Copying content from this website is strictly prohibited to protect our intellectual property. Please respect the creator's work.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAlert(false)}
              className="w-full py-4 bg-red-500 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-red-600 transition-all uppercase tracking-widest text-sm shadow-lg shadow-red-500/20"
            >
              <X size={20} />
              Close & Continue
            </motion.button>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-white/20 uppercase font-bold tracking-widest">
              <AlertTriangle size={12} />
              Security System Active
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

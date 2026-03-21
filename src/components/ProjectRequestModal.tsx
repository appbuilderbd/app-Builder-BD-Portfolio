import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Briefcase, FileText, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './FirebaseProvider';

interface ProjectRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectRequestModal: React.FC<ProjectRequestModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [projectName, setProjectName] = useState('');
  const [details, setDetails] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ADMIN_EMAIL = 'sojibahmed00087@gmail.com';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Save to Firestore
      await addDoc(collection(db, 'project_requests'), {
        projectName,
        details,
        imageUrl,
        userEmail: user.email,
        userId: user.uid,
        createdAt: serverTimestamp(),
        recipientEmail: ADMIN_EMAIL
      });

      // 2. Prepare mailto link for "automatic" email feel
      const subject = encodeURIComponent(`New Project Request: ${projectName}`);
      const body = encodeURIComponent(
        `Hello,\n\nI have a new project request:\n\n` +
        `Project Name: ${projectName}\n` +
        `Details: ${details}\n` +
        `Image URL: ${imageUrl || 'N/A'}\n\n` +
        `From: ${user.email}\n` +
        `User ID: ${user.uid}`
      );
      
      // Open mailto link in a new tab/window
      window.open(`mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`, '_blank');

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        // Reset form
        setProjectName('');
        setDetails('');
        setImageUrl('');
      }, 3000);
    } catch (err: any) {
      console.error("Project Request Error:", err);
      setError(err.message || "Failed to send project request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#00ff88]/20 rounded-xl flex items-center justify-center text-[#00ff88]">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Submit Project</h3>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">New Request</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-8">
              {success ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center space-y-4"
                >
                  <div className="w-20 h-20 bg-[#00ff88]/20 rounded-full flex items-center justify-center mx-auto text-[#00ff88]">
                    <CheckCircle2 size={40} />
                  </div>
                  <h4 className="text-2xl font-bold text-white">Request Submitted!</h4>
                  <p className="text-white/60">Your project details have been saved and your email client has been opened to send the message.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm">
                      <AlertCircle size={18} />
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] text-white/40 uppercase font-black tracking-widest flex items-center gap-2">
                      <Briefcase className="w-3 h-3" />
                      Project Name
                    </label>
                    <input
                      required
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g. My Awesome App"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-[#00ff88]/50 focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-white/40 uppercase font-black tracking-widest flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      Project Details
                    </label>
                    <textarea
                      required
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="Describe your project requirements..."
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-[#00ff88]/50 focus:bg-white/10 transition-all resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-white/40 uppercase font-black tracking-widest flex items-center gap-2">
                      <ImageIcon className="w-3 h-3" />
                      Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-[#00ff88]/50 focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div className="pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full py-5 bg-[#00ff88] text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-[#00ff88]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Submit & Send Email
                        </>
                      )}
                    </motion.button>
                    <p className="mt-4 text-center text-[10px] text-white/20 uppercase font-bold tracking-widest">
                      Sent to: {ADMIN_EMAIL}
                    </p>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

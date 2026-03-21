import React, { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth, handleFirestoreError, OperationType } from './FirebaseProvider';
import { motion } from 'motion/react';
import { User as UserIcon, Save, LogOut, Camera, Edit3, Mail, Info } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export const Profile: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setBio(profile.bio || '');
      setPhotoURL(profile.photoURL || '');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        displayName,
        bio,
        photoURL,
        updatedAt: serverTimestamp(),
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      console.error("Profile Update Error:", err);
      setMessage({ type: 'error', text: 'Failed to update profile: ' + err.message });
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error("Logout Error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-10 h-10 border-4 border-[#00ff88]/20 border-t-[#00ff88] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-20 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-4">Please log in to view your profile</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <div className="bg-black/40 backdrop-blur-xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden">
        {/* Header/Banner */}
        <div className="h-48 bg-gradient-to-br from-[#00ff88]/20 to-indigo-500/20 relative">
          <div className="absolute -bottom-16 left-8 sm:left-12">
            <div className="w-32 h-32 rounded-3xl bg-black border-4 border-white/10 overflow-hidden shadow-2xl relative group">
              {photoURL ? (
                <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                  <UserIcon className="w-12 h-12 text-white/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          <div className="absolute top-8 right-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl border border-red-500/20 flex items-center gap-2 text-sm font-bold transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="pt-24 pb-12 px-8 sm:px-12">
          <div className="mb-12">
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2">{displayName || 'User Profile'}</h1>
            <p className="text-white/40 text-sm font-medium flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {user.email}
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 uppercase font-black tracking-widest flex items-center gap-2">
                  <Edit3 className="w-3 h-3" />
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-[#00ff88]/50 focus:bg-white/10 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-white/40 uppercase font-black tracking-widest flex items-center gap-2">
                  <Camera className="w-3 h-3" />
                  Avatar URL
                </label>
                <input
                  type="url"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-[#00ff88]/50 focus:bg-white/10 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-white/40 uppercase font-black tracking-widest flex items-center gap-2">
                <Info className="w-3 h-3" />
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-[#00ff88]/50 focus:bg-white/10 transition-all resize-none"
              />
            </div>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl text-sm font-bold text-center border ${
                  message.type === 'success' 
                    ? 'bg-[#00ff88]/10 border-[#00ff88]/20 text-[#00ff88]' 
                    : 'bg-red-500/10 border-red-500/20 text-red-500'
                }`}
              >
                {message.text}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={saving}
              className="w-full py-5 bg-[#00ff88] text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-[#00ff88]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
};

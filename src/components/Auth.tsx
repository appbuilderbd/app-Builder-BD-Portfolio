import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, LogOut, User as UserIcon, Mail, Lock, UserPlus, ArrowRight } from 'lucide-react';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update profile with display name
        await updateProfile(user, { displayName: displayName || 'User' });

        // Create user document in Firestore
        const isAdminEmail = email === 'banglagamerz330@gmail.com';
        await setDoc(doc(db, 'users', user.uid), {
          displayName: displayName || 'User',
          email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          role: isAdminEmail ? 'admin' : 'user'
        });
      }
      navigate('/');
    } catch (err: any) {
      console.error("Auth Error:", err);
      let message = "An error occurred during authentication.";
      if (err.code === 'auth/user-not-found') message = "No user found with this email.";
      else if (err.code === 'auth/wrong-password') message = "Incorrect password.";
      else if (err.code === 'auth/email-already-in-use') message = "Email already in use.";
      else if (err.code === 'auth/weak-password') message = "Password should be at least 6 characters.";
      else if (err.code === 'auth/operation-not-allowed') {
        message = "Email/Password login is not enabled in Firebase. Please enable it in the Firebase Console (Authentication > Sign-in method).";
      }
      else message = err.message;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        const isAdminEmail = user.email === 'banglagamerz330@gmail.com';
        await setDoc(doc(db, 'users', user.uid), {
          displayName: user.displayName || 'User',
          email: user.email,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          role: isAdminEmail ? 'admin' : 'user'
        });
      }
      navigate('/');
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl max-w-md w-full mx-auto">
      <div className="w-20 h-20 bg-[#00ff88]/20 rounded-full flex items-center justify-center mb-6 border border-[#00ff88]/30">
        <UserIcon className="w-10 h-10 text-[#00ff88]" />
      </div>
      
      <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
        {isLogin ? 'Welcome Back' : 'Create Account'}
      </h2>
      <p className="text-white/60 text-center mb-8">
        {isLogin ? 'Sign in to your account to continue.' : 'Join us today and start your journey.'}
      </p>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleAuth} className="w-full space-y-4">
        {!isLogin && (
          <div className="relative">
            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Full Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#00ff88]/50 transition-all"
            />
          </div>
        )}

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#00ff88]/50 transition-all"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#00ff88]/50 transition-all"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 bg-[#00ff88] text-black font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-[#00ff88]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          ) : (
            <>
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>

        <div className="relative flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-white/20 text-xs font-bold uppercase tracking-widest">OR</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-4 px-6 bg-white/5 border border-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <img src="https://www.gstatic.com/firebase/explore/google.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </motion.button>
      </form>

      <div className="mt-8 flex flex-col items-center gap-4">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-white/60 hover:text-[#00ff88] transition-colors text-sm font-medium"
        >
          {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
        </button>
        <p className="text-white/20 text-[10px] uppercase tracking-[0.2em] font-bold">Secure Authentication</p>
      </div>
    </div>
  );
};

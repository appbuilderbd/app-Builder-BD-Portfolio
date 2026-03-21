import React, { useCallback, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView, animate, useMotionValue } from 'motion/react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { FirebaseProvider, useAuth, handleFirestoreError, OperationType } from './components/FirebaseProvider';
import { Auth } from './components/Auth';
import { Profile } from './components/Profile';
import { 
  ArrowRight, 
  CheckCircle2, 
  ShoppingBasket, 
  Eye, 
  Mail, 
  Instagram, 
  Twitter, 
  MessageCircle, 
  Palette, 
  Layout, 
  Video, 
  Image as ImageIcon, 
  Trophy, 
  Cpu,
  X,
  Send,
  Plus,
  Trash2,
  LogOut,
  Settings,
  User,
  Share2,
  Monitor,
  Moon,
  Sun,
  ArrowUp,
  Briefcase
} from 'lucide-react';
import { ProjectRequestModal } from './components/ProjectRequestModal';
import { CopyProtection } from './components/CopyProtection';

// Counter Component for animated numbers
function Counter({ value, duration = 2 }: { value: string, duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const count = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState("0");

  // Extract number and suffix (e.g., "150+" -> { num: 150, suffix: "+" })
  const match = value.match(/(\d+)(.*)/);
  const target = match ? parseInt(match[1]) : 0;
  const suffix = match ? match[2] : "";

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, target, {
        duration: duration,
        ease: "easeOut",
        onUpdate: (latest) => {
          setDisplayValue(Math.floor(latest).toString());
        }
      });
      return () => controls.stop();
    }
  }, [isInView, target, count, duration]);

  return (
    <span ref={ref}>
      {displayValue}{suffix}
    </span>
  );
}

// Modal Component
const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
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
          className="relative w-full max-w-2xl bg-bg-secondary border border-border-primary rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="flex items-center justify-between p-6 border-b border-border-primary/50">
            <h3 className="text-xl font-bold text-text-primary uppercase tracking-wider">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
              <X size={24} className="text-text-secondary" />
            </button>
          </div>
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// Service Card Component
function ServiceCard({ title, image, onClick }: { title: string, image: string, onClick: () => void, key?: React.Key }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl bg-bg-secondary border border-border-primary p-4 flex flex-col gap-4 cursor-pointer"
    >
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-zinc-900/10 dark:bg-zinc-900">
        <img 
          src={image} 
          alt={title} 
          loading="lazy"
          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] md:text-xs font-bold text-text-primary tracking-wider uppercase max-w-[70%]">
          {title}
        </h3>
        <div className="w-8 h-8 rounded-full bg-[#00ff88] flex items-center justify-center text-black hover:scale-110 transition-transform">
          <ArrowRight size={16} />
        </div>
      </div>
      <div className="absolute top-2 right-2 text-[6px] font-bold text-[#00ff88]/20 uppercase tracking-widest group-hover:text-[#00ff88]/40 transition-colors">
        App Builder BD
      </div>
    </motion.div>
  );
}

// Project Card Component
function ProjectCard({ project }: { project: any, key?: React.Key }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className="group bg-bg-secondary border border-border-primary rounded-3xl overflow-hidden hover:border-[#00ff88]/50 transition-all duration-500"
    >
      <div className="aspect-video overflow-hidden relative">
        <img 
          src={project.image} 
          alt={project.title} 
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
          <div className="flex gap-2">
            {project.tech.map((t: string, i: number) => (
              <span key={i} className="px-2 py-1 bg-[#00ff88]/20 text-[#00ff88] text-[8px] font-bold uppercase rounded-md border border-[#00ff88]/30">{t}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="p-6 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] text-[#00ff88] font-bold uppercase tracking-widest">{project.category}</span>
            <h3 className="text-xl font-bold text-text-primary">{project.title}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-bg-primary border border-border-primary flex items-center justify-center text-text-secondary group-hover:text-[#00ff88] group-hover:border-[#00ff88] transition-colors">
            <ArrowRight size={18} />
          </div>
        </div>
        <p className="text-text-secondary text-xs leading-relaxed line-clamp-2">{project.description}</p>
      </div>
    </motion.div>
  );
}

// Social Icon Component
const SocialIcon = ({ color, icon: Icon, label, href }: { color: string, icon: any, label: string, href: string }) => (
  <a 
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex flex-col items-center gap-2 group cursor-pointer"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`} style={{ backgroundColor: color }}>
      <Icon size={24} className="text-white" />
    </div>
    <span className="text-[10px] text-zinc-500 uppercase tracking-tighter group-hover:text-zinc-300">{label}</span>
  </a>
);

// Custom Cursor Component
const CustomCursor = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, .cursor-pointer')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 border-2 border-[#00ff88] rounded-full pointer-events-none z-[10000] hidden md:block"
      animate={{
        x: mousePos.x - 16,
        y: mousePos.y - 16,
        scale: isHovering ? 1.5 : 1,
        backgroundColor: isHovering ? "rgba(0, 255, 136, 0.2)" : "transparent"
      }}
      transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
    />
  );
};

// Walking Character Component
const WalkingCharacter = () => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isAngry, setIsAngry] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left

  useEffect(() => {
    if (!isVisible || isAngry) return;

    const moveInterval = setInterval(() => {
      const newX = Math.random() * (window.innerWidth - 100);
      const newY = Math.random() * (window.innerHeight - 100);
      
      setDirection(newX > position.x ? 1 : -1);
      setPosition({ x: newX, y: newY });
    }, 4000);

    return () => clearInterval(moveInterval);
  }, [position, isVisible, isAngry]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAngry) return;
    
    setIsAngry(true);
    
    // Move away quickly
    setTimeout(() => {
      setPosition(prev => ({ x: prev.x + (direction * 800), y: prev.y - 800 }));
      
      setTimeout(() => {
        setIsVisible(false);
        setIsAngry(false);
        
        // Reappear after 6 seconds
        setTimeout(() => {
          setPosition({ 
            x: Math.random() * (window.innerWidth - 100), 
            y: Math.random() * (window.innerHeight - 100) 
          });
          setIsVisible(true);
        }, 6000);
      }, 500);
    }, 1000);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      animate={{ 
        x: position.x, 
        y: position.y,
        scaleX: direction,
        rotate: isAngry ? [0, 10, -10, 10, 0] : 0
      }}
      transition={{ 
        x: { type: "spring", stiffness: isAngry ? 100 : 30, damping: 15, duration: isAngry ? 0.5 : 4 },
        y: { type: "spring", stiffness: isAngry ? 100 : 30, damping: 15, duration: isAngry ? 0.5 : 4 },
        scaleX: { type: "spring", stiffness: isAngry ? 100 : 30, damping: 15, duration: isAngry ? 0.5 : 4 },
        rotate: { type: "tween", duration: 0.5 }
      }}
      onClick={handleClick}
      className="fixed top-0 left-0 z-[9999] cursor-pointer pointer-events-auto select-none"
      style={{ width: 60, height: 60 }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Cute Robot Character */}
        <div className={`relative w-12 h-12 bg-[#00ff88] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-colors duration-300 ${isAngry ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : ''}`}>
          <div className="flex gap-1.5">
            <div className={`w-2 h-2 rounded-full ${isAngry ? 'bg-white' : 'bg-black'} animate-pulse`} />
            <div className={`w-2 h-2 rounded-full ${isAngry ? 'bg-white' : 'bg-black'} animate-pulse`} />
          </div>
          {/* Glasses for "smart" look */}
          <div className="absolute top-4 w-8 h-0.5 bg-black/20" />
          {/* Antenna */}
          <div className="absolute -top-2 w-1 h-3 bg-inherit rounded-full" />
          <div className="absolute -top-3 w-2 h-2 bg-inherit rounded-full animate-bounce" />
          
          {/* Angry eyebrows */}
          {isAngry && (
            <>
              <div className="absolute top-3 left-2 w-3 h-0.5 bg-white rotate-45" />
              <div className="absolute top-3 right-2 w-3 h-0.5 bg-white -rotate-45" />
            </>
          )}
        </div>
        {/* Speech bubble when angry */}
        <AnimatePresence>
          {isAngry && (
            <motion.div
              initial={{ opacity: 0, scale: 0, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0, y: 10 }}
              className="absolute -top-12 bg-white text-black text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap shadow-xl"
            >
              DON'T TOUCH! 😤
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

function AuthButton({ onAdminClick }: { onAdminClick?: () => void }) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />;

  if (user) {
    return (
      <div className="flex items-center gap-2">
        {profile?.role === 'admin' && (
          <button 
            onClick={onAdminClick}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#00ff88] text-black text-[10px] md:text-xs font-black hover:bg-[#00ff88]/90 transition-all shadow-[0_0_15px_rgba(0,255,136,0.2)] uppercase tracking-widest"
          >
            <Settings size={14} className="hidden md:block" /> Dashboard
          </button>
        )}
        <Link 
          to="/profile"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-bg-secondary border border-border-primary text-text-primary text-[10px] md:text-xs font-bold hover:bg-bg-secondary/80 transition-all"
        >
          {profile?.photoURL ? (
            <img src={profile.photoURL} alt="" className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <User size={14} />
          )}
          <span className="hidden md:inline">{profile?.displayName || 'Profile'}</span>
        </Link>
      </div>
    );
  }

  return (
    <Link 
      to="/login"
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#00ff88] text-black text-[10px] md:text-xs font-black hover:bg-[#00ff88]/90 transition-all shadow-[0_0_15px_rgba(0,255,136,0.2)] uppercase tracking-widest"
    >
      <User size={14} /> Login
    </Link>
  );
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState<'home' | 'admin'>('home');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { user, profile } = useAuth();
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Portfolio Content State
  const defaultContent = {
    hero: {
      title: "Full-Stack App Developer \n & Creative Brand Designer",
      firstName: "app",
      middleChar: "B",
      lastName: "uilder BD",
      bio: "I craft high-performance mobile & web applications with a focus on stunning UI/UX and creative brand identity. Bridging the gap between complex code and beautiful design.",
      avatar: "https://picsum.photos/seed/developer-avatar/800/800"
    },
    services: [
      { title: "MOBILE APP DEVELOPMENT", image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800", link: "", description: "Building high-performance, native-feel mobile applications for iOS and Android using React Native and Flutter." },
      { title: "FULL-STACK WEB APPS", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800", link: "", description: "Scalable, secure, and modern web applications built with React, Next.js, and Node.js." },
      { title: "UI/UX & PRODUCT DESIGN", image: "https://images.unsplash.com/photo-1586717791821-3f44a563dc4c?auto=format&fit=crop&q=80&w=800", link: "", description: "User-centric design that focuses on usability, accessibility, and aesthetic appeal." },
      { title: "BRAND IDENTITY & LOGO DESIGN", image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800", link: "", description: "Professional brand identity and logo design services that tell your story." },
      { title: "AI-POWERED SOLUTIONS", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800", link: "", description: "Integrating cutting-edge AI models like Gemini and OpenAI into your business workflows." },
      { title: "GRAPHIC & MOTION DESIGN", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800", link: "", description: "Eye-catching graphics and motion designs for social media, ads, and more." }
    ],
    projects: [
      { title: "E-Commerce App", category: "Mobile App", description: "A full-featured e-commerce application with real-time tracking, secure payments, and a sleek UI.", image: "https://images.unsplash.com/photo-1556742049-02e49f9d4b10?auto=format&fit=crop&q=80&w=800", tech: ["React Native", "Firebase", "Stripe"] },
      { title: "Social Connect", category: "Web App", description: "A social media platform for professionals to share insights and collaborate on projects.", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800", tech: ["Next.js", "Tailwind", "PostgreSQL"] },
      { title: "Brand Identity - Zenith", category: "Graphic Design", description: "Complete brand identity for a tech startup, including logo, typography, and marketing assets.", image: "https://images.unsplash.com/photo-1572044162444-ad60f128bde2?auto=format&fit=crop&q=80&w=800", tech: ["Illustrator", "Photoshop", "Figma"] },
      { title: "Foodie Express", category: "Mobile App", description: "A multi-vendor food delivery platform with real-time GPS tracking and AI-based recommendations.", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800", tech: ["Flutter", "Node.js", "MongoDB"] },
      { title: "FitTrack Pro", category: "Mobile App", description: "Advanced fitness tracking app with wearable integration and personalized workout plans.", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800", tech: ["React Native", "HealthKit", "Redux"] },
      { title: "Estate Master", category: "Web App", description: "Premium real estate listing platform with 360-degree virtual tours and mortgage calculators.", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800", tech: ["React", "Three.js", "Firebase"] }
    ],
    about: {
      text: "I am a dedicated professional with over 5 years of experience in the digital space. My mission is to help businesses grow by providing them with high-quality, scalable, and visually stunning digital products. Whether it's a mobile app that millions will use or a brand identity that defines a company, I bring the same level of passion and precision to every project.",
      experience: "5+ Years",
      projects: "150+",
      clients: "80+"
    },
    socials: {
      gmail: "hello@ivannrence.com",
      instagram: "https://instagram.com",
      whatsapp: "https://wa.me/1234567890",
      twitter: "https://twitter.com",
      pinterest: "https://pinterest.com",
      behance: "https://behance.net"
    }
  };

  const [content, setContent] = useState(defaultContent);

  // Load content from Firestore
  useEffect(() => {
    const contentDocRef = doc(db, 'site_content', 'main');
    const unsubscribeContent = onSnapshot(contentDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setContent(prev => ({
          ...prev,
          ...data,
          hero: { ...prev.hero, ...data.hero },
          about: { ...prev.about, ...data.about },
          socials: { ...prev.socials, ...data.socials },
          services: data.services || prev.services,
          projects: data.projects || prev.projects
        }));
      } else {
        // Fallback to localStorage if Firestore is empty
        const saved = localStorage.getItem('portfolio_content');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setContent(prev => ({
              ...prev,
              ...parsed,
              hero: { ...prev.hero, ...parsed.hero },
              about: { ...prev.about, ...parsed.about },
              socials: { ...prev.socials, ...parsed.socials },
              services: parsed.services || prev.services,
              projects: parsed.projects || prev.projects
            }));
          } catch (e) {
            console.error("Failed to parse saved content", e);
          }
        }
      }
    });

    return () => {
      unsubscribeContent();
    };
  }, [profile?.role]);

  const saveToCloud = async () => {
    if (!profile || profile.role !== 'admin') {
      alert("Only admins can save changes to the cloud.");
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const contentDocRef = doc(db, 'site_content', 'main');
      await setDoc(contentDocRef, {
        ...content,
        updatedAt: serverTimestamp()
      });
      setSaveStatus('success');
      localStorage.setItem('portfolio_content', JSON.stringify(content));
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error("Error saving content:", err);
      setSaveStatus('error');
      handleFirestoreError(err, OperationType.WRITE, 'site_content/main');
    } finally {
      setIsSaving(false);
    }
  };

  const updateHero = (field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      hero: { ...prev.hero, [field]: value }
    }));
  };

  const updateService = (index: number, field: string, value: string) => {
    setContent(prev => {
      const newServices = [...prev.services];
      newServices[index] = { ...newServices[index], [field]: value };
      return { ...prev, services: newServices };
    });
  };

  const addService = () => {
    setContent(prev => ({
      ...prev,
      services: [{ title: "New Service", image: "https://picsum.photos/seed/new-service/800/600", link: "", description: "" }, ...prev.services]
    }));
  };

  const deleteService = (index: number) => {
    setContent(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const updateSocial = (field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      socials: { ...prev.socials, [field]: value }
    }));
  };

  const updateAbout = (field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      about: { ...prev.about, [field]: value }
    }));
  };

  const updateProject = (index: number, field: string, value: any) => {
    setContent(prev => {
      const newProjects = [...prev.projects];
      newProjects[index] = { ...newProjects[index], [field]: value };
      return { ...prev, projects: newProjects };
    });
  };

  const addProject = () => {
    setContent(prev => ({
      ...prev,
      projects: [{ title: "New Project", category: "App", description: "", image: "https://picsum.photos/seed/new-project/800/600", tech: ["React"] }, ...prev.projects]
    }));
  };

  const deleteProject = (index: number) => {
    setContent(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setActiveModal(null);
    }, 3000);
  };

  const { scrollYProgress, scrollY } = useScroll();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      setShowScrollTop(latest > 400);
    });
  }, [scrollY]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const blob1Y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const blob2Y = useTransform(scrollYProgress, [0, 1], [0, -200]);

  if (currentPage === 'admin') {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary font-sans selection:bg-[#00ff88] selection:text-black">
        {/* Admin Sidebar/Header */}
        <header className="border-b border-border-primary bg-bg-secondary px-6 py-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00ff88] rounded-xl flex items-center justify-center text-black">
              <Settings size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold uppercase tracking-widest">Dashboard</h1>
              <p className="text-[10px] text-text-secondary uppercase font-bold tracking-tighter">Manage your portfolio content</p>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <button 
              onClick={saveToCloud}
              disabled={isSaving}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                saveStatus === 'success' ? 'bg-green-500 text-white' :
                saveStatus === 'error' ? 'bg-red-500 text-white' :
                'bg-[#00ff88] text-black hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]'
              } disabled:opacity-50`}
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : saveStatus === 'success' ? (
                <CheckCircle2 size={14} />
              ) : (
                <Send size={14} />
              )}
              {isSaving ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : saveStatus === 'error' ? 'Error!' : 'Save to Cloud'}
            </button>
            <button 
              onClick={toggleTheme}
              className="p-2 bg-bg-primary border border-border-primary rounded-xl text-text-primary hover:bg-bg-secondary transition-all"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              type="button"
              onClick={() => setCurrentPage('home')}
              className="flex items-center gap-2 px-4 py-2 bg-bg-primary border border-border-primary rounded-xl hover:bg-bg-secondary transition-colors text-xs font-bold uppercase tracking-widest text-text-primary"
            >
              <LogOut size={14} /> Exit Dashboard
            </button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
          {/* Hero Section Editor */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-[#00ff88]">
              <User size={20} />
              <h2 className="text-xl font-bold uppercase tracking-widest">Hero Section</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-bg-secondary border border-border-primary rounded-3xl">
              <div className="space-y-2">
                <label className="text-[10px] text-text-secondary uppercase font-bold">Main Title (use \n for line break)</label>
                <textarea 
                  value={content.hero.title} 
                  onChange={(e) => updateHero('title', e.target.value)}
                  className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00ff88] min-h-[80px] text-text-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-text-secondary uppercase font-bold">First Name</label>
                <input 
                  value={content.hero.firstName} 
                  onChange={(e) => updateHero('firstName', e.target.value)}
                  className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00ff88] text-text-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-text-secondary uppercase font-bold">Middle Character</label>
                <input 
                  value={content.hero.middleChar} 
                  onChange={(e) => updateHero('middleChar', e.target.value)}
                  className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00ff88] text-text-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-text-secondary uppercase font-bold">Last Name</label>
                <input 
                  value={content.hero.lastName} 
                  onChange={(e) => updateHero('lastName', e.target.value)}
                  className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00ff88] text-text-primary"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] text-text-secondary uppercase font-bold">Bio Description</label>
                <textarea 
                  value={content.hero.bio} 
                  onChange={(e) => updateHero('bio', e.target.value)}
                  className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00ff88] min-h-[100px] text-text-primary"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] text-text-secondary uppercase font-bold">Avatar URL</label>
                <input 
                  value={content.hero.avatar} 
                  onChange={(e) => updateHero('avatar', e.target.value)}
                  className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00ff88] text-text-primary"
                />
              </div>
            </div>
          </section>

          {/* Posts/Services Section Editor */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-[#00ff88]">
                <Monitor size={20} />
                <h2 className="text-xl font-bold uppercase tracking-widest">Posts / Services</h2>
              </div>
              <button 
                type="button"
                onClick={addService}
                className="flex items-center gap-2 px-6 py-3 bg-[#00ff88] text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all active:scale-95"
              >
                <Plus size={14} /> Add New Post
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {content.services.map((service, idx) => (
                <div key={idx} className="group relative p-6 bg-bg-secondary border border-border-primary rounded-3xl space-y-4 transition-all hover:border-[#00ff88]/30">
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteService(idx);
                    }}
                    className="absolute top-4 right-4 z-[60] p-3 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-90 shadow-lg"
                    title="Delete Post"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-zinc-900/10 dark:bg-zinc-900">
                    <img src={service.image} alt="" className="w-full h-full object-cover opacity-50" referrerPolicy="no-referrer" />
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] text-text-secondary uppercase font-bold">Post Title</label>
                      <input 
                        value={service.title} 
                        onChange={(e) => updateService(idx, 'title', e.target.value)}
                        className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-2 text-sm outline-none focus:border-[#00ff88] text-text-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-text-secondary uppercase font-bold">Image URL</label>
                      <input 
                        value={service.image} 
                        onChange={(e) => updateService(idx, 'image', e.target.value)}
                        className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-2 text-sm outline-none focus:border-[#00ff88] text-text-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-text-secondary uppercase font-bold">Post Description</label>
                      <textarea 
                        value={service.description || ''} 
                        onChange={(e) => updateService(idx, 'description', e.target.value)}
                        className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-2 text-sm outline-none focus:border-[#00ff88] min-h-[80px] resize-none text-text-primary"
                        placeholder="Describe your project..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-text-secondary uppercase font-bold">External Link (Optional)</label>
                      <input 
                        value={service.link || ''} 
                        onChange={(e) => updateService(idx, 'link', e.target.value)}
                        className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-2 text-sm outline-none focus:border-[#00ff88] text-text-primary"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* About Me Section Editor */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-[#00ff88]">
              <Layout size={20} />
              <h2 className="text-xl font-bold uppercase tracking-widest">About Me Section</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 p-6 bg-bg-secondary border border-border-primary rounded-3xl">
              <div className="space-y-2">
                <label className="text-[10px] text-text-secondary uppercase font-bold">About Text</label>
                <textarea 
                  value={content.about.text} 
                  onChange={(e) => updateAbout('text', e.target.value)}
                  className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00ff88] min-h-[120px] text-text-primary"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-text-secondary uppercase font-bold">Experience Label</label>
                  <input 
                    value={content.about.experience} 
                    onChange={(e) => updateAbout('experience', e.target.value)}
                    className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00ff88] text-text-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-text-secondary uppercase font-bold">Projects Label</label>
                  <input 
                    value={content.about.projects} 
                    onChange={(e) => updateAbout('projects', e.target.value)}
                    className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00ff88] text-text-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-text-secondary uppercase font-bold">Clients Label</label>
                  <input 
                    value={content.about.clients} 
                    onChange={(e) => updateAbout('clients', e.target.value)}
                    className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00ff88] text-text-primary"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Featured Projects Section Editor */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-[#00ff88]">
                <Trophy size={20} />
                <h2 className="text-xl font-bold uppercase tracking-widest">Featured Projects</h2>
              </div>
              <button 
                type="button"
                onClick={addProject}
                className="flex items-center gap-2 px-6 py-3 bg-[#00ff88] text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all active:scale-95"
              >
                <Plus size={14} /> Add New Project
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {content.projects.map((project: any, idx: number) => (
                <div key={idx} className="group relative p-6 bg-bg-secondary border border-border-primary rounded-3xl space-y-4 transition-all hover:border-[#00ff88]/30">
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(idx);
                    }}
                    className="absolute top-4 right-4 z-[60] p-3 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-90 shadow-lg"
                    title="Delete Project"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-zinc-900/10 dark:bg-zinc-900">
                    <img src={project.image} alt="" className="w-full h-full object-cover opacity-50" referrerPolicy="no-referrer" />
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] text-text-secondary uppercase font-bold">Project Title</label>
                        <input 
                          value={project.title} 
                          onChange={(e) => updateProject(idx, 'title', e.target.value)}
                          className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-2 text-sm outline-none focus:border-[#00ff88] text-text-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-text-secondary uppercase font-bold">Category</label>
                        <input 
                          value={project.category} 
                          onChange={(e) => updateProject(idx, 'category', e.target.value)}
                          className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-2 text-sm outline-none focus:border-[#00ff88] text-text-primary"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-text-secondary uppercase font-bold">Image URL</label>
                      <input 
                        value={project.image} 
                        onChange={(e) => updateProject(idx, 'image', e.target.value)}
                        className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-2 text-sm outline-none focus:border-[#00ff88] text-text-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-text-secondary uppercase font-bold">Description</label>
                      <textarea 
                        value={project.description} 
                        onChange={(e) => updateProject(idx, 'description', e.target.value)}
                        className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-2 text-sm outline-none focus:border-[#00ff88] min-h-[80px] resize-none text-text-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-text-secondary uppercase font-bold">Tech Stack (comma separated)</label>
                      <input 
                        value={project.tech.join(', ')} 
                        onChange={(e) => updateProject(idx, 'tech', e.target.value.split(',').map(t => t.trim()))}
                        className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-2 text-sm outline-none focus:border-[#00ff88] text-text-primary"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Social Links Editor */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-[#00ff88]">
              <Share2 size={20} />
              <h2 className="text-xl font-bold uppercase tracking-widest">Social Links</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-bg-secondary border border-border-primary rounded-3xl">
              {Object.keys(content.socials).map((key) => (
                <div key={key} className="space-y-2">
                  <label className="text-[10px] text-text-secondary uppercase font-bold">{key}</label>
                  <input 
                    value={content.socials[key as keyof typeof content.socials]} 
                    onChange={(e) => updateSocial(key, e.target.value)}
                    className="w-full bg-bg-primary border border-border-primary rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00ff88] text-text-primary"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans selection:bg-[#00ff88] selection:text-black overflow-x-hidden scroll-smooth relative">
      <CustomCursor />
      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-[#00ff88] z-[100] origin-left"
        style={{ scaleX: scrollYProgress }}
      />
      
      {/* Grid Background */}
      <div className="fixed inset-0 z-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#00ff88 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Watermark Text */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden select-none">
        <h2 className="text-[20vw] font-black text-text-primary/5 uppercase tracking-tighter rotate-[-15deg] whitespace-nowrap">
          App Builder BD
        </h2>
      </div>

      {/* Side Labels */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 hidden xl:flex flex-col gap-20 pointer-events-none">
        <div className="rotate-[-90deg] origin-left">
          <span className="text-[10px] font-black text-[#00ff88] uppercase tracking-[0.5em] whitespace-nowrap opacity-50">
            EST. 2021 — APP BUILDER BD
          </span>
        </div>
      </div>
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden xl:flex flex-col gap-20 pointer-events-none">
        <div className="rotate-[90deg] origin-right">
          <span className="text-[10px] font-black text-[#00ff88] uppercase tracking-[0.5em] whitespace-nowrap opacity-50">
            CREATIVE TECHNOLOGY — BD
          </span>
        </div>
      </div>

      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          style={{ y: blob1Y }}
          animate={{ 
            x: [0, 100, 0], 
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#00ff88]/10 rounded-full blur-[120px]"
        />
        <motion.div 
          style={{ y: blob2Y }}
          animate={{ 
            x: [0, -100, 0], 
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-[#00ff88]/5 rounded-full blur-[150px]"
        />
      </div>

      <WalkingCharacter />
      
      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-24 right-8 z-[60] w-12 h-12 bg-[#00ff88] text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform active:scale-95"
            whileHover={{ y: -5 }}
          >
            <ArrowUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Status Badge */}
      <motion.div 
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5 }}
        className="fixed bottom-8 right-8 z-[60] hidden md:flex items-center gap-3 px-4 py-2 bg-bg-secondary/80 backdrop-blur-md border border-[#00ff88]/30 rounded-full shadow-2xl"
      >
        <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-ping" />
        <span className="text-[10px] font-bold text-text-primary uppercase tracking-widest">Available for new projects</span>
      </motion.div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="fixed top-0 left-0 w-full z-50 px-6 py-8 flex justify-center gap-4 md:gap-8 bg-gradient-to-b from-bg-primary to-transparent pointer-events-none"
      >
        <div className="flex gap-3 pointer-events-auto items-center">
          <button 
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-bg-secondary border border-border-primary text-text-primary hover:bg-bg-secondary/80 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <Link 
            to="/"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-bg-secondary border border-border-primary text-text-primary text-xs font-medium hover:bg-bg-secondary/80 transition-colors"
          >
            Home
          </Link>

          {user && (
            <button 
              onClick={() => setIsProjectModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-xs font-bold hover:bg-[#00ff88]/20 transition-all"
              title="Submit Project"
            >
              <Briefcase size={14} />
              <span className="hidden sm:inline">Project</span>
            </button>
          )}

          <AuthButton onAdminClick={() => setCurrentPage('admin')} />

          <button 
            onClick={() => scrollToSection('work')}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-bg-secondary border border-[#00ff88]/30 text-[#00ff88] text-xs font-medium hover:bg-[#00ff88]/10 transition-colors"
          >
            <Eye size={14} /> See my work
          </button>
        </div>
      </motion.nav>

      <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        <Routes>
          <Route path="/login" element={<div className="pt-12"><Auth /></div>} />
          <Route path="/profile" element={<div className="pt-12"><Profile /></div>} />
          <Route path="/" element={
            <>
              {/* Hero Section */}
              <section className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-32">
                {/* Left Content */}
                <div className="lg:col-span-5 z-10 space-y-8">
                  <motion.h2 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className="text-2xl md:text-3xl font-medium text-text-primary leading-tight whitespace-pre-line"
            >
              {content.hero.title}
            </motion.h2>
            
            <div className="relative pt-10">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "circOut", delay: 0.2 }}
                className="relative"
              >
                <span className="absolute -top-6 left-0 text-[#00ff88] text-sm font-bold tracking-[0.5em] uppercase">
                  STUDIO
                </span>
                <h1 className="text-8xl md:text-9xl font-black tracking-tighter flex items-baseline overflow-hidden">
                  {content.hero.firstName.split('').map((char, i) => (
                    <motion.span
                      key={i}
                      initial={{ y: 100, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.05, ease: "circOut" }}
                      className="text-text-primary"
                    >
                      {char}
                    </motion.span>
                  ))}
                  <motion.span 
                    initial={{ y: 100, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: content.hero.firstName.length * 0.05, ease: "circOut" }}
                    className="text-[#00ff88] -ml-2"
                  >
                    {content.hero.middleChar}
                  </motion.span>
                  {content.hero.lastName.split('').map((char, i) => (
                    <motion.span
                      key={i}
                      initial={{ y: 100, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: (content.hero.firstName.length + 1 + i) * 0.05, ease: "circOut" }}
                      className="text-text-primary -ml-2"
                    >
                      {char}
                    </motion.span>
                  ))}
                </h1>
              </motion.div>
            </div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-text-secondary text-sm leading-relaxed max-w-md"
            >
              {content.hero.bio}
            </motion.p>

            <div className="flex flex-wrap gap-4">
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                onClick={() => scrollToSection('contact')}
                className="px-8 py-4 bg-[#00ff88] text-black font-bold rounded-2xl flex items-center gap-3 hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all"
              >
                Start a Project <Send size={18} />
              </motion.button>

              {!user && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <Link 
                    to="/login"
                    className="px-8 py-4 bg-bg-secondary border border-border-primary text-text-primary font-bold rounded-2xl flex items-center gap-3 hover:bg-bg-secondary/80 transition-all"
                  >
                    Login <User size={18} />
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Terminal Accent */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="hidden md:block p-4 bg-black/40 backdrop-blur-sm border border-white/5 rounded-xl font-mono text-[10px] text-text-secondary max-w-xs"
            >
              <div className="flex gap-1.5 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                <div className="w-2 h-2 rounded-full bg-green-500/50" />
              </div>
              <p className="text-[#00ff88]">$ npm install creativity</p>
              <p className="opacity-50">Installing dependencies...</p>
              <p className="text-blue-400">Success: Brand identity loaded.</p>
            </motion.div>
          </div>

          {/* Right Content (Avatar) */}
          <div className="lg:col-span-7 relative flex justify-center lg:justify-end">
            <motion.div 
              initial={{ opacity: 0, x: 50, rotate: 5 }}
              whileInView={{ opacity: 1, x: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "circOut" }}
              className="relative w-full max-w-md aspect-square"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-[#00ff88]/20 to-transparent rounded-full blur-3xl" />
              <img 
                src={content.hero.avatar} 
                alt="app Builder BD" 
                className="relative w-full h-full object-cover rounded-3xl grayscale hover:grayscale-0 transition-all duration-700 border border-border-primary"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-4 left-4 right-4 p-4 bg-bg-secondary/40 backdrop-blur-md rounded-xl border border-border-primary">
                <p className="text-[10px] text-text-secondary uppercase tracking-widest">Creative Director @ app Builder BD</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="mb-32">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="p-8 bg-bg-secondary/50 border border-border-primary rounded-[2rem] backdrop-blur-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-4xl pointer-events-none">APP BUILDER BD</div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-text-primary uppercase tracking-widest">Tech Stack</h3>
                <p className="text-text-secondary text-xs uppercase tracking-tighter">Tools I use to build the future</p>
              </div>
              <div className="flex flex-wrap justify-center gap-6 md:gap-12">
                {[
                  { name: 'React', icon: Cpu },
                  { name: 'Node.js', icon: Monitor },
                  { name: 'Figma', icon: Palette },
                  { name: 'Adobe CC', icon: Layout },
                  { name: 'AI/ML', icon: Cpu },
                  { name: 'TypeScript', icon: Settings }
                ].map((tech, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -5, color: '#00ff88' }}
                    className="flex flex-col items-center gap-2 text-text-secondary transition-colors"
                  >
                    <tech.icon size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{tech.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Featured Projects Section */}
        <section id="projects" className="mb-32 scroll-mt-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-4">
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-[#00ff88] text-xs font-bold uppercase tracking-[0.3em]"
              >
                Portfolio
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-5xl font-black text-text-primary tracking-tighter"
              >
                Featured Projects
              </motion.h2>
            </div>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-text-secondary text-sm max-w-xs"
            >
              A selection of my best work in app development and creative design.
            </motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.projects.map((project: any, idx: number) => (
              <ProjectCard key={idx} project={project} />
            ))}
          </div>
        </section>

        {/* About Me Section */}
        <section id="about" className="mb-32 scroll-mt-32 relative">
          <div className="absolute -top-20 -right-20 text-[10vw] font-black text-text-primary/5 pointer-events-none uppercase">BUILDER</div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <span className="text-[#00ff88] text-xs font-bold uppercase tracking-[0.3em]">About Me</span>
                <h2 className="text-5xl font-black text-text-primary tracking-tighter">More than just code.</h2>
              </div>
              <p className="text-text-secondary leading-relaxed text-lg">
                {content.about.text}
              </p>
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div>
                  <h4 className="text-3xl font-black text-[#00ff88]">
                    <Counter value={content.about.experience} />
                  </h4>
                  <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Experience</p>
                </div>
                <div>
                  <h4 className="text-3xl font-black text-[#00ff88]">
                    <Counter value={content.about.projects} />
                  </h4>
                  <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Projects</p>
                </div>
                <div>
                  <h4 className="text-3xl font-black text-[#00ff88]">
                    <Counter value={content.about.clients} />
                  </h4>
                  <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Clients</p>
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square rounded-[3rem] overflow-hidden border border-border-primary group"
            >
              <img 
                src="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=1000" 
                alt="About" 
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" 
              />
              <div className="absolute inset-0 bg-[#00ff88]/10 mix-blend-overlay" />
              <div className="absolute top-8 left-8 font-black text-6xl text-white/20 pointer-events-none">BD</div>
              <div className="absolute bottom-8 right-8 font-black text-xs text-white/40 pointer-events-none uppercase tracking-[0.5em]">App Builder BD</div>
            </motion.div>
          </div>
        </section>

        {/* What I Do Section */}
        <section id="work" className="mb-32 scroll-mt-32 relative">
          <div className="absolute -top-20 -left-20 text-[10vw] font-black text-text-primary/5 pointer-events-none uppercase">SERVICES</div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-12 text-text-primary"
          >
            what I do
          </motion.h2>
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {content.services.map((service, idx) => (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "circOut" } }
                }}
              >
                <ServiceCard 
                  title={service.title} 
                  image={service.image}
                  onClick={() => {
                    setSelectedService(service);
                    setActiveModal('service');
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Process Section */}
        <section className="mb-32">
          <div className="text-center space-y-4 mb-16">
            <span className="text-[#00ff88] text-xs font-bold uppercase tracking-[0.3em]">Workflow</span>
            <h2 className="text-5xl font-black text-text-primary tracking-tighter">My Creative Process</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "DISCOVERY", desc: "Understanding your vision, goals, and target audience." },
              { step: "02", title: "STRATEGY", desc: "Crafting a roadmap for design and development." },
              { step: "03", title: "EXECUTION", desc: "Building with precision and creative flair." },
              { step: "04", title: "DELIVERY", desc: "Launching your product to the world." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 bg-bg-secondary border border-border-primary rounded-3xl relative group hover:border-[#00ff88]/30 transition-all"
              >
                <span className="text-4xl font-black text-[#00ff88]/20 group-hover:text-[#00ff88]/40 transition-colors">{item.step}</span>
                <h3 className="text-lg font-bold text-text-primary mt-4 mb-2 uppercase tracking-wider">{item.title}</h3>
                <p className="text-text-secondary text-xs leading-relaxed">{item.desc}</p>
                <div className="absolute bottom-4 right-4 text-[8px] font-bold text-[#00ff88]/10 group-hover:text-[#00ff88]/20 uppercase tracking-widest">App Builder BD</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="text-center space-y-12 scroll-mt-32">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-text-primary"
          >
            Contact me
          </motion.h2>
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            className="flex flex-wrap justify-center gap-8"
          >
            {[
              { color: "#EA4335", icon: Mail, label: "Gmail", href: `mailto:${content.socials.gmail}` },
              { color: "#E4405F", icon: Instagram, label: "Instagram", href: content.socials.instagram },
              { color: "#25D366", icon: MessageCircle, label: "WhatsApp", href: content.socials.whatsapp },
              { color: "#000000", icon: Twitter, label: "X/Twitter", href: content.socials.twitter },
              { color: "#BD081C", icon: Layout, label: "Pinterest", href: content.socials.pinterest },
              { color: "#1769FF", icon: Palette, label: "Behance", href: content.socials.behance }
            ].map((social, idx) => (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, scale: 0.5 },
                  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200 } }
                }}
              >
                <SocialIcon {...social} />
              </motion.div>
            ))}
          </motion.div>
        </section>
            </>
          } />
        </Routes>
      </main>

      {/* Modals */}
      <Modal 
        isOpen={activeModal === 'catalog'} 
        onClose={() => setActiveModal(null)} 
        title="My Catalog"
      >
        <div className="space-y-6 text-center py-10">
          <ShoppingBasket size={64} className="mx-auto text-[#00ff88] opacity-50" />
          <h4 className="text-2xl font-bold text-text-primary">Catalog is coming soon!</h4>
          <p className="text-text-secondary">I'm currently curating my best assets for you. Stay tuned for the launch.</p>
          <button 
            onClick={() => setActiveModal(null)}
            className="px-6 py-3 bg-bg-secondary border border-border-primary rounded-xl hover:bg-bg-primary transition-colors text-text-primary"
          >
            Close
          </button>
        </div>
      </Modal>

      <Modal 
        isOpen={activeModal === 'booking'} 
        onClose={() => {
          setActiveModal(null);
          setBookingSuccess(false);
        }} 
        title="Book a Service"
      >
        {bookingSuccess ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-[#00ff88]/20 rounded-full flex items-center justify-center mx-auto text-[#00ff88]">
              <CheckCircle2 size={40} />
            </div>
            <h4 className="text-2xl font-bold text-text-primary">Request Sent!</h4>
            <p className="text-text-secondary">Thank you! Ivan will contact you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">Full Name</label>
              <input required type="text" className="w-full bg-bg-secondary border border-border-primary rounded-xl px-4 py-3 focus:border-[#00ff88] outline-none transition-colors text-text-primary" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">Email Address</label>
              <input required type="email" className="w-full bg-bg-secondary border border-border-primary rounded-xl px-4 py-3 focus:border-[#00ff88] outline-none transition-colors text-text-primary" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">Service Type</label>
              <select className="w-full bg-bg-secondary border border-border-primary rounded-xl px-4 py-3 focus:border-[#00ff88] outline-none transition-colors appearance-none text-text-primary">
                <option className="bg-bg-primary">Brand Identity</option>
                <option className="bg-bg-primary">Social Media Design</option>
                <option className="bg-bg-primary">YouTube Thumbnails</option>
                <option className="bg-bg-primary">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">Project Brief</label>
              <textarea required className="w-full bg-bg-secondary border border-border-primary rounded-xl px-4 py-3 focus:border-[#00ff88] outline-none transition-colors min-h-[100px] text-text-primary" placeholder="Tell me about your project..."></textarea>
            </div>
            <button type="submit" className="w-full py-4 bg-[#00ff88] text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(0,255,136,0.2)] transition-all">
              Send Request
            </button>
          </form>
        )}
      </Modal>

      <Modal 
        isOpen={activeModal === 'service'} 
        onClose={() => setActiveModal(null)} 
        title={selectedService?.title || 'Service Details'}
      >
        <div className="space-y-6">
          <div className="aspect-video w-full rounded-2xl bg-bg-secondary overflow-hidden border border-border-primary">
            <img 
              src={selectedService?.image || "https://picsum.photos/seed/project-detail/1200/800"} 
              alt="Project Detail" 
              loading="lazy"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="space-y-4">
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-[#00ff88]">About this service</h4>
              <p className="text-text-secondary leading-relaxed">
                {selectedService?.description || `I provide high-quality, professional ${selectedService?.title?.toLowerCase()} tailored to your brand's unique needs. My process involves deep research, conceptualization, and iterative refinement to ensure the best possible outcome.`}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setActiveModal('booking')}
                className="w-full py-4 bg-[#00ff88] text-black font-bold rounded-xl transition-all"
              >
                Book this service
              </button>
              {selectedService?.link && (
                <a 
                  href={selectedService.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-[#00ff88] text-black font-bold rounded-xl transition-all text-center flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]"
                >
                  See this <ArrowRight size={16} />
                </a>
              )}
            </div>
          </div>
        </div>
      </Modal>

      <ProjectRequestModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
      />

      <CopyProtection />

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-border-primary text-center space-y-4">
        <div className="text-xl font-black text-text-primary tracking-tighter uppercase">
          App Builder <span className="text-[#00ff88]">BD</span>
        </div>
        <p className="text-text-secondary text-[10px] uppercase tracking-[0.3em]">
          &copy; 2026 app Builder BD. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </FirebaseProvider>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  Search, 
  Bell, 
  Calendar, 
  FileText, 
  Layout, 
  Clock, 
  CheckSquare, 
  BookOpen, 
  Calculator, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Shuffle, 
  Copy, 
  CheckCheck, 
  Flame, 
  Layers,
  KeyRound,
  ExternalLink,
  ShieldCheck,
  Award
} from 'lucide-react';

const PRELOADED_DECKS = [
  {
    id: 'bio',
    name: 'Cellular Biology & Genetics',
    cards: [
      { q: 'What is the primary function of Mitochondria?', a: 'Produces cellular energy (ATP) through oxidative phosphorylation.' },
      { q: 'What are the base pairs in DNA?', a: 'Adenine (A) pairs with Thymine (T); Guanine (G) pairs with Cytosine (C).' },
      { q: 'What is Osmosis?', a: 'The net movement of water molecules across a semipermeable membrane from lower to higher solute concentration.' },
      { q: 'What is the role of Ribosomes?', a: 'Synthesize proteins by translating messenger RNA (mRNA) sequences.' },
      { q: 'What phase of Mitosis separates sister chromatids?', a: 'Anaphase: spindle fibers pull sister chromatids apart toward opposite poles.' }
    ]
  },
  {
    id: 'math',
    name: 'Calculus & Advanced Algebra',
    cards: [
      { q: 'What is the derivative of sin(x)?', a: 'cos(x)' },
      { q: 'What is the Quadratic Formula?', a: 'x = (-b ± √(b² - 4ac)) / (2a)' },
      { q: 'What does the Fundamental Theorem of Calculus state?', a: 'Differentiation and integration are inverse operations; ∫[a,b] f(x)dx = F(b) - F(a).' },
      { q: 'What is Euler’s Identity?', a: 'e^(iπ) + 1 = 0 (connects e, i, π, 1, and 0 in one elegant equation).' },
      { q: 'What is the derivative of ln(x)?', a: '1 / x (for x > 0)' }
    ]
  },
  {
    id: 'history',
    name: 'World History & Constitutional Civics',
    cards: [
      { q: 'What year was the Magna Carta signed?', a: '1215 at Runnymede by King John of England.' },
      { q: 'What are the three branches of the US Government?', a: 'Legislative (makes laws), Executive (enforces laws), Judicial (interprets laws).' },
      { q: 'When did World War II end?', a: '1945, concluding with the unconditional surrender of the Axis powers.' },
      { q: 'What is the First Amendment of the US Constitution?', a: 'Guarantees freedom of speech, religion, the press, assembly, and the right to petition.' }
    ]
  },
  {
    id: 'spanish',
    name: 'Spanish Academic Vocabulary',
    cards: [
      { q: 'El aprendizaje', a: 'Learning / apprenticeship' },
      { q: 'El desarrollo sostenible', a: 'Sustainable development' },
      { q: 'La hipótesis comprobada', a: 'Proven hypothesis' },
      { q: 'La investigación académica', a: 'Academic research / inquiry' }
    ]
  }
];

const FORMULAS_DATA = [
  {
    category: 'Mathematics',
    items: [
      { name: 'Quadratic Equation', formula: 'x = [-b ± √(b² - 4ac)] / 2a', note: 'Solves ax² + bx + c = 0' },
      { name: 'Pythagorean Theorem', formula: 'a² + b² = c²', note: 'For right-angled triangles' },
      { name: 'Circle Circumference & Area', formula: 'C = 2πr  |  A = πr²', note: 'r = radius' },
      { name: 'Compound Interest', formula: 'A = P(1 + r/n)^(nt)', note: 'P=principal, r=rate, n=frequency, t=time' },
      { name: 'Distance Formula', formula: 'd = √[(x₂ - x₁)² + (y₂ - y₁)²]', note: 'Euclidean Cartesian distance' }
    ]
  },
  {
    category: 'Physics & Mechanics',
    items: [
      { name: "Newton's Second Law", formula: 'F = m · a', note: 'Force = mass × acceleration' },
      { name: 'Kinetic Energy', formula: 'KE = ½ · m · v²', note: 'Joules (kg·m²/s²)' },
      { name: 'Gravitational Potential Energy', formula: 'PE = m · g · h', note: 'g ≈ 9.8 m/s²' },
      { name: "Ohm's Law", formula: 'V = I · R', note: 'Voltage = Current × Resistance' },
      { name: 'Wave Velocity', formula: 'v = f · λ', note: 'velocity = frequency × wavelength' }
    ]
  },
  {
    category: 'Chemistry',
    items: [
      { name: 'Ideal Gas Law', formula: 'P · V = n · R · T', note: 'R = 0.0821 L·atm/(mol·K)' },
      { name: 'Molarity', formula: 'M = moles of solute / liters of solution', note: 'Concentration (mol/L)' },
      { name: 'pH Formula', formula: 'pH = -log₁₀[H⁺]', note: 'Acidity measurement scale' },
      { name: 'Density', formula: 'ρ = mass / volume', note: 'g/cm³ or kg/m³' }
    ]
  }
];

export const EducationalCloak = ({ onToggleCloak }) => {
  // Navigation tabs in study portal
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'pomodoro' | 'flashcards' | 'notes' | 'tasks' | 'formulas' | 'calculator'
  
  // Stealth Cine Unlocking Triggers
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [footerClickCount, setFooterClickCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [secretModalOpen, setSecretModalOpen] = useState(false);
  const [secretPasscode, setSecretPasscode] = useState('');
  const [secretError, setSecretError] = useState(false);
  const [stealthUnlockedAnim, setStealthUnlockedAnim] = useState(false);

  // Trigger Cine Launch
  const triggerCineLaunch = () => {
    try {
      sessionStorage.setItem('cine_uncloaked', 'true');
    } catch (e) {
      console.warn(e);
    }
    setStealthUnlockedAnim(true);
    setTimeout(() => {
      onToggleCloak();
    }, 700);
  };

  // Stealth Logo Click Count (3 clicks unlocks Cine)
  const handleLogoClick = () => {
    const next = logoClickCount + 1;
    setLogoClickCount(next);
    if (next >= 3) {
      setLogoClickCount(0);
      triggerCineLaunch();
    }
  };

  // Stealth Footer Click Count (3 clicks unlocks Cine)
  const handleFooterClick = () => {
    const next = footerClickCount + 1;
    setFooterClickCount(next);
    if (next >= 3) {
      setFooterClickCount(0);
      triggerCineLaunch();
    }
  };

  // Search Bar Trigger: typing 'cine', 'games', 'play', or 'apex' immediately unlocks Cine!
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    const lower = val.toLowerCase().trim();
    if (['cine', 'games', 'game', 'play', 'apex', '/cine', 'unlock'].includes(lower)) {
      setSearchQuery('');
      triggerCineLaunch();
    }
  };

  // Keyboard shortcut listener: Shift + C or ~ or 0-0-0-0
  const seqRef = useRef('');
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        triggerCineLaunch();
        return;
      }
      if (e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        triggerCineLaunch();
        return;
      }
      seqRef.current = (seqRef.current + e.key).slice(-4);
      if (seqRef.current === '0000' || seqRef.current.toLowerCase() === 'cine') {
        triggerCineLaunch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 1. Pomodoro Focus Timer State
  const [pomoMode, setPomoMode] = useState('focus'); // 'focus' (25m) | 'short' (5m) | 'long' (15m)
  const [pomoSeconds, setPomoSeconds] = useState(25 * 60);
  const [pomoRunning, setPomoRunning] = useState(false);
  const [completedPomos, setCompletedPomos] = useState(3);

  useEffect(() => {
    let interval = null;
    if (pomoRunning && pomoSeconds > 0) {
      interval = setInterval(() => {
        setPomoSeconds(prev => prev - 1);
      }, 1000);
    } else if (pomoSeconds === 0 && pomoRunning) {
      setPomoRunning(false);
      if (pomoMode === 'focus') {
        setCompletedPomos(prev => prev + 1);
        setPomoMode('short');
        setPomoSeconds(5 * 60);
      } else {
        setPomoMode('focus');
        setPomoSeconds(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [pomoRunning, pomoSeconds, pomoMode]);

  const switchPomoMode = (mode) => {
    setPomoRunning(false);
    setPomoMode(mode);
    if (mode === 'focus') setPomoSeconds(25 * 60);
    else if (mode === 'short') setPomoSeconds(5 * 60);
    else if (mode === 'long') setPomoSeconds(15 * 60);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 2. Flashcards State
  const [selectedDeckIdx, setSelectedDeckIdx] = useState(0);
  const [cardIdx, setCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [customDecks, setCustomDecks] = useState(() => {
    try {
      const saved = localStorage.getItem('study_custom_decks_v1');
      return saved ? JSON.parse(saved) : PRELOADED_DECKS;
    } catch {
      return PRELOADED_DECKS;
    }
  });
  const [newCardQ, setNewCardQ] = useState('');
  const [newCardA, setNewCardA] = useState('');
  const [isAddingCard, setIsAddingCard] = useState(false);

  const currentDeck = customDecks[selectedDeckIdx] || customDecks[0];
  const currentCard = currentDeck?.cards?.[cardIdx] || { q: 'No cards available', a: 'Add a new card to start.' };

  const handleNextCard = () => {
    setIsFlipped(false);
    setCardIdx(prev => (prev + 1) % currentDeck.cards.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCardIdx(prev => (prev - 1 + currentDeck.cards.length) % currentDeck.cards.length);
  };

  const handleShuffleDeck = () => {
    setIsFlipped(false);
    const shuffled = [...currentDeck.cards].sort(() => Math.random() - 0.5);
    const updated = [...customDecks];
    updated[selectedDeckIdx] = { ...currentDeck, cards: shuffled };
    setCustomDecks(updated);
    setCardIdx(0);
  };

  const handleAddCustomCard = (e) => {
    e.preventDefault();
    if (!newCardQ.trim() || !newCardA.trim()) return;
    const newCard = { q: newCardQ.trim(), a: newCardA.trim() };
    const updated = [...customDecks];
    updated[selectedDeckIdx] = {
      ...currentDeck,
      cards: [...currentDeck.cards, newCard]
    };
    setCustomDecks(updated);
    try {
      localStorage.setItem('study_custom_decks_v1', JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }
    setNewCardQ('');
    setNewCardA('');
    setIsAddingCard(false);
    setCardIdx(updated[selectedDeckIdx].cards.length - 1);
    setIsFlipped(false);
  };

  // 3. Smart Study Scratchpad / Notes
  const [selectedSubject, setSelectedSubject] = useState('General');
  const [studyNotes, setStudyNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('study_notebook_notes_v1');
      return saved ? JSON.parse(saved) : {
        General: "Review chapter 4 and chapter 5 key definitions before the upcoming midterm exam.",
        Mathematics: "Integration by parts formula: ∫u·dv = u·v - ∫v·du\nRemember to test boundary limits.",
        Biology: "Cell organelles: nucleus holds chromosomes, endoplasmic reticulum synthesizes lipids/proteins."
      };
    } catch {
      return { General: "" };
    }
  });
  const [copiedNotes, setCopiedNotes] = useState(false);

  const handleNoteChange = (text) => {
    const updated = { ...studyNotes, [selectedSubject]: text };
    setStudyNotes(updated);
    try {
      localStorage.setItem('study_notebook_notes_v1', JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }
  };

  // 4. Homework & Tasks Checklist
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('study_tasks_list_v1');
      return saved ? JSON.parse(saved) : [
        { id: '1', title: 'Complete Calculus Chapter 7 Review Problems', subject: 'Math', due: 'Tomorrow, 5:00 PM', done: false, priority: 'high' },
        { id: '2', title: 'Read Cellular Respiration Lab Handout', subject: 'Biology', due: 'Thursday, 11:59 PM', done: true, priority: 'medium' },
        { id: '3', title: 'Draft Outline for Modern History Essay', subject: 'History', due: 'Friday, 3:00 PM', done: false, priority: 'high' },
        { id: '4', title: 'Practice Spanish Conjugations Deck (20 mins)', subject: 'Spanish', due: 'Daily Habit', done: false, priority: 'low' }
      ];
    } catch {
      return [];
    }
  });
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('Math');
  const [newTaskDue, setNewTaskDue] = useState('Tomorrow');

  const toggleTask = (id) => {
    const updated = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setTasks(updated);
    try { localStorage.setItem('study_tasks_list_v1', JSON.stringify(updated)); } catch {}
  };

  const deleteTask = (id) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    try { localStorage.setItem('study_tasks_list_v1', JSON.stringify(updated)); } catch {}
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      subject: newTaskSubject,
      due: newTaskDue || 'This week',
      done: false,
      priority: 'medium'
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    try { localStorage.setItem('study_tasks_list_v1', JSON.stringify(updated)); } catch {}
    setNewTaskTitle('');
  };

  // 5. Scientific / Standard Calculator
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcPrev, setCalcPrev] = useState(null);
  const [calcOp, setCalcOp] = useState(null);

  const handleCalcNum = (num) => {
    setCalcDisplay(prev => prev === '0' ? String(num) : prev + String(num));
  };

  const handleCalcOp = (op) => {
    setCalcPrev(parseFloat(calcDisplay));
    setCalcOp(op);
    setCalcDisplay('0');
  };

  const handleCalcEquals = () => {
    if (calcPrev === null || calcOp === null) return;
    const current = parseFloat(calcDisplay);
    let result = 0;
    if (calcOp === '+') result = calcPrev + current;
    else if (calcOp === '-') result = calcPrev - current;
    else if (calcOp === '×' || calcOp === '*') result = calcPrev * current;
    else if (calcOp === '÷' || calcOp === '/') result = current !== 0 ? calcPrev / current : 'Error';
    else if (calcOp === '^') result = Math.pow(calcPrev, current);
    
    setCalcDisplay(String(result));
    setCalcPrev(null);
    setCalcOp(null);
  };

  const handleCalcClear = () => {
    setCalcDisplay('0');
    setCalcPrev(null);
    setCalcOp(null);
  };

  const handleCalcSqrt = () => {
    const val = parseFloat(calcDisplay);
    if (val >= 0) setCalcDisplay(String(Math.sqrt(val)));
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#f8fafc] text-[#1e293b] font-sans overflow-auto selection:bg-blue-100">
      
      {/* Stealth Unlocking Ambient Banner */}
      <AnimatePresence>
        {stealthUnlockedAnim && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100000] bg-black/90 text-white px-6 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 backdrop-blur-xl"
          >
            <Sparkles size={18} className="text-yellow-400 animate-spin" />
            <span className="text-xs font-black uppercase tracking-widest text-cyan-300">
              Stealth Override Triggered • Launching Cine...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Academic Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Stealth Trigger 1 */}
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogoClick}
              className="flex items-center gap-2.5 text-slate-800 hover:text-blue-600 transition-colors cursor-pointer group"
              title="EduPortal Academic Workspace"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap size={22} />
              </div>
              <div className="text-left">
                <span className="text-lg font-black tracking-tight block leading-tight text-slate-900">EduPortal</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Academic Suite</span>
              </div>
            </button>

            {/* Desktop Navigation Tools */}
            <nav className="hidden lg:flex items-center gap-1 ml-6 text-xs font-bold text-slate-600">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Layout },
                { id: 'pomodoro', label: 'Focus Timer', icon: Clock },
                { id: 'flashcards', label: 'Flashcards', icon: BookOpen },
                { id: 'notes', label: 'Notebook', icon: FileText },
                { id: 'tasks', label: 'Study Tasks', icon: CheckSquare },
                { id: 'formulas', label: 'Formulas', icon: Award },
                { id: 'calculator', label: 'Calculator', icon: Calculator }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600 font-black shadow-xs' 
                        : 'hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={15} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Search Bar & Stealth Trigger 2 */}
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block w-48 md:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search courses or topics..."
                className="w-full bg-slate-100 border border-slate-200 rounded-full pl-9 pr-4 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Notification Bell */}
            <div className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
            </div>
          </div>

        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs no-scrollbar">
          {[
            { id: 'dashboard', label: 'Overview', icon: Layout },
            { id: 'pomodoro', label: 'Timer', icon: Clock },
            { id: 'flashcards', label: 'Cards', icon: BookOpen },
            { id: 'notes', label: 'Notes', icon: FileText },
            { id: 'tasks', label: 'Tasks', icon: CheckSquare },
            { id: 'formulas', label: 'Formulas', icon: Award },
            { id: 'calculator', label: 'Calc', icon: Calculator }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold flex items-center gap-1 ${
                activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <tab.icon size={13} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Hero Welcome Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 relative z-10 max-w-xl">
                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                  Spring Term 2026
                </span>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                  Academic Focus Workspace
                </h1>
                <p className="text-blue-100 text-xs sm:text-sm font-medium leading-relaxed">
                  You have completed 3 focus study sessions today. Next scheduled lecture: <span className="font-bold underline">Advanced Physics at 2:00 PM</span>.
                </p>
              </div>

              <div className="flex items-center gap-3 relative z-10 shrink-0">
                <button
                  onClick={() => setActiveTab('pomodoro')}
                  className="px-5 py-3 rounded-2xl bg-white text-blue-700 font-black text-xs uppercase tracking-wider shadow-lg hover:bg-blue-50 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Clock size={16} />
                  <span>Start Focus Session</span>
                </button>
                <button
                  onClick={() => setActiveTab('flashcards')}
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs uppercase tracking-wider backdrop-blur-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <BookOpen size={16} />
                  <span>Review Flashcards</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">DAILY STUDY TIME</span>
                <span className="text-2xl font-black text-slate-800 mt-1 block">2h 15m</span>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">FOCUS SESSIONS</span>
                <span className="text-2xl font-black text-blue-600 mt-1 block">{completedPomos} Pomodoros</span>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">TASKS REMAINING</span>
                <span className="text-2xl font-black text-amber-500 mt-1 block">{tasks.filter(t => !t.done).length} Tasks</span>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">GPA ESTIMATE</span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">3.92 / 4.0</span>
              </div>
            </div>

            {/* Two Column Layout: Courses & Upcoming Deadlines */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Courses Grid */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">Active Academic Courses</h3>
                  <span className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">View Syllabus</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { code: 'MATH301', title: 'Calculus III & Differential Eq.', prof: 'Dr. Katherine Johnson', progress: 85, color: 'bg-blue-600', text: 'text-blue-600' },
                    { code: 'PHYS204', title: 'Classical Mechanics & Optics', prof: 'Dr. Richard Feynman', progress: 68, color: 'bg-indigo-600', text: 'text-indigo-600' },
                    { code: 'BIOL105', title: 'Molecular Biology & Genetics', prof: 'Dr. Rosalind Franklin', progress: 92, color: 'bg-emerald-600', text: 'text-emerald-600' },
                    { code: 'HIST202', title: 'Modern Global Civilization', prof: 'Prof. Howard Zinn', progress: 54, color: 'bg-amber-600', text: 'text-amber-600' }
                  ].map((c, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-white ${c.color}`}>
                          {c.code}
                        </span>
                        <span className="text-xs font-bold text-slate-400">{c.progress}% Complete</span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900 leading-snug">{c.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{c.prof}</p>
                      
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-bold text-slate-400">Next Lecture: 2h</span>
                        <button 
                          onClick={() => setActiveTab('notes')}
                          className="font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Open Notes</span>
                          <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar Upcoming Tasks & Deadlines */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">Upcoming Deadlines</h3>
                  <button onClick={() => setActiveTab('tasks')} className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">
                    Manage All
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
                  {tasks.slice(0, 4).map(t => (
                    <div 
                      key={t.id}
                      onClick={() => toggleTask(t.id)}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        t.done ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 group-hover:border-blue-500'
                      }`}>
                        {t.done && <Check size={12} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-bold text-slate-800 leading-tight ${t.done ? 'line-through text-slate-400' : ''}`}>
                          {t.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-medium">
                          <span className="font-bold text-slate-600">{t.subject}</span>
                          <span>•</span>
                          <span>{t.due}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: POMODORO FOCUS STUDY TIMER */}
        {activeTab === 'pomodoro' && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest">
                Scientific Focus Technique
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Pomodoro Study Timer
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Maintain high cognitive retention with 25-minute uninterrupted study sprints followed by brief rest intervals.
              </p>
            </div>

            {/* Timer Card */}
            <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-lg text-center space-y-8 relative overflow-hidden">
              {/* Mode Switcher */}
              <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl gap-1">
                {[
                  { id: 'focus', label: 'Focus (25m)' },
                  { id: 'short', label: 'Short Break (5m)' },
                  { id: 'long', label: 'Long Break (15m)' }
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => switchPomoMode(m.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      pomoMode === m.id 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Big Digital Clock Display */}
              <div className="my-8">
                <span className="text-7xl sm:text-8xl font-black font-mono tracking-tight text-slate-900">
                  {formatTime(pomoSeconds)}
                </span>
                <span className="text-xs font-bold text-slate-400 block mt-2 uppercase tracking-widest">
                  {pomoMode === 'focus' ? 'Active Concentration Interval' : 'Rest & Hydration Interval'}
                </span>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setPomoRunning(!pomoRunning)}
                  className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 shadow-lg ${
                    pomoRunning 
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  }`}
                >
                  {pomoRunning ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                  <span>{pomoRunning ? 'Pause Session' : 'Start Focus'}</span>
                </button>

                <button
                  onClick={() => switchPomoMode(pomoMode)}
                  className="p-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw size={18} />
                </button>
              </div>

              {/* Completed Pomodoro Circles */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-2">
                <span className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-wider">Completed Sprints:</span>
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      i < completedPomos % 5 ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    ✓
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INTERACTIVE FLASHCARDS */}
        {activeTab === 'flashcards' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Study Flashcards</h2>
                <p className="text-xs text-slate-500">Master core concepts with active recall testing.</p>
              </div>

              {/* Deck Selector */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedDeckIdx}
                  onChange={(e) => {
                    setSelectedDeckIdx(parseInt(e.target.value));
                    setCardIdx(0);
                    setIsFlipped(false);
                  }}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {customDecks.map((d, i) => (
                    <option key={d.id} value={i}>{d.name} ({d.cards.length})</option>
                  ))}
                </select>
                
                <button
                  onClick={() => setIsAddingCard(!isAddingCard)}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Card</span>
                </button>
              </div>
            </div>

            {/* Add Custom Card Form */}
            {isAddingCard && (
              <form onSubmit={handleAddCustomCard} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Add New Card to {currentDeck.name}</h4>
                <input
                  type="text"
                  value={newCardQ}
                  onChange={(e) => setNewCardQ(e.target.value)}
                  placeholder="Front Question / Term (e.g. What is Mitochondria?)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500"
                />
                <textarea
                  rows={2}
                  value={newCardA}
                  onChange={(e) => setNewCardA(e.target.value)}
                  placeholder="Back Answer / Definition..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingCard(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                  >
                    Save Card
                  </button>
                </div>
              </form>
            )}

            {/* Flashcard Component */}
            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className="min-h-[280px] rounded-3xl bg-white border-2 border-slate-200 hover:border-blue-400 shadow-md p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none relative group"
            >
              <div className="absolute top-4 left-6 flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Card {cardIdx + 1} of {currentDeck.cards.length}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className={`text-[10px] font-black uppercase tracking-widest ${isFlipped ? 'text-emerald-600' : 'text-blue-600'}`}>
                  {isFlipped ? 'ANSWER (BACK)' : 'QUESTION (FRONT)'}
                </span>
              </div>

              <div className="my-auto py-6">
                <p className={`text-xl sm:text-2xl font-black leading-snug transition-colors ${isFlipped ? 'text-emerald-700' : 'text-slate-900'}`}>
                  {isFlipped ? currentCard.a : currentCard.q}
                </p>
              </div>

              <div className="text-[11px] font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                Click anywhere to flip card ↺
              </div>
            </div>

            {/* Deck Navigation Controls */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handlePrevCard}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <button
                onClick={handleShuffleDeck}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Shuffle Cards"
              >
                <Shuffle size={15} />
                <span>Shuffle</span>
              </button>

              <button
                onClick={handleNextCard}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20"
              >
                <span>Next Card</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: STUDY NOTEBOOK / SCRATCHPAD */}
        {activeTab === 'notes' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Academic Scratchpad</h2>
                <p className="text-xs text-slate-500">Auto-saves locally for every course and study session.</p>
              </div>

              {/* Subject Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {['General', 'Mathematics', 'Biology', 'History'].map(sub => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubject(sub)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                      selectedSubject === sub 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Note Editor Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-600">
                  {selectedSubject} Study Notes
                </span>
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(studyNotes[selectedSubject] || '');
                    setCopiedNotes(true);
                    setTimeout(() => setCopiedNotes(false), 2000);
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                >
                  {copiedNotes ? <CheckCheck size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copiedNotes ? 'Copied!' : 'Copy Notes'}</span>
                </button>
              </div>

              <textarea
                rows={12}
                value={studyNotes[selectedSubject] || ''}
                onChange={(e) => handleNoteChange(e.target.value)}
                placeholder="Type lecture notes, definitions, formulas, or homework reminders here..."
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all leading-relaxed font-mono"
              />

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>{(studyNotes[selectedSubject] || '').split(/\s+/).filter(Boolean).length} Words</span>
                <span>Auto-saved locally</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: HOMEWORK & TASK CHECKLIST */}
        {activeTab === 'tasks' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Assignment Checklist</h2>
                <p className="text-xs text-slate-500">Track homework deadlines, lab reports, and exam preparation.</p>
              </div>
            </div>

            {/* Add Task Input Form */}
            <form onSubmit={handleAddTask} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add new homework or assignment..."
                className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
              <select
                value={newTaskSubject}
                onChange={(e) => setNewTaskSubject(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700"
              >
                <option value="Math">Math</option>
                <option value="Physics">Physics</option>
                <option value="Biology">Biology</option>
                <option value="History">History</option>
                <option value="Spanish">Spanish</option>
              </select>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shrink-0 cursor-pointer"
              >
                Add Task
              </button>
            </form>

            {/* Tasks List */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
              {tasks.map(t => (
                <div 
                  key={t.id}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div 
                    onClick={() => toggleTask(t.id)}
                    className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer"
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                      t.done ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                    }`}>
                      {t.done && <Check size={13} />}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-bold text-slate-800 truncate ${t.done ? 'line-through text-slate-400' : ''}`}>
                        {t.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                        <span className="font-bold text-slate-600">{t.subject}</span>
                        <span>•</span>
                        <span>{t.due}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTask(t.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: FORMULA CHEAT SHEETS */}
        {activeTab === 'formulas' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Academic Reference Formulas</h2>
              <p className="text-xs text-slate-500">Quick-reference formulas for Mathematics, Physics, and Chemistry.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FORMULAS_DATA.map((group, idx) => (
                <div key={idx} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-3">
                    {group.category}
                  </h3>

                  <div className="space-y-3.5">
                    {group.items.map((item, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">{item.name}</span>
                        <p className="text-xs font-mono font-bold text-slate-900 mt-1">{item.formula}</p>
                        <span className="text-[10px] text-slate-500 block mt-1">{item.note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: SCIENTIFIC STUDY CALCULATOR */}
        {activeTab === 'calculator' && (
          <div className="max-w-sm mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Academic Calculator</h2>
              <p className="text-xs text-slate-500">Quick math and algebraic calculations.</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-4">
              {/* Calculator Display */}
              <div className="p-4 rounded-2xl bg-slate-900 text-right">
                <span className="text-[10px] font-mono text-slate-400 block">
                  {calcPrev !== null && calcOp ? `${calcPrev} ${calcOp}` : ''}
                </span>
                <span className="text-3xl font-mono font-black text-white truncate block">
                  {calcDisplay}
                </span>
              </div>

              {/* Calculator Keypad */}
              <div className="grid grid-cols-4 gap-2 text-sm font-bold">
                <button onClick={handleCalcClear} className="p-3.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 cursor-pointer">AC</button>
                <button onClick={handleCalcSqrt} className="p-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer">√</button>
                <button onClick={() => handleCalcOp('^')} className="p-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer">^</button>
                <button onClick={() => handleCalcOp('÷')} className="p-3.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 cursor-pointer">÷</button>

                <button onClick={() => handleCalcNum('7')} className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 cursor-pointer">7</button>
                <button onClick={() => handleCalcNum('8')} className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 cursor-pointer">8</button>
                <button onClick={() => handleCalcNum('9')} className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 cursor-pointer">9</button>
                <button onClick={() => handleCalcOp('×')} className="p-3.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 cursor-pointer">×</button>

                <button onClick={() => handleCalcNum('4')} className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 cursor-pointer">4</button>
                <button onClick={() => handleCalcNum('5')} className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 cursor-pointer">5</button>
                <button onClick={() => handleCalcNum('6')} className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 cursor-pointer">6</button>
                <button onClick={() => handleCalcOp('-')} className="p-3.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 cursor-pointer">-</button>

                <button onClick={() => handleCalcNum('1')} className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 cursor-pointer">1</button>
                <button onClick={() => handleCalcNum('2')} className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 cursor-pointer">2</button>
                <button onClick={() => handleCalcNum('3')} className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 cursor-pointer">3</button>
                <button onClick={() => handleCalcOp('+')} className="p-3.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 cursor-pointer">+</button>

                <button onClick={() => handleCalcNum('0')} className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 col-span-2 cursor-pointer">0</button>
                <button onClick={() => handleCalcNum('.')} className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 cursor-pointer">.</button>
                <button onClick={handleCalcEquals} className="p-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black cursor-pointer">=</button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Academic Footer with Secret Trigger 4 */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <GraduationCap size={16} className="text-blue-600" />
            <span className="font-bold text-slate-800">EduPortal Academic System</span>
            <span>•</span>
            
            {/* Secret Footer Trigger: 3 clicks unlocks Cine */}
            <span 
              onClick={handleFooterClick}
              className="cursor-pointer hover:text-slate-800 transition-colors select-none"
              title="Academic Standard v4.2.8"
            >
              © 2026 Academic Learning Suite • Accredited Reference
            </span>
          </div>

          <div className="flex items-center gap-6">
            <span className="hover:underline cursor-pointer">Academic Honor Code</span>
            <span className="hover:underline cursor-pointer">Student Resources</span>
            <span className="hover:underline cursor-pointer">Library Services</span>
            
            {/* Discrete stealth trigger button */}
            <button 
              onClick={() => setSecretModalOpen(true)}
              className="text-slate-300 hover:text-slate-500 text-[10px] font-mono cursor-pointer transition-colors"
              title="Diagnostic Panel"
            >
              [SYS]
            </button>
          </div>
        </div>
      </footer>

      {/* Secret Stealth Passcode Modal */}
      <AnimatePresence>
        {secretModalOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <KeyRound size={22} />
              </div>

              <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">
                Academic Diagnostic & Vault
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Enter your stealth passkey or click Launch to enter Cine directly.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const p = secretPasscode.toLowerCase().trim();
                  if (p === 'cine' || p === 'apex' || p === 'games' || p === 'unlock' || p === '1234') {
                    setSecretModalOpen(false);
                    triggerCineLaunch();
                  } else {
                    setSecretError(true);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <input
                    type="password"
                    value={secretPasscode}
                    onChange={(e) => {
                      setSecretPasscode(e.target.value);
                      setSecretError(false);
                    }}
                    placeholder="Enter passkey (e.g. cine)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                    autoFocus
                  />
                  {secretError && (
                    <span className="text-[10px] text-rose-500 font-bold mt-1 block">
                      Invalid passkey. Try typing "cine" or use Direct Launch.
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Unlock
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSecretModalOpen(false);
                      triggerCineLaunch();
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Direct Launch
                  </button>
                </div>
              </form>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                <span>Hint: press `~` or type "cine" in search</span>
                <button
                  type="button"
                  onClick={() => setSecretModalOpen(false)}
                  className="hover:text-slate-700"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

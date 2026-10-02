import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Calculator, 
  Clock, 
  BookOpen, 
  FileText, 
  CheckSquare, 
  BookMarked, 
  ArrowLeftRight,
  Search,
  Plus, 
  Trash2, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Shuffle, 
  Copy, 
  CheckCheck, 
  RotateCcw,
  Play,
  Pause
} from 'lucide-react';

const PRELOADED_DECKS = [
  {
    id: 'bio',
    name: 'Cellular Biology',
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
    name: 'Algebra & Calculus',
    cards: [
      { q: 'What is the derivative of sin(x)?', a: 'cos(x)' },
      { q: 'What is the Quadratic Formula?', a: 'x = (-b ± √(b² - 4ac)) / (2a)' },
      { q: 'What does the Fundamental Theorem of Calculus state?', a: 'Differentiation and integration are inverse operations; ∫[a,b] f(x)dx = F(b) - F(a).' },
      { q: 'What is Euler’s Identity?', a: 'e^(iπ) + 1 = 0' },
      { q: 'What is the derivative of ln(x)?', a: '1 / x (for x > 0)' }
    ]
  },
  {
    id: 'history',
    name: 'Civics & History',
    cards: [
      { q: 'What year was the Magna Carta signed?', a: '1215 at Runnymede by King John of England.' },
      { q: 'What are the three branches of the US Government?', a: 'Legislative, Executive, and Judicial.' },
      { q: 'When did World War II end?', a: '1945.' },
      { q: 'What is the First Amendment of the US Constitution?', a: 'Protects freedom of speech, religion, the press, assembly, and petition.' }
    ]
  },
  {
    id: 'spanish',
    name: 'Spanish Vocabulary',
    cards: [
      { q: 'El aprendizaje', a: 'Learning / apprenticeship' },
      { q: 'El desarrollo sostenible', a: 'Sustainable development' },
      { q: 'La hipótesis comprobada', a: 'Proven hypothesis' },
      { q: 'La investigación', a: 'Research / inquiry' }
    ]
  }
];

const FORMULAS_DATA = [
  {
    category: 'Mathematics',
    items: [
      { name: 'Quadratic Equation', formula: 'x = [-b ± √(b² - 4ac)] / 2a', note: 'Standard form ax² + bx + c = 0' },
      { name: 'Pythagorean Theorem', formula: 'a² + b² = c²', note: 'Right triangle hypotenuse relationship' },
      { name: 'Circle Formulas', formula: 'Circumference = 2πr  |  Area = πr²', note: 'r = radius' },
      { name: 'Slope Formula', formula: 'm = (y₂ - y₁) / (x₂ - x₁)', note: 'Rate of change between two coordinates' },
      { name: 'Distance Formula', formula: 'd = √[(x₂ - x₁)² + (y₂ - y₁)²]', note: 'Euclidean distance between two Cartesian points' }
    ]
  },
  {
    category: 'Physics',
    items: [
      { name: "Newton's Second Law", formula: 'F = m · a', note: 'Force = mass × acceleration (Newtons)' },
      { name: 'Kinetic Energy', formula: 'KE = ½ · m · v²', note: 'Energy of motion (Joules)' },
      { name: 'Gravitational Potential Energy', formula: 'PE = m · g · h', note: 'g ≈ 9.807 m/s²' },
      { name: "Ohm's Law", formula: 'V = I · R', note: 'Voltage = Current × Resistance' },
      { name: 'Speed / Velocity', formula: 'v = d / t', note: 'Velocity = displacement / time' }
    ]
  },
  {
    category: 'Chemistry',
    items: [
      { name: 'Ideal Gas Law', formula: 'P · V = n · R · T', note: 'R = 0.0821 L·atm/(mol·K)' },
      { name: 'Molarity', formula: 'M = moles of solute / liters of solution', note: 'Concentration (mol/L)' },
      { name: 'Density', formula: 'ρ = mass / volume', note: 'g/cm³ or kg/m³' },
      { name: 'pH Definition', formula: 'pH = -log₁₀[H⁺]', note: 'Measure of hydrogen ion concentration' }
    ]
  }
];

const UNIT_CONVERSIONS = {
  length: {
    name: 'Length',
    units: ['meters', 'feet', 'inches', 'kilometers', 'miles', 'centimeters'],
    toBase: {
      meters: 1,
      feet: 0.3048,
      inches: 0.0254,
      kilometers: 1000,
      miles: 1609.344,
      centimeters: 0.01
    }
  },
  mass: {
    name: 'Mass & Weight',
    units: ['kilograms', 'grams', 'pounds', 'ounces'],
    toBase: {
      kilograms: 1,
      grams: 0.001,
      pounds: 0.453592,
      ounces: 0.0283495
    }
  },
  temperature: {
    name: 'Temperature',
    units: ['Celsius', 'Fahrenheit', 'Kelvin']
  }
};

export const EducationalCloak = ({ onToggleCloak }) => {
  // Navigation tabs in study portal
  const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' | 'timer' | 'flashcards' | 'notes' | 'tasks' | 'formulas' | 'converter'
  
  // Stealth Cine Unlocking Triggers (Discreet, no loud banners)
  const [footerClickCount, setFooterClickCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Uncloak cleanly
  const triggerCineLaunch = () => {
    try {
      sessionStorage.setItem('cine_uncloaked', 'true');
    } catch (e) {
      console.warn(e);
    }
    if (onToggleCloak) {
      onToggleCloak();
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

  // Search Bar Trigger: typing 'cine', 'games', 'play', or 'apex' immediately unlocks Cine
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    const lower = val.toLowerCase().trim();
    if (['cine', 'games', 'game', 'play', 'apex', '/cine', 'unlock', 'exit'].includes(lower)) {
      setSearchQuery('');
      triggerCineLaunch();
    }
  };

  // Keyboard shortcut listener: Shift + C or ~ (tilde)
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
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- TOOL 1: CALCULATOR STATE ---
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcPrev, setCalcPrev] = useState(null);
  const [calcOp, setCalcOp] = useState(null);
  const [calcClearNext, setCalcClearNext] = useState(false);

  const handleCalcNum = (digit) => {
    if (calcDisplay === '0' || calcClearNext) {
      setCalcDisplay(digit);
      setCalcClearNext(false);
    } else {
      if (digit === '.' && calcDisplay.includes('.')) return;
      setCalcDisplay(calcDisplay + digit);
    }
  };

  const handleCalcOp = (op) => {
    const current = parseFloat(calcDisplay);
    if (calcPrev === null) {
      setCalcPrev(current);
    } else if (calcOp) {
      const res = executeCalc(calcPrev, current, calcOp);
      setCalcPrev(res);
      setCalcDisplay(String(res));
    }
    setCalcOp(op);
    setCalcClearNext(true);
  };

  const executeCalc = (a, b, op) => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      case '^': return Math.pow(a, b);
      default: return b;
    }
  };

  const handleCalcEquals = () => {
    if (calcPrev !== null && calcOp) {
      const current = parseFloat(calcDisplay);
      const res = executeCalc(calcPrev, current, calcOp);
      setCalcDisplay(String(res));
      setCalcPrev(null);
      setCalcOp(null);
      setCalcClearNext(true);
    }
  };

  const handleCalcClear = () => {
    setCalcDisplay('0');
    setCalcPrev(null);
    setCalcOp(null);
    setCalcClearNext(false);
  };

  const handleCalcSqrt = () => {
    const val = parseFloat(calcDisplay);
    if (val >= 0) {
      setCalcDisplay(String(Math.sqrt(val)));
      setCalcClearNext(true);
    }
  };

  const handleCalcPercent = () => {
    const val = parseFloat(calcDisplay);
    setCalcDisplay(String(val / 100));
    setCalcClearNext(true);
  };

  const handleCalcToggleSign = () => {
    const val = parseFloat(calcDisplay);
    setCalcDisplay(String(-val));
  };

  // --- TOOL 2: STUDY TIMER STATE ---
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState('focus'); // 'focus' (25m) | 'short' (5m) | 'long' (15m)

  useEffect(() => {
    let interval = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerRunning) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  const switchTimerMode = (mode) => {
    setTimerMode(mode);
    setTimerRunning(false);
    if (mode === 'focus') setTimerSeconds(25 * 60);
    else if (mode === 'short') setTimerSeconds(5 * 60);
    else if (mode === 'long') setTimerSeconds(15 * 60);
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // --- TOOL 3: FLASHCARDS STATE ---
  const [customDecks, setCustomDecks] = useState(() => {
    try {
      const saved = localStorage.getItem('study_flashcards_decks');
      return saved ? JSON.parse(saved) : PRELOADED_DECKS;
    } catch {
      return PRELOADED_DECKS;
    }
  });
  const [selectedDeckIdx, setSelectedDeckIdx] = useState(0);
  const [cardIdx, setCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardQ, setNewCardQ] = useState('');
  const [newCardA, setNewCardA] = useState('');

  const currentDeck = customDecks[selectedDeckIdx] || customDecks[0];
  const currentCard = currentDeck?.cards?.[cardIdx] || { q: 'No cards available.', a: 'Add a card above.' };

  const handleNextCard = () => {
    setIsFlipped(false);
    setCardIdx((cardIdx + 1) % currentDeck.cards.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCardIdx((cardIdx - 1 + currentDeck.cards.length) % currentDeck.cards.length);
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
    const updatedCards = [...currentDeck.cards, { q: newCardQ.trim(), a: newCardA.trim() }];
    const updatedDecks = [...customDecks];
    updatedDecks[selectedDeckIdx] = { ...currentDeck, cards: updatedCards };
    setCustomDecks(updatedDecks);
    try {
      localStorage.setItem('study_flashcards_decks', JSON.stringify(updatedDecks));
    } catch (err) {}
    setNewCardQ('');
    setNewCardA('');
    setIsAddingCard(false);
    setCardIdx(updatedCards.length - 1);
  };

  // --- TOOL 4: NOTEPAD STATE ---
  const [selectedSubject, setSelectedSubject] = useState('General');
  const [studyNotes, setStudyNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('study_scratchpad_notes');
      return saved ? JSON.parse(saved) : { General: '', Mathematics: '', Science: '', History: '' };
    } catch {
      return { General: '', Mathematics: '', Science: '', History: '' };
    }
  });
  const [copiedNotes, setCopiedNotes] = useState(false);

  const handleNoteChange = (text) => {
    const next = { ...studyNotes, [selectedSubject]: text };
    setStudyNotes(next);
    try {
      localStorage.setItem('study_scratchpad_notes', JSON.stringify(next));
    } catch (err) {}
  };

  // --- TOOL 5: TASK LIST STATE ---
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('study_checklist_items');
      return saved ? JSON.parse(saved) : [
        { id: '1', title: 'Complete Chapter 4 problem set', subject: 'Math', done: false, date: 'Today' },
        { id: '2', title: 'Review vocabulary list for quiz', subject: 'Spanish', done: true, date: 'Today' },
        { id: '3', title: 'Read lab procedure before class', subject: 'Chemistry', done: false, date: 'Tomorrow' }
      ];
    } catch {
      return [
        { id: '1', title: 'Complete Chapter 4 problem set', subject: 'Math', done: false, date: 'Today' }
      ];
    }
  });
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('Math');
  const [taskFilter, setTaskFilter] = useState('all'); // 'all' | 'pending' | 'completed'

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      subject: newTaskSubject,
      done: false,
      date: 'Pending'
    };
    const next = [newTask, ...tasks];
    setTasks(next);
    try {
      localStorage.setItem('study_checklist_items', JSON.stringify(next));
    } catch (err) {}
    setNewTaskTitle('');
  };

  const toggleTask = (id) => {
    const next = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setTasks(next);
    try {
      localStorage.setItem('study_checklist_items', JSON.stringify(next));
    } catch (err) {}
  };

  const deleteTask = (id) => {
    const next = tasks.filter(t => t.id !== id);
    setTasks(next);
    try {
      localStorage.setItem('study_checklist_items', JSON.stringify(next));
    } catch (err) {}
  };

  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'pending') return !t.done;
    if (taskFilter === 'completed') return t.done;
    return true;
  });

  // --- TOOL 6: UNIT CONVERTER STATE ---
  const [convType, setConvType] = useState('length'); // 'length' | 'mass' | 'temperature'
  const [convInput, setConvInput] = useState('1');
  const [fromUnit, setFromUnit] = useState('meters');
  const [toUnit, setToUnit] = useState('feet');

  const calculateConversion = () => {
    const num = parseFloat(convInput);
    if (isNaN(num)) return '0';

    if (convType === 'temperature') {
      let celsius = num;
      if (fromUnit === 'Fahrenheit') celsius = (num - 32) * (5 / 9);
      else if (fromUnit === 'Kelvin') celsius = num - 273.15;

      if (toUnit === 'Celsius') return celsius.toFixed(4);
      if (toUnit === 'Fahrenheit') return (celsius * (9 / 5) + 32).toFixed(4);
      if (toUnit === 'Kelvin') return (celsius + 273.15).toFixed(4);
      return celsius.toFixed(4);
    }

    const conf = UNIT_CONVERSIONS[convType];
    if (!conf || !conf.toBase[fromUnit] || !conf.toBase[toUnit]) return '0';
    const baseValue = num * conf.toBase[fromUnit];
    const converted = baseValue / conf.toBase[toUnit];
    return Number(converted.toFixed(6)).toString();
  };

  const handleConvTypeChange = (type) => {
    setConvType(type);
    if (type === 'length') {
      setFromUnit('meters');
      setToUnit('feet');
    } else if (type === 'mass') {
      setFromUnit('kilograms');
      setToUnit('pounds');
    } else if (type === 'temperature') {
      setFromUnit('Celsius');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="min-h-screen bg-[#f3f4f6] text-[#1f2937] font-sans antialiased text-sm flex flex-col justify-between"
    >
      
      <div>
        {/* Basic Header Bar */}
        <header className="bg-white border-b border-gray-300">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
            
            {/* Title / Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-700">
                <BookMarked size={18} />
              </div>
              <div>
                <span className="font-semibold text-gray-900 text-sm tracking-tight block">
                  Study Utility Workspace
                </span>
                <span className="text-[11px] text-gray-500 block leading-none">
                  Standard Academic Reference Tools
                </span>
              </div>
            </div>

            {/* Quick search / trigger */}
            <div className="relative w-48 sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search tools or references..."
                className="w-full bg-gray-50 border border-gray-300 rounded px-2.5 py-1 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-500 focus:bg-white"
              />
              <Search size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

          </div>

          {/* Simple Tab Bar */}
          <div className="max-w-5xl mx-auto px-4 flex items-center gap-1 overflow-x-auto border-t border-gray-200">
            {[
              { id: 'calculator', label: 'Calculator', icon: Calculator },
              { id: 'timer', label: 'Study Timer', icon: Clock },
              { id: 'flashcards', label: 'Flashcards', icon: BookOpen },
              { id: 'notes', label: 'Notepad', icon: FileText },
              { id: 'tasks', label: 'Task List', icon: CheckSquare },
              { id: 'formulas', label: 'Formula Sheet', icon: BookMarked },
              { id: 'converter', label: 'Unit Converter', icon: ArrowLeftRight }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isActive
                      ? 'border-gray-800 text-gray-950 font-semibold bg-gray-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-gray-900' : 'text-gray-500'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-5xl mx-auto px-4 py-6">

          {/* TAB 1: CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="max-w-md mx-auto bg-white border border-gray-300 rounded shadow-xs p-4 space-y-3">
              <div className="border-b border-gray-200 pb-2">
                <h2 className="text-sm font-semibold text-gray-900">Standard Calculator</h2>
                <p className="text-xs text-gray-500">Basic arithmetic and standard operations</p>
              </div>

              {/* Display */}
              <div className="bg-gray-100 border border-gray-300 rounded p-3 text-right">
                <div className="text-[11px] font-mono text-gray-500 h-4">
                  {calcPrev !== null && calcOp ? `${calcPrev} ${calcOp}` : ''}
                </div>
                <div className="text-2xl font-mono font-semibold text-gray-900 truncate">
                  {calcDisplay}
                </div>
              </div>

              {/* Keys */}
              <div className="grid grid-cols-4 gap-1.5 text-xs font-medium">
                <button onClick={handleCalcClear} className="py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded border border-gray-300">C</button>
                <button onClick={handleCalcToggleSign} className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded border border-gray-300">±</button>
                <button onClick={handleCalcPercent} className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded border border-gray-300">%</button>
                <button onClick={() => handleCalcOp('÷')} className="py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded border border-gray-300 font-semibold">÷</button>

                <button onClick={() => handleCalcNum('7')} className="py-2.5 bg-white hover:bg-gray-50 text-gray-800 rounded border border-gray-300">7</button>
                <button onClick={() => handleCalcNum('8')} className="py-2.5 bg-white hover:bg-gray-50 text-gray-800 rounded border border-gray-300">8</button>
                <button onClick={() => handleCalcNum('9')} className="py-2.5 bg-white hover:bg-gray-50 text-gray-800 rounded border border-gray-300">9</button>
                <button onClick={() => handleCalcOp('×')} className="py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded border border-gray-300 font-semibold">×</button>

                <button onClick={() => handleCalcNum('4')} className="py-2.5 bg-white hover:bg-gray-50 text-gray-800 rounded border border-gray-300">4</button>
                <button onClick={() => handleCalcNum('5')} className="py-2.5 bg-white hover:bg-gray-50 text-gray-800 rounded border border-gray-300">5</button>
                <button onClick={() => handleCalcNum('6')} className="py-2.5 bg-white hover:bg-gray-50 text-gray-800 rounded border border-gray-300">6</button>
                <button onClick={() => handleCalcOp('-')} className="py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded border border-gray-300 font-semibold">-</button>

                <button onClick={() => handleCalcNum('1')} className="py-2.5 bg-white hover:bg-gray-50 text-gray-800 rounded border border-gray-300">1</button>
                <button onClick={() => handleCalcNum('2')} className="py-2.5 bg-white hover:bg-gray-50 text-gray-800 rounded border border-gray-300">2</button>
                <button onClick={() => handleCalcNum('3')} className="py-2.5 bg-white hover:bg-gray-50 text-gray-800 rounded border border-gray-300">3</button>
                <button onClick={() => handleCalcOp('+')} className="py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded border border-gray-300 font-semibold">+</button>

                <button onClick={() => handleCalcNum('0')} className="py-2.5 bg-white hover:bg-gray-50 text-gray-800 rounded border border-gray-300 col-span-2">0</button>
                <button onClick={() => handleCalcNum('.')} className="py-2.5 bg-white hover:bg-gray-50 text-gray-800 rounded border border-gray-300">.</button>
                <button onClick={handleCalcEquals} className="py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded border border-gray-800 font-semibold">=</button>

                <button onClick={handleCalcSqrt} className="py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300 col-span-2">√ Square Root</button>
                <button onClick={() => handleCalcOp('^')} className="py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300 col-span-2">x^y Power</button>
              </div>
            </div>
          )}

          {/* TAB 2: STUDY TIMER */}
          {activeTab === 'timer' && (
            <div className="max-w-md mx-auto bg-white border border-gray-300 rounded shadow-xs p-6 space-y-6 text-center">
              <div className="border-b border-gray-200 pb-2 text-left">
                <h2 className="text-sm font-semibold text-gray-900">Study Session Timer</h2>
                <p className="text-xs text-gray-500">Standard interval timer for focused reading and problem sets</p>
              </div>

              {/* Mode Selection */}
              <div className="inline-flex rounded border border-gray-300 bg-gray-100 p-0.5">
                {[
                  { id: 'focus', label: '25 min Study' },
                  { id: 'short', label: '5 min Break' },
                  { id: 'long', label: '15 min Break' }
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => switchTimerMode(m.id)}
                    className={`px-3 py-1.5 text-xs rounded transition-colors ${
                      timerMode === m.id
                        ? 'bg-white font-medium text-gray-900 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Digits Display */}
              <div className="py-4">
                <div className="text-6xl font-mono font-bold tracking-tight text-gray-900">
                  {formatTimer(timerSeconds)}
                </div>
                <div className="text-xs text-gray-500 mt-2 font-medium">
                  {timerRunning ? 'Timer active' : 'Timer paused'}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className={`px-6 py-2 rounded text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                    timerRunning
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-800 border-gray-400'
                      : 'bg-gray-900 hover:bg-gray-800 text-white border-gray-900'
                  }`}
                >
                  {timerRunning ? <Pause size={14} /> : <Play size={14} />}
                  <span>{timerRunning ? 'Pause' : 'Start'}</span>
                </button>

                <button
                  onClick={() => switchTimerMode(timerMode)}
                  className="px-4 py-2 rounded bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 text-xs flex items-center gap-1"
                >
                  <RotateCcw size={14} />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: FLASHCARDS */}
          {activeTab === 'flashcards' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="bg-white border border-gray-300 rounded p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Study Flashcards</h2>
                  <p className="text-xs text-gray-500">Memorization and term review</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedDeckIdx}
                    onChange={(e) => {
                      setSelectedDeckIdx(parseInt(e.target.value));
                      setCardIdx(0);
                      setIsFlipped(false);
                    }}
                    className="bg-white border border-gray-300 rounded px-2.5 py-1 text-xs text-gray-800"
                  >
                    {customDecks.map((d, i) => (
                      <option key={d.id} value={i}>{d.name} ({d.cards.length})</option>
                    ))}
                  </select>

                  <button
                    onClick={() => setIsAddingCard(!isAddingCard)}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-xs text-gray-800 flex items-center gap-1"
                  >
                    <Plus size={13} />
                    <span>New Card</span>
                  </button>
                </div>
              </div>

              {/* Add Card Form */}
              {isAddingCard && (
                <form onSubmit={handleAddCustomCard} className="bg-white border border-gray-300 rounded p-3 space-y-2">
                  <span className="text-xs font-semibold text-gray-800 block">Add card to {currentDeck.name}</span>
                  <input
                    type="text"
                    value={newCardQ}
                    onChange={(e) => setNewCardQ(e.target.value)}
                    placeholder="Front (Question / Concept)..."
                    className="w-full border border-gray-300 rounded p-2 text-xs"
                  />
                  <textarea
                    rows={2}
                    value={newCardA}
                    onChange={(e) => setNewCardA(e.target.value)}
                    placeholder="Back (Answer / Definition)..."
                    className="w-full border border-gray-300 rounded p-2 text-xs"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingCard(false)}
                      className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-gray-900 text-white rounded text-xs"
                    >
                      Save
                    </button>
                  </div>
                </form>
              )}

              {/* Flashcard Box */}
              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className="min-h-[220px] bg-white border border-gray-300 rounded p-8 flex flex-col justify-between items-center text-center cursor-pointer select-none hover:border-gray-400"
              >
                <div className="w-full flex justify-between text-[11px] text-gray-500 font-mono">
                  <span>Card {cardIdx + 1} of {currentDeck.cards.length}</span>
                  <span className="font-sans font-medium uppercase tracking-wider">
                    {isFlipped ? 'Definition' : 'Question'}
                  </span>
                </div>

                <div className="py-6 px-4">
                  <p className="text-base sm:text-lg font-medium text-gray-900 leading-relaxed">
                    {isFlipped ? currentCard.a : currentCard.q}
                  </p>
                </div>

                <div className="text-[11px] text-gray-400">
                  (Click card to flip)
                </div>
              </div>

              {/* Card Controls */}
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={handlePrevCard}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-1"
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>

                <button
                  onClick={handleShuffleDeck}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-50 flex items-center gap-1"
                >
                  <Shuffle size={13} />
                  <span>Shuffle</span>
                </button>

                <button
                  onClick={handleNextCard}
                  className="px-3 py-1.5 bg-gray-900 text-white rounded text-xs hover:bg-gray-800 flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: NOTEPAD */}
          {activeTab === 'notes' && (
            <div className="max-w-3xl mx-auto space-y-3">
              <div className="bg-white border border-gray-300 rounded p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Study Scratchpad</h2>
                  <p className="text-xs text-gray-500">Text is saved locally in browser</p>
                </div>

                {/* Section Selector */}
                <div className="flex items-center gap-1">
                  {['General', 'Mathematics', 'Science', 'History'].map(sub => (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubject(sub)}
                      className={`px-2.5 py-1 text-xs rounded border ${
                        selectedSubject === sub
                          ? 'bg-gray-800 text-white border-gray-800 font-medium'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-300 rounded p-3 space-y-2">
                <div className="flex justify-between items-center text-xs text-gray-500 border-b border-gray-200 pb-2">
                  <span className="font-medium text-gray-700">{selectedSubject} Notes</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(studyNotes[selectedSubject] || '');
                      setCopiedNotes(true);
                      setTimeout(() => setCopiedNotes(false), 2000);
                    }}
                    className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-xs"
                  >
                    {copiedNotes ? <CheckCheck size={13} className="text-green-600" /> : <Copy size={13} />}
                    <span>{copiedNotes ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <textarea
                  rows={14}
                  value={studyNotes[selectedSubject] || ''}
                  onChange={(e) => handleNoteChange(e.target.value)}
                  placeholder="Type rough notes, definitions, or homework scratch work..."
                  className="w-full border-0 p-2 text-xs font-mono text-gray-800 leading-relaxed focus:outline-none resize-y"
                />

                <div className="flex justify-between text-[11px] text-gray-400 border-t border-gray-200 pt-2">
                  <span>{(studyNotes[selectedSubject] || '').split(/\s+/).filter(Boolean).length} words</span>
                  <span>{(studyNotes[selectedSubject] || '').length} characters</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TASK LIST */}
          {activeTab === 'tasks' && (
            <div className="max-w-2xl mx-auto space-y-3">
              <div className="bg-white border border-gray-300 rounded p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Assignment Checklist</h2>
                  <p className="text-xs text-gray-500">Track pending homework and readings</p>
                </div>

                <div className="flex items-center gap-1 text-xs">
                  {['all', 'pending', 'completed'].map(f => (
                    <button
                      key={f}
                      onClick={() => setTaskFilter(f)}
                      className={`px-2 py-0.5 rounded capitalize ${
                        taskFilter === f ? 'bg-gray-200 font-medium text-gray-900' : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Task Input */}
              <form onSubmit={handleAddTask} className="bg-white border border-gray-300 rounded p-2.5 flex items-center gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Add assignment or task..."
                  className="flex-1 border border-gray-300 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-gray-500"
                />
                <select
                  value={newTaskSubject}
                  onChange={(e) => setNewTaskSubject(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs text-gray-700 bg-white"
                >
                  <option value="Math">Math</option>
                  <option value="Science">Science</option>
                  <option value="History">History</option>
                  <option value="English">English</option>
                  <option value="Other">Other</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-1 bg-gray-900 text-white rounded text-xs hover:bg-gray-800"
                >
                  Add
                </button>
              </form>

              {/* List */}
              <div className="bg-white border border-gray-300 rounded divide-y divide-gray-200">
                {filteredTasks.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400">
                    No tasks found in this view.
                  </div>
                ) : (
                  filteredTasks.map(t => (
                    <div key={t.id} className="p-2.5 flex items-center justify-between gap-3 hover:bg-gray-50">
                      <div 
                        onClick={() => toggleTask(t.id)}
                        className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={t.done}
                          onChange={() => {}}
                          className="h-3.5 w-3.5 text-gray-800 rounded border-gray-300 cursor-pointer"
                        />
                        <span className={`text-xs truncate ${t.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {t.title}
                        </span>
                        <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                          {t.subject}
                        </span>
                      </div>

                      <button
                        onClick={() => deleteTask(t.id)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: FORMULA CHEAT SHEET */}
          {activeTab === 'formulas' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="bg-white border border-gray-300 rounded p-4">
                <h2 className="text-sm font-semibold text-gray-900">Reference Formulas & Constants</h2>
                <p className="text-xs text-gray-500">Standard formulas across subjects</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {FORMULAS_DATA.map((group, idx) => (
                  <div key={idx} className="bg-white border border-gray-300 rounded p-3 space-y-2">
                    <h3 className="text-xs font-semibold text-gray-900 border-b border-gray-200 pb-1.5">
                      {group.category}
                    </h3>
                    <div className="space-y-2">
                      {group.items.map((item, i) => (
                        <div key={i} className="p-2 bg-gray-50 border border-gray-200 rounded text-xs">
                          <span className="font-medium text-gray-800 block text-[11px]">{item.name}</span>
                          <span className="font-mono text-gray-900 font-semibold block my-0.5">{item.formula}</span>
                          <span className="text-[10px] text-gray-500 block">{item.note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: UNIT CONVERTER */}
          {activeTab === 'converter' && (
            <div className="max-w-lg mx-auto bg-white border border-gray-300 rounded p-5 space-y-4">
              <div className="border-b border-gray-200 pb-2">
                <h2 className="text-sm font-semibold text-gray-900">Unit Converter</h2>
                <p className="text-xs text-gray-500">Conversion across metric and imperial systems</p>
              </div>

              {/* Conversion Type Select */}
              <div className="flex gap-1 border-b border-gray-200 pb-3">
                {['length', 'mass', 'temperature'].map(t => (
                  <button
                    key={t}
                    onClick={() => handleConvTypeChange(t)}
                    className={`px-3 py-1 text-xs rounded border capitalize ${
                      convType === t
                        ? 'bg-gray-800 text-white border-gray-800 font-medium'
                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Input & Unit Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-gray-500 font-medium block">From:</label>
                  <input
                    type="number"
                    value={convInput}
                    onChange={(e) => setConvInput(e.target.value)}
                    className="w-full border border-gray-300 rounded p-1.5 text-xs font-mono"
                  />
                  <select
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                    className="w-full border border-gray-300 rounded p-1 text-xs bg-white capitalize"
                  >
                    {(UNIT_CONVERSIONS[convType]?.units || []).map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-gray-500 font-medium block">To:</label>
                  <div className="w-full border border-gray-300 bg-gray-50 rounded p-1.5 text-xs font-mono font-semibold text-gray-900 h-8 flex items-center">
                    {calculateConversion()}
                  </div>
                  <select
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value)}
                    className="w-full border border-gray-300 rounded p-1 text-xs bg-white capitalize"
                  >
                    {(UNIT_CONVERSIONS[convType]?.units || []).map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-2.5 bg-gray-50 rounded border border-gray-200 text-center text-xs text-gray-600 font-mono">
                {convInput} {fromUnit} = <span className="font-bold text-gray-900">{calculateConversion()}</span> {toUnit}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Boring School Footer */}
      <footer className="bg-white border-t border-gray-300 py-4 mt-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <div>
            <span>Study Utility Workspace v2.4 • Standard Academic Tools</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Terms of Use</span>
            <span>Privacy</span>
            {/* Secret 3-click trigger on copyright year */}
            <span
              onClick={handleFooterClick}
              className="cursor-pointer select-none text-gray-400 hover:text-gray-500"
              title="System reference"
            >
              © 2026 Reference Suite
            </span>
          </div>
        </div>
      </footer>

    </motion.div>
  );
};

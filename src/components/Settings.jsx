import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings as SettingsIcon, User, AlertTriangle, RefreshCw, Lightbulb, Send, CheckCircle2, Shield } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { filterProfanity } from '../lib/profanity';

export const Settings = ({ user, onUpdateSettings, onSetTheme, onRedeemCode, onResetProgress, onUpdateUsername, addNotification }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showUsernameConfirm, setShowUsernameConfirm] = useState(false);
  const [usernameInput, setUsernameInput] = useState(user?.username || '');
  const [suggestionText, setSuggestionText] = useState('');
  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false);

  // Note: Display & Visuals settings have been removed per user request
  const sections = [
    {
      id: 'general',
      title: 'Preferences',
      icon: SettingsIcon,
      settings: [
        { id: 'sidebarAutoHide', label: 'Sidebar Auto-Hide', description: 'Automatically collapse the navigation menu.' },
        { id: 'notifications', label: 'System Notifications', description: 'Receive toast alerts for level-ups and milestones.' },
        { id: 'displayProfileBadges', label: 'Display Profile Badges', description: 'Show your earned achievement badges on your public profile.' }
      ]
    },
    {
      id: 'suggestions',
      title: 'Submit Suggestion',
      icon: Lightbulb,
      settings: []
    },
    {
      id: 'account',
      title: 'Profile & Identity',
      icon: User,
      settings: []
    }
  ];

  const handleSuggestionSubmit = async (e) => {
    e.preventDefault();
    if (!suggestionText.trim() || isSubmittingSuggestion) return;

    if (!auth.currentUser) {
      if (addNotification) {
        addNotification('SIGN-IN REQUIRED', 'Please sign in to transmit a suggestion to the owner.', 'error');
      }
      return;
    }

    setIsSubmittingSuggestion(true);
    try {
      const filtered = filterProfanity(suggestionText.trim());
      await addDoc(collection(db, 'suggestions'), {
        text: filtered,
        authorId: auth.currentUser.uid,
        authorName: user?.username || 'Player',
        votes: 0,
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      setSuggestionText('');
      if (addNotification) {
        addNotification('SUGGESTION TRANSMITTED', 'Your suggestion was sent directly to the site owner in the Owner Portal!', 'success', <CheckCircle2 size={14} className="text-emerald-400" />);
      }
    } catch (err) {
      console.error('Error submitting suggestion:', err);
      if (addNotification) {
        addNotification('TRANSMISSION FAILED', 'Could not send suggestion. Please try again.', 'error');
      }
    } finally {
      setIsSubmittingSuggestion(false);
    }
  };

  return (
    <div className="min-h-screen pt-8 pb-32 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Confirm Reset Dialog */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0e121a] border border-rose-500/30 rounded-3xl p-8 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-5">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-2">Reset Progress?</h3>
              <p className="text-white/60 text-xs leading-relaxed mb-6">
                This will reset your local XP level, game stats, and pinned games. This action cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    onResetProgress();
                    setShowResetConfirm(false);
                  }}
                  className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-rose-500/20 cursor-pointer"
                >
                  Confirm Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Confirm Username Dialog */}
        {showUsernameConfirm && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0e121a] border border-white/10 rounded-3xl p-8 shadow-2xl text-center"
            >
              <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-2">Change Display Name</h3>
              <p className="text-white/50 text-xs mb-6">
                Your new username will appear across Cine Leaderboards and Global Chat.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowUsernameConfirm(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    onUpdateUsername(usernameInput.trim());
                    setShowUsernameConfirm(false);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  Confirm Change
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-black text-white uppercase italic tracking-tight">
          System Settings
        </h1>
        <p className="text-white/40 text-xs sm:text-sm font-medium uppercase tracking-widest mt-1">
          Customize personal preferences and account configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Navigation Tabs */}
        <div className="md:col-span-4 flex flex-col gap-2 bg-[#0e121a] border border-white/10 p-3 rounded-3xl">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-xs uppercase tracking-wider text-left cursor-pointer ${
                activeTab === section.id
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <section.icon size={18} />
              <span>{section.title}</span>
            </button>
          ))}

          <div className="pt-2 mt-2 border-t border-white/5">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Reset Data</span>
            </button>
          </div>
        </div>

        {/* Tab Content Panel */}
        <div className="md:col-span-8 bg-[#0e121a] border border-white/10 rounded-3xl p-6 sm:p-8">
          {/* TAB 1: SUGGESTION SUBMISSION (Only owner sees community suggestions in Owner Portal) */}
          {activeTab === 'suggestions' ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-1 flex items-center gap-2">
                  <Lightbulb size={20} className="text-yellow-400" />
                  <span>Submit Suggestion to Owner</span>
                </h3>
                <p className="text-xs text-white/50">
                  Suggest a new game, app, or feature. Submissions are delivered directly to the platform owner in the Owner Portal.
                </p>
              </div>

              <form onSubmit={handleSuggestionSubmit} className="space-y-4">
                <textarea
                  value={suggestionText}
                  onChange={(e) => setSuggestionText(e.target.value)}
                  placeholder="Describe your game or feature suggestion here..."
                  maxLength={500}
                  rows={5}
                  required
                  className="w-full bg-[#121624] border border-white/10 rounded-2xl p-4 text-white text-xs font-medium focus:outline-none focus:border-blue-500 resize-none transition-colors"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-white/40">{suggestionText.length}/500</span>
                  <button
                    type="submit"
                    disabled={!suggestionText.trim() || isSubmittingSuggestion}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send size={14} />
                    <span>{isSubmittingSuggestion ? 'Transmitting...' : 'Send to Owner'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : activeTab === 'account' ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-white uppercase italic tracking-tight mb-1">Display Profile</h3>
                <p className="text-xs text-white/50">Update how your name appears across Cine leaderboards and active games.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/40 block">Your Username</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    maxLength={20}
                    className="flex-1 bg-[#121624] border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => setShowUsernameConfirm(true)}
                    disabled={!usernameInput.trim() || usernameInput === user?.username}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-white uppercase italic tracking-tight mb-1">Preferences</h3>
                <p className="text-xs text-white/50">Configure your system alerts and profile settings.</p>
              </div>

              <div className="divide-y divide-white/5">
                {sections.find(s => s.id === 'general')?.settings.map(setting => {
                  const isChecked = user?.settings?.[setting.id] !== false;
                  return (
                    <div key={setting.id} className="py-4 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-white">{setting.label}</h4>
                        <p className="text-xs text-white/50 mt-0.5">{setting.description}</p>
                      </div>

                      <button
                        onClick={() => {
                          onUpdateSettings({
                            ...user?.settings,
                            [setting.id]: !isChecked
                          });
                        }}
                        className={`w-12 h-6 rounded-full transition-all p-1 flex items-center cursor-pointer ${
                          isChecked 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 justify-end shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                            : 'bg-white/10 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

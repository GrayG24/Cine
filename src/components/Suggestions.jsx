import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ThumbsUp, ThumbsDown, MessageSquare, Plus, Clock, TrendingUp, AlertCircle, CheckCircle2, Pin, Trash2, Shield } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, limit, updateDoc, doc, arrayUnion, arrayRemove, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { filterProfanity } from '../lib/profanity';
import { isPlatformOwner } from '../constants';

export const Suggestions = ({ user, addNotification }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [newSuggestion, setNewSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('trending'); // 'new' or 'trending'

  useEffect(() => {
    if (!auth.currentUser) {
      setSuggestions([]);
      return;
    }

    const q = query(
      collection(db, 'suggestions'), 
      orderBy(sortBy === 'trending' ? 'votes' : 'createdAt', 'desc'),
      limit(50)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => {
        const item = d.data();
        return {
          id: d.id,
          ...item,
          upvoters: item.upvoters || item.voters || [],
          downvoters: item.downvoters || [],
          createdAt: item.createdAt?.toMillis() || Date.now()
        };
      });
      setSuggestions(data);
    }, (error) => {
      console.warn('Suggestions Sync Error:', error);
    });

    return () => unsub();
  }, [sortBy, user.uid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newSuggestion.trim() || isSubmitting) return;
    if (!auth.currentUser) {
      if (addNotification) {
        addNotification('AUTHENTICATION REQUIRED', 'Please sign in to suggest new features!', 'error', <Plus size={14} className="text-rose-500" />);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const filteredText = filterProfanity(newSuggestion.trim());
      await addDoc(collection(db, 'suggestions'), {
        text: filteredText,
        authorId: auth.currentUser.uid,
        authorName: user.username,
        authorCharacter: user.currentCharacter,
        votes: 0,
        upvoters: [],
        downvoters: [],
        voters: [],
        createdAt: serverTimestamp(),
        status: 'pending' // 'pending', 'approved', 'implemented'
      });
      setNewSuggestion('');
      if (addNotification) {
        addNotification('SUGGESTION RECEIVED', 'Your transmission has been logged. Thank you for helping us evolve!', 'success', <CheckCircle2 size={14} className="text-emerald-500" />);
      }
    } catch (err) {
      console.error('Error adding suggestion:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    // If we're on a school device or iframe, window.confirm might be weird.
    // For now, let's just make it work.
    try {
      if (addNotification) {
        addNotification('DELETING...', 'Removing suggestion...', 'info', <Shield size={14} className="text-theme animate-pulse" />);
      }
      await deleteDoc(doc(db, 'suggestions', id));
      if (addNotification) {
        addNotification('DELETED', 'Suggestion removed.', 'success', <Trash2 size={14} className="text-emerald-500" />);
      }
    } catch (error) {
      console.error('Delete Suggestion Error:', error);
      if (addNotification) {
        addNotification('ERROR', "You can't delete this.", 'error', <Shield size={14} className="text-rose-500" />);
      }
    }
  };

  const handleVote = async (id, delta) => {
    if (!auth.currentUser) {
      if (addNotification) {
        addNotification('AUTHENTICATION REQUIRED', 'Please sign in to vote on suggestions!', 'error', <Shield size={14} className="text-rose-500" />);
      }
      return;
    }
    const uid = auth.currentUser.uid;
    const suggestion = suggestions.find(s => s.id === id);
    if (!suggestion) return;

    const upvoters = suggestion.upvoters || suggestion.voters || []; // Migration support
    const downvoters = suggestion.downvoters || [];
    
    let newUpvoters = [...upvoters];
    let newDownvoters = [...downvoters];
    let voteChange = 0;

    const hasUpvoted = upvoters.includes(uid);
    const hasDownvoted = downvoters.includes(uid);

    if (delta > 0) {
      // Trying to UPVOTE
      if (hasUpvoted) {
        // Remove upvote
        newUpvoters = newUpvoters.filter(id => id !== uid);
        voteChange = -1;
      } else {
        // Add upvote
        newUpvoters.push(uid);
        voteChange = 1;
        // If they had downvoted, remove that too
        if (hasDownvoted) {
          newDownvoters = newDownvoters.filter(id => id !== uid);
          voteChange = 2; // -(-1) + 1
        }
      }
    } else {
      // Trying to DOWNVOTE
      if (hasDownvoted) {
        // Remove downvote
        newDownvoters = newDownvoters.filter(id => id !== uid);
        voteChange = 1;
      } else {
        // Add downvote
        newDownvoters.push(uid);
        voteChange = -1;
        // If they had upvoted, remove that too
        if (hasUpvoted) {
          newUpvoters = newUpvoters.filter(id => id !== uid);
          voteChange = -2; // -(1) - 1
        }
      }
    }

    try {
      await updateDoc(doc(db, 'suggestions', id), {
        votes: (suggestion.votes || 0) + voteChange,
        upvoters: newUpvoters,
        downvoters: newDownvoters,
        voters: newUpvoters // Keep legacy voters array in sync for rules
      });
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-2">
        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">PLAYER SUGGESTIONS</h3>
        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] italic leading-none">HELP US BUILD THE FUTURE OF 9X</p>
      </div>

      {/* Submit Form */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-theme/20 to-transparent rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative p-6 bg-white/[0.03] border border-white/10 rounded-[2rem] backdrop-blur-3xl">
          <textarea
            value={newSuggestion}
            onChange={(e) => setNewSuggestion(e.target.value)}
            placeholder="I THINK YOU SHOULD ADD..."
            maxLength={280}
            className="w-full bg-transparent text-white font-black uppercase tracking-widest placeholder:text-white/10 outline-none resize-none min-h-[100px] italic text-sm"
          />
          <div className="flex items-center justify-between mt-4">
            <span className="text-[10px] font-black text-white/20 italic">{newSuggestion.length}/280</span>
            <button
              disabled={!newSuggestion.trim() || isSubmitting}
              className="flex items-center gap-3 px-8 py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-theme hover:text-white transition-all italic disabled:opacity-20 shadow-xl"
            >
              {isSubmitting ? 'TRANSMITTING...' : 'SEND SUGGESTION'}
              <Send size={14} />
            </button>
          </div>
        </div>
      </form>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSortBy('trending')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all italic ${
            sortBy === 'trending' ? 'bg-white text-black' : 'text-white/30 hover:text-white hover:bg-white/5 border border-white/10'
          }`}
        >
          <TrendingUp size={12} />
          TRENDING
        </button>
        <button 
          onClick={() => setSortBy('new')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all italic ${
            sortBy === 'new' ? 'bg-white text-black' : 'text-white/30 hover:text-white hover:bg-white/5 border border-white/10'
          }`}
        >
          <Clock size={12} />
          NEWEST
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {suggestions.map((s) => (
            <motion.div
              key={s.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-8 bg-black/40 border border-white/10 rounded-[2.5rem] flex items-center gap-8 group hover:border-white/20 transition-all"
            >
              <div className="flex flex-col items-center gap-2 shrink-0">
                <button 
                  onClick={() => handleVote(s.id, 1)}
                  className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all ${
                    s.upvoters?.includes(auth.currentUser?.uid) 
                      ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                      : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <ThumbsUp size={18} />
                  <span className="text-[10px] font-black mt-1 leading-none">{s.upvoters?.length || 0}</span>
                </button>
                <div className="w-1 h-1 rounded-full bg-white/10" />
                <button 
                  onClick={() => handleVote(s.id, -1)}
                  className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all ${
                    s.downvoters?.includes(auth.currentUser?.uid) 
                      ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]' 
                      : 'bg-white/5 text-white/20 hover:bg-rose-500/10 hover:text-rose-500'
                  }`}
                >
                  <ThumbsDown size={14} />
                  <span className="text-[10px] font-black mt-1 leading-none">{s.downvoters?.length || 0}</span>
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5">
                      <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] italic">{s.authorName}</span>
                    </div>
                    {s.status === 'implemented' && (
                      <div className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center gap-2">
                        <CheckCircle2 size={10} className="text-emerald-500" />
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest italic">IMPLEMENTED</span>
                      </div>
                    )}
                    {s.status === 'approved' && (
                      <div className="px-3 py-1 bg-theme/10 rounded-full border border-theme/20 flex items-center gap-2">
                        <AlertCircle size={10} className="text-theme" />
                        <span className="text-[8px] font-black text-theme uppercase tracking-widest italic">APPROVED</span>
                      </div>
                    )}
                  </div>
                  
                    {(s.authorId === auth.currentUser?.uid || user.isAdmin || isPlatformOwner(user, auth.currentUser)) && (
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(s.id);
                        }}
                        className="p-5 -m-5 text-white/40 hover:text-rose-500 hover:bg-rose-500/20 rounded-2xl transition-all cursor-pointer relative z-50 pointer-events-auto flex items-center justify-center bg-white/5 active:scale-75 border border-white/5 hover:border-rose-500/30"
                        title="Delete Suggestion"
                      >
                        <Trash2 size={20} className="pointer-events-none" />
                      </button>
                    )}
                </div>
                <p className="text-lg font-black text-white uppercase tracking-tight italic leading-relaxed">{s.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {suggestions.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
            <MessageSquare size={48} className="text-white/5 mx-auto mb-4" />
            <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em] italic">NO SUGGESTIONS YET. BE THE FIRST!</p>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Crown, 
  Megaphone, 
  Gamepad2, 
  Users, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Send, 
  Search, 
  Sparkles, 
  Clock, 
  Eye, 
  RefreshCw, 
  UserX, 
  Radio, 
  ExternalLink,
  ShieldCheck,
  Ban,
  Activity,
  UserCheck,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Check,
  Lock,
  Unlock,
  Wrench,
  Terminal,
  Trophy,
  Zap,
  Plus,
  Flame,
  Award,
  Medal,
  Hammer,
  Palette,
  Layers,
  RotateCcw,
  Key,
  ChevronDown,
  Target,
  HelpCircle,
  Code,
  User,
  Calendar
} from 'lucide-react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AppRoute, GAMES_DATA, CHARACTERS, PROFILE_BANNERS, BADGES, isPlatformOwner } from '../constants';

export const OwnerPortalPage = ({ 
  user, 
  firebaseUser, 
  onNavigate, 
  onPlayGame,
  onTestGame,
  addNotification,
  countOwnerOnLeaderboard,
  onToggleCountOwner,
  onUpdateUser,
  dailyGame,
  gamesData
}) => {
  const [activeTab, setActiveTab] = useState('admin_tools'); // 'admin_tools' | 'game_exp' | 'daily_exp' | 'reports' | 'games' | 'suggestions' | 'broadcast' | 'users' | 'blacklist'
  const [reportSubTab, setReportSubTab] = useState('games'); // 'games' | 'accounts'
  
  // Data states
  const [reports, setReports] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [blacklist, setBlacklist] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsFilter, setSuggestionsFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'implemented'
  const [lockedGames, setLockedGames] = useState({});
  const [gameFilter, setGameFilter] = useState('all'); // 'all' | 'broken' | 'locked' | 'operational'
  const [gameSearchQuery, setGameSearchQuery] = useState('');
  const [isUpdatingGame, setIsUpdatingGame] = useState(false);
  const [editingGameReason, setEditingGameReason] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Broadcast composer state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastType, setBroadcastType] = useState('alert');
  const [enable10sOverlay, setEnable10sOverlay] = useState(true);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Account deletion modal state
  const [deleteTargetUser, setDeleteTargetUser] = useState(null);
  const [deleteReason, setDeleteReason] = useState('Violated platform rules & terms of service');
  const [isDeleting, setIsDeleting] = useState(false);

  // User search query
  const [searchUserQuery, setSearchUserQuery] = useState('');

  // Leaderboard toggle local state
  const [localCountOwner, setLocalCountOwner] = useState(countOwnerOnLeaderboard ?? false);
  useEffect(() => {
    if (countOwnerOnLeaderboard !== undefined) {
      setLocalCountOwner(countOwnerOnLeaderboard);
    }
  }, [countOwnerOnLeaderboard]);

  const handleToggleLeaderboard = async () => {
    const nextVal = !localCountOwner;
    setLocalCountOwner(nextVal);
    if (onToggleCountOwner) {
      onToggleCountOwner();
    } else {
      try {
        await setDoc(doc(db, 'settings', 'global'), { countOwnerOnLeaderboard: nextVal }, { merge: true });
        if (addNotification) {
          addNotification('LEADERBOARD UPDATED', nextVal ? 'Owner account is now counted on leaderboard.' : 'Owner account excluded from leaderboard. 2nd place ranked up to 1st!', 'success');
        }
      } catch (err) {
        console.error('Toggle error:', err);
      }
    }
  };

  // Individual tool target usernames for level and exp tools
  const [levelToolUser, setLevelToolUser] = useState(user?.username || 'Owner');
  const [expToolUser, setExpToolUser] = useState(user?.username || 'Owner');

  // Warning confirmation modal state before granting anything
  const [pendingGrant, setPendingGrant] = useState(null);

  // Game EXP tool state
  const [gameExpSearch, setGameExpSearch] = useState('');

  // Daily EXP Tracker state
  const [dailyExpDate, setDailyExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyExpSearch, setDailyExpSearch] = useState('');

  const [customLevel, setCustomLevel] = useState('');
  const [customExp, setCustomExp] = useState('');
  const [isGranting, setIsGranting] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState([
    { id: '1', text: 'Classroom 9X Owner Terminal initialized. Type /help for available admin commands.', type: 'info', time: new Date().toLocaleTimeString() }
  ]);

  // Check if owner
  const isOwner = isPlatformOwner(user, firebaseUser) || 
                  (user?.redeemedCodes || []).some(c => c.toUpperCase() === 'OWNER3413');

  // Realtime listeners for Reports, Users, Announcements, and Deleted Emails
  useEffect(() => {
    if (!isOwner) return;

    // Reports
    const unsubReports = onSnapshot(collection(db, 'reports'), (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setReports(items);
      setIsLoading(false);
    }, (err) => {
      console.warn('Reports listener error:', err);
      setIsLoading(false);
    });

    // Users
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsersList(items);
    }, (err) => {
      console.warn('Users listener error:', err);
    });

    // Announcements
    const unsubAnn = onSnapshot(collection(db, 'announcements'), (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setAnnouncements(items);
    }, (err) => {
      console.warn('Announcements listener error:', err);
    });

    // Deleted Emails (Background blacklist)
    const unsubBlacklist = onSnapshot(collection(db, 'deleted_emails'), (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      items.sort((a, b) => new Date(b.deletedAt || 0) - new Date(a.deletedAt || 0));
      setBlacklist(items);
    }, (err) => {
      console.warn('Blacklist listener error:', err);
    });

    // Suggestions (Community Suggestions)
    const unsubSuggestions = onSnapshot(collection(db, 'suggestions'), (snap) => {
      const items = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          upvoters: data.upvoters || data.voters || [],
          downvoters: data.downvoters || [],
          createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.createdAt || Date.now())
        };
      });
      items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setSuggestions(items);
    }, (err) => {
      console.warn('Suggestions listener error:', err);
    });

    // Global Settings Listener for lockedGames & countOwnerOnLeaderboard
    const unsubGlobal = onSnapshot(doc(db, 'settings', 'global'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setLockedGames(data.lockedGames || {});
        if (data.countOwnerOnLeaderboard !== undefined) {
          setLocalCountOwner(data.countOwnerOnLeaderboard === true);
        }
      }
    }, (err) => {
      console.warn('Global settings snapshot error:', err);
    });

    return () => {
      unsubReports();
      unsubUsers();
      unsubAnn();
      unsubBlacklist();
      unsubSuggestions();
      unsubGlobal();
    };
  }, [isOwner]);

  const addTerminalLog = (text, type = 'info') => {
    setTerminalLogs(prev => [
      { id: Math.random().toString(), text, type, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 49)
    ]);
  };

  const resolveTarget = (usernameOrUid) => {
    const trimmed = (usernameOrUid || '').trim().replace(/^@/, '').toLowerCase();
    if (!trimmed || trimmed === 'self' || trimmed === 'me' || (user?.username && trimmed === user.username.toLowerCase())) {
      return usersList.find(u => u.uid === user?.uid) || user;
    }
    return usersList.find(u => 
      (u.username || '').toLowerCase() === trimmed || 
      (u.email || '').toLowerCase() === trimmed || 
      (u.uid || '').toLowerCase() === trimmed
    ) || null;
  };

  const requestConfirmGrant = (title, targetUser, description, actionFn) => {
    if (!targetUser) {
      if (addNotification) addNotification('PLAYER NOT FOUND', 'Please enter a valid player username first.', 'error');
      return;
    }
    setPendingGrant({
      title,
      targetUser,
      description,
      onConfirm: actionFn
    });
  };

  // 1. Tool to give levels / set level
  const handleSetUserLevel = async (targetUid, newLvl) => {
    const lvl = Math.min(Math.max(1, parseInt(newLvl) || 1), 999);
    const target = usersList.find(u => u.uid === targetUid) || (targetUid === user?.uid ? user : null);
    const targetName = target?.username || targetUid;
    const baseLvlExp = ((lvl - 1) * lvl / 2) * 200;

    setIsGranting(true);
    try {
      await setDoc(doc(db, 'users', targetUid), {
        level: lvl,
        exp: 0,
        totalExp: baseLvlExp,
        score: baseLvlExp
      }, { merge: true });

      if (targetUid === user?.uid && onUpdateUser) {
        onUpdateUser(prev => ({
          ...prev,
          level: lvl,
          exp: 0,
          totalExp: baseLvlExp,
          score: baseLvlExp
        }));
      }

      addTerminalLog(`[SUCCESS] Level set to ${lvl} for player @${targetName} (Total EXP: ${baseLvlExp.toLocaleString()}).`, 'success');
      if (addNotification) {
        addNotification('LEVEL GRANTED', `Player @${targetName} is now Level ${lvl}!`, 'success');
      }
    } catch (err) {
      console.error('Error setting level:', err);
      addTerminalLog(`[ERROR] Failed to set level: ${err.message}`, 'error');
    } finally {
      setIsGranting(false);
    }
  };

  const handleAddUserLevels = (targetUid, delta) => {
    const target = usersList.find(u => u.uid === targetUid) || (targetUid === user?.uid ? user : null);
    const current = target?.level || 1;
    handleSetUserLevel(targetUid, current + delta);
  };

  // 2. Tool to grant EXP
  const handleGiveUserExp = async (targetUid, amount) => {
    const target = usersList.find(u => u.uid === targetUid) || (targetUid === user?.uid ? user : null);
    const targetName = target?.username || targetUid;
    const currentExp = target?.exp || 0;
    const currentTotal = target?.totalExp || 0;
    const currentScore = target?.score || 0;
    const added = parseInt(amount) || 0;
    const newTotal = currentTotal + added;
    const newScore = currentScore + added;

    setIsGranting(true);
    try {
      await setDoc(doc(db, 'users', targetUid), {
        exp: currentExp + added,
        totalExp: newTotal,
        score: newScore
      }, { merge: true });

      if (targetUid === user?.uid && onUpdateUser) {
        onUpdateUser(prev => ({
          ...prev,
          exp: currentExp + added,
          totalExp: newTotal,
          score: newScore
        }));
      }

      addTerminalLog(`[SUCCESS] Granted +${added.toLocaleString()} EXP to @${targetName}.`, 'success');
      if (addNotification) {
        addNotification('EXP GRANTED', `+${added.toLocaleString()} EXP granted to @${targetName}`, 'success');
      }
    } catch (err) {
      console.error('Error granting EXP:', err);
      addTerminalLog(`[ERROR] Failed to grant EXP: ${err.message}`, 'error');
    } finally {
      setIsGranting(false);
    }
  };

  // 3. Command line parser (Require player username)
  const handleExecuteCli = (cmdString) => {
    const trimmed = (cmdString || '').trim();
    if (!trimmed) return;
    addTerminalLog(`> ${trimmed}`, 'command');
    setCommandInput('');

    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();
    const arg1 = parts[1];
    const arg2 = parts[2];

    switch (command) {
      case '/help':
        addTerminalLog('AVAILABLE ADMIN COMMANDS (Require player username):', 'info');
        addTerminalLog('  /setlevel <username> <level>  - Set exact player level (1-999)', 'info');
        addTerminalLog('  /givelevels <username> <amt>  - Add levels to player', 'info');
        addTerminalLog('  /giveexp <username> <amt>     - Add EXP/Score to player', 'info');
        addTerminalLog('  /clear                        - Clear terminal log', 'info');
        break;

      case '/clear':
        setTerminalLogs([]);
        break;

      case '/setlevel': {
        if (!arg1 || arg1 === '<username>' || !arg2) {
          addTerminalLog('Usage: /setlevel <username> <level>', 'error');
          return;
        }
        const target = resolveTarget(arg1);
        if (!target) {
          addTerminalLog(`Player @${arg1} not found.`, 'error');
          return;
        }
        const lvl = parseInt(arg2);
        if (isNaN(lvl)) {
          addTerminalLog('Invalid level number provided.', 'error');
          return;
        }
        handleSetUserLevel(target.uid, lvl);
        break;
      }

      case '/givelevels': {
        if (!arg1 || arg1 === '<username>' || !arg2) {
          addTerminalLog('Usage: /givelevels <username> <amount>', 'error');
          return;
        }
        const target = resolveTarget(arg1);
        if (!target) {
          addTerminalLog(`Player @${arg1} not found.`, 'error');
          return;
        }
        const amt = parseInt(arg2);
        if (isNaN(amt)) {
          addTerminalLog('Invalid level increment number.', 'error');
          return;
        }
        handleAddUserLevels(target.uid, amt);
        break;
      }

      case '/giveexp': {
        if (!arg1 || arg1 === '<username>' || !arg2) {
          addTerminalLog('Usage: /giveexp <username> <amount>', 'error');
          return;
        }
        const target = resolveTarget(arg1);
        if (!target) {
          addTerminalLog(`Player @${arg1} not found.`, 'error');
          return;
        }
        const amt = parseInt(arg2);
        if (isNaN(amt)) {
          addTerminalLog('Invalid EXP amount.', 'error');
          return;
        }
        handleGiveUserExp(target.uid, amt);
        break;
      }

      default:
        addTerminalLog(`Unknown command "${command}". Type /help to see available commands.`, 'error');
        break;
    }
  };

  // Handle game lock / broken status toggle
  const handleToggleGameBroken = async (gameId, currentBroken, currentLocked, customReason) => {
    setIsUpdatingGame(true);
    try {
      const newBroken = !currentBroken;
      // When marking as broken, also lock the game by default so players cannot launch it
      const newLocked = newBroken ? true : currentLocked;
      const existingInfo = lockedGames[gameId] || {};
      const updatedMap = {
        ...lockedGames,
        [gameId]: {
          ...existingInfo,
          isBroken: newBroken,
          isLocked: newLocked,
          reason: customReason !== undefined ? customReason : (existingInfo.reason || (newBroken ? 'Reported broken - temporarily under maintenance' : '')),
          updatedAt: new Date().toISOString(),
          updatedBy: user?.username || 'Owner'
        }
      };
      if (!newBroken && !newLocked) {
        delete updatedMap[gameId];
      }
      await setDoc(doc(db, 'settings', 'global'), {
        lockedGames: updatedMap
      }, { merge: true });

      if (addNotification) {
        addNotification(
          newBroken ? 'GAME MARKED BROKEN' : 'GAME OPERATIONAL',
          `${gameId} is now ${newBroken ? 'marked broken & temporarily locked' : 'marked working and unlocked'}.`,
          newBroken ? 'warning' : 'success'
        );
      }
    } catch (err) {
      console.error('Failed to update broken status:', err);
      if (addNotification) addNotification('UPDATE FAILED', 'Could not update game state in database.', 'error');
    } finally {
      setIsUpdatingGame(false);
    }
  };

  const handleToggleGameLock = async (gameId, currentLocked, currentBroken, customReason) => {
    setIsUpdatingGame(true);
    try {
      const newLocked = !currentLocked;
      const existingInfo = lockedGames[gameId] || {};
      const updatedMap = {
        ...lockedGames,
        [gameId]: {
          ...existingInfo,
          isBroken: Boolean(currentBroken),
          isLocked: newLocked,
          reason: customReason !== undefined ? customReason : (existingInfo.reason || (newLocked ? 'Temporarily locked by owner for maintenance' : '')),
          updatedAt: new Date().toISOString(),
          updatedBy: user?.username || 'Owner'
        }
      };
      if (!newLocked && !currentBroken) {
        delete updatedMap[gameId];
      }
      await setDoc(doc(db, 'settings', 'global'), {
        lockedGames: updatedMap
      }, { merge: true });

      if (addNotification) {
        addNotification(
          newLocked ? 'GAME LOCKED' : 'GAME UNLOCKED',
          `Game is now ${newLocked ? 'temporarily locked to players' : 'unlocked and operational'}.`,
          newLocked ? 'warning' : 'success'
        );
      }
    } catch (err) {
      console.error('Failed to update game lock:', err);
      if (addNotification) addNotification('UPDATE FAILED', 'Could not update game lock in database.', 'error');
    } finally {
      setIsUpdatingGame(false);
    }
  };

  const handleSaveGameReason = async (gameId, newReason) => {
    setIsUpdatingGame(true);
    try {
      const existingInfo = lockedGames[gameId] || { isLocked: true, isBroken: false };
      const updatedMap = {
        ...lockedGames,
        [gameId]: {
          ...existingInfo,
          reason: newReason.trim(),
          updatedAt: new Date().toISOString(),
          updatedBy: user?.username || 'Owner'
        }
      };
      await setDoc(doc(db, 'settings', 'global'), {
        lockedGames: updatedMap
      }, { merge: true });

      if (addNotification) {
        addNotification('REASON SAVED', 'Maintenance notice updated for players.', 'success');
      }
      setEditingGameReason(null);
    } catch (err) {
      console.error('Failed to save reason:', err);
      if (addNotification) addNotification('UPDATE FAILED', 'Could not update reason in database.', 'error');
    } finally {
      setIsUpdatingGame(false);
    }
  };

  const handleUnlockAllGames = async () => {
    if (!window.confirm('Are you sure you want to unlock all games and clear all maintenance locks?')) return;
    setIsUpdatingGame(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), {
        lockedGames: {}
      }, { merge: true });
      if (addNotification) {
        addNotification('ALL GAMES UNLOCKED', 'All titles are now operational and unlocked.', 'success');
      }
    } catch (err) {
      console.error('Failed to unlock all games:', err);
    } finally {
      setIsUpdatingGame(false);
    }
  };

  if (!isOwner) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 text-white">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(244,63,94,0.3)]">
          <ShieldAlert size={40} />
        </div>
        <h2 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tight text-white mb-3">
          ACCESS RESTRICTED
        </h2>
        <p className="text-white/40 text-xs sm:text-sm font-medium uppercase tracking-widest max-w-md mb-8">
          This control center is strictly reserved for the site owner. Unauthorized access is logged and denied.
        </p>
        <button
          onClick={() => onNavigate(AppRoute.HOME)}
          className="px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-widest transition-all cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Filter reports
  const gameReports = reports.filter(r => r.type === 'game_broken');
  const accountReports = reports.filter(r => r.type === 'account_reported');
  const pendingGameReports = gameReports.filter(r => r.status === 'pending');
  const pendingAccountReports = accountReports.filter(r => r.status === 'pending');

  // Handle report status change
  const handleUpdateReportStatus = async (reportId, newStatus) => {
    try {
      await updateDoc(doc(db, 'reports', reportId), {
        status: newStatus,
        resolvedAt: new Date().toISOString()
      });
      if (addNotification) {
        addNotification('REPORT UPDATED', `Marked as ${newStatus.toUpperCase()}`, 'success');
      }
    } catch (err) {
      console.error('Failed to update report:', err);
      if (addNotification) {
        addNotification('ERROR', 'Failed to update report status', 'error');
      }
    }
  };

  // Handle report deletion
  const handleDeleteReport = async (reportId) => {
    try {
      await deleteDoc(doc(db, 'reports', reportId));
      if (addNotification) {
        addNotification('REPORT REMOVED', 'Report dismissed from registry', 'info');
      }
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  // Publish Global Announcement
  const handleBroadcastAnnouncement = async (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastText.trim()) {
      if (addNotification) addNotification('MISSING FIELDS', 'Please provide a title and announcement body.', 'error');
      return;
    }

    setIsBroadcasting(true);
    try {
      const announcementData = {
        title: broadcastTitle.trim(),
        text: broadcastText.trim(),
        message: broadcastText.trim(),
        type: broadcastType,
        senderUid: firebaseUser?.uid || user?.uid || 'owner',
        senderName: user?.username || 'Site Owner',
        senderEmail: firebaseUser?.email || 'softball_chik_007@yahoo.com',
        isPopup: enable10sOverlay,
        broadcastAt: Date.now(),
        createdAt: new Date().toISOString(),
        timestamp: serverTimestamp()
      };

      await addDoc(collection(db, 'announcements'), announcementData);

      if (addNotification) {
        addNotification(
          'BROADCAST LIVE',
          enable10sOverlay ? 'Global 10s announcement sent to everyone!' : 'Announcement published to Notifications feed.',
          'success'
        );
      }

      setBroadcastTitle('');
      setBroadcastText('');
    } catch (err) {
      console.error('Broadcast failed:', err);
      if (addNotification) {
        addNotification('ERROR', 'Failed to publish announcement.', 'error');
      }
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Delete Announcement
  const handleDeleteAnnouncement = async (id) => {
    try {
      await deleteDoc(doc(db, 'announcements', id));
      if (addNotification) {
        addNotification('ANNOUNCEMENT REMOVED', 'Deleted from community feed', 'info');
      }
    } catch (err) {
      console.error('Failed to delete announcement:', err);
    }
  };

  // Handle suggestion status update (approve / implement)
  const handleUpdateSuggestionStatus = async (suggestionId, newStatus) => {
    try {
      await updateDoc(doc(db, 'suggestions', suggestionId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      if (addNotification) {
        addNotification('SUGGESTION UPDATED', `Marked as ${newStatus.toUpperCase()}`, 'success');
      }
    } catch (err) {
      console.error('Failed to update suggestion:', err);
      if (addNotification) addNotification('ERROR', 'Failed to update suggestion status', 'error');
    }
  };

  // Handle suggestion deletion
  const handleDeleteSuggestion = async (suggestionId) => {
    try {
      await deleteDoc(doc(db, 'suggestions', suggestionId));
      if (addNotification) {
        addNotification('SUGGESTION DISMISSED', 'Removed from suggestions registry', 'info');
      }
    } catch (err) {
      console.error('Failed to delete suggestion:', err);
    }
  };

  // Quick broadcast based on suggestion
  const handleBroadcastSuggestion = (sug) => {
    setBroadcastTitle(`NEW FEATURE: Community Suggestion Implemented!`);
    setBroadcastText(`We just added your community suggestion: "${sug.text}". Shoutout to @${sug.authorName || 'community member'}!`);
    setEnable10sOverlay(true);
    setActiveTab('broadcast');
    if (addNotification) {
      addNotification('COMPOSER READY', 'Suggestion details loaded into 10s broadcast form', 'info');
    }
  };

  // Execute Owner-Only Soft Delete on Account
  const handleConfirmDeleteAccount = async () => {
    if (!deleteTargetUser) return;
    setIsDeleting(true);

    try {
      const targetUid = deleteTargetUser.id || deleteTargetUser.uid;
      const targetEmail = (deleteTargetUser.email || '').toLowerCase();
      const targetUsername = deleteTargetUser.username || 'Unknown';

      // 1. Update user document in Firestore to disappear from public view
      // Keeping document with isDeleted: true in the background
      await updateDoc(doc(db, 'users', targetUid), {
        isDeleted: true,
        isBanned: true,
        deletedAt: new Date().toISOString(),
        deletedBy: 'owner',
        deletionReason: deleteReason,
        username: '[Deleted User]',
        exp: 0,
        score: 0,
        customAvatar: null,
        level: 1
      });

      // 2. Add email to deleted_emails registry to permanently prevent recreation
      if (targetEmail) {
        await setDoc(doc(db, 'deleted_emails', targetEmail), {
          email: targetEmail,
          originalUid: targetUid,
          originalUsername: targetUsername,
          deletedAt: new Date().toISOString(),
          reason: deleteReason,
          terminatedBy: 'owner'
        });
      }

      // 3. Mark any associated reports as resolved
      const relatedReports = reports.filter(r => r.targetId === targetUid || r.targetName === targetUsername);
      for (const rep of relatedReports) {
        await updateDoc(doc(db, 'reports', rep.id), {
          status: 'resolved',
          resolutionNote: 'Account terminated by owner',
          resolvedAt: new Date().toISOString()
        });
      }

      if (addNotification) {
        addNotification(
          'ACCOUNT TERMINATED',
          `@${targetUsername} has been removed. Email (${targetEmail || 'N/A'}) is permanently blocked from re-registering.`,
          'success'
        );
      }

      setDeleteTargetUser(null);
    } catch (err) {
      console.error('Account deletion failed:', err);
      if (addNotification) {
        addNotification('DELETION ERROR', 'Failed to delete account. Check Firestore permissions.', 'error');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Restore / Unblock Email from background blacklist
  const handleUnblockEmail = async (emailKey) => {
    try {
      await deleteDoc(doc(db, 'deleted_emails', emailKey));
      if (addNotification) {
        addNotification('EMAIL UNBLOCKED', `${emailKey} can now register again.`, 'info');
      }
    } catch (err) {
      console.error('Unblock failed:', err);
    }
  };

  // Filtered active users for user management tab
  const filteredUsers = usersList.filter(u => {
    const isTerminated = u.isDeleted || u.isBanned;
    const matchesSearch = (u.username || '').toLowerCase().includes(searchUserQuery.toLowerCase()) ||
                          (u.email || '').toLowerCase().includes(searchUserQuery.toLowerCase());
    return matchesSearch && !isTerminated;
  });

  return (
    <div className="w-full min-h-screen py-8 pb-32 text-white max-w-7xl mx-auto px-4 sm:px-6">
      {/* Top Header Banner */}
      <div className="p-8 sm:p-10 rounded-[3rem] bg-gradient-to-br from-[#1c1306] via-[#100b02] to-black border-2 border-amber-500/40 shadow-[0_20px_70px_rgba(245,158,11,0.2)] mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-widest mb-4">
              <Crown size={14} className="text-amber-400 fill-amber-400" />
              <span>OWNER CONTROL CENTER</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter text-white leading-tight mb-2">
              SITE OWNER PORTAL
            </h1>
            <p className="text-white/60 text-xs sm:text-sm font-medium uppercase tracking-widest max-w-xl">
              Live reports moderation, global 10-second announcements, and owner-only account termination protocols.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-5 py-3.5 rounded-2xl bg-black/60 border border-rose-500/30 text-center">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block">LOCKED / BROKEN</span>
              <span className={`text-2xl font-black italic ${Object.values(lockedGames).filter(g => g.isLocked || g.isBroken).length > 0 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
                {Object.values(lockedGames).filter(g => g.isLocked || g.isBroken).length}
              </span>
            </div>
            <div className="px-5 py-3.5 rounded-2xl bg-black/60 border border-amber-500/30 text-center">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block">BROKEN REPORTS</span>
              <span className={`text-2xl font-black italic ${pendingGameReports.length > 0 ? 'text-amber-400 animate-pulse' : 'text-white'}`}>
                {pendingGameReports.length}
              </span>
            </div>
            <div className="px-5 py-3.5 rounded-2xl bg-black/60 border border-purple-500/30 text-center">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block">ACCOUNT REPORTS</span>
              <span className={`text-2xl font-black italic ${pendingAccountReports.length > 0 ? 'text-purple-400 animate-pulse' : 'text-white'}`}>
                {pendingAccountReports.length}
              </span>
            </div>
            <div className="px-5 py-3.5 rounded-2xl bg-black/60 border border-yellow-500/30 text-center">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block">SUGGESTIONS</span>
              <span className={`text-2xl font-black italic ${suggestions.filter(s => s.status === 'pending').length > 0 ? 'text-yellow-400 animate-pulse' : 'text-white'}`}>
                {suggestions.filter(s => s.status === 'pending').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* OWNER LEADERBOARD TOGGLE CARD */}
      <div className="mb-8 p-6 sm:p-7 rounded-[2.5rem] bg-gradient-to-r from-[#0c1222] via-[#090d1a] to-black border-2 border-blue-500/30 shadow-[0_15px_50px_rgba(30,58,138,0.25)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 backdrop-blur-2xl relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
            localCountOwner 
              ? 'bg-amber-500/20 border-amber-400/60 text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.4)]' 
              : 'bg-white/5 border-white/10 text-white/40'
          }`}>
            <Trophy size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-black uppercase italic tracking-tight text-white">
                Count Owner Account on Leaderboard
              </h2>
              <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                localCountOwner 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
              }`}>
                {localCountOwner ? 'TOGGLED ON: COUNTED IN RANKINGS' : 'NOT TOGGLED: EXCLUDED (2ND RANKS TO 1ST)'}
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1 max-w-2xl leading-relaxed">
              {localCountOwner 
                ? 'Your owner account is currently counted on the global leaderboard rankings.' 
                : 'Your owner account will NOT show on the leaderboard. Whoever is placed 2nd right now automatically ranks up to 1st place!'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <button
            onClick={handleToggleLeaderboard}
            className={`relative inline-flex h-9 w-18 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
              localCountOwner ? 'bg-amber-500 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]' : 'bg-zinc-800 border-zinc-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-xl ring-0 transition duration-200 ease-in-out translate-y-0.5 ${
                localCountOwner ? 'translate-x-9' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-3 mb-8 border-b border-white/10 pb-4">
        {[
          { 
            id: 'admin_tools', 
            label: 'Admin Tools & Grants', 
            icon: Terminal, 
            badge: 'COMMANDS',
            badgeColor: 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]'
          },
          { 
            id: 'game_exp', 
            label: 'Game EXP Inspector', 
            icon: Zap, 
            badge: 'TOOL',
            badgeColor: 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]'
          },
          { 
            id: 'daily_exp', 
            label: 'Daily EXP Tracker', 
            icon: Calendar, 
            badge: 'PANEL',
            badgeColor: 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]'
          },
          { 
            id: 'reports', 
            label: 'Reports & Alerts', 
            icon: ShieldAlert, 
            badge: (pendingGameReports.length + pendingAccountReports.length) > 0 ? (pendingGameReports.length + pendingAccountReports.length) : null,
            badgeColor: 'bg-rose-500'
          },
          { 
            id: 'games', 
            label: 'Game Locks & Maintenance', 
            icon: Lock, 
            badge: Object.values(lockedGames).filter(g => g.isLocked || g.isBroken).length > 0 
              ? Object.values(lockedGames).filter(g => g.isLocked || g.isBroken).length 
              : null,
            badgeColor: 'bg-rose-500'
          },
          { 
            id: 'suggestions', 
            label: 'Community Suggestions', 
            icon: Lightbulb, 
            badge: suggestions.filter(s => s.status === 'pending').length > 0 ? suggestions.filter(s => s.status === 'pending').length : (suggestions.length > 0 ? suggestions.length : null),
            badgeColor: 'bg-yellow-500 text-black'
          },
          { id: 'broadcast', label: '10s Announcement Broadcaster', icon: Megaphone },
          { id: 'users', label: 'User Management & Termination', icon: Users },
          { 
            id: 'blacklist', 
            label: 'Background Blacklist', 
            icon: Ban, 
            badge: blacklist.length > 0 ? blacklist.length : null,
            badgeColor: 'bg-zinc-700'
          },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2.5 cursor-pointer border ${
                isActive
                  ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.4)]'
                  : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border-white/10'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${tab.badgeColor}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 0: ADMIN TOOLS (EACH TOOL HAS ITS OWN USERNAME BOX & CONFIRMATION WARNING) */}
      {activeTab === 'admin_tools' && (
        <div className="space-y-8">
          {/* TWO COLUMN GRID: LEVEL TOOL & EXP GRANTING */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* TOOL 1: LEVEL GRANTING TOOL */}
            <div className="p-6 sm:p-7 rounded-[2rem] bg-[#0c101c]/90 border border-blue-500/30 backdrop-blur-2xl shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40">
                  <Trophy size={20} />
                </div>
                <div>
                  <h4 className="text-base font-black uppercase italic tracking-tight text-white">
                    Level Granting Tool
                  </h4>
                  <p className="text-xs text-white/50">Give levels or set an exact target level (1-999).</p>
                </div>
              </div>

              {/* Tool Username Box */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-black/60 border border-blue-500/20">
                <div className="flex items-center gap-2 shrink-0">
                  <User size={13} className="text-blue-400" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-white/70">Target Username:</span>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={levelToolUser}
                    onChange={(e) => setLevelToolUser(e.target.value)}
                    placeholder="Enter username (e.g. VoidWalker or self)..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-black/70 border border-white/15 text-white text-xs font-bold uppercase tracking-wider placeholder:text-white/30 focus:outline-none focus:border-blue-500/60"
                  />
                  <button
                    type="button"
                    onClick={() => setLevelToolUser(user?.username || 'self')}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-[10px] font-black uppercase border border-white/10 cursor-pointer shrink-0"
                  >
                    Self
                  </button>
                </div>
              </div>

              {/* Quick Add Level Deltas */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-white/40 block">ADD LEVELS (+DELTA)</span>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 5, 10, 50, 100].map(amt => (
                    <button
                      key={amt}
                      onClick={() => {
                        const target = resolveTarget(levelToolUser);
                        if (!target) {
                          if (addNotification) addNotification('USER NOT FOUND', `Player "${levelToolUser}" not found.`, 'error');
                          return;
                        }
                        const curLvl = target.level || 1;
                        const nextLvl = Math.min(999, curLvl + amt);
                        requestConfirmGrant(
                          `ADD +${amt} LEVELS`,
                          target,
                          `Increase @${target.username}'s level from Level ${curLvl} to Level ${nextLvl}.`,
                          () => handleAddUserLevels(target.uid, amt)
                        );
                      }}
                      disabled={isGranting}
                      className="py-2.5 px-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 text-center"
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Preset Levels */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-white/40 block">SET PRESET LEVEL</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { lvl: 10, label: 'Lvl 10 (Terminal)' },
                    { lvl: 50, label: 'Lvl 50 (Obsidian)' },
                    { lvl: 100, label: 'Lvl 100 (Gold)' },
                    { lvl: 200, label: 'Lvl 200 (Quantum)' },
                    { lvl: 500, label: 'Lvl 500 (Demigod)' },
                    { lvl: 999, label: 'Lvl 999 (MAX)' }
                  ].map(preset => (
                    <button
                      key={preset.lvl}
                      onClick={() => {
                        const target = resolveTarget(levelToolUser);
                        if (!target) {
                          if (addNotification) addNotification('USER NOT FOUND', `Player "${levelToolUser}" not found.`, 'error');
                          return;
                        }
                        requestConfirmGrant(
                          `SET LEVEL TO ${preset.lvl}`,
                          target,
                          `Set @${target.username}'s level to ${preset.lvl} and recalculate total EXP base.`,
                          () => handleSetUserLevel(target.uid, preset.lvl)
                        );
                      }}
                      disabled={isGranting}
                      className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 text-center"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Level Input */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <span className="text-[10px] font-black uppercase tracking-wider text-white/40 block">SET CUSTOM EXACT LEVEL</span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={customLevel}
                    onChange={(e) => setCustomLevel(e.target.value)}
                    placeholder="Enter level (1 - 999)..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-bold uppercase tracking-wider placeholder:text-white/30 focus:outline-none focus:border-blue-500/60"
                  />
                  <button
                    onClick={() => {
                      if (!customLevel) return;
                      const target = resolveTarget(levelToolUser);
                      if (!target) {
                        if (addNotification) addNotification('USER NOT FOUND', `Player "${levelToolUser}" not found.`, 'error');
                        return;
                      }
                      const lvlNum = Math.min(999, Math.max(1, parseInt(customLevel) || 1));
                      requestConfirmGrant(
                        `SET LEVEL TO ${lvlNum}`,
                        target,
                        `Set @${target.username}'s exact level to ${lvlNum}.`,
                        () => {
                          handleSetUserLevel(target.uid, lvlNum);
                          setCustomLevel('');
                        }
                      );
                    }}
                    disabled={isGranting || !customLevel}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                  >
                    Set Level
                  </button>
                </div>
              </div>
            </div>

            {/* TOOL 2: EXP GRANTING TOOL */}
            <div className="p-6 sm:p-7 rounded-[2rem] bg-[#0c101c]/90 border border-purple-500/30 backdrop-blur-2xl shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="text-base font-black uppercase italic tracking-tight text-white">
                    EXP & Score Granting Tool
                  </h4>
                  <p className="text-xs text-white/50">Inject experience points directly into target account.</p>
                </div>
              </div>

              {/* Tool Username Box */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-black/60 border border-purple-500/20">
                <div className="flex items-center gap-2 shrink-0">
                  <User size={13} className="text-purple-400" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-white/70">Target Username:</span>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={expToolUser}
                    onChange={(e) => setExpToolUser(e.target.value)}
                    placeholder="Enter username (e.g. GlitchMaster or self)..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-black/70 border border-white/15 text-white text-xs font-bold uppercase tracking-wider placeholder:text-white/30 focus:outline-none focus:border-purple-500/60"
                  />
                  <button
                    type="button"
                    onClick={() => setExpToolUser(user?.username || 'self')}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-[10px] font-black uppercase border border-white/10 cursor-pointer shrink-0"
                  >
                    Self
                  </button>
                </div>
              </div>

              {/* Quick Add EXP Buttons */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-white/40 block">QUICK EXP PRESETS</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { amt: 10000, label: '+10,000 EXP' },
                    { amt: 50000, label: '+50,000 EXP' },
                    { amt: 100000, label: '+100,000 EXP' },
                    { amt: 500000, label: '+500,000 EXP' },
                    { amt: 1000000, label: '+1,000,000 EXP' },
                    { amt: 5000000, label: '+5,000,000 EXP' }
                  ].map(p => (
                    <button
                      key={p.amt}
                      onClick={() => {
                        const target = resolveTarget(expToolUser);
                        if (!target) {
                          if (addNotification) addNotification('USER NOT FOUND', `Player "${expToolUser}" not found.`, 'error');
                          return;
                        }
                        requestConfirmGrant(
                          `GRANT ${p.label}`,
                          target,
                          `Add ${p.amt.toLocaleString()} EXP points and score to @${target.username}'s account.`,
                          () => handleGiveUserExp(target.uid, p.amt)
                        );
                      }}
                      disabled={isGranting}
                      className="py-3 px-3 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 text-center"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom EXP Input */}
              <div className="space-y-2 pt-3 border-t border-white/10">
                <span className="text-[10px] font-black uppercase tracking-wider text-white/40 block">CUSTOM EXP AMOUNT</span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={customExp}
                    onChange={(e) => setCustomExp(e.target.value)}
                    placeholder="Enter EXP amount..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-bold uppercase tracking-wider placeholder:text-white/30 focus:outline-none focus:border-purple-500/60"
                  />
                  <button
                    onClick={() => {
                      if (!customExp) return;
                      const target = resolveTarget(expToolUser);
                      if (!target) {
                        if (addNotification) addNotification('USER NOT FOUND', `Player "${expToolUser}" not found.`, 'error');
                        return;
                      }
                      const amtNum = parseInt(customExp) || 0;
                      requestConfirmGrant(
                        `GRANT +${amtNum.toLocaleString()} EXP`,
                        target,
                        `Add +${amtNum.toLocaleString()} EXP points to @${target.username}.`,
                        () => {
                          handleGiveUserExp(target.uid, amtNum);
                          setCustomExp('');
                        }
                      );
                    }}
                    disabled={isGranting || !customExp}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                  >
                    Grant EXP
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* SECTION: INTERACTIVE ADMIN COMMAND CONSOLE (CLI WITH TARGET USER REQUIRED) */}
          <div className="p-6 sm:p-8 rounded-[2.5rem] bg-[#070913] border-2 border-emerald-500/30 backdrop-blur-2xl shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <Terminal size={18} className="text-emerald-400" />
                <span className="text-sm font-black uppercase tracking-wider text-emerald-400">
                  OWNER ADMIN COMMAND TERMINAL
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] text-white/50">LIVE SYSTEM LINK</span>
              </div>
            </div>

            {/* Quick Command Chips requiring user parameter */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-white/50 uppercase font-sans font-bold">Preset Commands (Requires & Targets User):</span>
                <span className="text-[9px] text-emerald-400 font-sans">Click to fill terminal</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { cmd: `/setlevel ${levelToolUser || '<username>'} 999`, label: `/setlevel <user> 999` },
                  { cmd: `/givelevels ${levelToolUser || '<username>'} 50`, label: `/givelevels <user> 50` },
                  { cmd: `/giveexp ${expToolUser || '<username>'} 1000000`, label: `/giveexp <user> 1M` },
                  { cmd: '/help', label: '/help' },
                  { cmd: '/clear', label: '/clear' }
                ].map(item => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setCommandInput(item.cmd)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/40 text-emerald-300 text-[10px] transition-all cursor-pointer font-mono"
                    title={`Click to load "${item.cmd}" into command bar`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Terminal Log Screen */}
            <div className="h-64 rounded-2xl bg-black/80 border border-white/10 p-4 overflow-y-auto space-y-1.5 text-xs text-white/80">
              {terminalLogs.map(log => (
                <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-white/30 shrink-0">[{log.time}]</span>
                  <span className={`break-all ${
                    log.type === 'command' ? 'text-amber-400 font-bold' :
                    log.type === 'success' ? 'text-emerald-400 font-bold' :
                    log.type === 'error' ? 'text-rose-400 font-bold' :
                    'text-cyan-300'
                  }`}>
                    {log.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Terminal Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExecuteCli(commandInput);
              }}
              className="flex gap-2"
            >
              <div className="flex-1 relative flex items-center">
                <span className="absolute left-4 text-emerald-400 font-bold">&gt;</span>
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  placeholder="Type an admin command (e.g. /setlevel NeonSpecter 999 or /help)..."
                  className="w-full pl-9 pr-4 py-3 rounded-xl bg-black/60 border border-white/15 text-emerald-300 text-xs font-mono placeholder:text-white/20 focus:outline-none focus:border-emerald-400/60"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0"
              >
                Execute
              </button>
            </form>
          </div>

        </div>
      )}

      {/* TAB: GAME EXP INSPECTOR (SEE HOW MUCH EXP EACH GAME GIVES) */}
      {activeTab === 'game_exp' && (
        <div className="space-y-6">
          <div className="p-8 rounded-[2.5rem] bg-gradient-to-r from-amber-500/15 via-[#0e1322] to-black border-2 border-amber-500/30 backdrop-blur-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider mb-2">
                <Zap size={12} />
                <span>EXP REWARD SPECIFICATIONS</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tight text-white">
                Game EXP Inspector Tool
              </h3>
              <p className="text-xs text-white/60 max-w-2xl mt-1">
                View real-time EXP grant formulas, play bonus multipliers, and calculate exactly how much experience players earn across every title.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="px-5 py-3 rounded-2xl bg-black/60 border border-amber-400/30 text-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-300 block">STANDARD PLAY</span>
                <span className="text-xl font-black italic text-white">+120 - 180 EXP</span>
              </div>
              <div className="px-5 py-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-orange-400/40 text-center shadow-lg">
                <span className="text-[9px] font-black uppercase tracking-widest text-orange-300 block">DAILY GAME (2X)</span>
                <span className="text-xl font-black italic text-amber-300">+240 - 360 EXP</span>
              </div>
            </div>
          </div>

          {/* Search Filter */}
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={gameExpSearch}
              onChange={(e) => setGameExpSearch(e.target.value)}
              placeholder="Search game titles or categories to inspect EXP rates..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#0b0e18] border border-white/10 text-white text-xs font-bold uppercase tracking-wider placeholder:text-white/30 focus:outline-none focus:border-amber-400/60"
            />
          </div>

          {/* Games EXP Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(gamesData || GAMES_DATA)
              .filter(g => {
                const q = gameExpSearch.toLowerCase();
                return (g.title || '').toLowerCase().includes(q) || (g.category || '').toLowerCase().includes(q);
              })
              .map(game => {
                const isDaily = dailyGame && (game.id === dailyGame.id || game.title === dailyGame.name || game.title === dailyGame.title);
                const baseMin = isDaily ? 240 : 120;
                const baseMax = isDaily ? 360 : 180;
                const tenPlaysMin = baseMin * 10;
                const tenPlaysMax = baseMax * 10;
                const hundredPlaysMin = baseMin * 100;
                const hundredPlaysMax = baseMax * 100;

                return (
                  <div
                    key={game.id}
                    className={`p-5 rounded-3xl bg-[#0c101c]/90 border backdrop-blur-xl shadow-xl flex flex-col justify-between transition-all duration-300 ${
                      isDaily
                        ? 'border-amber-400/60 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-start gap-3.5 mb-3.5">
                        <img
                          src={game.thumbnail || game.image}
                          alt={game.title}
                          className="w-14 h-14 rounded-2xl object-cover border border-white/10 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase text-white/70">
                              {game.category || 'ACTION'}
                            </span>
                            {isDaily && (
                              <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[9px] font-black uppercase flex items-center gap-1 shadow-sm">
                                <Flame size={10} className="text-amber-400" />
                                <span>2X DAILY GAME</span>
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-black uppercase italic tracking-tight text-white truncate">
                            {game.title}
                          </h4>
                        </div>
                      </div>

                      {/* EXP Breakdown Cards */}
                      <div className="space-y-2 pt-2 border-t border-white/10">
                        <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-black/40 border border-white/5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-white/50">EXP Per Single Play:</span>
                          <span className={`font-black ${isDaily ? 'text-amber-300' : 'text-cyan-300'}`}>
                            +{baseMin} - {baseMax} EXP {isDaily && '(2X Boosted)'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="p-2 rounded-xl bg-black/30 border border-white/5">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 block">10 Plays Yield</span>
                            <span className="text-xs font-black text-white">{tenPlaysMin.toLocaleString()} - {tenPlaysMax.toLocaleString()} EXP</span>
                          </div>
                          <div className="p-2 rounded-xl bg-black/30 border border-white/5">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 block">100 Plays Yield</span>
                            <span className="text-xs font-black text-white">{hundredPlaysMin.toLocaleString()} - {hundredPlaysMax.toLocaleString()} EXP</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[9px] font-mono text-white/30 truncate max-w-[150px]">
                        ID: {game.id}
                      </span>
                      <button
                        onClick={() => (onPlayGame || onTestGame)(game)}
                        className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <ExternalLink size={11} />
                        <span>Launch & Test</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB: DAILY EXP TRACKER (SHOWS HOW MUCH EXP EACH PERSON MADE A DAY) */}
      {activeTab === 'daily_exp' && (
        <div className="space-y-6">
          <div className="p-8 rounded-[2.5rem] bg-gradient-to-r from-purple-500/15 via-[#0e1322] to-black border-2 border-purple-500/30 backdrop-blur-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black uppercase tracking-wider mb-2">
                <Calendar size={12} />
                <span>DAILY PERFORMANCE AUDIT</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tight text-white">
                Daily EXP Tracker Panel
              </h3>
              <p className="text-xs text-white/60 max-w-2xl mt-1">
                Inspect how much experience points each player accumulated on any calendar day.
              </p>
            </div>

            {/* Date Selector Row */}
            <div className="flex flex-wrap items-center gap-2.5 bg-black/60 p-2.5 rounded-2xl border border-white/10">
              <span className="text-[10px] font-black uppercase tracking-wider text-white/50 pl-1">Date:</span>
              <input
                type="date"
                value={dailyExpDate}
                onChange={(e) => setDailyExpDate(e.target.value)}
                className="bg-black/80 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-purple-400"
              />
              <button
                onClick={() => setDailyExpDate(new Date().toISOString().split('T')[0])}
                className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Today
              </button>
            </div>
          </div>

          {/* Metrics for Selected Date */}
          {(() => {
            let totalDateExp = 0;
            let totalDateGames = 0;
            let activeCount = 0;
            let topEarner = null;
            let topEarnerExp = 0;

            usersList.forEach(u => {
              if (u.isDeleted) return;
              const expToday = u.dailyExp?.[dailyExpDate] || 0;
              const gamesToday = u.dailyGames?.[dailyExpDate] || 0;
              totalDateExp += expToday;
              totalDateGames += gamesToday;
              if (expToday > 0 || gamesToday > 0) {
                activeCount++;
                if (expToday > topEarnerExp) {
                  topEarnerExp = expToday;
                  topEarner = u;
                }
              }
            });

            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[#0c101c] border border-white/10">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block">TOTAL EXP EARNED ({dailyExpDate})</span>
                  <span className="text-2xl font-black italic text-purple-400 mt-1 block">
                    {totalDateExp.toLocaleString()} EXP
                  </span>
                </div>
                <div className="p-5 rounded-2xl bg-[#0c101c] border border-white/10">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block">TOTAL GAMES PLAYED</span>
                  <span className="text-2xl font-black italic text-cyan-400 mt-1 block">
                    {totalDateGames.toLocaleString()} Plays
                  </span>
                </div>
                <div className="p-5 rounded-2xl bg-[#0c101c] border border-white/10">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block">ACTIVE PLAYERS</span>
                  <span className="text-2xl font-black italic text-emerald-400 mt-1 block">
                    {activeCount} Users
                  </span>
                </div>
                <div className="p-5 rounded-2xl bg-[#0c101c] border border-white/10">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block">TOP EARNER</span>
                  <span className="text-lg font-black italic text-amber-300 mt-1 block truncate">
                    {topEarner ? `@${topEarner.username} (+${topEarnerExp.toLocaleString()})` : 'None yet'}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* User Filter Search */}
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={dailyExpSearch}
              onChange={(e) => setDailyExpSearch(e.target.value)}
              placeholder="Search player username to view their daily EXP..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#0b0e18] border border-white/10 text-white text-xs font-bold uppercase tracking-wider placeholder:text-white/30 focus:outline-none focus:border-purple-400/60"
            />
          </div>

          {/* Daily EXP Table */}
          <div className="rounded-[2.5rem] bg-[#0c101c] border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/5 flex items-center justify-between text-xs font-black uppercase tracking-wider text-white/50">
              <span>Player Profile</span>
              <div className="flex items-center gap-12 sm:gap-16">
                <span className="text-right">EXP on {dailyExpDate}</span>
                <span className="hidden sm:inline text-right">Lifetime EXP</span>
                <span>Actions</span>
              </div>
            </div>

            <div className="divide-y divide-white/5">
              {usersList
                .filter(u => {
                  if (u.isDeleted) return false;
                  const q = dailyExpSearch.toLowerCase();
                  return (u.username || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
                })
                .sort((a, b) => {
                  const aDateExp = a.dailyExp?.[dailyExpDate] || 0;
                  const bDateExp = b.dailyExp?.[dailyExpDate] || 0;
                  if (bDateExp !== aDateExp) return bDateExp - aDateExp;
                  return (b.totalExp || 0) - (a.totalExp || 0);
                })
                .map(player => {
                  const expToday = player.dailyExp?.[dailyExpDate] || 0;
                  const gamesToday = player.dailyGames?.[dailyExpDate] || 0;

                  return (
                    <div
                      key={player.uid}
                      className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white/70 font-black text-xs shrink-0 overflow-hidden">
                          {player.customAvatar ? (
                            <img src={player.customAvatar} alt={player.username} className="w-full h-full object-cover" />
                          ) : (
                            <span>{player.username ? player.username.charAt(0).toUpperCase() : 'U'}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black uppercase italic text-white truncate">
                              {player.username || 'Anonymous'}
                            </span>
                            {player.role === 'OWNER' && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[8px] font-black uppercase">
                                OWNER
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-white/40 block truncate">
                            Lvl {player.level || 1} • {gamesToday} games played on {dailyExpDate}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 sm:gap-12 shrink-0">
                        <div className="text-right">
                          <span className={`text-sm sm:text-base font-black italic block ${expToday > 0 ? 'text-purple-300' : 'text-white/40'}`}>
                            +{expToday.toLocaleString()} EXP
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-purple-400/80 block">
                            DAY YIELD
                          </span>
                        </div>

                        <div className="text-right hidden sm:block">
                          <span className="text-sm font-black text-white block">
                            {(player.totalExp || 0).toLocaleString()}
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-white/30 block">
                            LIFETIME
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            setLevelToolUser(player.username || player.uid);
                            setExpToolUser(player.username || player.uid);
                            setActiveTab('admin_tools');
                            if (addNotification) {
                              addNotification('TARGET SELECTED', `Loaded @${player.username} into Level and EXP Tools.`, 'info');
                            }
                          }}
                          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-purple-600/30 border border-white/10 hover:border-purple-500/40 text-white text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Target
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: REPORTS & ALERTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Sub Tab Switcher */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setReportSubTab('games')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                reportSubTab === 'games'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-white/5 text-white/50 hover:text-white'
              }`}
            >
              <Gamepad2 size={16} />
              <span>Broken Games ({gameReports.length})</span>
              {pendingGameReports.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>

            <button
              onClick={() => setReportSubTab('accounts')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                reportSubTab === 'accounts'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'bg-white/5 text-white/50 hover:text-white'
              }`}
            >
              <Users size={16} />
              <span>Reported Accounts ({accountReports.length})</span>
              {pendingAccountReports.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              )}
            </button>
          </div>

          {/* Sub Tab Content: Broken Games */}
          {reportSubTab === 'games' && (
            <div className="space-y-4">
              {gameReports.length === 0 ? (
                <div className="p-16 rounded-[2.5rem] bg-black/40 border border-white/10 text-center flex flex-col items-center justify-center">
                  <CheckCircle2 size={40} className="text-emerald-400 mb-3" />
                  <p className="text-lg font-black uppercase tracking-wider text-white">No Broken Game Reports</p>
                  <p className="text-xs text-white/40 uppercase tracking-widest mt-1">All titles are currently reported healthy by players.</p>
                </div>
              ) : (
                gameReports.map((report) => {
                  const matchedGame = (GAMES_DATA || []).find(g => g.id === report.targetId);
                  const isPending = report.status === 'pending';

                  return (
                    <div
                      key={report.id}
                      className={`p-6 sm:p-7 rounded-[2rem] border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                        isPending 
                          ? 'bg-amber-500/[0.06] border-amber-500/30' 
                          : 'bg-black/30 border-white/10 opacity-70'
                      }`}
                    >
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                          <Gamepad2 size={24} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                              isPending 
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse' 
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            }`}>
                              {report.status.toUpperCase()}
                            </span>
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                              Reported by {report.reportedByName}
                            </span>
                            <span className="text-[10px] font-medium text-white/30">
                              • {report.createdAt ? new Date(report.createdAt).toLocaleString() : 'Recent'}
                            </span>
                          </div>

                          <h3 className="text-xl font-black italic uppercase text-white tracking-tight truncate">
                            {report.targetName}
                          </h3>
                          <p className="text-xs font-bold text-amber-300 mt-1 uppercase tracking-wider">
                            Issue: {report.reason}
                          </p>
                          {report.details && (
                            <p className="text-xs text-white/70 mt-1 italic bg-black/40 p-2.5 rounded-xl border border-white/5">
                              "{report.details}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto">
                        {matchedGame && (
                          <>
                            {/* Direct toggle broken and lock for reported game */}
                            <button
                              onClick={() => {
                                const isCurrentBroken = Boolean(lockedGames[matchedGame.id]?.isBroken);
                                const isCurrentLocked = Boolean(lockedGames[matchedGame.id]?.isLocked);
                                handleToggleGameBroken(matchedGame.id, isCurrentBroken, isCurrentLocked, `Report: ${report.reason}`);
                              }}
                              disabled={isUpdatingGame}
                              className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer border transition-all ${
                                lockedGames[matchedGame.id]?.isBroken
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                                  : 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-600/30'
                              }`}
                            >
                              {lockedGames[matchedGame.id]?.isBroken ? <Unlock size={14} /> : <Lock size={14} />}
                              <span>{lockedGames[matchedGame.id]?.isBroken ? 'Unlock & Mark Working' : 'Mark Broken & Lock Title'}</span>
                            </button>

                            <button
                              onClick={() => (onPlayGame || onTestGame)(matchedGame)}
                              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                              title="Launch game in sandbox to reproduce"
                            >
                              <ExternalLink size={14} />
                              <span>Test Game</span>
                            </button>
                          </>
                        )}

                        {isPending ? (
                          <button
                            onClick={() => handleUpdateReportStatus(report.id, 'resolved')}
                            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
                          >
                            <CheckCircle2 size={14} />
                            <span>Mark Resolved</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateReportStatus(report.id, 'pending')}
                            className="flex-1 md:flex-initial px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-xs font-bold uppercase tracking-wider cursor-pointer"
                          >
                            Reopen
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Dismiss report"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Sub Tab Content: Account Reports */}
          {reportSubTab === 'accounts' && (
            <div className="space-y-4">
              {accountReports.length === 0 ? (
                <div className="p-16 rounded-[2.5rem] bg-black/40 border border-white/10 text-center flex flex-col items-center justify-center">
                  <ShieldCheck size={40} className="text-emerald-400 mb-3" />
                  <p className="text-lg font-black uppercase tracking-wider text-white">No Account Reports</p>
                  <p className="text-xs text-white/40 uppercase tracking-widest mt-1">No community rule violations currently reported.</p>
                </div>
              ) : (
                accountReports.map((report) => {
                  const targetUserObj = usersList.find(u => u.uid === report.targetId || u.username === report.targetName);
                  const isPending = report.status === 'pending';

                  return (
                    <div
                      key={report.id}
                      className={`p-6 sm:p-7 rounded-[2rem] border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                        isPending 
                          ? 'bg-rose-500/[0.07] border-rose-500/30' 
                          : 'bg-black/30 border-white/10 opacity-70'
                      }`}
                    >
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-full bg-black border border-rose-500/40 flex items-center justify-center shrink-0 overflow-hidden">
                          {report.targetAvatar ? (
                            <img src={report.targetAvatar} alt={report.targetName} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <UserX size={22} className="text-rose-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                              isPending 
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' 
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            }`}>
                              {report.status.toUpperCase()}
                            </span>
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                              Reported by {report.reportedByName}
                            </span>
                            <span className="text-[10px] font-medium text-white/30">
                              • {report.createdAt ? new Date(report.createdAt).toLocaleString() : 'Recent'}
                            </span>
                          </div>

                          <h3 className="text-xl font-black italic uppercase text-white tracking-tight truncate">
                            @{report.targetName}
                          </h3>
                          <p className="text-xs font-bold text-rose-300 mt-1 uppercase tracking-wider">
                            Violation: {report.reason}
                          </p>
                          {report.details && (
                            <p className="text-xs text-white/70 mt-1 italic bg-black/40 p-2.5 rounded-xl border border-white/5">
                              "{report.details}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Owner-Only Account Action Buttons */}
                      <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
                        <button
                          onClick={() => {
                            setDeleteTargetUser({
                              id: report.targetId,
                              uid: report.targetId,
                              username: report.targetName,
                              email: report.targetEmail || targetUserObj?.email || ''
                            });
                          }}
                          className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/25"
                        >
                          <Trash2 size={14} />
                          <span>Delete Account</span>
                        </button>

                        {isPending ? (
                          <button
                            onClick={() => handleUpdateReportStatus(report.id, 'resolved')}
                            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 size={14} />
                            <span>Dismiss</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateReportStatus(report.id, 'pending')}
                            className="flex-1 md:flex-initial px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-xs font-bold uppercase tracking-wider cursor-pointer"
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: 10S GLOBAL ANNOUNCEMENT BROADCASTER */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Broadcaster Form */}
          <div className="lg:col-span-7 rounded-[2.5rem] bg-black/40 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.25)]">
                <Megaphone size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black italic uppercase text-white tracking-tight">
                  GLOBAL ANNOUNCEMENT COMPOSER
                </h3>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                  Post to notifications feed & broadcast live 10s overlay
                </p>
              </div>
            </div>

            <form onSubmit={handleBroadcastAnnouncement} className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block mb-2">
                  Announcement Title
                </label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. SERVER MAINTENANCE COMPLETE / NEW GAME DROPPED"
                  className="w-full bg-[#121622] border border-white/10 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400 transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block mb-2">
                  Announcement Message
                </label>
                <textarea
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  rows={4}
                  placeholder="Write the full broadcast message for all players to read..."
                  className="w-full bg-[#121622] border border-white/10 rounded-xl p-4 text-xs font-medium text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400 resize-none transition-all"
                  required
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center gap-3">
                  <Radio size={20} className="text-amber-400 animate-pulse" />
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-white block">
                      Broadcast 10-Second Screen Takeover
                    </span>
                    <span className="text-[10px] font-medium text-white/50 block">
                      Pop up immediately on every player's screen with a live 10s countdown
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enable10sOverlay}
                    onChange={(e) => setEnable10sOverlay(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              <button
                type="submit"
                disabled={isBroadcasting}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-black font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send size={16} />
                <span>{isBroadcasting ? 'Broadcasting...' : 'Publish Announcement Now'}</span>
              </button>
            </form>
          </div>

          {/* Active Announcements List */}
          <div className="lg:col-span-5 rounded-[2.5rem] bg-black/40 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <span className="text-xs font-black uppercase tracking-widest text-white/60">
                ACTIVE BROADCASTS ({announcements.length})
              </span>
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                Visible on Notifications Page
              </span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[480px] space-y-3 no-scrollbar pr-1">
              {announcements.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-center opacity-40">
                  <Megaphone size={32} className="mb-2" />
                  <p className="text-xs font-black uppercase tracking-wider">No active announcements</p>
                </div>
              ) : (
                announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all flex items-start justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[8px] font-black uppercase">
                          BROADCAST
                        </span>
                        <span className="text-[9px] font-medium text-white/30">
                          {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      <h4 className="text-sm font-black uppercase italic text-white tracking-tight truncate">
                        {ann.title}
                      </h4>
                      <p className="text-xs text-white/60 line-clamp-2 mt-0.5">
                        {ann.text || ann.message}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all cursor-pointer shrink-0"
                      title="Delete announcement"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USER MANAGEMENT & ACCOUNT TERMINATION */}
      {activeTab === 'users' && (
        <div className="rounded-[2.5rem] bg-black/40 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black italic uppercase text-white tracking-tight">
                ACTIVE USER DIRECTORY
              </h3>
              <p className="text-xs font-medium text-white/40 uppercase tracking-wider mt-0.5">
                Only the site owner can terminate accounts and trigger background email blocking.
              </p>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
                placeholder="SEARCH PLAYERS OR EMAILS..."
                className="w-full bg-[#121622] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400 transition-all"
              />
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40">
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Level & Score</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-right">Owner Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs font-bold text-white/30 uppercase tracking-widest">
                      No matching active accounts found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSuperUser = isPlatformOwner(u);
                    return (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                        {/* Profile with CIRCLE avatar */}
                        <td className="py-3.5 px-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-black border border-white/10 flex items-center justify-center shrink-0 overflow-hidden shadow-md">
                            {u.customAvatar ? (
                              <img src={u.customAvatar} alt={u.username} className="w-full h-full object-cover rounded-full" />
                            ) : (
                              <span className="text-xs font-black text-white/60">{u.username?.[0] || 'P'}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase italic text-white">{u.username || 'Anonymous Player'}</p>
                            <span className="text-[9px] font-mono text-white/30 truncate block max-w-[120px]">{u.uid || u.id}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-xs font-medium text-white/60">
                          {u.email || 'Guest / Local Session'}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-xs font-bold text-amber-400">Lvl {u.level || 1}</span>
                          <span className="text-[10px] text-white/30 ml-2">{(u.score || 0).toLocaleString()} XP</span>
                        </td>

                        <td className="py-3.5 px-4">
                          {isSuperUser ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-black uppercase">
                              OWNER
                            </span>
                          ) : u.role === 'MODERATOR' ? (
                            <span className="px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[9px] font-black uppercase">
                              MODERATOR
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-white/5 text-white/40 text-[9px] font-bold uppercase">
                              PLAYER
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {!isSuperUser && (
                            <button
                              onClick={() => setDeleteTargetUser(u)}
                              className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                            >
                              Delete Account
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: BACKGROUND BLACKLIST */}
      {activeTab === 'blacklist' && (
        <div className="rounded-[2.5rem] bg-black/40 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-black uppercase tracking-widest mb-2">
              <Ban size={12} />
              <span>TERMINATED ACCOUNTS PERSISTENCE</span>
            </div>
            <h3 className="text-2xl font-black italic uppercase text-white tracking-tight">
              BACKGROUND BLOCKED REGISTRY ({blacklist.length})
            </h3>
            <p className="text-xs font-medium text-white/50 max-w-2xl leading-relaxed">
              When the owner deletes an account, their profile disappears from all leaderboards and chat, but their background record persists here. Any attempt to register or log in under these emails is permanently blocked.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40">
                  <th className="py-3 px-4">Blocked Email</th>
                  <th className="py-3 px-4">Original Username</th>
                  <th className="py-3 px-4">Termination Reason</th>
                  <th className="py-3 px-4">Date Terminated</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {blacklist.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs font-bold text-white/30 uppercase tracking-widest">
                      No terminated accounts currently in background registry
                    </td>
                  </tr>
                ) : (
                  blacklist.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 text-xs font-black text-rose-400 font-mono">
                        {item.email || item.id}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-bold text-white/70 uppercase italic">
                        {item.originalUsername || '[Hidden Profile]'}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-white/50">
                        {item.reason || 'Terminated by owner for rule violation'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-white/40">
                        {item.deletedAt ? new Date(item.deletedAt).toLocaleDateString() : 'Recorded'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleUnblockEmail(item.id)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                          title="Allow this email to sign up again"
                        >
                          Unblock Email
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: COMMUNITY SUGGESTIONS IN OWNER PORTAL */}
      {activeTab === 'suggestions' && (
        <div className="space-y-6">
          {/* Header and Filter Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-[2rem] bg-gradient-to-br from-yellow-500/10 via-black/40 to-black/60 border border-yellow-500/30 backdrop-blur-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 flex items-center justify-center shadow-[0_0_25px_rgba(234,179,8,0.25)]">
                <Lightbulb size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black italic uppercase text-white tracking-tight">
                  Owner Notifications: Community Suggestions
                </h3>
                <p className="text-xs text-white/50">
                  Direct user submissions, feature requests, and community upvotes.
                </p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-black/60 rounded-xl border border-white/10">
              {[
                { id: 'all', label: 'All', count: suggestions.length },
                { id: 'pending', label: 'Pending', count: suggestions.filter(s => s.status === 'pending').length },
                { id: 'approved', label: 'Approved', count: suggestions.filter(s => s.status === 'approved').length },
                { id: 'implemented', label: 'Implemented', count: suggestions.filter(s => s.status === 'implemented').length }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSuggestionsFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    suggestionsFilter === f.id
                      ? 'bg-yellow-500 text-black shadow-sm'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className="ml-1 text-[10px] opacity-70">({f.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Suggestions List */}
          {suggestions.filter(s => suggestionsFilter === 'all' ? true : s.status === suggestionsFilter).length === 0 ? (
            <div className="p-16 rounded-[2.5rem] bg-black/40 border border-white/10 text-center flex flex-col items-center justify-center">
              <Lightbulb size={40} className="text-white/20 mb-4" />
              <p className="text-base font-black uppercase tracking-widest text-white/60">No suggestions in this category</p>
              <p className="text-xs text-white/30 mt-1">Community suggestions submitted by users will appear right here in real time!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions
                .filter(s => suggestionsFilter === 'all' ? true : s.status === suggestionsFilter)
                .map((sug) => {
                  const score = (sug.upvoters?.length || 0) - (sug.downvoters?.length || 0);
                  const isPending = sug.status === 'pending';
                  const isApproved = sug.status === 'approved';
                  const isImplemented = sug.status === 'implemented';

                  return (
                    <motion.div
                      key={sug.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-6 rounded-[2rem] bg-[#0e121a]/90 border backdrop-blur-xl transition-all flex flex-col justify-between ${
                        isImplemented
                          ? 'border-emerald-500/40 bg-emerald-950/10'
                          : isApproved
                          ? 'border-blue-500/40 bg-blue-950/10'
                          : 'border-yellow-500/30 bg-black/40'
                      }`}
                    >
                      <div>
                        {/* Top Author & Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-black border border-white/15 overflow-hidden flex items-center justify-center text-xs font-black text-white/60">
                              {(sug.authorName || 'U')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-black text-white uppercase tracking-wider">
                                @{sug.authorName || 'Anonymous'}
                              </p>
                              <p className="text-[9px] text-white/40">
                                {sug.createdAt ? new Date(sug.createdAt).toLocaleDateString() : 'Just now'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                              isImplemented
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                : isApproved
                                ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                            }`}>
                              {sug.status || 'Pending'}
                            </span>
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-black text-white/80">
                              <ThumbsUp size={12} className="text-emerald-400" />
                              <span>{score}</span>
                            </div>
                          </div>
                        </div>

                        {/* Suggestion Text */}
                        <p className="text-sm font-medium text-white/90 leading-relaxed my-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                          "{sug.text}"
                        </p>
                      </div>

                      {/* Owner Actions */}
                      <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 mt-2">
                        <div className="flex items-center gap-2">
                          {!isApproved && !isImplemented && (
                            <button
                              onClick={() => handleUpdateSuggestionStatus(sug.id, 'approved')}
                              className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <Check size={12} />
                              <span>Approve</span>
                            </button>
                          )}

                          {!isImplemented && (
                            <button
                              onClick={() => handleUpdateSuggestionStatus(sug.id, 'implemented')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <CheckCircle2 size={12} />
                              <span>Mark Implemented</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleBroadcastSuggestion(sug)}
                            className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                            title="Turn this suggestion into a 10s announcement"
                          >
                            <Megaphone size={12} />
                            <span>Broadcast</span>
                          </button>
                        </div>

                        <button
                          onClick={() => handleDeleteSuggestion(sug.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 border border-white/5 hover:border-rose-500/30 transition-all cursor-pointer"
                          title="Delete suggestion"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GAME LOCKS & MAINTENANCE IN OWNER PORTAL */}
      {activeTab === 'games' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 sm:p-8 rounded-[2.5rem] bg-gradient-to-br from-rose-500/10 via-black/40 to-black/60 border border-rose-500/30 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.3)] shrink-0">
                <Lock size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black italic uppercase text-white tracking-tight">
                  Game Locks & Title Maintenance
                </h3>
                <p className="text-xs text-white/50 max-w-xl mt-1 leading-relaxed">
                  Mark games as broken and temporarily lock them to prevent player issues. Locked titles cannot be launched by players, but remain testable by you as the platform owner.
                </p>
              </div>
            </div>

            {Object.values(lockedGames).some(g => g.isLocked || g.isBroken) && (
              <button
                onClick={handleUnlockAllGames}
                disabled={isUpdatingGame}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer border border-white/10 shrink-0"
              >
                <Unlock size={14} className="text-emerald-400" />
                <span>Unlock All Titles</span>
              </button>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">TOTAL TITLES</span>
              <span className="text-2xl font-black italic text-white">{(GAMES_DATA || []).length}</span>
            </div>
            <div className="p-5 rounded-2xl bg-black/40 border border-emerald-500/30">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">OPERATIONAL</span>
              <span className="text-2xl font-black italic text-emerald-400">
                {(GAMES_DATA || []).length - Object.values(lockedGames).filter(g => g.isBroken || g.isLocked).length}
              </span>
            </div>
            <div className="p-5 rounded-2xl bg-black/40 border border-amber-500/30">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">BROKEN TITLES</span>
              <span className={`text-2xl font-black italic ${Object.values(lockedGames).filter(g => g.isBroken).length > 0 ? 'text-amber-400 animate-pulse' : 'text-white'}`}>
                {Object.values(lockedGames).filter(g => g.isBroken).length}
              </span>
            </div>
            <div className="p-5 rounded-2xl bg-black/40 border border-rose-500/30">
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 block">LOCKED TITLES</span>
              <span className={`text-2xl font-black italic ${Object.values(lockedGames).filter(g => g.isLocked).length > 0 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
                {Object.values(lockedGames).filter(g => g.isLocked).length}
              </span>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 border border-white/10">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search games by title or category..."
                value={gameSearchQuery}
                onChange={(e) => setGameSearchQuery(e.target.value)}
                className="w-full bg-[#121624] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-black/60 rounded-xl border border-white/10 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: `All (${(GAMES_DATA || []).length})` },
                { id: 'broken', label: `Broken (${Object.values(lockedGames).filter(g => g.isBroken).length})` },
                { id: 'locked', label: `Locked (${Object.values(lockedGames).filter(g => g.isLocked).length})` },
                { id: 'operational', label: 'Operational' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setGameFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    gameFilter === f.id
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(GAMES_DATA || [])
              .filter(game => {
                const lock = lockedGames[game.id] || {};
                const matchesQuery = game.title.toLowerCase().includes(gameSearchQuery.toLowerCase()) ||
                  (game.category && game.category.toLowerCase().includes(gameSearchQuery.toLowerCase()));
                if (!matchesQuery) return false;
                if (gameFilter === 'broken') return Boolean(lock.isBroken);
                if (gameFilter === 'locked') return Boolean(lock.isLocked);
                if (gameFilter === 'operational') return !lock.isBroken && !lock.isLocked;
                return true;
              })
              .map((game) => {
                const lockInfo = lockedGames[game.id] || {};
                const isBroken = Boolean(lockInfo.isBroken);
                const isLocked = Boolean(lockInfo.isLocked);

                return (
                  <div
                    key={game.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                      isBroken
                        ? 'bg-amber-500/[0.08] border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                        : isLocked
                        ? 'bg-rose-500/[0.08] border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                        : 'bg-black/40 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-xl bg-black border border-white/10 overflow-hidden relative shrink-0">
                        <img
                          src={game.thumbnail || game.image}
                          alt={game.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {(isBroken || isLocked) && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            {isBroken ? <AlertTriangle size={18} className="text-amber-400" /> : <Lock size={18} className="text-rose-400" />}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          {isBroken && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                              <AlertTriangle size={10} />
                              Broken Title
                            </span>
                          )}
                          {isLocked && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                              <Lock size={10} />
                              Locked
                            </span>
                          )}
                          {!isBroken && !isLocked && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black uppercase tracking-wider">
                              Operational
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-white/40 uppercase">
                            {game.category || 'Arcade'}
                          </span>
                        </div>

                        <h4 className="text-base font-black italic uppercase text-white tracking-tight truncate">
                          {game.title}
                        </h4>

                        {/* Reason / maintenance notice */}
                        {lockInfo.reason && (
                          <p className="text-[11px] text-white/70 italic mt-1 bg-black/50 p-2 rounded-lg border border-white/5 line-clamp-2">
                            "{lockInfo.reason}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/5">
                      {/* Toggle Broken Button */}
                      <button
                        onClick={() => handleToggleGameBroken(game.id, isBroken, isLocked)}
                        disabled={isUpdatingGame}
                        className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                          isBroken
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                            : 'bg-white/5 hover:bg-amber-500/20 text-white/70 hover:text-amber-300 border-white/10 hover:border-amber-500/30'
                        }`}
                      >
                        <AlertTriangle size={12} />
                        <span>{isBroken ? 'Mark Working' : 'Mark as Broken'}</span>
                      </button>

                      {/* Toggle Lock Button */}
                      <button
                        onClick={() => handleToggleGameLock(game.id, isLocked, isBroken)}
                        disabled={isUpdatingGame}
                        className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                          isLocked
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 hover:bg-rose-500/30'
                            : 'bg-white/5 hover:bg-rose-500/20 text-white/70 hover:text-rose-300 border-white/10 hover:border-rose-500/30'
                        }`}
                      >
                        {isLocked ? <Unlock size={12} /> : <Lock size={12} />}
                        <span>{isLocked ? 'Unlock Game' : 'Lock Game'}</span>
                      </button>

                      {/* Set Reason Button */}
                      <button
                        onClick={() => setEditingGameReason({ gameId: game.id, title: game.title, currentReason: lockInfo.reason || '' })}
                        className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                        title="Set custom notice message for players"
                      >
                        <Wrench size={12} />
                        <span>Notice</span>
                      </button>

                      {/* Test Play in Sandbox */}
                      <button
                        onClick={() => (onPlayGame || onTestGame)(game)}
                        className="py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md"
                        title="Launch game to test"
                      >
                        <ExternalLink size={12} />
                        <span>Test</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Edit Game Notice / Reason Modal */}
      <AnimatePresence>
        {editingGameReason && (
          <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0e121a] border-2 border-amber-500/40 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_25px_80px_rgba(245,158,11,0.25)] text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-4">
                <Wrench size={24} />
              </div>

              <h3 className="text-xl font-black italic uppercase text-white tracking-tight mb-1">
                Player Maintenance Notice
              </h3>
              <p className="text-xs text-white/50 mb-4">
                Set the explanation displayed to players on the game card and launch screen for <span className="text-white font-bold">{editingGameReason.title}</span>.
              </p>

              <div className="space-y-4 mb-6">
                <textarea
                  rows={3}
                  value={editingGameReason.currentReason}
                  onChange={(e) => setEditingGameReason(prev => ({ ...prev, currentReason: e.target.value }))}
                  maxLength={200}
                  placeholder="e.g. Broken iframe connection - under maintenance by owner. Check back soon!"
                  className="w-full bg-[#121624] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors resize-none"
                />
                <span className="text-[10px] text-white/40 block text-right font-mono">
                  {(editingGameReason.currentReason || '').length}/200
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSaveGameReason(editingGameReason.gameId, editingGameReason.currentReason)}
                  disabled={isUpdatingGame}
                  className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  Save Notice
                </button>
                <button
                  onClick={() => setEditingGameReason(null)}
                  className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {deleteTargetUser && (
          <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0e121a] border-2 border-rose-500/50 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_25px_80px_rgba(244,63,94,0.3)] text-left"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mb-5 shadow-lg">
                <Trash2 size={28} />
              </div>

              <h3 className="text-2xl font-black italic uppercase text-white tracking-tight mb-2">
                TERMINATE ACCOUNT?
              </h3>
              
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 mb-5 space-y-2">
                <p className="text-xs font-bold text-white uppercase">
                  Target: <span className="text-rose-400 font-black">@{deleteTargetUser.username || 'User'}</span>
                </p>
                <p className="text-[11px] font-mono text-white/60">
                  Email: {deleteTargetUser.email || 'No email associated'}
                </p>
                <p className="text-[10px] text-white/50 mt-2 leading-relaxed">
                  ✓ Profile and badges will immediately disappear from all leaderboards and chat.<br />
                  ✓ Account will persist in the background registry.<br />
                  ✓ Re-registering with this email will be permanently blocked.
                </p>
              </div>

              <div className="mb-6">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block mb-2">
                  Termination Reason
                </label>
                <input
                  type="text"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full bg-[#121622] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 transition-all"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleConfirmDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-rose-600/30 cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? 'Terminating...' : 'Delete & Block Account'}
                </button>
                <button
                  onClick={() => setDeleteTargetUser(null)}
                  className="py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Grant Action Confirmation Warning Modal */}
      <AnimatePresence>
        {pendingGrant && (
          <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0e121a] border-2 border-amber-500/50 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_25px_80px_rgba(245,158,11,0.3)] text-left"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-5 shadow-lg">
                <AlertTriangle size={28} />
              </div>

              <h3 className="text-2xl font-black italic uppercase text-white tracking-tight mb-2">
                CONFIRM ADMIN ACTION
              </h3>
              
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase">
                    Target: <span className="text-amber-400 font-black">@{pendingGrant.targetUser?.username || 'User'}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase font-mono">
                    Lvl {pendingGrant.targetUser?.level || 1}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-white/60">
                  UID: {pendingGrant.targetUser?.uid || 'Unknown'}
                </p>
                <div className="pt-2 border-t border-amber-500/20">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300/90 block mb-1">
                    Action: {pendingGrant.title}
                  </span>
                  <p className="text-xs text-white/80 leading-relaxed font-sans">
                    {pendingGrant.description}
                  </p>
                </div>
                <p className="text-[10px] text-white/50 pt-2 leading-relaxed">
                  ⚠️ This action will immediately write directly to Firebase Firestore, modifying live player stats, rankings, and cloud records.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={async () => {
                    const fn = pendingGrant.onConfirm;
                    setPendingGrant(null);
                    if (fn) await fn();
                  }}
                  disabled={isGranting}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-amber-500/30 cursor-pointer disabled:opacity-50"
                >
                  {isGranting ? 'Granting...' : 'Confirm & Grant'}
                </button>
                <button
                  onClick={() => setPendingGrant(null)}
                  className="py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

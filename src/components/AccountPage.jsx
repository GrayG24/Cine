import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  Lock, 
  UserCheck, 
  UserPlus, 
  LogOut, 
  Check, 
  Shield, 
  Crown, 
  Sparkles, 
  Flame, 
  Zap, 
  Trophy, 
  Gamepad2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChevronRight, 
  Palette, 
  ShieldCheck,
  ArrowLeft,
  X,
  Target,
  Award,
  MessageSquare
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  sendPasswordResetEmail, 
  updateProfile,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { PROFILE_BANNERS, BADGES, LEVEL_ROAD_TIERS, DEFAULT_LEADERBOARD_DATA, AppRoute, isPlatformOwner } from '../constants';
import { CustomizeProfileModal } from './CustomizeProfileModal';
import { BannerDisplay } from './BannerDisplay';

const LEVEL_UP_BASE = 80;

export const calculateTotalExp = (u) => {
  if (!u) return 0;
  if (typeof u.totalExp === 'number' && u.totalExp > 0) return u.totalExp;
  const lvl = Math.min(u.level || 1, 999);
  const currentExp = u.exp || 0;
  const baseLvlExp = ((lvl - 1) * lvl / 2) * LEVEL_UP_BASE;
  return baseLvlExp + currentExp;
};

export const computeUserBadges = (u, leaderboardData = []) => {
  if (!u) return [];
  const badges = [];
  const username = u.username || '';
  const email = (u.email || '').toLowerCase();
  const lvl = u.level || 1;
  const games = u.gamesPlayed || 0;

  // Use effective leaderboard with default fallback
  const baseData = (leaderboardData && leaderboardData.length > 0)
    ? leaderboardData
    : DEFAULT_LEADERBOARD_DATA;

  // Ensure current user u is included in ranking dataset so ranks evaluate properly
  const allPlayers = [...baseData];
  const userIdx = allPlayers.findIndex(p => 
    (u.uid && p.uid && p.uid === u.uid) || 
    (username && p.username && p.username.toLowerCase() === username.toLowerCase())
  );
  if (userIdx >= 0) {
    allPlayers[userIdx] = { ...allPlayers[userIdx], ...u };
  } else if (username) {
    allPlayers.push(u);
  }

  // 1. Level / EXP leaderboard rank
  const expSorted = [...allPlayers].sort((a, b) => {
    const lvlDiff = (b.level || 1) - (a.level || 1);
    if (lvlDiff !== 0) return lvlDiff;
    const aTotal = a.totalExp || calculateTotalExp(a);
    const bTotal = b.totalExp || calculateTotalExp(b);
    return bTotal - aTotal;
  });
  const expRank = expSorted.findIndex(p => 
    (p.uid && u.uid && p.uid === u.uid) || 
    (p.username && username && p.username.toLowerCase() === username.toLowerCase())
  );

  // 2. Games Played leaderboard rank
  const gamesSorted = [...allPlayers].sort((a, b) => {
    return (b.gamesPlayed || 0) - (a.gamesPlayed || 0);
  });
  const gamesRank = gamesSorted.findIndex(p => 
    (p.uid && u.uid && p.uid === u.uid) || 
    (p.username && username && p.username.toLowerCase() === username.toLowerCase())
  );

  // Both 1st place players on EXP and Games Played leaderboards get the 1st place badge!
  const isFirstInExp = expRank === 0 && expSorted.length > 0;
  const isFirstInGames = gamesRank === 0 && gamesSorted.length > 0 && (gamesSorted[0].gamesPlayed || 0) > 0;
  const isFirstPlace = isFirstInExp || isFirstInGames;

  const isTop10Exp = expRank >= 0 && expRank < 10;
  const isTop10Games = gamesRank >= 0 && gamesRank < 10;
  const isTop10 = (!isFirstPlace) && (isTop10Exp || isTop10Games);

  if (isFirstPlace) {
    const b = BADGES.find(x => x.id === 'leaderboard-first');
    if (b) badges.push(b);
  } else if (isTop10) {
    const b = BADGES.find(x => x.id === 'leaderboard-top10');
    if (b) badges.push(b);
  }

  if (lvl >= 999) {
    const b = BADGES.find(x => x.id === 'grandmaster-999');
    if (b) badges.push(b);
  }
  if (lvl >= 100) {
    const b = BADGES.find(x => x.id === 'century-club');
    if (b) badges.push(b);
  }
  if (games >= 100) {
    const b = BADGES.find(x => x.id === 'games-master');
    if (b) badges.push(b);
  }
  if (u.isEarlyAccess !== false && !u.isAnonymous) {
    const b = BADGES.find(x => x.id === 'early-access');
    if (b) badges.push(b);
  }
  const isOwnerUser = isPlatformOwner(u, auth?.currentUser);

  if (isOwnerUser) {
    const b = BADGES.find(x => x.id === 'site-owner');
    if (b) badges.unshift(b);
  }

  // Include any custom unlocked badges if present in user record (strictly exclude site-owner for non-owners)
  if (Array.isArray(u.unlockedBadges)) {
    u.unlockedBadges.forEach(id => {
      if (id === 'site-owner' && !isOwnerUser) return; // ONLY the true platform owner can have the owner badge
      const b = BADGES.find(x => x.id === id);
      if (b && !badges.some(existing => existing.id === b.id)) badges.push(b);
    });
  }

  return Array.from(new Set(badges));
};

export const AccountPage = ({ 
  user, 
  firebaseUser, 
  viewingUser,
  onCloseViewingUser,
  leaderboardData = [],
  onNavigate, 
  onUpdateUser, 
  addNotification 
}) => {
  // Auth Form States for Guest / Logged-out users
  const [authTab, setAuthTab] = useState('register'); // 'register' | 'login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Signed-in User State & Tabs
  const [activeAccountTab, setActiveAccountTab] = useState('overview'); // 'overview' | 'security'
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [isLevelRoadModalOpen, setIsLevelRoadModalOpen] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [fetchedViewingUser, setFetchedViewingUser] = useState(null);

  // If viewingUser is passed and not self, this is an external user profile view
  const isViewingOther = Boolean(viewingUser && (!user || (viewingUser.username !== user.username && viewingUser.uid !== user.uid)));

  // Try to enrich viewingUser from leaderboardData or Firestore
  React.useEffect(() => {
    if (!isViewingOther || !viewingUser) {
      setFetchedViewingUser(null);
      return;
    }
    const fromBoard = (leaderboardData || []).find(p => p.username === viewingUser.username || (p.uid && p.uid === viewingUser.uid));
    if (fromBoard) {
      setFetchedViewingUser(fromBoard);
    }
    if (viewingUser.uid) {
      getDoc(doc(db, 'users', viewingUser.uid))
        .then(snap => {
          if (snap.exists()) {
            setFetchedViewingUser(prev => ({ ...prev, ...snap.data(), uid: snap.id }));
          }
        })
        .catch(err => console.warn('Could not load viewed user doc:', err));
    }
  }, [isViewingOther, viewingUser, leaderboardData]);

  const displayedUser = isViewingOther 
    ? (fetchedViewingUser ? { ...viewingUser, ...fetchedViewingUser } : viewingUser)
    : user;

  const isAuthenticated = Boolean(firebaseUser && !firebaseUser.isAnonymous);

  // Stats and customization calculations
  const currentBanner = PROFILE_BANNERS.find(b => b.id === displayedUser?.currentBanner) || PROFILE_BANNERS[0];
  const currentLevel = Math.min(displayedUser?.level || 1, 999);
  const totalExp = calculateTotalExp(displayedUser);
  const nextLevelExp = currentLevel * LEVEL_UP_BASE;
  const currentLevelRemainderExp = displayedUser?.exp || 0;
  
  // Level 999 cap check
  const isMaxLevel = currentLevel >= 999;
  const progressPercent = isMaxLevel ? 100 : Math.min(100, Math.round((currentLevelRemainderExp / nextLevelExp) * 100));

  const isOwner = isPlatformOwner(displayedUser, firebaseUser || auth?.currentUser);

  // Badges calculation
  const earnedBadges = computeUserBadges(displayedUser, leaderboardData);
  const displayBadgesSetting = displayedUser?.settings?.displayProfileBadges !== false;
  let displayedBadgesList = (Array.isArray(displayedUser?.displayedBadgeIds))
    ? earnedBadges.filter(b => displayedUser.displayedBadgeIds.includes(b.id))
    : earnedBadges;

  // CRITICAL FIX: The owner must ALWAYS display their Site Owner badge
  if (isOwner) {
    const ownerBadge = BADGES.find(b => b.id === 'site-owner');
    if (ownerBadge && !displayedBadgesList.some(b => b.id === 'site-owner')) {
      displayedBadgesList = [ownerBadge, ...displayedBadgesList];
    }
  }

  // Handle Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!usernameInput.trim()) {
      setAuthError('Please enter a gamertag/username.');
      return;
    }
    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setAuthLoading(true);
      const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const chosenUsername = usernameInput.trim();

      await updateProfile(userCred.user, {
        displayName: chosenUsername
      });

      const initialProfile = {
        ...user,
        uid: userCred.user.uid,
        email: userCred.user.email,
        username: chosenUsername,
        hasSetProfile: true,
        isAnonymous: false,
        level: user?.level || 1,
        exp: user?.exp || 0,
        totalExp: calculateTotalExp(user),
        score: user?.score || 0,
        gamesPlayed: user?.gamesPlayed || 0,
        bio: '',
        settings: {
          sidebarAutoHide: false,
          notifications: true,
          displayProfileBadges: true
        }
      };

      await setDoc(doc(db, 'users', userCred.user.uid), initialProfile, { merge: true });

      if (onUpdateUser) {
        onUpdateUser(initialProfile);
      }

      setAuthSuccess('Account registered successfully! Welcome.');
      if (addNotification) {
        addNotification('ACCOUNT CREATED', `Welcome to Classroom 9X, ${chosenUsername}!`, 'success');
      }
    } catch (err) {
      console.error('Registration Error:', err);
      let msg = 'Failed to create account. Please check your details.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already in use by another account.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'The email address is invalid.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password is too weak. Must be at least 6 characters.';
      }
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    try {
      setAuthLoading(true);
      const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);

      const userDocRef = doc(db, 'users', userCred.user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const cloudData = userDocSnap.data();
        if (onUpdateUser) {
          onUpdateUser(prev => ({
            ...prev,
            ...cloudData,
            uid: userCred.user.uid,
            email: userCred.user.email,
            isAnonymous: false
          }));
        }
      }

      setAuthSuccess('Signed in successfully!');
      if (addNotification) {
        addNotification('WELCOME BACK', `Logged in as ${userCred.user.displayName || 'Player'}`, 'success');
      }
    } catch (err) {
      console.error('Login Error:', err);
      let msg = 'Failed to log in. Please check your email and password.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password.';
      }
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setAuthError('');
    setAuthSuccess('');
    try {
      setAuthLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUserObj = result.user;

      const userDocRef = doc(db, 'users', firebaseUserObj.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const cloudData = userDocSnap.data();
        if (onUpdateUser) {
          onUpdateUser(prev => ({
            ...prev,
            ...cloudData,
            uid: firebaseUserObj.uid,
            email: firebaseUserObj.email,
            isAnonymous: false
          }));
        }
      } else {
        const newUsername = firebaseUserObj.displayName || `Player_${firebaseUserObj.uid.substring(0, 5)}`;
        const initialProfile = {
          ...user,
          uid: firebaseUserObj.uid,
          email: firebaseUserObj.email,
          username: newUsername,
          hasSetProfile: true,
          isAnonymous: false,
          level: user?.level || 1,
          exp: user?.exp || 0,
          totalExp: calculateTotalExp(user),
          score: user?.score || 0,
          gamesPlayed: user?.gamesPlayed || 0,
          bio: '',
          settings: {
            sidebarAutoHide: false,
            notifications: true,
            displayProfileBadges: true
          }
        };
        await setDoc(userDocRef, initialProfile, { merge: true });
        if (onUpdateUser) {
          onUpdateUser(initialProfile);
        }
      }

      if (addNotification) {
        addNotification('GOOGLE SIGN-IN', `Connected as ${firebaseUserObj.displayName || 'Player'}`, 'success');
      }
    } catch (err) {
      console.error('Google Sign-in Error:', err);
      setAuthError(err.message || 'Google sign-in failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Password Reset
  const handlePasswordReset = async () => {
    if (!firebaseUser?.email) return;
    try {
      await sendPasswordResetEmail(auth, firebaseUser.email);
      setResetEmailSent(true);
      if (addNotification) {
        addNotification('RESET EMAIL SENT', 'A password reset link was dispatched to your email address.', 'success');
      }
    } catch (err) {
      console.error('Password Reset Error:', err);
      if (addNotification) {
        addNotification('RESET ERROR', 'Could not send reset email at this time.', 'error');
      }
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      if (addNotification) {
        addNotification('SIGNED OUT', 'You have been disconnected safely.', 'info');
      }
      if (onNavigate) {
        onNavigate(AppRoute.HOME);
      }
    } catch (err) {
      console.error('Sign Out Error:', err);
    }
  };

  return (
    <div className="min-h-screen pt-8 pb-32 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Back button when viewing another user's profile */}
      {isViewingOther && (
        <button
          onClick={onCloseViewingUser || (() => onNavigate && onNavigate(AppRoute.HOME))}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      )}

      {/* VIEW A: GUEST / UNAUTHENTICATED REGISTRATION & LOGIN PORTAL (Only when not viewing someone else) */}
      {!isAuthenticated && !isViewingOther ? (
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-300 text-xs font-black uppercase tracking-widest mb-4 shadow-[0_0_20px_rgba(59,130,246,0.25)]">
              <Sparkles size={14} className="text-blue-400" />
              <span>PROFILE & IDENTITY</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white uppercase italic tracking-tight leading-none mb-3">
              Player Account
            </h1>
            <p className="text-white/40 text-xs sm:text-sm font-medium uppercase tracking-widest max-w-md mx-auto">
              Create a cloud-backed account to preserve your Level Road, badges, and games played across devices.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-[#0e121a] border border-purple-500/30 rounded-3xl p-6 sm:p-10 shadow-[0_0_50px_rgba(168,85,247,0.15)] relative overflow-hidden">
            <div className="flex border-b border-white/10 mb-8">
              <button
                onClick={() => setAuthTab('register')}
                className={`flex-1 pb-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-2 cursor-pointer ${
                  authTab === 'register'
                    ? 'border-blue-500 text-blue-400 shadow-[0_10px_20px_rgba(59,130,246,0.2)]'
                    : 'border-transparent text-white/40 hover:text-white'
                }`}
              >
                <UserPlus size={16} />
                <span>Create Account</span>
              </button>
              <button
                onClick={() => setAuthTab('login')}
                className={`flex-1 pb-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-2 cursor-pointer ${
                  authTab === 'login'
                    ? 'border-purple-500 text-purple-400 shadow-[0_10px_20px_rgba(168,85,247,0.2)]'
                    : 'border-transparent text-white/40 hover:text-white'
                }`}
              >
                <UserCheck size={16} />
                <span>Log In</span>
              </button>
            </div>

            {authError && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs font-bold">
                <AlertCircle size={18} className="shrink-0" />
                <span>{authError}</span>
              </div>
            )}
            {authSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs font-bold">
                <CheckCircle2 size={18} className="shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            <form onSubmit={authTab === 'register' ? handleRegister : handleLogin} className="space-y-4">
              {authTab === 'register' && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block mb-1.5">
                    Player Gamertag (Username)
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="e.g. ShadowBlade"
                      maxLength={20}
                      required
                      className="w-full bg-[#121624] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-xs font-bold focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="player@example.com"
                    required
                    className="w-full bg-[#121624] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-xs font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-[#121624] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-xs font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {authTab === 'register' && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-[#121624] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-xs font-bold focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(59,130,246,0.3)] disabled:opacity-50 mt-4"
              >
                {authLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : authTab === 'register' ? (
                  <>
                    <UserPlus size={16} />
                    <span>Create Free Account</span>
                  </>
                ) : (
                  <>
                    <UserCheck size={16} />
                    <span>Log In to Account</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5">
              <button
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW B: PROFILE DASHBOARD (FOR SELF OR VIEWING OTHER PLAYER) */
        <div className="space-y-6">
          {/* Top Banner & Profile Header */}
          <div className="relative rounded-3xl bg-[#0c0f18] border border-blue-500/20 overflow-hidden shadow-2xl">
            {/* Custom Equipped Profile Banner */}
            <BannerDisplay 
              banner={currentBanner} 
              className="h-44 sm:h-52 w-full"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f18] via-transparent to-black/30 pointer-events-none" />
              
              {/* Only show Platform Owner badge if applicable */}
              <div className="absolute top-5 left-6 flex items-center gap-2 z-20">
                {isOwner && (
                  <span className="px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <Crown size={12} />
                    Platform Owner
                  </span>
                )}
              </div>
            </BannerDisplay>

            {/* Profile Bar */}
            <div className="px-6 sm:px-10 -mt-14 sm:-mt-16 pb-7 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 relative z-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
                {/* Avatar with Circular Frame */}
                <div className="relative group">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-black border-4 border-blue-500/40 p-1 shadow-[0_0_30px_rgba(59,130,246,0.3)] flex items-center justify-center overflow-hidden">
                    {displayedUser?.customAvatar ? (
                      <img src={displayedUser.customAvatar} alt={displayedUser.username} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center text-blue-300">
                        <User size={44} />
                      </div>
                    )}
                  </div>
                  <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-[#0c0f18]" />
                </div>

                {/* Name, Level, Badges next to name, Bio */}
                <div>
                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight text-white">
                      {displayedUser?.username || 'Player'}
                    </h2>

                    <span className="px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider">
                      LVL {currentLevel}
                    </span>

                    {/* Badge Icons directly next to name with detailed cool emblem styling & hover tooltip */}
                    {displayBadgesSetting && displayedBadgesList.length > 0 && (
                      <div className="flex items-center gap-1.5 ml-1 flex-wrap">
                        {displayedBadgesList.map((badge) => {
                          const Icon = badge.icon || Award;
                          const badgeConfig = 
                            badge.id === 'leaderboard-first' ? {
                              container: 'from-amber-400/25 via-yellow-500/20 to-amber-600/30 border-amber-400/70 text-yellow-300 shadow-[0_0_15px_rgba(245,158,11,0.45)] ring-1 ring-yellow-400/40',
                              shine: 'bg-yellow-400/20'
                            } :
                            badge.id === 'leaderboard-top10' ? {
                              container: 'from-purple-600/30 via-violet-600/20 to-indigo-700/30 border-purple-400/60 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.35)] ring-1 ring-purple-400/30',
                              shine: 'bg-purple-400/20'
                            } :
                            badge.id === 'grandmaster-999' ? {
                              container: 'from-cyan-400/30 via-indigo-600/30 to-purple-600/40 border-cyan-300/80 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.5)] ring-1 ring-cyan-400/50 animate-pulse',
                              shine: 'bg-cyan-300/30'
                            } :
                            badge.id === 'century-club' ? {
                              container: 'from-blue-600/30 via-indigo-600/25 to-blue-800/30 border-blue-400/70 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.35)] ring-1 ring-blue-400/40',
                              shine: 'bg-blue-400/20'
                            } :
                            badge.id === 'games-master' ? {
                              container: 'from-emerald-500/25 via-teal-600/20 to-cyan-700/30 border-emerald-400/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400/30',
                              shine: 'bg-emerald-400/20'
                            } :
                            badge.id === 'site-owner' ? {
                              container: 'from-amber-400/30 via-yellow-600/25 to-amber-700/30 border-amber-300/80 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.5)] ring-1 ring-yellow-400/50',
                              shine: 'bg-yellow-400/30'
                            } : {
                              container: 'from-purple-500/20 via-indigo-500/15 to-purple-800/20 border-purple-400/40 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.25)] ring-1 ring-purple-400/20',
                              shine: 'bg-purple-400/15'
                            };

                          return (
                            <div key={badge.id} className="relative group/badge inline-block">
                              <div 
                                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border bg-gradient-to-br flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-115 relative overflow-hidden backdrop-blur-md ${badgeConfig.container}`}
                              >
                                <div className={`absolute top-0 left-0 w-full h-1/2 rounded-t-xl opacity-60 pointer-events-none ${badgeConfig.shine}`} />
                                <Icon size={16} className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                              </div>
                              {/* Hover Tooltip */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/badge:flex flex-col items-center z-50 pointer-events-none w-max max-w-[220px]">
                                <div className="bg-[#0b0e17]/95 border border-blue-500/40 rounded-xl px-3 py-2 shadow-2xl text-center backdrop-blur-xl">
                                  <span className="text-xs font-black uppercase text-white block tracking-wider">{badge.name}</span>
                                  <span className="text-[10px] text-white/70 mt-0.5 block leading-tight font-medium">{badge.desc}</span>
                                </div>
                                <div className="w-2 h-2 bg-[#0b0e17] border-r border-b border-blue-500/40 rotate-45 -mt-1" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Profile Bio (Zero bio until set!) */}
                  {displayedUser?.bio ? (
                    <p className="text-xs text-white/70 mt-1 max-w-md italic">
                      {displayedUser.bio}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Action Buttons */}
              {!isViewingOther ? (
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => setIsCustomizeModalOpen(true)}
                    className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  >
                    <Palette size={14} />
                    <span>Customize Profile</span>
                  </button>
                  <button
                    onClick={() => onNavigate && onNavigate(AppRoute.LIBRARY)}
                    className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10"
                  >
                    <Gamepad2 size={14} />
                    <span>Play Games</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => onNavigate && onNavigate(AppRoute.CHAT, { targetUser: displayedUser })}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  >
                    <MessageSquare size={14} />
                    <span>Message Player</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tab Header (Only for own profile) */}
          {!isViewingOther && (
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              {[
                { id: 'overview', label: 'Overview', icon: Trophy },
                { id: 'security', label: 'Security & Session', icon: ShieldCheck },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeAccountTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveAccountTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer border ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-400/40 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                        : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* OVERVIEW CONTENT */}
          {(isViewingOther || activeAccountTab === 'overview') && (
            <div className="space-y-5">
              {/* 3 Clean Stats Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { 
                    label: 'Player Level', 
                    value: isMaxLevel ? '999 (MAX)' : `Level ${currentLevel}`, 
                    icon: Trophy, 
                    color: 'text-amber-400', 
                    bg: 'bg-amber-500/10', 
                    border: 'border-amber-500/20' 
                  },
                  { 
                    label: 'Total EXP Earned', 
                    value: isMaxLevel ? `MAX (${totalExp.toLocaleString()} EXP)` : `${totalExp.toLocaleString()} EXP`, 
                    icon: Zap, 
                    color: 'text-blue-400', 
                    bg: 'bg-blue-500/10', 
                    border: 'border-blue-500/20' 
                  },
                  { 
                    label: 'Games Played', 
                    value: displayedUser?.gamesPlayed || 0, 
                    icon: Gamepad2, 
                    color: 'text-purple-400', 
                    bg: 'bg-purple-500/10', 
                    border: 'border-purple-500/20' 
                  },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className={`p-4 sm:p-5 rounded-2xl ${item.bg} border ${item.border} flex items-center gap-4`}>
                      <div className={`p-2.5 rounded-xl bg-black/40 ${item.color}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">{item.label}</p>
                        <p className="text-lg sm:text-xl font-black italic uppercase text-white truncate max-w-[200px]">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Level Road & EXP Progress Card */}
              <div className="p-5 sm:p-7 rounded-2xl bg-[#0c0f18] border border-blue-500/20 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <Flame size={16} className="text-blue-400" />
                      <span>Level {currentLevel} Road</span>
                      {isMaxLevel && (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[9px] font-black uppercase">
                          MAX ROAD COMPLETED
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-white/50 mt-0.5">
                      {isMaxLevel 
                        ? 'Congratulations! You have reached the pinnacle of Level 999.' 
                        : 'Play games to accumulate EXP and unlock prestigious banners and milestones.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* EXP Status indicator */}
                    <span className="text-xs font-mono font-black text-blue-400">
                      {isMaxLevel ? `MAX (${totalExp.toLocaleString()} EXP)` : `${progressPercent}% to Next Level`}
                    </span>

                    {/* Button to view completed level road */}
                    <button
                      onClick={() => setIsLevelRoadModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Trophy size={13} className="text-blue-400" />
                      <span>{isMaxLevel ? 'View Completed Level Road' : 'View Level Road'}</span>
                    </button>
                  </div>
                </div>

                {/* Progress Bar (Full when level >= 999) */}
                <div className="w-full h-3 rounded-full bg-black/60 overflow-hidden border border-white/10 p-0.5 shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${isMaxLevel ? 100 : progressPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SECURITY & SESSION (Only for own profile) */}
          {!isViewingOther && activeAccountTab === 'security' && (
            <div className="space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-[#0c0f18] border border-white/10">
                <h3 className="text-base font-black uppercase italic tracking-tight text-white mb-1">
                  Account Credentials & Password
                </h3>
                <p className="text-xs text-white/50 mb-6">Manage your account email, password resets, and session.</p>

                <div className="space-y-4 max-w-xl">
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-white/40 block">Email Address</span>
                      <span className="text-sm font-bold text-white">{firebaseUser?.email || 'No email attached'}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase">
                      Verified
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-black uppercase text-white/40 block">Password</span>
                      <span className="text-xs text-white/70">Receive a secure reset link to your email to change your password.</span>
                    </div>
                    <button
                      onClick={handlePasswordReset}
                      disabled={resetEmailSent}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {resetEmailSent ? 'Link Sent!' : 'Send Reset Link'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone: Log Out */}
              <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-black uppercase tracking-wider text-rose-400">Account Session</h4>
                  <p className="text-xs text-white/50 mt-0.5">End your current session on this device.</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                >
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CUSTOMIZE PROFILE MODAL */}
      <CustomizeProfileModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
        user={user}
        firebaseUser={firebaseUser}
        earnedBadges={earnedBadges}
        onUpdateUser={onUpdateUser}
        onUpdateUsername={(newName) => {
          if (onUpdateUser) {
            onUpdateUser(prev => ({ ...prev, username: newName }));
          }
        }}
        addNotification={addNotification}
      />

      {/* VIEW COMPLETED LEVEL ROAD MODAL */}
      {isLevelRoadModalOpen && (
        <div className="fixed inset-0 z-[2600] bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl bg-[#0c0f18] border border-purple-500/30 rounded-[2.5rem] shadow-[0_0_80px_rgba(168,85,247,0.25)] relative overflow-hidden flex flex-col my-auto max-h-[85vh]"
          >
            <div className="p-6 sm:p-8 border-b border-white/10 flex items-center justify-between shrink-0">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-black uppercase tracking-widest mb-1">
                  <Trophy size={12} className="text-blue-400" />
                  <span>LEVEL ROAD MILESTONES</span>
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tight text-white">
                  Level Progression Road
                </h3>
              </div>
              <button
                onClick={() => setIsLevelRoadModalOpen(false)}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-3 overflow-y-auto custom-scrollbar flex-1">
              {LEVEL_ROAD_TIERS.map((tier) => {
                const isPassed = currentLevel >= tier.level;
                return (
                  <div
                    key={tier.level}
                    className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                      isPassed
                        ? 'bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border-blue-500/40 shadow-lg shadow-blue-500/5'
                        : 'bg-black/30 border-white/5 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                        isPassed 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                          : 'bg-white/5 text-white/40'
                      }`}>
                        {tier.level}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/10 text-blue-300">
                            {tier.type}
                          </span>
                          <h4 className="text-sm font-black uppercase italic text-white">{tier.name}</h4>
                          {isPassed && <CheckCircle2 size={16} className="text-blue-400" />}
                        </div>
                        <p className="text-xs text-white/60 mt-0.5">{tier.desc}</p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg shrink-0 ${
                      isPassed ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-white/5 text-white/40'
                    }`}>
                      {isPassed ? 'UNLOCKED' : `LVL ${tier.level}`}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="p-4 sm:p-6 border-t border-white/10 flex justify-end shrink-0 bg-[#090b12]">
              <button
                onClick={() => setIsLevelRoadModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

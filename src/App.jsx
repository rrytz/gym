import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import WorkoutLogger from './components/WorkoutLogger';
import RoutinePlanner from './components/RoutinePlanner';
import ExerciseLibrary from './components/ExerciseLibrary';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import SplitGuides from './components/SplitGuides';
import Admin from './components/Admin';
import Nutrition from './components/Nutrition';
import WeightTracker from './components/WeightTracker';
import GoalManager from './components/GoalManager';
import ErrorBoundary from './components/ErrorBoundary';
import DailySpinWheel from './components/DailySpinWheel';
import InstallPrompt from './components/InstallPrompt';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';

// Loading Spinner shown while Supabase resolves the initial session
const LoadingScreen = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--background)',
    gap: '24px',
  }}>
    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px' }}>
      TITAN<span className="neon-text">LOG</span>
    </h1>
    <div style={{
      width: '44px',
      height: '44px',
      border: '3px solid rgba(0, 242, 255, 0.15)',
      borderTop: '3px solid var(--primary)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeRoutine, setActiveRoutine] = useState(null);
  const [session, setSession] = useState(null);
  // null = still loading, false = confirmed no session, object = has session
  const [sessionLoading, setSessionLoading] = useState(true);
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [userData, setUserData] = useState({
    workouts: [],
    routines: [],
    goals: [],
    pr: {},
    settings: {
      unit: 'kg',
      restTimer: 60
    }
  });

  // Resolve initial session — show loading until done
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSessionLoading(false);
    }).catch(() => {
      // Supabase unreachable — still show app in guest mode
      setSession(null);
      setSessionLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setSessionLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show daily spin wheel once per day after login
  useEffect(() => {
    if (!session || sessionLoading) return;
    const todayKey = new Date().toISOString().slice(0, 10);
    const lastSpin = localStorage.getItem('titanlog_last_spin');
    if (lastSpin !== todayKey) {
      // Small delay so the app loads visually before modal pops
      const timer = setTimeout(() => setShowSpinWheel(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [session, sessionLoading]);

  // Sync from Supabase on Login
  useEffect(() => {
    if (session) {
      const fetchData = async () => {
        try {
          // Fetch Workouts
          const { data: workouts, error: wErr } = await supabase
            .from('workouts')
            .select('*')
            .order('start_time', { ascending: false });

          // Fetch Routines
          const { data: routines, error: rErr } = await supabase
            .from('routines')
            .select('*');

          // Fetch Goals
          const { data: goals, error: gErr } = await supabase
            .from('goals')
            .select('*');

          setUserData(prev => ({
            ...prev,
            workouts: (!wErr && Array.isArray(workouts)) ? workouts : prev.workouts,
            routines: (!rErr && Array.isArray(routines)) ? routines : prev.routines,
            goals: (!gErr && Array.isArray(goals)) ? goals : prev.goals,
          }));
        } catch (e) {
          console.warn('Supabase fetch failed, using local data:', e.message);
        }
      };
      fetchData();
    }
  }, [session]);

  // Load data from LocalStorage (Fallback ONLY if no session)
  useEffect(() => {
    if (!session) {
      try {
        const savedData = localStorage.getItem('titanlog_data');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setUserData(prev => ({
            ...prev,
            ...parsed,
            workouts: Array.isArray(parsed.workouts) ? parsed.workouts : prev.workouts,
            routines: Array.isArray(parsed.routines) ? parsed.routines : prev.routines,
            goals: Array.isArray(parsed.goals) ? parsed.goals : prev.goals,
          }));
        }
      } catch (e) {
        console.error('Failed to load local data:', e);
      }
    }
  }, [session]);

  // Save data to LocalStorage for persistence
  useEffect(() => {
    if (userData.workouts.length > 0 || userData.routines.length > 0) {
      try {
        localStorage.setItem('titanlog_data', JSON.stringify(userData));
      } catch (e) {
        console.warn('Failed to save local data:', e);
      }
    }
  }, [userData]);

  // Show loading spinner while session is being determined
  if (sessionLoading) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <Auth />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard userData={userData} setActiveTab={setActiveTab} />;
      case 'workouts':
        return (
          <WorkoutLogger
            userData={userData}
            setUserData={setUserData}
            setActiveTab={setActiveTab}
            activeRoutine={activeRoutine}
            setActiveRoutine={setActiveRoutine}
            session={session}
          />
        );
      case 'routines':
        return (
          <RoutinePlanner
            userData={userData}
            setUserData={setUserData}
            setActiveTab={setActiveTab}
            setActiveRoutine={setActiveRoutine}
            session={session}
          />
        );
      case 'exercises':
        return <ExerciseLibrary userData={userData} setActiveTab={setActiveTab} />;
      case 'stats':
        return <Analytics userData={userData} setActiveTab={setActiveTab} session={session} />;
      case 'guides':
        return <SplitGuides setActiveTab={setActiveTab} />;
      case 'admin':
        return <Admin />;
      case 'nutrition':
        return <Nutrition userData={userData} setUserData={setUserData} />;
      case 'progress':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <WeightTracker session={session} />
            <GoalManager session={session} userData={userData} onGoalUpdate={() => {}} />
          </div>
        );
      default:
        return <Dashboard userData={userData} setActiveTab={setActiveTab} />;
    }
  };

  const handleSpinWorkout = (exercise) => {
    // Pre-fill workout hint via activeTab navigation
    setActiveTab('workouts');
  };

  return (
    <ErrorBoundary>
      <div className="app-container">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} session={session} />

        {/* Install App Banner */}
        <InstallPrompt />

        {/* Daily Spin Wheel Modal */}
        <AnimatePresence>
          {showSpinWheel && (
            <DailySpinWheel
              onClose={() => setShowSpinWheel(false)}
              onStartWorkout={handleSpinWorkout}
            />
          )}
        </AnimatePresence>

        <main className="main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ErrorBoundary>
                {renderContent()}
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;

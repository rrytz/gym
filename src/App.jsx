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
import Profile from './components/Profile';
import BodyMeasurements from './components/BodyMeasurements';
import WaterIntake from './components/WaterIntake';
import Reminders from './components/Reminders';
import ErrorBoundary from './components/ErrorBoundary';
import DailySpinWheel from './components/DailySpinWheel';
import InstallPrompt from './components/InstallPrompt';
import RestTimer from './components/RestTimer';
import PersonalRecords from './components/PersonalRecords';
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
    gap: '20px',
  }}>
    {/* tropa fit logo */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
      <svg width="52" height="52" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="23" cy="23" r="21" stroke="#C9A84C" strokeWidth="2.5" fill="none" />
        <circle cx="13" cy="23" r="3.5" fill="#C9A84C" />
        <circle cx="23" cy="23" r="3.5" fill="#C9A84C" />
        <circle cx="33" cy="23" r="3.5" fill="#C9A84C" />
      </svg>
      <div>
        <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#F0EDE8', lineHeight: 1, letterSpacing: '-0.01em' }}>tropa</div>
        <div style={{
          fontSize: '1.6rem', fontWeight: '700', color: '#C9A84C', lineHeight: 1.1, letterSpacing: '-0.01em',
          borderBottom: '2px solid #C9A84C', paddingBottom: '2px'
        }}>fit</div>
      </div>
    </div>
    <div style={{
      width: '36px', height: '36px',
      border: '2px solid rgba(201, 168, 76, 0.15)',
      borderTop: '2px solid #C9A84C',
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
      restTimer: 60,
      autoStartRest: true,
      soundEnabled: true
    }
  });

  const [restState, setRestState] = useState({
    isResting: false,
    remaining: 0,
    duration: 60,
    isPaused: false,
    isExpanded: false,
    soundEnabled: true
  });

  // Global Rest Timer Tick Effect
  useEffect(() => {
    let interval = null;
    if (restState.isResting && !restState.isPaused && restState.remaining > 0) {
      interval = setInterval(() => {
        setRestState(prev => {
          if (prev.remaining <= 1) {
            // Timer finished! Play sound if enabled
            if (prev.soundEnabled) {
              try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) {
                  const ctx = new AudioCtx();
                  const playTone = (freq, time, dur) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.frequency.setValueAtTime(freq, time);
                    gain.gain.setValueAtTime(0.15, time);
                    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
                    osc.start(time);
                    osc.stop(time + dur);
                  };
                  const now = ctx.currentTime;
                  playTone(784, now, 0.4);
                  playTone(1046.5, now + 0.15, 0.5);
                }
              } catch (e) {
                console.warn('Audio chime failed:', e);
              }
            }
            return { ...prev, isResting: false, remaining: 0, isExpanded: false };
          }
          return { ...prev, remaining: prev.remaining - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [restState.isResting, restState.isPaused, restState.remaining]);

  const triggerRest = (seconds, options = {}) => {
    const defaultSec = userData.settings?.restTimer || 60;
    const duration = typeof seconds === 'number' ? seconds : defaultSec;
    const autoStart = userData.settings?.autoStartRest !== false;
    const force = options.force === true;
    if (!autoStart && !force) return;

    setRestState(prev => ({
      ...prev,
      isResting: true,
      duration: duration,
      remaining: duration,
      isPaused: false,
      isExpanded: force ? true : true
    }));
  };

  const handleRestPauseToggle = () => {
    setRestState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const handleRestAddSeconds = (secs) => {
    setRestState(prev => ({
      ...prev,
      remaining: Math.min(prev.remaining + secs, 999),
      duration: Math.min(prev.duration + secs, 999)
    }));
  };

  const handleRestPresetSelect = (duration) => {
    setRestState(prev => ({
      ...prev,
      duration: duration,
      remaining: duration,
      isPaused: false
    }));
  };

  const handleRestSoundToggle = () => {
    setRestState(prev => {
      const nextSound = !prev.soundEnabled;
      setUserData(u => ({
        ...u,
        settings: {
          ...u.settings,
          soundEnabled: nextSound
        }
      }));
      return { ...prev, soundEnabled: nextSound };
    });
  };

  const handleRestSkip = () => {
    setRestState(prev => ({ ...prev, isResting: false, remaining: 0, isExpanded: false }));
  };

  // Sync restState.soundEnabled when settings change
  useEffect(() => {
    if (userData.settings && userData.settings.soundEnabled !== undefined) {
      setRestState(prev => ({ ...prev, soundEnabled: userData.settings.soundEnabled }));
    }
  }, [userData.settings?.soundEnabled]);

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
    const lastSpin = localStorage.getItem('tropafit_last_spin') || localStorage.getItem('titanlog_last_spin');
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
        const savedData = localStorage.getItem('tropafit_data') || localStorage.getItem('titanlog_data');
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
        localStorage.setItem('tropafit_data', JSON.stringify(userData));
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
            triggerRest={triggerRest}
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
      case 'records':
        return <PersonalRecords userData={userData} setActiveTab={setActiveTab} />;
      case 'settings':
        return <Settings userData={userData} setUserData={setUserData} />;
      case 'profile':
        return <Profile session={session} />;
      case 'water':
        return <WaterIntake session={session} />;
      case 'reminders':
        return <Reminders session={session} />;
      case 'weekly':
        return <WeeklyProgress session={session} userData={userData} />;
      case 'guides':
        return <SplitGuides setActiveTab={setActiveTab} />;
      case 'admin':
        return <Admin />;
      case 'nutrition':
        return <Nutrition userData={userData} setUserData={setUserData} session={session} />;
      case 'progress':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <WeightTracker session={session} />
            <BodyMeasurements session={session} />
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

        {/* Global Rest Timer Component */}
        <RestTimer
          isResting={restState.isResting}
          remaining={restState.remaining}
          duration={restState.duration}
          isPaused={restState.isPaused}
          soundEnabled={restState.soundEnabled}
          onPauseToggle={handleRestPauseToggle}
          onAddSeconds={handleRestAddSeconds}
          onSkip={handleRestSkip}
          onPresetSelect={handleRestPresetSelect}
          onSoundToggle={handleRestSoundToggle}
          isExpanded={restState.isExpanded}
          setIsExpanded={(val) => setRestState(prev => ({ ...prev, isExpanded: val }))}
        />

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
export default App;

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
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeRoutine, setActiveRoutine] = useState(null);
  const [session, setSession] = useState(null);
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync from Supabase on Login
  useEffect(() => {
    if (session) {
      const fetchData = async () => {
        // Fetch Workouts
        const { data: workouts } = await supabase
          .from('workouts')
          .select('*')
          .order('start_time', { ascending: false });
        
        // Fetch Routines
        const { data: routines } = await supabase
          .from('routines')
          .select('*');

        // Fetch Goals
        const { data: goals } = await supabase
          .from('goals')
          .select('*');

        if (workouts || routines || goals) {
          setUserData(prev => ({
            ...prev,
            workouts: workouts || prev.workouts,
            routines: routines || prev.routines,
            goals: goals || prev.goals
          }));
        }
      };
      fetchData();
    }
  }, [session]);

  // Load data from LocalStorage (Fallback)
  useEffect(() => {
    const savedData = localStorage.getItem('titanlog_data');
    if (savedData) {
      setUserData(JSON.parse(savedData));
    }
  }, []);

  // Save data to LocalStorage
  useEffect(() => {
    localStorage.setItem('titanlog_data', JSON.stringify(userData));
  }, [userData]);

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

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} session={session} />
      
      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;

import React, { useMemo } from 'react';
import { TrendingUp, Trophy, Flame, Calendar, ArrowRight, Sparkles, Target, Zap, Clock, Dumbbell, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { calculatePRsFromWorkouts, getPRsThisWeek } from '../utils/prUtils';

const StatCard = ({ label, value, sub, icon: Icon, trend, trendUp, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className="glass-card"
    style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}
  >
    {Icon && (
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        background: 'rgba(212, 175, 55, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icon size={20} color="#D4AF37" />
      </div>
    )}
    <div className="stat-label" style={{ marginBottom: '8px', fontSize: '0.7rem' }}>{label}</div>
    <div className="stat-value" style={{ fontSize: '2.2rem', marginBottom: '4px' }}>{value}</div>
    {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{sub}</div>}
    {trend && (
      <div style={{
        fontSize: '0.7rem',
        color: trendUp ? '#4cd964' : '#ff3b30',
        marginTop: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontWeight: '600',
      }}>
        {trendUp ? '↑' : '↓'} {trend}
      </div>
    )}
  </motion.div>
);

const ProgressRing = ({ progress, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#D4AF37"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.5s ease',
          }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#D4AF37' }}>{progress}%</div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Done</div>
      </div>
    </div>
  );
};

const Dashboard = ({ userData, setActiveTab }) => {
  const workouts = userData.workouts || [];
  const goals = userData.goals || [];

  const prsThisWeek = useMemo(() => {
    const allPRs = calculatePRsFromWorkouts(workouts);
    const stored = userData.pr || {};
    const merged = { ...allPRs, ...stored };
    return getPRsThisWeek(merged);
  }, [workouts, userData.pr]);

  const getRecommendation = () => {
    if (workouts.length === 0)
      return { 
        title: 'Push Day A', 
        exercises: 7, 
        duration: 60, 
        muscles: 'Chest / Shoulders / Triceps',
        progress: 0 
      };
    const lastTitle = workouts[0]?.title?.toLowerCase() || '';
    if (lastTitle.includes('push') || lastTitle.includes('chest'))
      return { 
        title: 'Pull Day B', 
        exercises: 8, 
        duration: 65, 
        muscles: 'Back / Biceps / Rear Delts',
        progress: 33 
      };
    if (lastTitle.includes('pull') || lastTitle.includes('back'))
      return { 
        title: 'Leg Day A', 
        exercises: 6, 
        duration: 55, 
        muscles: 'Quads / Hamstrings / Glutes',
        progress: 66 
      };
    return { 
      title: 'Push Day A', 
      exercises: 7, 
      duration: 60, 
      muscles: 'Chest / Shoulders / Triceps',
      progress: 0 
    };
  };

  const todayWorkout = getRecommendation();
  const totalVolume = workouts.reduce((acc, w) => acc + (parseFloat(w.volume) || 0), 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const username = userData.settings?.name || 'Tropa';

  const chartData = workouts.length > 0
    ? workouts.slice(0, 7).reverse().map(w => ({
        name: new Date(w.start_time).toLocaleDateString(undefined, { weekday: 'short' }),
        volume: Math.round(parseFloat(w.volume) || 0),
      }))
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(n => ({ name: n, volume: 0 }));

  const streakDays = (() => {
    if (workouts.length === 0) return 0;
    let streak = 0;
    const now = new Date();
    const sorted = [...workouts].sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
    for (let i = 0; i < sorted.length; i++) {
      const d = new Date(sorted[i].start_time);
      const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
      if (diff === i) streak++;
      else break;
    }
    return streak;
  })();

  const customTooltipStyle = {
    background: 'var(--surface-light)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    color: 'var(--text)',
    fontSize: '0.8rem',
    padding: '12px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* ─── Hero Section ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '32px',
          alignItems: 'center',
        }}
      >
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}
          >
            {greeting}, {username} 👋
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{ 
              fontSize: 'clamp(2rem, 5vw, 3rem)', 
              fontWeight: '800', 
              lineHeight: 1.1, 
              letterSpacing: '-0.03em',
              marginBottom: '24px',
            }}
          >
            Today's Workout
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ marginBottom: '24px' }}
          >
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '8px' }}>
              {todayWorkout.title}
            </div>
            <div style={{ display: 'flex', gap: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Dumbbell size={16} /> {todayWorkout.exercises} Exercises
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} /> {todayWorkout.duration} Minutes
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '8px' }}>
              {todayWorkout.muscles}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ display: 'flex', gap: '12px' }}
          >
            <button 
              className="btn-primary" 
              onClick={() => setActiveTab('workouts')}
              style={{ padding: '16px 32px', fontSize: '0.9rem' }}
            >
              <PlayCircle size={18} /> Start Workout
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => setActiveTab('routines')}
              style={{ padding: '16px 24px', fontSize: '0.9rem' }}
            >
              View Plan
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5, type: 'spring' }}
          style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <img 
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&h=300&fit=crop"
            alt="Workout"
            style={{ 
              width: '200px', 
              height: '200px', 
              borderRadius: '50%',
              objectFit: 'cover',
              boxShadow: '0 20px 60px rgba(212, 175, 55, 0.2)',
              border: '4px solid rgba(212, 175, 55, 0.3)',
            }}
          />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <ProgressRing progress={todayWorkout.progress} size={140} strokeWidth={10} />
          </div>
        </motion.div>
      </motion.div>

      {/* ─── Quick Stats ────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <StatCard 
          label="Workout Streak" 
          value={streakDays} 
          sub="days" 
          icon={Flame}
          trend={streakDays > 0 ? 'Active' : 'Start today'}
          trendUp={streakDays > 0}
          index={0}
        />
        <StatCard 
          label="Current Weight" 
          value={userData.settings?.weight || '—'} 
          sub="kg" 
          icon={TrendingUp}
          trend="+2.3%"
          trendUp={true}
          index={1}
        />
        <StatCard 
          label="Personal Records" 
          value={Object.keys(userData.pr || {}).length} 
          sub="total" 
          icon={Trophy}
          trend={prsThisWeek.length > 0 ? `+${prsThisWeek.length} this week` : 'No new PRs'}
          trendUp={prsThisWeek.length > 0}
          index={2}
        />
        <StatCard 
          label="Monthly Progress" 
          value={workouts.length > 0 ? Math.round((workouts.length / 4) * 100) : 0} 
          sub="workouts" 
          icon={Zap}
          trend="On track"
          trendUp={true}
          index={3}
        />
      </div>

      {/* ─── Active Program ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="glass-card"
        style={{ padding: '32px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', fontWeight: '600', marginBottom: '8px' }}>
              Active Program
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>Push Pull Legs Program</h2>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Week 3 of 8
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px' }}>
              Completion
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>37%</div>
          </div>
        </div>
        
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '24px', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '37%' }}
            transition={{ delay: 0.9, duration: 1, ease: 'easeOut' }}
            style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--primary-light))', borderRadius: '2px' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '600' }}>Next Workout</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>Pull Day B</div>
          </div>
          <button 
            className="btn-primary" 
            onClick={() => setActiveTab('workouts')}
            style={{ padding: '12px 24px', fontSize: '0.85rem' }}
          >
            Continue Program
          </button>
        </div>
      </motion.div>

      {/* ─── Progress Analytics ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="glass-card"
        style={{ padding: '32px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Weekly Volume</h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Last 7 days</div>
        </div>
        <div style={{ height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => v > 0 ? `${(v/1000).toFixed(1)}k` : '0'} />
              <Tooltip contentStyle={customTooltipStyle} cursor={{ fill: 'rgba(212, 175, 55, 0.08)' }} />
              <Bar dataKey="volume" fill="url(#goldGradient)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#B8962F" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 768px) {
          .dashboard-main {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;

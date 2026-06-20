import React, { useMemo } from 'react';
import { TrendingUp, Trophy, Flame, Calendar, ArrowRight, Sparkles, Target, Zap } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { calculatePRsFromWorkouts, getPRsThisWeek } from '../utils/prUtils';

const StatCard = ({ label, value, sub }) => (
  <div className="glass-card" style={{ padding: '20px 24px' }}>
    <div className="stat-label" style={{ marginBottom: '8px' }}>{label}</div>
    <div className="stat-value">{value}</div>
    {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>{sub}</div>}
  </div>
);

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
      return { tag: 'AI Pick', title: 'Full body, day one.', desc: 'For a fresh start, a compound full body routine builds your foundation faster than any split. Let\'s begin.' };
    const lastTitle = workouts[0]?.title?.toLowerCase() || '';
    if (lastTitle.includes('push') || lastTitle.includes('chest'))
      return { tag: 'AI Pick', title: 'Pull day incoming.', desc: 'Your push session was solid. Focus on back & biceps to keep things balanced and avoid imbalances.' };
    if (lastTitle.includes('pull') || lastTitle.includes('back'))
      return { tag: 'AI Pick', title: 'Leg day. No excuses.', desc: 'Lower body is calling. Hit squats and deadlifts to boost your overall strength and metabolism.' };
    return { tag: 'AI Pick', title: 'Push day awaits.', desc: 'Chest, shoulders, triceps — let\'s build that pressing power. You\'ve got this.' };
  };

  const rec = getRecommendation();
  const totalVolume = workouts.reduce((acc, w) => acc + (parseFloat(w.volume) || 0), 0);

  const today = new Date();
  const dayName = today.toLocaleDateString(undefined, { weekday: 'long' });
  const dateStr = today.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });

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
    borderRadius: '8px',
    color: 'var(--text)',
    fontSize: '0.8rem',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* ─── Header ────────────────────────────────────────────── */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '6px' }}>
            {dayName.toUpperCase()}, {dateStr.toUpperCase()}
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: '700', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Welcome back,
          </h1>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: '700',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            fontStyle: 'italic',
            color: 'var(--primary)',
          }}>
            Tropa.
          </h1>
        </div>
        <button className="btn-primary" onClick={() => setActiveTab('workouts')}>
          Begin Workout <ArrowRight size={16} />
        </button>
      </header>

      {/* ─── Stat Cards ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px' }}>
        <StatCard label="Sessions" value={workouts.length} sub="total logged" />
        <StatCard label="Volume" value={totalVolume > 0 ? `${(totalVolume / 1000).toFixed(1)}k` : '0kg'} sub="total lifted" />
        <StatCard label="Goals" value={goals.length} sub="in progress" />
        <StatCard label="Avg / Week" value={workouts.length > 0 ? (workouts.length / Math.max(1, Math.ceil(workouts.length / 4))).toFixed(1) : '—'} sub="not enough data" />
      </div>

      {/* ─── Main Content Row ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }} className="dashboard-main">

        {/* Chart + Streak Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Volume Bar Chart */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '20px', color: 'var(--text-muted)' }}>
              Volume this week
            </h3>
            <div style={{ height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-dim)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-dim)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => v > 0 ? `${(v/1000).toFixed(1)}k` : '0'} />
                  <Tooltip contentStyle={customTooltipStyle} cursor={{ fill: 'rgba(201,168,76,0.05)' }} />
                  <Bar dataKey="volume" fill="var(--primary)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Streak + PR Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '20px 24px' }}>
              <div className="stat-label" style={{ marginBottom: '8px' }}>Streak</div>
              <div className="stat-value">{streakDays} days</div>
            </div>
            <div className="glass-card" style={{ padding: '20px 24px' }}>
              <div className="stat-label" style={{ marginBottom: '8px' }}>PR This Week</div>
              <div style={{ fontSize: '1rem', fontWeight: '600', color: prsThisWeek.length > 0 ? 'var(--primary)' : 'var(--text-muted)', marginTop: '4px' }}>
                {prsThisWeek.length > 0
                  ? `${prsThisWeek.length} new ${prsThisWeek.length === 1 ? 'record' : 'records'}`
                  : 'none yet'}
              </div>
            </div>
          </div>
        </div>

        {/* AI Pick + Goal Focus */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* AI Recommendation */}
          <div className="glass-card" style={{
            padding: '24px',
            border: '1px solid rgba(201, 168, 76, 0.25)',
            background: 'rgba(201, 168, 76, 0.04)',
          }}>
            <div style={{
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--primary)',
              fontWeight: '600',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <Sparkles size={12} /> {rec.tag}
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', lineHeight: 1.2, marginBottom: '10px', letterSpacing: '-0.01em' }}>
              {rec.title}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
              {rec.desc}
            </p>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setActiveTab('workouts')}>
              Start this session
            </button>
          </div>

          {/* Goal Focus */}
          <div className="glass-card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: '500' }}>
                Goal Focus
              </span>
              <Target size={14} color="var(--primary)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {goals.length > 0 ? goals.slice(0, 2).map((goal, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.82rem' }}>
                    <span style={{ fontWeight: '500', textTransform: 'capitalize' }}>{goal.type} Goal</span>
                    <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{goal.target_value}{goal.type === 'weight' ? 'kg' : ''}</span>
                  </div>
                  <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '45%', background: 'var(--primary)', borderRadius: '2px' }} />
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-dim)' }}>
                  <p style={{ fontSize: '0.78rem' }}>No active goals.</p>
                </div>
              )}
            </div>
            <button
              className="btn-secondary"
              style={{ width: '100%', marginTop: '16px', justifyContent: 'center', fontSize: '0.78rem' }}
              onClick={() => setActiveTab('progress')}
            >
              + Add a goal
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-main {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;

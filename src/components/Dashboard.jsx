import React from 'react';
import { TrendingUp, Trophy, Clock, Flame, ArrowRight, Calendar, Sparkles, Target } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="glass-card" style={{ padding: '24px', flex: 1, minWidth: '200px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
      <div style={{ 
        padding: '10px', 
        borderRadius: '12px', 
        background: `${color}15`, 
        color: color 
      }}>
        <Icon size={24} />
      </div>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>{label}</span>
    </div>
    <div style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: 'Outfit' }}>{value}</div>
  </div>
);

const Dashboard = ({ userData, setActiveTab }) => {
  const workouts = userData.workouts || [];
  const goals = userData.goals || [];
  
  // Logic for recommendations
  const getRecommendation = () => {
    if (workouts.length === 0) return { title: 'First Workout', desc: 'Start with a Full Body routine to kick things off!', icon: Flame };
    
    const lastWorkout = workouts[0];
    const lastTitle = lastWorkout.title.toLowerCase();
    
    if (lastTitle.includes('push') || lastTitle.includes('chest')) {
      return { title: 'Pull Day', desc: 'Focus on your Back and Biceps today for a balanced physique.', icon: Sparkles };
    } else if (lastTitle.includes('pull') || lastTitle.includes('back')) {
      return { title: 'Leg Day', desc: 'Time to hit the lower body and boost your metabolism.', icon: TrendingUp };
    } else {
      return { title: 'Push Day', desc: 'Let\'s work on Chest, Shoulders, and Triceps today.', icon: Flame };
    }
  };

  const recommendation = getRecommendation();

  // Calculate real stats
  const totalVolume = workouts.reduce((acc, w) => acc + (parseFloat(w.volume) || 0), 0);
  const totalPRs = Object.keys(userData.pr || {}).length;
  
  const chartData = workouts.length > 0 ? workouts.slice(0, 7).reverse().map(w => ({
    name: new Date(w.start_time).toLocaleDateString(undefined, { weekday: 'short' }),
    volume: parseFloat(w.volume) || 0
  })) : [
    { name: 'Mon', volume: 0 }, { name: 'Tue', volume: 0 }, { name: 'Wed', volume: 0 },
    { name: 'Thu', volume: 0 }, { name: 'Fri', volume: 0 }, { name: 'Sat', volume: 0 }, { name: 'Sun', volume: 0 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '4px' }}>Welcome, <span className="neon-text">Titan</span>!</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {workouts.length > 0 
              ? `You've completed ${workouts.length} workouts. Your current trend is positive!` 
              : "Ready to start your fitness journey with AI insights?"}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setActiveTab('workouts')}>
          Start New Workout <ArrowRight size={20} />
        </button>
      </header>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <StatCard icon={Flame} label="Total Workouts" value={workouts.length} color="#FF3B30" />
        <StatCard icon={TrendingUp} label="Total Volume" value={`${(totalVolume/1000).toFixed(1)}k kg`} color="var(--primary)" />
        <StatCard icon={Trophy} label="Active Goals" value={goals.length} color="#BD00FF" />
        <StatCard icon={Calendar} label="Avg/Week" value={workouts.length > 0 ? (workouts.length / 2).toFixed(1) : 0} color="#FFA500" />
      </div>

      {/* AI Recommendation Section */}
      <div className="glass-card animate-fade-in" style={{ padding: '24px', border: '1px solid rgba(0, 242, 254, 0.2)', background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.05) 0%, transparent 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ padding: '12px', background: 'var(--primary)', borderRadius: '15px', color: '#000' }}>
            <recommendation.icon size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Sparkles size={16} className="neon-text" />
              <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>AI Recommendation</span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{recommendation.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '4px 0 0' }}>{recommendation.desc}</p>
          </div>
          <button className="btn-primary" style={{ padding: '10px 20px' }} onClick={() => setActiveTab('workouts')}>Start</button>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="glass-card" style={{ flex: 2, padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Volume Progress (Recent)</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="var(--text-muted)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${(value/1000).toFixed(1)}k`}
                />
                <Tooltip 
                  contentStyle={{ background: 'var(--surface-dark)', border: '1px solid var(--glass-border)', borderRadius: '8px' }} 
                />
                <Area type="monotone" dataKey="volume" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card" style={{ flex: 1, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Goal Focus</h3>
            <Target size={20} color="var(--primary)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {goals.length > 0 ? goals.slice(0, 3).map((goal, i) => (
              <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', textTransform: 'capitalize' }}>{goal.type} Goal</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>{goal.target_value} {goal.type === 'weight' ? 'kg' : ''}</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '45%', background: 'var(--primary)' }} />
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                <p style={{ fontSize: '0.8rem' }}>No active goals. Set one in the Progress tab!</p>
              </div>
            )}
          </div>
          <button 
            className="btn-secondary" 
            style={{ width: '100%', marginTop: '20px', fontSize: '0.9rem' }}
            onClick={() => setActiveTab('progress')}
          >
            Manage Goals
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

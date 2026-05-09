import React, { useState, useEffect } from 'react';
import { Target, Trophy, Plus, TrendingUp, Calendar, Trash2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

const GoalManager = ({ session, userData, onGoalUpdate }) => {
  const [goals, setGoals] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({
    type: 'weight',
    target_value: '',
    target_date: '',
  });

  useEffect(() => {
    if (session) {
      fetchGoals();
    }
  }, [session]);

  const fetchGoals = async () => {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setGoals(data);
    }
  };

  const calculateProgress = (goal) => {
    if (!userData) return 0;

    switch (goal.type) {
      case 'weight':
        // Progress for weight is tricky as it can be losing or gaining.
        // For now, let's assume if current weight is closer to target than start weight was.
        const currentWeight = userData.weightLogs?.[userData.weightLogs.length - 1]?.weight || goal.current_value;
        const startWeight = userData.weightLogs?.[0]?.weight || currentWeight;
        const totalToLose = Math.abs(startWeight - goal.target_value);
        const lostSoFar = Math.abs(startWeight - currentWeight);
        return totalToLose === 0 ? 100 : Math.min(100, (lostSoFar / totalToLose) * 100);

      case 'frequency':
        // Count workouts in the last 7 days vs target
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        const weeklyCount = (userData.workouts || []).filter(w => new Date(w.start_time) > last7Days).length;
        return Math.min(100, (weeklyCount / goal.target_value) * 100);

      case 'strength':
        // Current PR vs target
        return Math.min(100, (goal.current_value / goal.target_value) * 100);

      default:
        return 0;
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('goals')
      .insert([{
        user_id: session.user.id,
        type: newGoal.type,
        target_value: parseFloat(newGoal.target_value),
        target_date: newGoal.target_date,
        current_value: 0,
      }])
      .select();

    if (!error) {
      setGoals([data[0], ...goals]);
      setIsAdding(false);
      setNewGoal({ type: 'weight', target_value: '', target_date: '' });
      if (onGoalUpdate) onGoalUpdate();
    }
  };

  const deleteGoal = async (id) => {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (!error) {
      setGoals(goals.filter(g => g.id !== id));
    }
  };

  const getProgressColor = (type) => {
    switch (type) {
      case 'weight': return 'var(--primary)';
      case 'strength': return 'var(--secondary)';
      default: return '#4ade80';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Target className="neon-text" size={24} />
          <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Goal <span className="neon-text">Management</span></h3>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => setIsAdding(!isAdding)}
          style={{ padding: '8px 16px', fontSize: '0.9rem' }}
        >
          {isAdding ? 'Cancel' : <><Plus size={18} /> New Goal</>}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddGoal} className="glass-card animate-fade-in" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Goal Type</label>
            <select 
              value={newGoal.type}
              onChange={(e) => setNewGoal({...newGoal, type: e.target.value})}
              style={{ width: '100%', background: 'var(--surface-light)', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', color: '#fff' }}
            >
              <option value="weight">Body Weight (kg)</option>
              <option value="strength">Strength (Max Lift)</option>
              <option value="frequency">Weekly Workouts</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Target Value</label>
            <input 
              type="number" 
              required
              step="0.1"
              value={newGoal.target_value}
              onChange={(e) => setNewGoal({...newGoal, target_value: e.target.value})}
              style={{ width: '100%', background: 'var(--surface-light)', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', color: '#fff' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Target Date</label>
            <input 
              type="date" 
              required
              value={newGoal.target_date}
              onChange={(e) => setNewGoal({...newGoal, target_date: e.target.value})}
              style={{ width: '100%', background: 'var(--surface-light)', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', color: '#fff' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Set Goal</button>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {goals.map((goal) => {
          const progress = calculateProgress(goal);
          return (
            <div key={goal.id} className="glass-card" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                    {goal.type === 'weight' ? <TrendingUp size={20} color="var(--primary)" /> : <Trophy size={20} color="var(--secondary)" />}
                  </div>
                  <div>
                    <h4 style={{ textTransform: 'capitalize', marginBottom: '2px' }}>{goal.type} Goal</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: {goal.target_value} {goal.type === 'weight' ? 'kg' : ''}</span>
                  </div>
                </div>
                <button 
                  onClick={() => deleteGoal(goal.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '5px' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                  <span style={{ fontWeight: 'bold' }}>{Math.round(progress)}%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${progress}%`, 
                      background: `linear-gradient(90deg, ${getProgressColor(goal.type)}, #fff)`,
                      boxShadow: `0 0 10px ${getProgressColor(goal.type)}`
                    }} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <Calendar size={14} />
                Deadline: {new Date(goal.target_date).toLocaleDateString()}
              </div>
            </div>
          );
        })}
        {goals.length === 0 && !isAdding && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed var(--border)' }}>
            <Target size={40} style={{ opacity: 0.2, marginBottom: '10px' }} />
            <p style={{ color: 'var(--text-muted)' }}>No active goals. Set one to start tracking!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalManager;

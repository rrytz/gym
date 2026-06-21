import React, { useState, useEffect } from 'react';
import { Droplets, Plus, TrendingUp, Calendar, Target, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

const WaterIntake = ({ session }) => {
  const [intakeLogs, setIntakeLogs] = useState([]);
  const [dailyGoal, setDailyGoal] = useState(3000);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('today'); // 'today', 'weekly', 'monthly'
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (session) {
      fetchWaterData();
    }
  }, [session]);

  const fetchWaterData = async () => {
    try {
      // Fetch today's intake logs
      const today = new Date().toISOString().split('T')[0];
      const { data: logs, error: logsError } = await supabase
        .from('water_intake_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('log_date', today)
        .order('log_time', { ascending: false });

      if (logsError) throw logsError;
      setIntakeLogs(logs || []);

      // Fetch daily goal
      const { data: goal, error: goalError } = await supabase
        .from('water_goals')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (goalError) {
        console.error('Error fetching water goal:', goalError);
      }

      if (goal) {
        setDailyGoal(goal.daily_goal_ml);
      }

      // Calculate streak
      await calculateStreak();
    } catch (error) {
      console.error('Error fetching water data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = async () => {
    try {
      const { data, error } = await supabase
        .from('water_intake_logs')
        .select('log_date')
        .eq('user_id', session.user.id);

      if (error) throw error;

      const dates = [...new Set(data.map(log => log.log_date))].sort((a, b) => new Date(b) - new Date(a));
      let currentStreak = 0;
      const today = new Date().toISOString().split('T')[0];

      for (let i = 0; i < dates.length; i++) {
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        const expectedDateStr = expectedDate.toISOString().split('T')[0];

        if (dates.includes(expectedDateStr)) {
          currentStreak++;
        } else {
          break;
        }
      }

      setStreak(currentStreak);
    } catch (error) {
      console.error('Error calculating streak:', error);
    }
  };

  const addWaterIntake = async (amount) => {
    try {
      const { error } = await supabase
        .from('water_intake_logs')
        .insert([{
          user_id: session.user.id,
          amount_ml: amount,
          log_date: new Date().toISOString().split('T')[0],
          log_time: new Date().toTimeString().slice(0, 5)
        }]);

      if (error) throw error;

      fetchWaterData();
    } catch (error) {
      console.error('Error adding water intake:', error);
      alert('Failed to add water intake. Please try again.');
    }
  };

  const updateDailyGoal = async (newGoal) => {
    try {
      const { error } = await supabase
        .from('water_goals')
        .upsert({
          user_id: session.user.id,
          daily_goal_ml: newGoal
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      setDailyGoal(newGoal);
    } catch (error) {
      console.error('Error updating water goal:', error);
      alert('Failed to update daily goal. Please try again.');
    }
  };

  const getTodayTotal = () => {
    return intakeLogs.reduce((sum, log) => sum + log.amount_ml, 0);
  };

  const getProgress = () => {
    const total = getTodayTotal();
    return Math.min(100, (total / dailyGoal) * 100);
  };

  const getWeeklyData = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);

      const { data, error } = await supabase
        .from('water_intake_logs')
        .select('log_date, amount_ml')
        .eq('user_id', session.user.id)
        .gte('log_date', startDate.toISOString().split('T')[0])
        .lte('log_date', endDate.toISOString().split('T')[0]);

      if (error) throw error;

      const dailyTotals = {};
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyTotals[dateStr] = 0;
      }

      data.forEach(log => {
        if (dailyTotals[log.log_date] !== undefined) {
          dailyTotals[log.log_date] += log.amount_ml;
        }
      });

      return Object.entries(dailyTotals).map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
        amount: Math.round(amount / 1000 * 10) / 10, // Convert to liters
        goal: dailyGoal / 1000
      }));
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      return [];
    }
  };

  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    if (session && viewMode === 'weekly') {
      getWeeklyData().then(setWeeklyData);
    }
  }, [session, viewMode]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading water intake data...</div>
      </div>
    );
  }

  const todayTotal = getTodayTotal();
  const progress = getProgress();
  const remaining = Math.max(0, dailyGoal - todayTotal);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Water Intake</h2>
          <p style={{ color: 'var(--text-muted)' }}>Stay hydrated and track your daily water consumption.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={() => setViewMode('today')} style={{ 
            background: viewMode === 'today' ? 'var(--primary)' : 'transparent',
            color: viewMode === 'today' ? '#141210' : 'var(--text)'
          }}>
            Today
          </button>
          <button className="btn-secondary" onClick={() => setViewMode('weekly')} style={{ 
            background: viewMode === 'weekly' ? 'var(--primary)' : 'transparent',
            color: viewMode === 'weekly' ? '#141210' : 'var(--text)'
          }}>
            Weekly
          </button>
        </div>
      </header>

      {viewMode === 'today' ? (
        <>
          {/* Main Progress Card */}
          <div className="glass-card floating" style={{ padding: '32px', textAlign: 'center', border: '1px solid var(--primary-glow)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'conic-gradient(var(--primary) 0%, var(--primary) ' + progress + '%, rgba(255,255,255,0.1) ' + progress + '%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <div style={{
                  width: '130px',
                  height: '130px',
                  borderRadius: '50%',
                  background: 'var(--surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'absolute',
                  flexDirection: 'column'
                }}>
                  <Droplets size={32} color="var(--primary)" />
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)', marginTop: '8px' }}>
                    {Math.round(todayTotal / 1000 * 10) / 10}L
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    of {dailyGoal / 1000}L
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '24px' }}>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Remaining</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>{Math.round(remaining / 1000 * 10) / 10}L</p>
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Streak</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#4cd964' }}>{streak} days</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {[250, 500, 750, 1000].map(amount => (
                <button
                  key={amount}
                  className="btn-primary"
                  onClick={() => addWaterIntake(amount)}
                  style={{ padding: '12px 24px', fontSize: '1rem' }}
                >
                  +{amount}ml
                </button>
              ))}
              <button
                className="btn-secondary"
                onClick={() => {
                  const customAmount = prompt('Enter custom amount (ml):');
                  if (customAmount && !isNaN(customAmount)) {
                    addWaterIntake(parseInt(customAmount));
                  }
                }}
                style={{ padding: '12px 24px', fontSize: '1rem' }}
              >
                Custom
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
              <Target size={24} color="var(--primary)" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Daily Goal</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{dailyGoal / 1000}L</h3>
              <button
                className="btn-secondary"
                onClick={() => {
                  const newGoal = prompt('Enter new daily goal (ml):', dailyGoal);
                  if (newGoal && !isNaN(newGoal)) {
                    updateDailyGoal(parseInt(newGoal));
                  }
                }}
                style={{ marginTop: '12px', padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Update Goal
              </button>
            </div>
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
              <Flame size={24} color="#ff9500" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Progress</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{Math.round(progress)}%</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                {progress >= 100 ? 'Goal reached! 🎉' : 'Keep going!'}
              </p>
            </div>
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
              <TrendingUp size={24} color="#4cd964" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Today's Logs</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{intakeLogs.length}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                {intakeLogs.length > 0 ? 'entries' : 'No entries yet'}
              </p>
            </div>
          </div>

          {/* Today's Logs */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} color="var(--primary)" /> Today's Logs
            </h3>
            {intakeLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                No water intake logged today. Start tracking!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {intakeLogs.map(log => (
                  <div key={log.id} style={{
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.9rem' }}>{log.log_time}</span>
                    <span style={{ fontWeight: '600', color: 'var(--primary)' }}>+{log.amount_ml}ml</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Weekly View */
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Weekly Water Intake</h3>
          <div style={{ height: '300px' }}>
            {weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'var(--surface)', 
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="amount" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="goal" stroke="#4cd964" strokeWidth={2} strokeDasharray="5 5" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                color: 'var(--text-muted)'
              }}>
                No weekly data available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WaterIntake;

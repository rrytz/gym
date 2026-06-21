import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Trophy, Flame, Droplets, Scale, Download, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

const WeeklyProgress = ({ session, userData }) => {
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [weeklyData, setWeeklyData] = useState(null);

  useEffect(() => {
    if (session) {
      fetchWeeklyData();
    }
  }, [session, currentWeekStart]);

  const getWeekRange = (date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  };

  const fetchWeeklyData = async () => {
    try {
      const { start, end } = getWeekRange(currentWeekStart);
      const startDateStr = start.toISOString().split('T')[0];
      const endDateStr = end.toISOString().split('T')[0];

      // Fetch workouts for the week
      const { data: workouts, error: wErr } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('start_time', startDateStr)
        .lte('start_time', endDateStr + 'T23:59:59');

      // Fetch weight logs
      const { data: weightLogs, error: wlErr } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('log_date', startDateStr)
        .lte('log_date', endDateStr);

      // Fetch water intake
      const { data: waterLogs, error: waterErr } = await supabase
        .from('water_intake_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('log_date', startDateStr)
        .lte('log_date', endDateStr);

      // Fetch meals
      const { data: meals, error: mErr } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('meal_date', startDateStr)
        .lte('meal_date', endDateStr);

      // Calculate weekly stats with null checks
      const totalWorkouts = workouts?.length || 0;
      const totalSets = workouts?.reduce((sum, w) => {
        if (!w.exercises) return sum;
        return sum + w.exercises.reduce((exSum, ex) => {
          if (!ex.sets) return exSum;
          return exSum + ex.sets.filter(s => s.completed).length;
        }, 0);
      }, 0) || 0;

      const totalReps = workouts?.reduce((sum, w) => {
        if (!w.exercises) return sum;
        return sum + w.exercises.reduce((exSum, ex) => {
          if (!ex.sets) return exSum;
          return exSum + ex.sets.reduce((setSum, s) => {
            if (!s.completed) return setSum;
            return setSum + (parseInt(s.reps) || 0);
          }, 0);
        }, 0);
      }, 0) || 0;

      const totalVolume = workouts?.reduce((sum, w) => sum + (parseFloat(w.volume) || 0), 0) || 0;

      const totalCalories = meals?.reduce((sum, m) => sum + (parseFloat(m.calories) || 0), 0) || 0;
      const avgDailyCalories = meals?.length > 0 ? Math.round(totalCalories / 7) : 0;

      const totalWater = waterLogs?.reduce((sum, w) => sum + (w.amount_ml || 0), 0) || 0;
      const avgDailyWater = totalWater / 1000; // Convert to liters

      const weightChange = weightLogs?.length >= 2 
        ? (weightLogs[weightLogs.length - 1].weight - weightLogs[0].weight).toFixed(1)
        : null;

      // Calculate workout streak
      let workoutStreak = 0;
      const workoutDates = workouts?.map(w => new Date(w.start_time).toDateString()) || [];
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(end);
        checkDate.setDate(checkDate.getDate() - i);
        if (workoutDates.includes(checkDate.toDateString())) {
          workoutStreak++;
        } else {
          break;
        }
      }

      // Generate daily chart data
      const dailyData = [];
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(start);
        dayDate.setDate(start.getDate() + i);
        const dayStr = dayDate.toISOString().split('T')[0];
        
        const dayWorkouts = workouts?.filter(w => w.start_time.startsWith(dayStr)) || [];
        const dayWater = waterLogs?.filter(w => w.log_date === dayStr).reduce((sum, w) => sum + w.amount_ml, 0) || 0;
        const dayCalories = meals?.filter(m => m.meal_date === dayStr).reduce((sum, m) => sum + m.calories, 0) || 0;

        dailyData.push({
          day: dayDate.toLocaleDateString('en-US', { weekday: 'short' }),
          workouts: dayWorkouts.length,
          water: Math.round(dayWater / 1000 * 10) / 10,
          calories: dayCalories
        });
      }

      setWeeklyData({
        totalWorkouts,
        totalSets,
        totalReps,
        totalVolume: Math.round(totalVolume),
        avgDailyCalories,
        avgDailyWater: Math.round(avgDailyWater * 10) / 10,
        weightChange,
        workoutStreak,
        dailyData,
        weekRange: { start, end }
      });
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      setWeeklyData({
        totalWorkouts: 0,
        totalSets: 0,
        totalReps: 0,
        totalVolume: 0,
        avgDailyCalories: 0,
        avgDailyWater: 0,
        weightChange: null,
        workoutStreak: 0,
        dailyData: [],
        weekRange: { start: new Date(), end: new Date() }
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newDate);
  };

  const exportReport = () => {
    if (!weeklyData) return;
    
    const reportText = `
TropaFit Weekly Progress Report
Week of ${weeklyData.weekRange.start.toLocaleDateString()} - ${weeklyData.weekRange.end.toLocaleDateString()}

SUMMARY
========
Workouts Completed: ${weeklyData.totalWorkouts}
Total Sets: ${weeklyData.totalSets}
Total Reps: ${weeklyData.totalReps}
Total Volume: ${weeklyData.totalVolume} kg
Average Daily Calories: ${weeklyData.avgDailyCalories} kcal
Average Daily Water: ${weeklyData.avgDailyWater} L
Weight Change: ${weeklyData.weightChange ? weeklyData.weightChange + ' kg' : 'N/A'}
Workout Streak: ${weeklyData.workoutStreak} days

DAILY BREAKDOWN
===============
${weeklyData.dailyData.map(d => 
  `${d.day}: ${d.workouts} workouts, ${d.water}L water, ${d.calories} kcal`
).join('\n')}

Generated by TropaFit
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tropafit-weekly-report-${weeklyData.weekRange.start.toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading weekly progress...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Weekly Progress</h2>
          <p style={{ color: 'var(--text-muted)' }}>Review your weekly performance and track your progress.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="btn-secondary" onClick={() => navigateWeek('prev')}>
            <ChevronLeft size={20} />
          </button>
          <span style={{ fontSize: '1rem', fontWeight: '600', minWidth: '200px', textAlign: 'center' }}>
            {weeklyData?.weekRange.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weeklyData?.weekRange.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <button className="btn-secondary" onClick={() => navigateWeek('next')}>
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <Trophy size={24} color="var(--primary)" style={{ marginBottom: '12px' }} />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Workouts</p>
          <h3 style={{ fontSize: '2rem', fontWeight: '800' }}>{weeklyData?.totalWorkouts || 0}</h3>
        </div>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <TrendingUp size={24} color="#4cd964" style={{ marginBottom: '12px' }} />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Volume</p>
          <h3 style={{ fontSize: '2rem', fontWeight: '800' }}>{weeklyData?.totalVolume || 0}kg</h3>
        </div>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <Flame size={24} color="#ff9500" style={{ marginBottom: '12px' }} />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Avg Calories</p>
          <h3 style={{ fontSize: '2rem', fontWeight: '800' }}>{weeklyData?.avgDailyCalories || 0}</h3>
        </div>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <Droplets size={24} color="#007AFF" style={{ marginBottom: '12px' }} />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Avg Water</p>
          <h3 style={{ fontSize: '2rem', fontWeight: '800' }}>{weeklyData?.avgDailyWater || 0}L</h3>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Weekly Statistics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Sets</p>
            <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>{weeklyData?.totalSets || 0}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Reps</p>
            <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>{weeklyData?.totalReps || 0}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Weight Change</p>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: weeklyData?.weightChange >= 0 ? '#4cd964' : '#ff3b30' }}>
              {weeklyData?.weightChange ? `${weeklyData.weightChange} kg` : 'N/A'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Workout Streak</p>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#D4AF37' }}>{weeklyData?.workoutStreak || 0} days</p>
          </div>
        </div>
      </div>

      {/* Daily Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Daily Workouts</h3>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData?.dailyData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="day" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--surface)', 
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="workouts" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Daily Water Intake</h3>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData?.dailyData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="day" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--surface)', 
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="water" stroke="#007AFF" strokeWidth={2} dot={{ fill: '#007AFF' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button className="btn-secondary" onClick={exportReport}>
          <Download size={18} /> Export Report
        </button>
        <button className="btn-secondary" onClick={() => {
          if (navigator.share) {
            navigator.share({
              title: 'TropaFit Weekly Progress',
              text: `I completed ${weeklyData?.totalWorkouts} workouts this week! 💪`,
              url: window.location.href
            });
          } else {
            alert('Sharing is not supported on this browser');
          }
        }}>
          <Share2 size={18} /> Share Progress
        </button>
      </div>
    </div>
  );
};

export default WeeklyProgress;

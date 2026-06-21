import React, { useState, useMemo, useEffect } from 'react';
import { Trophy, Search, Calendar, ChevronRight, BarChart2, Star, Sparkles, TrendingUp, X, ArrowUp, ArrowDown, Medal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { calculatePRsFromWorkouts } from '../utils/prUtils';
import { supabase } from '../supabaseClient';

const PersonalRecords = ({ userData, setActiveTab, session }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [historyModalEx, setHistoryModalEx] = useState(null);
  const [dbPRs, setDbPRs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchPersonalRecords();
    }
  }, [session]);

  const fetchPersonalRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('personal_records')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_active', true);

      if (error) throw error;

      // Convert database format to component format
      const prMap = {};
      data.forEach(pr => {
        prMap[pr.exercise_name] = {
          name: pr.exercise_name,
          muscle: pr.muscle_group,
          maxWeight: pr.max_weight,
          maxReps: pr.max_reps,
          maxEst1RM: pr.max_est_1rm,
          date: new Date(pr.achieved_date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          rawDate: pr.achieved_date,
          workoutTitle: pr.workout_title || 'Workout',
          history: [],
          id: pr.id
        };
      });

      setDbPRs(prMap);
    } catch (error) {
      console.error('Error fetching personal records:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePersonalRecord = async (prData) => {
    try {
      const { error } = await supabase
        .from('personal_records')
        .upsert({
          user_id: session.user.id,
          exercise_name: prData.name,
          muscle_group: prData.muscle,
          max_weight: prData.maxWeight,
          max_reps: prData.maxReps,
          max_est_1rm: prData.maxEst1RM,
          achieved_date: prData.rawDate,
          workout_title: prData.workout_title,
          is_active: true
        }, {
          onConflict: 'user_id,exercise_name'
        });

      if (error) throw error;
      fetchPersonalRecords();
    } catch (error) {
      console.error('Error saving personal record:', error);
    }
  };

  const prs = useMemo(() => {
    const fromWorkouts = calculatePRsFromWorkouts(userData?.workouts);
    const stored = userData?.pr || {};
    // Merge: DB PRs take priority, then stored PRs, then workout-calculated PRs
    return { ...fromWorkouts, ...stored, ...dbPRs };
  }, [userData, dbPRs]);

  // Unique muscles available
  const muscleGroups = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

  // Filtered PR list with improvement calculation
  const filteredPRs = useMemo(() => {
    return Object.values(prs).map(pr => {
      // Calculate improvement from previous PR
      const history = pr.history || [];
      const previousPR = history.length > 1 ? history[history.length - 2] : null;
      const improvement = previousPR 
        ? ((pr.maxWeight - previousPR.weight) / previousPR.weight * 100).toFixed(1)
        : null;

      return {
        ...pr,
        previousPR,
        improvement,
      };
    }).filter(pr => {
      const matchesSearch = pr.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMuscle = selectedMuscle === 'All' || pr.muscle === selectedMuscle;
      return matchesSearch && matchesMuscle;
    }).sort((a, b) => b.maxWeight - a.maxWeight);
  }, [prs, searchQuery, selectedMuscle]);

  // Overall PR highlights
  const highlights = useMemo(() => {
    const list = Object.values(prs);
    if (list.length === 0) return { count: 0, heaviest: '—', latest: '—', improvement: '—' };

    const sortedByWeight = [...list].sort((a, b) => b.maxWeight - a.maxWeight);
    const sortedByDate = [...list].sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));

    // Calculate total improvement
    let totalImprovement = 0;
    let improvementCount = 0;
    list.forEach(pr => {
      const history = pr.history || [];
      if (history.length > 1) {
        const previous = history[history.length - 2];
        const improvement = ((pr.maxWeight - previous.weight) / previous.weight * 100);
        totalImprovement += improvement;
        improvementCount++;
      }
    });
    const avgImprovement = improvementCount > 0 ? (totalImprovement / improvementCount).toFixed(1) : '—';

    return {
      count: list.length,
      heaviest: `${sortedByWeight[0].maxWeight}kg (${sortedByWeight[0].name})`,
      latest: `${sortedByDate[0].name} (${sortedByDate[0].date})`,
      improvement: avgImprovement
    };
  }, [prs]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Personal Records
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Track your strength achievements and celebrate your progress
          </p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => setActiveTab('workouts')}
          style={{ padding: '14px 28px', fontSize: '0.85rem' }}
        >
          <Trophy size={18} /> Log Workout
        </button>
      </header>

      {/* Highlights Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '56px', 
            height: '56px', 
            borderRadius: '14px', 
            background: 'rgba(212, 175, 55, 0.12)', 
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            <img 
              src="https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=100&h=100&fit=crop"
              alt="Trophy"
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement.innerHTML = '';
                const icon = document.createElement('div');
                icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>';
                icon.style.color = 'var(--primary)';
                e.currentTarget.parentElement.appendChild(icon);
              }}
            />
          </div>
          <div>
            <div className="stat-label">Total PRs</div>
            <div className="stat-value" style={{ fontSize: '2rem', color: 'var(--primary)' }}>{highlights.count}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '56px', 
            height: '56px', 
            borderRadius: '14px', 
            background: 'rgba(212, 175, 55, 0.12)', 
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            <img 
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop"
              alt="Trending"
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement.innerHTML = '';
                const icon = document.createElement('div');
                icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>';
                icon.style.color = 'var(--primary)';
                e.currentTarget.parentElement.appendChild(icon);
              }}
            />
          </div>
          <div>
            <div className="stat-label">Avg Improvement</div>
            <div className="stat-value" style={{ fontSize: '1.5rem', color: 'var(--text)', marginTop: '4px' }}>
              {highlights.improvement !== '—' ? `+${highlights.improvement}%` : '—'}
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '56px', 
            height: '56px', 
            borderRadius: '14px', 
            background: 'rgba(212, 175, 55, 0.12)', 
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            <img 
              src="https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=100&h=100&fit=crop"
              alt="Medal"
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement.innerHTML = '';
                const icon = document.createElement('div');
                icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>';
                icon.style.color = 'var(--primary)';
                e.currentTarget.parentElement.appendChild(icon);
              }}
            />
          </div>
          <div>
            <div className="stat-label">Heaviest Lift</div>
            <div className="stat-value" style={{ fontSize: '1.1rem', fontWeight: '700', marginTop: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }} title={highlights.heaviest}>
              {highlights.heaviest}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ position: 'relative', width: '100%', marginBottom: '20px' }}>
          <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search exercise records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--surface-light)',
              border: '1px solid var(--glass-border)',
              padding: '14px 16px 14px 52px',
              borderRadius: '12px',
              color: 'var(--text)',
              outline: 'none',
              fontSize: '0.95rem',
              transition: 'all 0.3s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--glass-border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Muscle group selectors */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {muscleGroups.map(muscle => (
            <button
              key={muscle}
              onClick={() => setSelectedMuscle(muscle)}
              style={{
                background: selectedMuscle === muscle ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.04)',
                color: selectedMuscle === muscle ? 'var(--primary)' : 'var(--text-muted)',
                border: selectedMuscle === muscle ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid transparent',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (selectedMuscle !== muscle) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = 'var(--text)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedMuscle !== muscle) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              {muscle}
            </button>
          ))}
        </div>
      </div>

      {/* PR Cards Grid */}
      {filteredPRs.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredPRs.map((pr) => (
            <motion.div
              layout
              key={pr.name}
              className="glass-card"
              style={{
                padding: '0',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid var(--glass-border)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--glass-border)';
              }}
            >
              {/* Header with muscle badge */}
              <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(212, 175, 55, 0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Star size={20} fill="var(--primary)" color="var(--primary)" />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={pr.name}>
                      {pr.name}
                    </h3>
                  </div>
                  <span style={{
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    background: 'rgba(212, 175, 55, 0.15)',
                    color: 'var(--primary)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontWeight: '600'
                  }}>
                    {pr.muscle}
                  </span>
                </div>
              </div>

              {/* Current PR */}
              <div style={{ padding: '20px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px' }}>
                    Current PR
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text)', lineHeight: 1 }}>
                      {pr.maxWeight}
                    </span>
                    <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>kg</span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '600' }}>
                      × {pr.maxReps}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Est. 1RM: <span style={{ color: 'var(--text)', fontWeight: '600' }}>{pr.maxEst1RM}kg</span>
                  </div>
                </div>

                {/* Previous PR & Improvement */}
                {pr.previousPR && (
                  <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '6px' }}>
                      Previous PR
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text)' }}>
                        {pr.previousPR.weight}kg × {pr.previousPR.reps}
                      </span>
                      {pr.improvement && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: parseFloat(pr.improvement) > 0 ? 'rgba(76, 217, 100, 0.15)' : 'rgba(255, 59, 48, 0.15)',
                          color: parseFloat(pr.improvement) > 0 ? '#4cd964' : '#ff3b30',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                        }}>
                          {parseFloat(pr.improvement) > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                          {Math.abs(pr.improvement)}%
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  <Calendar size={14} />
                  <span>{pr.date}</span>
                </div>

                {/* View History Button */}
                {pr.history?.length > 0 && (
                  <button
                    onClick={() => setHistoryModalEx(pr)}
                    className="btn-secondary"
                    style={{
                      padding: '10px 16px',
                      fontSize: '0.85rem',
                      justifyContent: 'center',
                      gap: '6px',
                      width: '100%'
                    }}
                  >
                    <BarChart2 size={16} /> View History <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '80px 40px', textAlign: 'center' }}>
          <Trophy size={64} color="var(--text-dim)" style={{ marginBottom: '20px', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>No Records Found</h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 24px auto' }}>
            {searchQuery || selectedMuscle !== 'All' 
              ? "We couldn't find any PRs matching your query. Try clearing the search or choosing another muscle."
              : "Log your first workout to start tracking your personal records!"}
          </p>
          {(searchQuery || selectedMuscle !== 'All') && (
            <button 
              className="btn-secondary" 
              onClick={() => { setSearchQuery(''); setSelectedMuscle('All'); }}
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* ─── Progression Chart Modal ──────────────────────────── */}
      <AnimatePresence>
        {historyModalEx && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(12px)',
              zIndex: 9010,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setHistoryModalEx(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="glass-card"
              style={{
                width: '100%',
                maxWidth: '600px',
                padding: '32px',
                background: 'var(--surface)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                position: 'relative'
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setHistoryModalEx(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
              >
                <X size={16} />
              </button>

              {/* Title info */}
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Progress Report
                </span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px', color: 'var(--text)' }}>
                  {historyModalEx.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {historyModalEx.history.length} logged sessions
                </p>
              </div>

              {/* Chart container */}
              <div style={{ width: '100%', height: '280px', marginBottom: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '16px 12px 10px 0', border: '1px solid var(--glass-border)' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyModalEx.history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="var(--text-muted)" 
                      fontSize={11} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="var(--text-muted)" 
                      fontSize={11} 
                      tickLine={false}
                      axisLine={false}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip 
                      contentStyle={{ background: 'var(--surface-light)', border: '1px solid var(--glass-border)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text)' }}
                      labelStyle={{ color: 'var(--text-muted)', fontWeight: '600' }}
                      cursor={{ fill: 'rgba(212, 175, 55, 0.08)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      name="Lift Weight (kg)" 
                      stroke="var(--primary)" 
                      strokeWidth={3}
                      activeDot={{ r: 8, fill: 'var(--primary)', stroke: '#0A0A0A', strokeWidth: 2 }}
                      dot={{ stroke: 'var(--primary)', strokeWidth: 2, r: 4, fill: '#0A0A0A' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="est1RM" 
                      name="Est. 1RM (kg)" 
                      stroke="rgba(255,255,255,0.3)" 
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* History list */}
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--glass-border)', borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)', textAlign: 'left', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px 16px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>Date</th>
                      <th style={{ padding: '12px 16px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>Workout</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>Best Set</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>Est. 1RM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...historyModalEx.history].reverse().map((entry, i) => (
                      <tr key={i} style={{ borderBottom: i < historyModalEx.history.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{entry.date}</td>
                        <td style={{ padding: '12px 16px', fontWeight: '500', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={entry.workoutTitle}>
                          {entry.workoutTitle}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '700', color: 'var(--primary)' }}>
                          {entry.weight}kg × {entry.reps}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600' }}>
                          {entry.est1RM}kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PersonalRecords;

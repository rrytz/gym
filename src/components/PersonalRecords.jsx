import React, { useState, useMemo } from 'react';
import { Trophy, Search, Calendar, ChevronRight, BarChart2, Star, Sparkles, TrendingUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { calculatePRsFromWorkouts } from '../utils/prUtils';

const PersonalRecords = ({ userData, setActiveTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [historyModalEx, setHistoryModalEx] = useState(null);

  const prs = useMemo(() => {
    const fromWorkouts = calculatePRsFromWorkouts(userData?.workouts);
    const stored = userData?.pr || {};
    return { ...fromWorkouts, ...stored };
  }, [userData]);

  // Unique muscles available
  const muscleGroups = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

  // Filtered PR list
  const filteredPRs = useMemo(() => {
    return Object.values(prs).filter(pr => {
      const matchesSearch = pr.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMuscle = selectedMuscle === 'All' || pr.muscle === selectedMuscle;
      return matchesSearch && matchesMuscle;
    }).sort((a, b) => b.maxWeight - a.maxWeight); // Sort heaviest first
  }, [prs, searchQuery, selectedMuscle]);

  // Overall PR highlights
  const highlights = useMemo(() => {
    const list = Object.values(prs);
    if (list.length === 0) return { count: 0, heaviest: '—', latest: '—' };

    const sortedByWeight = [...list].sort((a, b) => b.maxWeight - a.maxWeight);
    const sortedByDate = [...list].sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));

    return {
      count: list.length,
      heaviest: `${sortedByWeight[0].maxWeight}kg (${sortedByWeight[0].name})`,
      latest: `${sortedByDate[0].name} (${sortedByDate[0].date})`
    };
  }, [prs]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Personal <span style={{ color: 'var(--primary)' }}>Records</span></h2>
          <p style={{ color: 'var(--text-muted)' }}>Celebrate your strength achievements and track lifetime PRs.</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => setActiveTab('workouts')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Trophy size={16} /> Log New Session
        </button>
      </header>

      {/* Highlights Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(201, 168, 76, 0.1)', color: 'var(--primary)' }}>
            <Trophy size={26} />
          </div>
          <div>
            <div className="stat-label">Total PRs</div>
            <div className="stat-value" style={{ fontSize: '1.8rem', color: 'var(--primary)' }}>{highlights.count}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(201, 168, 76, 0.1)', color: 'var(--primary)' }}>
            <TrendingUp size={26} />
          </div>
          <div>
            <div className="stat-label">Heaviest Lift</div>
            <div className="stat-value" style={{ fontSize: '0.95rem', fontWeight: '800', marginTop: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }} title={highlights.heaviest}>
              {highlights.heaviest}
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(201, 168, 76, 0.1)', color: 'var(--primary)' }}>
            <Sparkles size={26} />
          </div>
          <div>
            <div className="stat-label">Latest Achievement</div>
            <div className="stat-value" style={{ fontSize: '0.95rem', fontWeight: '800', marginTop: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }} title={highlights.latest}>
              {highlights.latest}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search exercise records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--background)',
              border: '1px solid var(--glass-border)',
              padding: '12px 16px 12px 46px',
              borderRadius: '12px',
              color: '#FFF',
              outline: 'none',
              fontSize: '0.95rem',
            }}
          />
        </div>

        {/* Muscle group selectors */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {muscleGroups.map(muscle => (
            <button
              key={muscle}
              onClick={() => setSelectedMuscle(muscle)}
              style={{
                background: selectedMuscle === muscle ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                color: selectedMuscle === muscle ? '#141210' : 'var(--text-muted)',
                border: '1px solid ' + (selectedMuscle === muscle ? 'var(--primary)' : 'var(--glass-border)'),
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {muscle}
            </button>
          ))}
        </div>
      </div>

      {/* PR Cards Grid */}
      {filteredPRs.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredPRs.map((pr) => (
            <motion.div
              layout
              key={pr.name}
              className="glass-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                border: '1px solid var(--glass-border)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Muscle badge top right */}
              <span style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                fontSize: '0.62rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                background: 'rgba(201, 168, 76, 0.12)',
                color: 'var(--primary)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: '600'
              }}>
                {pr.muscle}
              </span>

              {/* Title & Icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Star size={16} fill="var(--primary)" color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={pr.name}>
                  {pr.name}
                </h3>
              </div>

              {/* Highlight weight */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Personal Best</span>
                  <span style={{ fontSize: '1.7rem', fontWeight: '900', color: '#FFF' }}>
                    {pr.maxWeight}<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '400', marginLeft: '2px' }}>kg</span>
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--primary)', marginLeft: '8px', fontWeight: '600' }}>
                    × {pr.maxReps} reps
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Est. 1RM</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)' }}>
                    {pr.maxEst1RM}kg
                  </span>
                </div>
              </div>

              {/* PR Log Date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <Calendar size={12} />
                <span>Achieved on {pr.date} during <strong>{pr.workoutTitle}</strong></span>
              </div>

              {/* View History Button */}
              {pr.history?.length > 0 && (
                <button
                  onClick={() => setHistoryModalEx(pr)}
                  className="btn-secondary"
                  style={{
                    marginTop: '4px',
                    padding: '8px 12px',
                    fontSize: '0.78rem',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%'
                  }}
                >
                  <BarChart2 size={13} /> View Progression History <ChevronRight size={12} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Trophy size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
          <h3>No Records Found</h3>
          <p style={{ fontSize: '0.9rem', maxWidth: '380px', margin: '6px auto 20px auto' }}>
            {searchQuery || selectedMuscle !== 'All' 
              ? "We couldn't find any PRs matching your query. Try clearing the search or choosing another muscle."
              : "Log your first workout sets as completed to automatically start tracking your liftime personal records!"}
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
                padding: '30px',
                background: 'linear-gradient(135deg, #1C1A17, #12100E)',
                border: '1px solid rgba(201, 168, 76, 0.25)',
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
                <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Progress Report
                </span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '2px', color: '#FFF' }}>
                  {historyModalEx.name}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Visualizing your progression across {historyModalEx.history.length} logged lift sessions
                </p>
              </div>

              {/* Chart container */}
              <div style={{ width: '100%', height: '260px', marginBottom: '20px', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', padding: '16px 12px 10px 0', border: '1px solid rgba(255,255,255,0.03)' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyModalEx.history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="var(--text-muted)" 
                      fontSize={9} 
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="var(--text-muted)" 
                      fontSize={10} 
                      tickLine={false}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip 
                      contentStyle={{ background: '#12100E', border: '1px solid var(--primary)', borderRadius: '8px', fontSize: '0.8rem' }}
                      labelStyle={{ color: 'var(--text-muted)', fontWeight: 'bold' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      name="Lift Weight (kg)" 
                      stroke="var(--primary)" 
                      strokeWidth={3}
                      activeDot={{ r: 8 }}
                      dot={{ stroke: 'var(--primary)', strokeWidth: 2, r: 4, fill: '#141210' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="est1RM" 
                      name="Est. 1RM (kg)" 
                      stroke="rgba(255,255,255,0.3)" 
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* History list */}
              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '8px 16px' }}>Date</th>
                      <th style={{ padding: '8px 16px' }}>Workout</th>
                      <th style={{ padding: '8px 16px', textAlign: 'center' }}>Best Set</th>
                      <th style={{ padding: '8px 16px', textAlign: 'right' }}>Est. 1RM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...historyModalEx.history].reverse().map((entry, i) => (
                      <tr key={i} style={{ borderBottom: i < historyModalEx.history.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                        <td style={{ padding: '8px 16px', color: 'var(--text-muted)' }}>{entry.date}</td>
                        <td style={{ padding: '8px 16px', fontWeight: '500', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={entry.workoutTitle}>
                          {entry.workoutTitle}
                        </td>
                        <td style={{ padding: '8px 16px', textAlign: 'center', fontWeight: 'bold', color: 'var(--primary)' }}>
                          {entry.weight}kg × {entry.reps}
                        </td>
                        <td style={{ padding: '8px 16px', textAlign: 'right', fontWeight: '500' }}>
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

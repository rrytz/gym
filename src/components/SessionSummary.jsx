import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Sparkles, Save, X } from 'lucide-react';

const SessionSummary = ({ sessionSummary, setSessionSummary, onSave, onDiscard }) => {
  if (!sessionSummary) return null;

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const completedExercises = sessionSummary.exercises?.filter(ex =>
    ex.sets?.some(s => s.completed)
  ).length || 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(15px)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '540px',
          padding: '30px',
          background: 'linear-gradient(135deg, #1C1A17, #12100E)',
          border: '1px solid rgba(201, 168, 76, 0.25)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 40px rgba(201, 168, 76, 0.1)',
          maxHeight: '90vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          position: 'relative'
        }}
      >
        {onDiscard && (
          <button
            onClick={onDiscard}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)'
            }}
            aria-label="Discard summary"
          >
            <X size={15} />
          </button>
        )}

        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '74px',
            height: '74px',
            borderRadius: '50%',
            background: 'rgba(201, 168, 76, 0.12)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 0 20px rgba(201, 168, 76, 0.2)',
            border: '1px solid rgba(201, 168, 76, 0.3)'
          }}>
            <Trophy size={36} />
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Session Complete
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#FFF', marginTop: '4px' }}>
            {sessionSummary.title}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
            Outstanding effort! Here is what you achieved today.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <div style={{ textAlign: 'center', padding: '14px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Volume</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--primary)' }}>{sessionSummary.volume}kg</span>
          </div>
          <div style={{ textAlign: 'center', padding: '14px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Active Time</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#FFF' }}>{formatDuration(sessionSummary.duration)}</span>
          </div>
          <div style={{ textAlign: 'center', padding: '14px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Sets</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--primary)' }}>{sessionSummary.sets}</span>
          </div>
          <div style={{ textAlign: 'center', padding: '14px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Exercises</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#FFF' }}>{completedExercises}</span>
          </div>
        </div>

        {sessionSummary.exercises?.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '14px', padding: '16px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
              Exercise Breakdown
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '140px', overflowY: 'auto' }}>
              {sessionSummary.exercises.map((ex, idx) => {
                const completedSets = ex.sets?.filter(s => s.completed) || [];
                const exVolume = completedSets.reduce((acc, s) => acc + (Number(s.weight) * Number(s.reps) || 0), 0);
                if (completedSets.length === 0) return null;
                return (
                  <div key={ex.instanceId || idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '6px' }}>
                    <span style={{ fontWeight: '600', color: '#FFF', maxWidth: '55%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {completedSets.length} sets · {exVolume}kg
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {sessionSummary.prsBroken?.length > 0 && (
          <div style={{ background: 'rgba(201, 168, 76, 0.05)', border: '1px solid rgba(201, 168, 76, 0.2)', padding: '16px', borderRadius: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--primary)' }}>
              <Sparkles size={16} />
              <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Personal Records!</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {sessionSummary.prsBroken.map((pr, idx) => (
                <div key={idx} style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🏆</span>
                  <span>
                    <strong>{pr.exerciseName}</strong>: {pr.weight}kg × {pr.reps} reps
                    {pr.isFirstTime && (
                      <span style={{ fontSize: '0.68rem', color: 'var(--primary)', fontStyle: 'italic', marginLeft: '6px' }}>
                        (First time logged!)
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#FFF' }}>How did it go?</h4>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Energy Level</label>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
              {[
                { val: 1, label: '😩' },
                { val: 2, label: '🥱' },
                { val: 3, label: '🙂' },
                { val: 4, label: '⚡' },
                { val: 5, label: '🦁' },
              ].map(item => (
                <button
                  key={item.val}
                  onClick={() => setSessionSummary({ ...sessionSummary, energy: item.val })}
                  style={{
                    flex: 1,
                    fontSize: '1.5rem',
                    padding: '8px',
                    borderRadius: '10px',
                    border: sessionSummary.energy === item.val ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.06)',
                    background: sessionSummary.energy === item.val ? 'rgba(201, 168, 76, 0.1)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Difficulty (RPE)</label>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary)' }}>
                {sessionSummary.rpe} / 10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={sessionSummary.rpe}
              onChange={(e) => setSessionSummary({ ...sessionSummary, rpe: parseInt(e.target.value) })}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '8px',
                outline: 'none',
                accentColor: 'var(--primary)',
                cursor: 'pointer',
                height: '6px'
              }}
            />
            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', display: 'block', marginTop: '6px', fontStyle: 'italic' }}>
              {sessionSummary.rpe <= 4 && 'Easy: Warm-up or recovery effort.'}
              {(sessionSummary.rpe === 5 || sessionSummary.rpe === 6) && 'Moderate: Comfortable working weight, felt light.'}
              {(sessionSummary.rpe === 7 || sessionSummary.rpe === 8) && 'Vigorous: Hard but manageable. 2-3 reps left.'}
              {sessionSummary.rpe === 9 && 'Near Max: Extremely heavy. Only 1 rep left.'}
              {sessionSummary.rpe === 10 && 'Maximum Effort: Absolute limits. 0 reps left.'}
            </span>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Workout Notes</label>
            <textarea
              placeholder="Add comments on sleep, focus, pump, or performance..."
              value={sessionSummary.notes}
              onChange={(e) => setSessionSummary({ ...sessionSummary, notes: e.target.value })}
              style={{
                width: '100%',
                height: '80px',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#FFF',
                fontSize: '0.85rem',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
          <button
            className="btn-primary"
            onClick={onSave}
            style={{ width: '100%', padding: '16px', justifyContent: 'center', fontSize: '1rem', fontWeight: '800' }}
          >
            <Save size={18} /> Save & Return Home
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SessionSummary;

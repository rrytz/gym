import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, X, Plus, RotateCcw, Volume2, VolumeX } from 'lucide-react';

const RestTimer = ({
  isResting,
  remaining,
  duration,
  isPaused,
  soundEnabled,
  onPauseToggle,
  onAddSeconds,
  onSkip,
  onPresetSelect,
  onSoundToggle,
  isExpanded,
  setIsExpanded
}) => {
  if (!isResting) return null;

  // Calculate circular progress percentage
  const percentage = duration > 0 ? (remaining / duration) * 100 : 0;
  const radius = 60;
  const stroke = 5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const presets = [30, 60, 90, 120, 180];

  return (
    <>
      {/* ─── Collapsed Floating Bubble ────────────────────────── */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 50 }}
            onClick={() => setIsExpanded(true)}
            style={{
              position: 'fixed',
              bottom: '90px',
              right: '24px',
              zIndex: 9000,
              background: 'linear-gradient(135deg, #1C1A17, #12100E)',
              border: '2px solid var(--primary)',
              borderRadius: '50%',
              width: '66px',
              height: '66px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(201, 168, 76, 0.35)',
            }}
          >
            {/* Tiny Circle Progress */}
            <svg width="60" height="60" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
              <circle
                stroke="rgba(255,255,255,0.06)"
                fill="transparent"
                strokeWidth="2.5"
                r="24"
                cx="30"
                cy="30"
              />
              <circle
                stroke="var(--primary)"
                fill="transparent"
                strokeWidth="2.5"
                strokeDasharray="150.8"
                strokeDashoffset={150.8 - (percentage / 100) * 150.8}
                strokeLinecap="round"
                r="24"
                cx="30"
                cy="30"
                style={{ transition: 'stroke-dashoffset 0.3s ease' }}
              />
            </svg>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 2,
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', fontFamily: 'monospace', color: '#F0EDE8', lineHeight: 1 }}>
                {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, '0')}
              </span>
              <span style={{ fontSize: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginTop: '2px' }}>
                {isPaused ? 'PAUSED' : 'REST'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Expanded Glassmorphic Drawer/Card ───────────────── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(10px)',
              zIndex: 9005,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setIsExpanded(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="glass-card"
              style={{
                width: '100%',
                maxWidth: '380px',
                padding: '28px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #1C1A17, #12100E)',
                border: '1px solid rgba(201, 168, 76, 0.25)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 40px rgba(201, 168, 76, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '24px',
                position: 'relative',
              }}
            >
              {/* Close / Minimize */}
              <button
                onClick={() => setIsExpanded(false)}
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
                  color: 'var(--text-muted)',
                }}
              >
                <X size={15} />
              </button>

              {/* Sound Toggle (Top Left) */}
              <button
                onClick={onSoundToggle}
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: soundEnabled ? 'var(--primary)' : 'var(--text-muted)',
                }}
              >
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>

              {/* Header */}
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#F0EDE8' }}>
                  Rest Timer
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Keep your focus and recover
                </p>
              </div>

              {/* SVG Circular Countdown */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width={radius * 2} height={radius * 2} style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    stroke="rgba(255,255,255,0.04)"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                  />
                  <circle
                    stroke="var(--primary)"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.3s ease' }}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                  />
                </svg>
                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'monospace', color: '#FFF', lineHeight: 1 }}>
                    {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em', marginTop: '6px', fontWeight: '600' }}>
                    {isPaused ? 'PAUSED' : 'REMAINING'}
                  </span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
                {presets.map((time) => (
                  <button
                    key={time}
                    onClick={() => onPresetSelect(time)}
                    style={{
                      background: duration === time ? 'rgba(201, 168, 76, 0.12)' : 'rgba(255,255,255,0.03)',
                      border: duration === time ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.06)',
                      color: duration === time ? 'var(--primary)' : 'var(--text-muted)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                    }}
                  >
                    {time >= 60 ? `${time / 60}m` : `${time}s`}
                  </button>
                ))}
              </div>

              {/* Adjustments & Control Row */}
              <div style={{ display: 'flex', gap: '14px', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                {/* Add +30s */}
                <button
                  onClick={() => onAddSeconds(30)}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#FFF',
                    borderRadius: '12px',
                    padding: '10px 16px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Plus size={14} /> 30s
                </button>

                {/* Play/Pause Toggle */}
                <button
                  onClick={onPauseToggle}
                  style={{
                    background: 'var(--primary)',
                    color: '#141210',
                    border: 'none',
                    borderRadius: '50%',
                    width: '56px',
                    height: '56px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(201, 168, 76, 0.3)',
                  }}
                >
                  {isPaused ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
                </button>

                {/* Reset (RotateCcw) */}
                <button
                  onClick={() => onPresetSelect(duration)}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#FFF',
                    borderRadius: '12px',
                    padding: '10px 16px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <RotateCcw size={14} /> Reset
                </button>
              </div>

              {/* Skip / End Rest */}
              <button
                className="btn-secondary"
                onClick={onSkip}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '12px',
                  border: '1px solid rgba(255,59,48,0.2)',
                  color: '#FF3B30',
                }}
              >
                Skip Rest
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RestTimer;

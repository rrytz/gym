import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Trophy, ChevronDown, RefreshCw } from 'lucide-react';

const EXERCISES = [
  { name: 'Push-Ups',      emoji: '💪', sets: '3', reps: '15',    muscle: 'Chest',     color: '#C9A84C', tip: 'Keep your core tight and elbows at 45°.' },
  { name: 'Squats',        emoji: '🦵', sets: '3', reps: '20',    muscle: 'Legs',      color: '#C9A84C', tip: 'Push your knees out and drive through your heels.' },
  { name: 'Pull-Ups',      emoji: '🏋️', sets: '3', reps: '8',     muscle: 'Back',      color: '#C9A84C', tip: 'Engage your lats before pulling. Dead hang at bottom.' },
  { name: 'Plank',         emoji: '🧘', sets: '3', reps: '60s',   muscle: 'Core',      color: '#C9A84C', tip: 'Squeeze your glutes and don\'t let your hips sag.' },
  { name: 'Burpees',       emoji: '🔥', sets: '3', reps: '10',    muscle: 'Full Body', color: '#C9A84C', tip: 'Jump explosively and land softly on both feet.' },
  { name: 'Lunges',        emoji: '🚶', sets: '3', reps: '12',    muscle: 'Legs',      color: '#C9A84C', tip: 'Keep your front knee aligned over your ankle.' },
  { name: 'Mtn Climbers',  emoji: '⛰️', sets: '3', reps: '30s',   muscle: 'Core',      color: '#C9A84C', tip: 'Drive knees toward chest with hip-width stance.' },
  { name: 'Dips',          emoji: '💯', sets: '3', reps: '12',    muscle: 'Triceps',   color: '#C9A84C', tip: 'Lean slightly forward to hit triceps harder.' },
  { name: 'Jump Rope',     emoji: '🏃', sets: '3', reps: '2min',  muscle: 'Cardio',    color: '#C9A84C', tip: 'Stay on the balls of your feet, light and quick.' },
  { name: 'Deadlifts',     emoji: '🏆', sets: '3', reps: '10',    muscle: 'Back',      color: '#C9A84C', tip: 'Keep the bar close to your shins and spine neutral.' },
  { name: 'Crunches',      emoji: '💥', sets: '3', reps: '25',    muscle: 'Core',      color: '#C9A84C', tip: 'Exhale as you crunch. Avoid pulling your neck.' },
  { name: 'Box Jumps',     emoji: '⚡', sets: '3', reps: '10',    muscle: 'Power',     color: '#C9A84C', tip: 'Land softly with bent knees. Step down, don\'t jump.' },
];

const NUM_SEGMENTS = EXERCISES.length;
const SEGMENT_ANGLE = (2 * Math.PI) / NUM_SEGMENTS;
const CANVAS_SIZE = 360;
const CENTER = CANVAS_SIZE / 2;
const RADIUS = CENTER - 6;

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const DailySpinWheel = ({ onClose, onStartWorkout }) => {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const totalRotationRef = useRef(0);

  // Draw wheel on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Create segments with nice warm colors
    const colors = [
      '#C9A84C', '#B5943B', '#A0802C', '#8C6C1E', '#785A12', '#644808',
      '#C9A84C', '#B5943B', '#A0802C', '#8C6C1E', '#785A12', '#644808'
    ];

    EXERCISES.forEach((ex, i) => {
      const startAngle = SEGMENT_ANGLE * i - Math.PI / 2;
      const endAngle = startAngle + SEGMENT_ANGLE;

      // Segment fill
      ctx.beginPath();
      ctx.moveTo(CENTER, CENTER);
      ctx.arc(CENTER, CENTER, RADIUS, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = 'rgba(20, 18, 16, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Segment text
      ctx.save();
      ctx.translate(CENTER, CENTER);
      ctx.rotate(startAngle + SEGMENT_ANGLE / 2);
      ctx.textAlign = 'right';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 4;

      ctx.font = `bold 11px 'Outfit', sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(ex.name, RADIUS - 10, -3);

      ctx.font = `12px sans-serif`;
      ctx.fillText(ex.emoji, RADIUS - 10, 10);
      ctx.restore();
    });

    // Outer ring
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, RADIUS, 0, 2 * Math.PI);
    ctx.strokeStyle = 'var(--primary)';
    ctx.lineWidth = 4;
    ctx.shadowColor = 'var(--primary)';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Center hub
    const hubGrad = ctx.createRadialGradient(CENTER, CENTER, 0, CENTER, CENTER, 38);
    hubGrad.addColorStop(0, '#2D2820');
    hubGrad.addColorStop(1, '#141210');
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, 38, 0, 2 * Math.PI);
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.strokeStyle = 'var(--primary)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Hub label
    ctx.fillStyle = 'var(--primary)';
    ctx.font = `bold 9px 'Outfit', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('DAILY', CENTER, CENTER - 4);
    ctx.fillText('SPIN', CENTER, CENTER + 8);
  }, []);

  const spin = () => {
    if (isSpinning || hasSpun) return;

    const targetIndex = Math.floor(Math.random() * NUM_SEGMENTS);
    const segmentDeg = 360 / NUM_SEGMENTS;
    const extraSpins = (6 + Math.floor(Math.random() * 4)) * 360; // 6-9 full spins
    // Offset so middle of target segment lands at top pointer
    const targetOffset = 360 - (segmentDeg * targetIndex + segmentDeg / 2);
    const newRotation = totalRotationRef.current + extraSpins + targetOffset;

    totalRotationRef.current = newRotation;
    setRotation(newRotation);
    setIsSpinning(true);

    // Show result after spin completes
    setTimeout(() => {
      setIsSpinning(false);
      setHasSpun(true);
      setResult(EXERCISES[targetIndex]);
      setTimeout(() => setShowResult(true), 300);
      // Save today's date so it doesn't show again today
      localStorage.setItem('tropafit_last_spin', getTodayKey());
    }, 5500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget && !isSpinning) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        style={{
          background: 'linear-gradient(145deg, #1A1815, #12100E)',
          border: '1px solid rgba(201, 168, 76, 0.2)',
          borderRadius: '28px',
          padding: '32px 28px',
          width: '100%',
          maxWidth: '460px',
          position: 'relative',
          boxShadow: '0 0 80px rgba(201, 168, 76, 0.1), 0 30px 60px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        {/* Close button */}
        {!isSpinning && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
            }}
          >
            <X size={16} />
          </button>
        )}

        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
            <Zap size={18} color="#C9A84C" fill="#C9A84C" />
            <span style={{ fontSize: '0.75rem', color: '#C9A84C', fontWeight: '800', letterSpacing: '3px', textTransform: 'uppercase' }}>
              Daily Challenge
            </span>
            <Zap size={18} color="#C9A84C" fill="#C9A84C" />
          </div>
          <h2 style={{ fontSize: '1.7rem', fontWeight: '900', letterSpacing: '-0.5px' }}>
            Spin the <span style={{ color: 'var(--primary)' }}>Wheel!</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            Spin once a day to get your bonus challenge exercise
          </p>
        </div>

        {/* Wheel + Pointer */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Pointer arrow */}
          <div style={{
            position: 'absolute',
            top: '-2px',
            zIndex: 10,
            filter: 'drop-shadow(0 0 6px rgba(201, 168, 76, 0.8))',
          }}>
            <ChevronDown size={32} color="var(--primary)" strokeWidth={3} />
          </div>

          {/* Spinning canvas wrapper */}
          <div
            style={{
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: isSpinning
                ? '0 0 50px rgba(201, 168, 76, 0.4), 0 0 100px rgba(201, 168, 76, 0.15)'
                : '0 0 30px rgba(201, 168, 76, 0.15)',
              transition: 'box-shadow 0.5s ease',
            }}
          >
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              style={{
                display: 'block',
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning
                  ? 'transform 5.5s cubic-bezier(0.17, 0.67, 0.08, 0.99)'
                  : 'none',
                cursor: !hasSpun && !isSpinning ? 'pointer' : 'default',
              }}
              onClick={spin}
            />
          </div>
        </div>

        {/* Spin Button */}
        {!hasSpun && (
          <motion.button
            whileHover={!isSpinning ? { scale: 1.05 } : {}}
            whileTap={!isSpinning ? { scale: 0.97 } : {}}
            onClick={spin}
            disabled={isSpinning}
            style={{
              background: isSpinning
                ? 'rgba(201, 168, 76, 0.3)'
                : 'linear-gradient(135deg, var(--primary), #D6B75E)',
              color: isSpinning ? 'rgba(0,0,0,0.5)' : '#141210',
              border: 'none',
              padding: '16px 48px',
              borderRadius: '50px',
              fontWeight: '900',
              fontSize: '1.1rem',
              cursor: isSpinning ? 'not-allowed' : 'pointer',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              boxShadow: isSpinning ? 'none' : '0 8px 30px rgba(201, 168, 76, 0.4)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              minWidth: '200px',
              justifyContent: 'center',
            }}
          >
            {isSpinning ? (
              <>
                <RefreshCw size={20} style={{ animation: 'spin 0.6s linear infinite' }} />
                Spinning...
              </>
            ) : (
              <>
                <Zap size={20} fill="currentColor" />
                SPIN!
              </>
            )}
          </motion.button>
        )}

        {/* Result Card */}
        <AnimatePresence>
          {showResult && result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              style={{
                width: '100%',
                background: `linear-gradient(135deg, var(--primary)15, rgba(0,0,0,0))`,
                border: `1px solid var(--primary)40`,
                borderRadius: '20px',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  background: 'rgba(201, 168, 76, 0.20)',
                  border: '2px solid rgba(201, 168, 76, 0.60)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  flexShrink: 0,
                }}>
                  {result.emoji}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Trophy size={14} color="var(--primary)" fill="var(--primary)" />
                    <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Today's Challenge
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '900', margin: '2px 0' }}>
                    {result.name}
                  </h3>
                  <span style={{
                    fontSize: '0.75rem',
                    color: 'var(--primary)',
                    fontWeight: '700',
                    background: 'rgba(201, 168, 76, 0.15)',
                    padding: '2px 10px',
                    borderRadius: '20px',
                    border: '1px solid rgba(201, 168, 76, 0.30)',
                  }}>
                    {result.muscle}
                  </span>
                </div>
              </div>

              {/* Sets / Reps */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                {[
                  { label: 'Sets', value: result.sets },
                  { label: 'Reps', value: result.reps },
                  { label: 'Rest', value: '60s' },
                ].map(item => (
                  <div key={item.label} style={{
                    flex: 1,
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: '12px',
                    padding: '10px 6px',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary)' }}>{item.value}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{item.label}</div>
                  </div>
                ))}
              </div>

              {/* Tip */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                padding: '10px 14px',
                marginBottom: '16px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700' }}>💡 Pro Tip: </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{result.tip}</span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn-primary"
                  onClick={() => { onStartWorkout(result); onClose(); }}
                  style={{ flex: 1, justifyContent: 'center', fontSize: '0.9rem', padding: '12px' }}
                >
                  Start Workout
                </button>
                <button
                  className="btn-secondary"
                  onClick={onClose}
                  style={{ flex: 1, justifyContent: 'center', fontSize: '0.9rem', padding: '12px' }}
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </motion.div>
    </motion.div>
  );
};

export default DailySpinWheel;

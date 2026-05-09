import React, { useState, useEffect } from 'react';
import { Plus, X, Clock, Play, Check, Trash2, MoreVertical, Save, Dumbbell, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';

const WorkoutLogger = ({ userData, setUserData, setActiveTab, activeRoutine, setActiveRoutine, session }) => {
  const [activeWorkout, setActiveWorkout] = useState({
    title: 'New Workout',
    startTime: new Date().toISOString(),
    exercises: []
  });
  const [isLogging, setIsLogging] = useState(false);
  const [workoutTimer, setWorkoutTimer] = useState(0); // Total workout duration
  const [restTimer, setRestTimer] = useState(60); // Countdown rest timer
  const [isResting, setIsResting] = useState(false);
  const [showRoutinePicker, setShowRoutinePicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sessionSummary, setSessionSummary] = useState(null);

  // Total Workout Timer
  useEffect(() => {
    let interval = null;
    if (isLogging) {
      interval = setInterval(() => {
        setWorkoutTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLogging]);

  // Rest Timer Countdown
  useEffect(() => {
    let interval = null;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => prev - 1);
      }, 1000);
    } else if (restTimer === 0) {
      setIsResting(false);
      // Optional: Play a sound or vibrate
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer]);

  const startRest = (seconds = 60) => {
    setRestTimer(seconds);
    setIsResting(true);
  };

  // Auto-start routine if passed from another component
  useEffect(() => {
    if (activeRoutine) {
      startWorkout(activeRoutine);
      setActiveRoutine(null); // Clear it so it doesn't restart on every re-render
    }
  }, [activeRoutine]);

  const [searchQuery, setSearchQuery] = useState('');
  
  const exerciseDB = [
    { id: '1', name: 'Bench Press (Barbell)', muscle: 'Chest' },
    { id: '2', name: 'Squat (High Bar)', muscle: 'Legs' },
    { id: '3', name: 'Deadlift (Conventional)', muscle: 'Back' },
    { id: '4', name: 'Overhead Press (Dumbbell)', muscle: 'Shoulders' },
    { id: '5', name: 'Pull Ups', muscle: 'Back' },
    { id: '6', name: 'Incline Bench Press', muscle: 'Chest' },
    { id: '7', name: 'Lat Pulldown', muscle: 'Back' },
    { id: '8', name: 'Leg Press', muscle: 'Legs' },
    { id: '9', name: 'Dumbbell Bicep Curls', muscle: 'Arms' },
    { id: '10', name: 'Tricep Pushdowns', muscle: 'Arms' },
    { id: '11', name: 'Lateral Raises', muscle: 'Shoulders' },
    { id: '12', name: 'Leg Extensions', muscle: 'Legs' },
  ];

  const filteredExercises = exerciseDB.filter(ex => 
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.muscle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startWorkout = (routine = null) => {
    if (routine) {
      setActiveWorkout({
        title: routine.name,
        startTime: new Date().toISOString(),
        exercises: routine.exercises.map(exName => ({
          name: exName,
          instanceId: Math.random().toString(36).substr(2, 9),
          muscle: 'Target',
          sets: [{ id: 's1', weight: '', reps: '', type: 'normal', completed: false }]
        }))
      });
    } else {
      setActiveWorkout({
        title: 'New Workout',
        startTime: new Date().toISOString(),
        exercises: []
      });
    }
    setIsLogging(true);
    setWorkoutTimer(0);
    setShowRoutinePicker(false);
  };

  const addExercise = (exercise) => {
    setActiveWorkout({
      ...activeWorkout,
      exercises: [
        ...activeWorkout.exercises,
        { 
          ...exercise, 
          instanceId: Date.now().toString(),
          sets: [{ id: 's1', weight: '', reps: '', type: 'normal', completed: false }]
        }
      ]
    });
  };

  const addSet = (exerciseId) => {
    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map(ex => 
        ex.instanceId === exerciseId 
          ? { ...ex, sets: [...ex.sets, { id: Date.now().toString(), weight: '', reps: '', type: 'normal', completed: false }] }
          : ex
      )
    });
  };

  const updateSet = (exerciseId, setId, field, value) => {
    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map(ex => 
        ex.instanceId === exerciseId 
          ? { 
              ...ex, 
              sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s) 
            }
          : ex
      )
    });
  };

  const removeSet = (exerciseId, setId) => {
    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map(ex => 
        ex.instanceId === exerciseId 
          ? { ...ex, sets: ex.sets.filter(s => s.id !== setId) }
          : ex
      )
    });
  };

  const toggleSetComplete = (exerciseId, setId) => {
    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map(ex => 
        ex.instanceId === exerciseId 
          ? { 
              ...ex, 
              sets: ex.sets.map(s => s.id === setId ? { ...s, completed: !s.completed } : s) 
            }
          : ex
      )
    });
  };

  const finishWorkout = async () => {
    const totalVolume = activeWorkout.exercises.reduce((acc, ex) => {
      return acc + ex.sets.reduce((sAcc, s) => sAcc + (Number(s.weight) * Number(s.reps) || 0), 0);
    }, 0);

    const totalSets = activeWorkout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

    const completedWorkout = {
      title: activeWorkout.title,
      start_time: activeWorkout.startTime,
      end_time: new Date().toISOString(),
      duration: workoutTimer,
      volume: totalVolume,
      sets: totalSets,
      exercises: activeWorkout.exercises,
      user_id: session.user.id
    };

    // Save to Supabase
    const { error } = await supabase.from('workouts').insert([completedWorkout]);
    if (error) console.error('Cloud Sync Error:', error.message);

    setUserData({
      ...userData,
      workouts: [completedWorkout, ...userData.workouts]
    });

    setSessionSummary({
      title: activeWorkout.title,
      volume: totalVolume,
      sets: totalSets,
      duration: workoutTimer
    });

    setIsLogging(false);
    setShowSuccess(true);
    setActiveWorkout({ title: 'New Workout', startTime: null, exercises: [] });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minHeight: '80vh' }}>
      {!isLogging ? (
        <div className="flex-center animate-in" style={{ flex: 1, marginTop: '40px' }}>
          <div className="glass-card" style={{ 
            padding: '60px 40px', 
            textAlign: 'center', 
            maxWidth: '500px', 
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '30px',
            border: '1px solid rgba(0, 242, 255, 0.1)'
          }}>
            <div className="floating" style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%', 
              background: 'rgba(0, 242, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 40px rgba(0, 242, 255, 0.1)'
            }}>
              <Dumbbell size={50} color="var(--primary)" />
            </div>
            
            <div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '10px' }}>Ready to <span className="neon-text">Crush It?</span></h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Your journey to strength starts here.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '18px' }} onClick={() => startWorkout()}>
                <Plus size={22} /> Start Empty Workout
              </button>
              <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '16px' }} onClick={() => setShowRoutinePicker(true)}>
                Pick a Routine
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showRoutinePicker && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ 
                  position: 'fixed', 
                  inset: 0, 
                  background: 'rgba(0,0,0,0.8)', 
                  backdropFilter: 'blur(10px)',
                  zIndex: 2000,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px'
                }}
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="glass-card"
                  style={{ width: '100%', maxWidth: '500px', padding: '30px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3>Pick a Routine</h3>
                    <button onClick={() => setShowRoutinePicker(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                      <X size={24} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {userData.routines?.length > 0 ? (
                      userData.routines.map(routine => (
                        <button 
                          key={routine.id}
                          className="btn-secondary"
                          onClick={() => startWorkout(routine)}
                          style={{ justifyContent: 'space-between', padding: '16px' }}
                        >
                          <span style={{ fontWeight: '600' }}>{routine.name}</span>
                          <Play size={16} fill="currentColor" />
                        </button>
                      ))
                    ) : (
                      <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                        <p style={{ marginBottom: '16px' }}>No routines found in your library.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <button className="btn-primary" onClick={() => { setShowRoutinePicker(false); setActiveTab('routines'); }}>
                            Browse Beginner Templates
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <>
          <header className="glass-card" style={{ 
            padding: '20px 30px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            position: 'sticky',
            top: '0',
            zIndex: 10,
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <div style={{ minWidth: '200px' }}>
              <input 
                value={activeWorkout.title}
                onChange={(e) => setActiveWorkout({...activeWorkout, title: e.target.value})}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  color: '#fff',
                  outline: 'none',
                  width: '100%',
                  maxWidth: '300px'
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                <Clock size={14} /> <span>{Math.floor(workoutTimer / 60)}m {workoutTimer % 60}s</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end', flex: 1 }}>
              <button className="btn-secondary" style={{ color: 'var(--accent)', border: '1px solid rgba(255, 215, 0, 0.3)' }} onClick={() => setIsLogging(false)}>
                Discard
              </button>
              <button className="btn-primary" onClick={finishWorkout}>
                Finish Workout
              </button>
            </div>
          </header>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <AnimatePresence>
              {activeWorkout.exercises.map((exercise) => (
                <motion.div 
                  key={exercise.instanceId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="glass-card"
                  style={{ padding: '24px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>{exercise.name}</h3>
                    <button 
                      onClick={() => removeExercise(exercise.instanceId)}
                      style={{ color: 'var(--text-muted)', background: 'transparent' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '8px' }}>Set</th>
                        <th style={{ padding: '8px' }}>Type</th>
                        <th style={{ padding: '8px' }}>Weight (kg)</th>
                        <th style={{ padding: '8px' }}>Reps</th>
                        <th style={{ padding: '8px', textAlign: 'center' }}><Check size={16} /></th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>Rest</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exercise.sets.map((set, idx) => (
                        <tr key={set.id} style={{ borderTop: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 8px', fontWeight: '600' }}>{idx + 1}</td>
                          <td style={{ padding: '12px 8px' }}>
                            <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.7rem' }}>NORMAL</span>
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            <input 
                              type="number" 
                              placeholder="0"
                              value={set.weight}
                              onChange={(e) => updateSet(exercise.instanceId, set.id, 'weight', e.target.value)}
                              style={{ width: '60px', background: 'var(--surface-light)', border: 'none', padding: '6px 10px', borderRadius: '6px', color: '#fff', textAlign: 'center' }}
                            />
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            <input 
                              type="number" 
                              placeholder="0"
                              value={set.reps}
                              onChange={(e) => updateSet(exercise.instanceId, set.id, 'reps', e.target.value)}
                              style={{ width: '60px', background: 'var(--surface-light)', border: 'none', padding: '6px 10px', borderRadius: '6px', color: '#fff', textAlign: 'center' }}
                            />
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                            <button 
                              onClick={() => toggleSetComplete(exercise.instanceId, set.id)}
                              style={{ 
                                width: '28px', 
                                height: '28px', 
                                borderRadius: '6px', 
                                background: set.completed ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                color: set.completed ? '#000' : 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto'
                              }}
                            >
                              <Check size={16} strokeWidth={3} />
                            </button>
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                            <button 
                              className="btn-secondary"
                              onClick={() => startRest(60)}
                              style={{ padding: '4px 8px', fontSize: '0.7rem', borderRadius: '4px', border: '1px solid var(--primary)30' }}
                            >
                              Rest
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <button 
                    className="btn-secondary" 
                    onClick={() => addSet(exercise.instanceId)}
                    style={{ width: '100%', marginTop: '16px', padding: '8px', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', gap: '8px' }}
                  >
                    <Plus size={16} /> Add Set
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="glass-card" style={{ padding: '30px', borderStyle: 'dashed', background: 'transparent' }}>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ marginBottom: '16px' }}>Add Exercises</h3>
                <input 
                  type="text" 
                  placeholder="Search exercises (e.g. Chest, Squat)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ 
                    width: '100%', 
                    maxWidth: '400px',
                    background: 'var(--surface-light)', 
                    border: '1px solid var(--border)', 
                    padding: '12px 20px', 
                    borderRadius: '12px',
                    color: '#fff',
                    marginBottom: '20px',
                    outline: 'none'
                  }}
                />
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                  gap: '12px', 
                  width: '100%',
                  marginTop: '10px'
                }}>
                  {filteredExercises.map(ex => (
                    <button 
                      key={ex.id}
                      onClick={() => addExercise(ex)}
                      className="btn-secondary"
                      style={{ 
                        fontSize: '0.8rem', 
                        padding: '12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        justifyContent: 'flex-start',
                        width: '100%',
                        textAlign: 'left'
                      }}
                    >
                      <Plus size={14} /> 
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Rest Timer Overlay (Floating) */}
      <AnimatePresence>
        {isResting && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            style={{ position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}
          >
            <div className="glass-card neon-border" style={{ 
              padding: '16px 24px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '20px', 
              background: 'rgba(0,0,0,0.9)',
              boxShadow: '0 0 30px rgba(0, 242, 255, 0.2)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Resting</span>
                <span style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: 'monospace', color: 'var(--primary)' }}>
                  {Math.floor(restTimer / 60)}:{(restTimer % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => setRestTimer(prev => prev + 30)}
                  style={{ color: '#fff', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px', fontSize: '0.8rem' }}
                >
                  +30s
                </button>
                <button 
                  onClick={() => setIsResting(false)}
                  style={{ background: 'var(--accent)', color: '#fff', padding: '10px', borderRadius: '10px' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && sessionSummary && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', 
              inset: 0, 
              background: 'rgba(0,0,0,0.9)', 
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
              className="glass-card neon-border"
              style={{ 
                width: '100%', 
                maxWidth: '450px', 
                padding: '40px', 
                textAlign: 'center',
                background: 'rgba(10, 10, 11, 0.8)',
                boxShadow: '0 0 50px rgba(0, 242, 255, 0.15)'
              }}
            >
              <div style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '50%', 
                background: 'var(--primary)', 
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px auto',
                boxShadow: '0 0 30px var(--primary)'
              }}>
                <Trophy size={50} />
              </div>
              
              <h2 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>Workout Crushed!</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '1.1rem' }}>
                Outstanding effort, Ritz! You're one step closer to your goals.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '30px' }}>
                <div className="glass-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Volume</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>{sessionSummary.volume}kg</p>
                </div>
                <div className="glass-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Time</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--secondary)' }}>{Math.floor(sessionSummary.duration / 60)}m</p>
                </div>
                <div className="glass-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Sets</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent)' }}>{sessionSummary.sets}</p>
                </div>
              </div>

              <button 
                className="btn-primary" 
                style={{ width: '100%', padding: '16px', justifyContent: 'center', fontSize: '1.1rem' }}
                onClick={() => {
                  setShowSuccess(false);
                  setActiveTab('dashboard');
                }}
              >
                Return Home
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkoutLogger;

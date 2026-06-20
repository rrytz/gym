import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X, Clock, Play, Check, Trash2, Dumbbell, Trophy, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import SessionSummary from './SessionSummary';
import {
  calculatePRsFromWorkouts,
  detectSessionPRs,
  isSetPotentialPR,
  getExercisePR,
  mergeSessionPRsIntoStore
} from '../utils/prUtils';

const WorkoutLogger = ({ userData, setUserData, setActiveTab, activeRoutine, setActiveRoutine, session, triggerRest }) => {
  const [activeWorkout, setActiveWorkout] = useState({
    title: 'New Workout',
    startTime: new Date().toISOString(),
    exercises: []
  });
  const [isLogging, setIsLogging] = useState(false);
  const [workoutTimer, setWorkoutTimer] = useState(0); // Total workout duration
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

  // Auto-start routine if passed from another component
  useEffect(() => {
    if (activeRoutine) {
      startWorkout(activeRoutine);
      setActiveRoutine(null); // Clear it so it doesn't restart on every re-render
    }
  }, [activeRoutine]);

  const [searchQuery, setSearchQuery] = useState('');

  const defaultRestSeconds = userData.settings?.restTimer || 60;
  const historicalPRs = useMemo(
    () => calculatePRsFromWorkouts(userData.workouts || []),
    [userData.workouts]
  );
  
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

  const removeExercise = (exerciseId) => {
    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.filter(ex => ex.instanceId !== exerciseId)
    });
  };

  const toggleSetComplete = (exerciseId, setId) => {
    let setWasCompleted = false;
    const updatedExercises = activeWorkout.exercises.map(ex => {
      if (ex.instanceId === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(s => {
            if (s.id === setId) {
              const nextVal = !s.completed;
              if (nextVal) setWasCompleted = true;
              return { ...s, completed: nextVal };
            }
            return s;
          })
        };
      }
      return ex;
    });

    setActiveWorkout({
      ...activeWorkout,
      exercises: updatedExercises
    });

    if (setWasCompleted && triggerRest) {
      triggerRest();
    }
  };

  const finishWorkout = () => {
    const totalVolume = activeWorkout.exercises.reduce((acc, ex) => {
      return acc + ex.sets.reduce((sAcc, s) => sAcc + (Number(s.weight) * Number(s.reps) || 0), 0);
    }, 0);

    const totalSets = activeWorkout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
    const sessionPRs = detectSessionPRs(activeWorkout.exercises, userData.workouts || []);

    setSessionSummary({
      title: activeWorkout.title,
      volume: totalVolume,
      sets: totalSets,
      duration: workoutTimer,
      exercises: activeWorkout.exercises,
      prsBroken: sessionPRs,
      notes: '',
      rpe: 7,
      energy: 3
    });

    setIsLogging(false);
    setShowSuccess(true);
  };

  const saveWorkoutSummary = async () => {
    const completedWorkout = {
      title: sessionSummary.title,
      start_time: activeWorkout.startTime,
      end_time: new Date().toISOString(),
      duration: sessionSummary.duration,
      volume: sessionSummary.volume,
      sets: sessionSummary.sets,
      exercises: sessionSummary.exercises,
      user_id: session.user.id,
      notes: sessionSummary.notes,
      rpe: sessionSummary.rpe,
      energy: sessionSummary.energy
    };

    // Save to Supabase (with retry logic)
    let { error } = await supabase.from('workouts').insert([completedWorkout]);
    if (error && error.message?.includes('column')) {
      console.warn('Custom columns not found in database, retrying insert with standard columns...');
      const fallbackWorkout = { ...completedWorkout };
      delete fallbackWorkout.notes;
      delete fallbackWorkout.rpe;
      delete fallbackWorkout.energy;
      const retry = await supabase.from('workouts').insert([fallbackWorkout]);
      error = retry.error;
    }
    if (error) console.error('Cloud Sync Error:', error.message);

    const updatedPr = mergeSessionPRsIntoStore(
      userData.pr,
      sessionSummary.prsBroken || [],
      { title: sessionSummary.title, end_time: completedWorkout.end_time }
    );

    setUserData({
      ...userData,
      workouts: [completedWorkout, ...userData.workouts],
      pr: updatedPr
    });

    // Reset logging state
    setShowSuccess(false);
    setSessionSummary(null);
    setActiveWorkout({ title: 'New Workout', startTime: null, exercises: [] });
    setActiveTab('dashboard');
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
            border: '1px solid rgba(0, 242, 254, 0.1)'
          }}>
            <div className="floating" style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%', 
              background: 'rgba(0, 242, 254, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 40px rgba(0, 242, 254, 0.1)'
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
              <button
                className="btn-secondary"
                onClick={() => triggerRest && triggerRest(defaultRestSeconds, { force: true })}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Timer size={16} /> Rest {defaultRestSeconds}s
              </button>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <h3 style={{ color: 'var(--primary)', fontSize: '1.2rem', margin: 0 }}>{exercise.name}</h3>
                      {getExercisePR(exercise.name, historicalPRs) && (
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          background: 'rgba(201, 168, 76, 0.12)',
                          color: 'var(--primary)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Trophy size={10} />
                          PR {getExercisePR(exercise.name, historicalPRs).maxWeight}kg
                        </span>
                      )}
                    </div>
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
                      {exercise.sets.map((set, idx) => {
                        const isPR = set.completed && isSetPotentialPR(exercise.name, set.weight, set.reps, historicalPRs)
                          && (parseFloat(set.weight) || 0) > (getExercisePR(exercise.name, historicalPRs)?.maxWeight || 0);
                        return (
                        <tr key={set.id} style={{ borderTop: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 8px', fontWeight: '600' }}>
                            {idx + 1}
                            {isPR && (
                              <span title="New PR!" style={{ marginLeft: '4px', fontSize: '0.7rem' }}>🏆</span>
                            )}
                          </td>
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
                              onClick={() => triggerRest && triggerRest(defaultRestSeconds, { force: true })}
                              style={{ padding: '4px 8px', fontSize: '0.7rem', borderRadius: '4px', border: '1px solid var(--primary)30', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Timer size={10} /> {defaultRestSeconds}s
                            </button>
                          </td>
                        </tr>
                        );
                      })}
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

      {/* Post-Workout Session Summary */}
      <AnimatePresence>
        {showSuccess && sessionSummary && (
          <SessionSummary
            sessionSummary={sessionSummary}
            setSessionSummary={setSessionSummary}
            onSave={saveWorkoutSummary}
            onDiscard={() => {
              setShowSuccess(false);
              setSessionSummary(null);
              setIsLogging(true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkoutLogger;

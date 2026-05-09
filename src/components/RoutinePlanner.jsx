import React, { useState } from 'react';
import { Plus, GripVertical, Trash2, Edit2, Play, MoreHorizontal, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';

const beginnerTemplates = [
  {
    id: 't-ppl',
    name: 'Push Pull Legs (PPL)',
    description: 'The gold standard for muscle growth.',
    routines: [
      { id: 'ppl-push', name: 'PPL: Push (Chest/Tri)', exercises: ['Bench Press', 'Incline DB Press', 'Lateral Raises', 'Tricep Pushdowns'] },
      { id: 'ppl-pull', name: 'PPL: Pull (Back/Bi)', exercises: ['Deadlift', 'Pull Ups', 'Seated Rows', 'Hammer Curls'] },
      { id: 'ppl-legs', name: 'PPL: Legs', exercises: ['Squats', 'Leg Press', 'Leg Curls', 'Calf Raises'] }
    ]
  },
  {
    id: 't-ul',
    name: 'Upper / Lower',
    description: 'Perfect balance of frequency and recovery.',
    routines: [
      { id: 'ul-upper', name: 'Upper Body Power', exercises: ['Bench Press', 'Rows', 'OHP', 'Pull Ups'] },
      { id: 'ul-lower', name: 'Lower Body Power', exercises: ['Squats', 'Deadlift', 'Leg Extensions', 'Calf Raises'] }
    ]
  },
  {
    id: 't-fb',
    name: 'Full Body',
    description: 'Great for busy schedules and beginners.',
    routines: [
      { id: 'fb-main', name: 'Full Body (A)', exercises: ['Squats', 'Bench Press', 'Rows', 'Overhead Press', 'Curls'] }
    ]
  }
];

const RoutinePlanner = ({ userData, setUserData, setActiveTab, setActiveRoutine, session }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newRoutine, setNewRoutine] = useState({ name: '', exercises: [] });
  const [showTemplates, setShowTemplates] = useState(false);

  const handleCreate = async () => {
    if (!newRoutine.name) return;
    const routine = {
      name: newRoutine.name,
      exercises: newRoutine.exercises,
      user_id: session.user.id,
      last_performed: 'Never'
    };

    // Save to Supabase
    const { data, error } = await supabase.from('routines').insert([routine]).select();
    if (error) {
      console.error('Cloud Sync Error:', error.message);
      return;
    }

    const updatedRoutines = [data[0], ...(userData.routines || [])];
    setUserData({ ...userData, routines: updatedRoutines });
    setIsCreating(false);
    setNewRoutine({ name: '', exercises: [] });
  };

  const addTemplate = async (template) => {
    const newRoutines = template.routines.map(r => ({
      name: r.name,
      exercises: r.exercises,
      user_id: session.user.id,
      last_performed: 'Never'
    }));

    // Save to Supabase
    const { data, error } = await supabase.from('routines').insert(newRoutines).select();
    
    if (error) {
      console.error('Cloud Sync Error:', error.message);
      alert('Error saving template: ' + error.message);
      return;
    }

    if (data) {
      setUserData({
        ...userData,
        routines: [...data, ...(userData.routines || [])]
      });
      alert('Success! Template routines added to your library.');
      setShowTemplates(false);
    }
  };

  const deleteRoutine = async (id) => {
    // Delete from Supabase
    const { error } = await supabase.from('routines').delete().eq('id', id);
    if (error) {
      console.error('Cloud Sync Error:', error.message);
      return;
    }

    setUserData({
      ...userData,
      routines: userData.routines.filter(r => r.id !== id)
    });
  };

  const routines = userData.routines || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Routine Planner</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage your custom plans or use a beginner template.</p>
        </div>
        {(routines.length > 0 || showTemplates) && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-secondary" onClick={() => setShowTemplates(!showTemplates)}>
              <Sparkles size={20} color="var(--secondary)" /> {showTemplates ? 'Hide Templates' : 'Browse Templates'}
            </button>
            <button className="btn-primary" onClick={() => setIsCreating(true)}>
              <Plus size={20} /> New Routine
            </button>
          </div>
        )}
      </header>

      <AnimatePresence>
        {showTemplates && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="glass-card" style={{ padding: '24px', background: 'rgba(189, 0, 255, 0.03)', border: '1px solid rgba(189, 0, 255, 0.1)' }}>
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="var(--secondary)" /> Beginner Template Library
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {beginnerTemplates.map(template => (
                  <div key={template.id} className="glass-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '4px' }}>{template.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{template.description}</p>
                    <button 
                      className="btn-primary" 
                      style={{ width: '100%', fontSize: '0.8rem', padding: '8px', justifyContent: 'center' }}
                      onClick={() => addTemplate(template)}
                    >
                      Use This Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isCreating && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card" 
          style={{ padding: '30px', border: '1px solid var(--primary)' }}
        >
          <h3 style={{ marginBottom: '20px' }}>New Custom Routine</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Routine Name</label>
              <input 
                type="text" 
                placeholder="e.g. Morning Workout"
                value={newRoutine.name}
                onChange={(e) => setNewRoutine({...newRoutine, name: e.target.value})}
                style={{ 
                  width: '100%', 
                  background: 'var(--surface-light)', 
                  border: '1px solid var(--border)', 
                  padding: '12px', 
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setIsCreating(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreate}>Save Routine</button>
            </div>
          </div>
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {routines.map((routine) => (
          <motion.div 
            key={routine.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card"
            style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '4px' }}>{routine.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Last performed: {routine.lastPerformed || 'Never'}</p>
              </div>
              <button 
                onClick={() => deleteRoutine(routine.id)}
                style={{ color: 'var(--text-muted)', background: 'transparent', cursor: 'pointer' }}
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {routine.exercises.map((ex, i) => (
                <span key={i} className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
                  {ex}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
              <button 
                className="btn-primary" 
                style={{ flex: 2, justifyContent: 'center' }}
                onClick={() => {
                  setActiveRoutine(routine);
                  setActiveTab('workouts');
                }}
              >
                <Play size={18} fill="currentColor" /> Start Workout
              </button>
              <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                <Edit2 size={18} /> Edit
              </button>
            </div>
          </motion.div>
        ))}

        {routines.length === 0 && !showTemplates && (
          <div className="glass-card flex-center animate-in" style={{ 
            minHeight: '450px', 
            gridColumn: '1 / -1', 
            flexDirection: 'column', 
            gap: '30px', 
            borderStyle: 'dashed', 
            background: 'rgba(255,255,255,0.01)',
            padding: '40px'
          }}>
             <div className="floating" style={{ 
               width: '110px', 
               height: '110px', 
               borderRadius: '30px', 
               background: 'rgba(0, 242, 255, 0.05)', 
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'center',
               color: 'var(--primary)',
               boxShadow: '0 0 40px rgba(0, 242, 255, 0.1)',
               border: '1px solid rgba(0, 242, 255, 0.2)'
             }}>
               <Sparkles size={50} />
             </div>
             
             <div style={{ textAlign: 'center' }}>
               <h3 style={{ fontSize: '2.2rem', fontWeight: '900', marginBottom: '12px' }}>Your Planner is <span className="neon-text">Empty</span></h3>
               <p style={{ color: 'var(--text-muted)', maxWidth: '350px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.6' }}>
                 Design your perfect week or start with a pre-built beginner routine.
               </p>
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '300px' }}>
               <button className="btn-primary" onClick={() => setIsCreating(true)} style={{ width: '100%', justifyContent: 'center' }}>
                 <Plus size={22} /> Create Custom Plan
               </button>
               <button className="btn-secondary" onClick={() => setShowTemplates(true)} style={{ width: '100%', justifyContent: 'center' }}>
                 <Sparkles size={20} /> Use a Template
               </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutinePlanner;

import React, { useState } from 'react';
import { Search, Info, History, PlayCircle, PlusCircle } from 'lucide-react';

const exercisesData = [
  { id: '1', name: 'Bench Press (Barbell)', muscle: 'Chest', equipment: 'Barbell', video: 'https://example.com/video1' },
  { id: '2', name: 'Squat (High Bar)', muscle: 'Legs', equipment: 'Barbell', video: 'https://example.com/video2' },
  { id: '3', name: 'Deadlift (Conventional)', muscle: 'Back', equipment: 'Barbell', video: 'https://example.com/video3' },
  { id: '4', name: 'Overhead Press (Dumbbell)', muscle: 'Shoulders', equipment: 'Dumbbells', video: 'https://example.com/video4' },
  { id: '5', name: 'Pull Ups', muscle: 'Back', equipment: 'Bodyweight', video: 'https://example.com/video5' },
  { id: '6', name: 'Bicep Curls (Dumbbell)', muscle: 'Arms', equipment: 'Dumbbells', video: 'https://example.com/video6' },
  { id: '7', name: 'Tricep Pushdowns', muscle: 'Arms', equipment: 'Cable', video: 'https://example.com/video7' },
  { id: '8', name: 'Leg Press', muscle: 'Legs', equipment: 'Machine', video: 'https://example.com/video8' },
];

const ExerciseLibrary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');

  const muscles = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

  const filteredExercises = exercisesData.filter(ex => 
    (selectedMuscle === 'All' || ex.muscle === selectedMuscle) &&
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header>
        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Exercise Library</h2>
        <p style={{ color: 'var(--text-muted)' }}>Explore 200+ exercises with high-quality videos and history.</p>
      </header>

      <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
          <input 
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              background: 'var(--surface-light)', 
              border: '1px solid var(--border)', 
              padding: '12px 12px 12px 40px', 
              borderRadius: '10px',
              color: '#fff',
              outline: 'none'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {muscles.map(muscle => (
            <button
              key={muscle}
              onClick={() => setSelectedMuscle(muscle)}
              className={selectedMuscle === muscle ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '8px 16px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
            >
              {muscle}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {filteredExercises.map(ex => (
          <div key={ex.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{ex.name}</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span className="badge set-normal" style={{ fontSize: '0.7rem' }}>{ex.muscle}</span>
                  <span className="badge" style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>{ex.equipment}</span>
                </div>
              </div>
              <button style={{ color: 'var(--primary)', background: 'transparent' }}>
                <PlusCircle size={24} />
              </button>
            </div>

            <div style={{ 
              width: '100%', 
              height: '160px', 
              background: 'linear-gradient(45deg, #1a1a1c, #2a2a2d)', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
               <PlayCircle size={48} color="rgba(255,255,255,0.2)" />
               <div style={{ position: 'absolute', bottom: '10px', left: '10px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>
                 Watch Demo Video
               </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-secondary" style={{ flex: 1, fontSize: '0.8rem', display: 'flex', justifyContent: 'center', gap: '6px' }}>
                <History size={16} /> History
              </button>
              <button className="btn-secondary" style={{ flex: 1, fontSize: '0.8rem', display: 'flex', justifyContent: 'center', gap: '6px' }}>
                <Info size={16} /> Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExerciseLibrary;

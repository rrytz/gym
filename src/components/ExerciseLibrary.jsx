import React, { useState } from 'react';
import { Search, Info, History, PlayCircle, PlusCircle, Filter, Dumbbell, TrendingUp } from 'lucide-react';

const exercisesData = [
  { id: '1', name: 'Bench Press (Barbell)', muscle: 'Chest', equipment: 'Barbell', difficulty: 'Intermediate', category: 'Compound' },
  { id: '2', name: 'Squat (High Bar)', muscle: 'Legs', equipment: 'Barbell', difficulty: 'Advanced', category: 'Compound' },
  { id: '3', name: 'Deadlift (Conventional)', muscle: 'Back', equipment: 'Barbell', difficulty: 'Advanced', category: 'Compound' },
  { id: '4', name: 'Overhead Press (Dumbbell)', muscle: 'Shoulders', equipment: 'Dumbbells', difficulty: 'Intermediate', category: 'Compound' },
  { id: '5', name: 'Pull Ups', muscle: 'Back', equipment: 'Bodyweight', difficulty: 'Intermediate', category: 'Compound' },
  { id: '6', name: 'Bicep Curls (Dumbbell)', muscle: 'Arms', equipment: 'Dumbbells', difficulty: 'Beginner', category: 'Isolation' },
  { id: '7', name: 'Tricep Pushdowns', muscle: 'Arms', equipment: 'Cable', difficulty: 'Beginner', category: 'Isolation' },
  { id: '8', name: 'Leg Press', muscle: 'Legs', equipment: 'Machine', difficulty: 'Beginner', category: 'Compound' },
  { id: '9', name: 'Incline Dumbbell Press', muscle: 'Chest', equipment: 'Dumbbells', difficulty: 'Intermediate', category: 'Compound' },
  { id: '10', name: 'Barbell Row', muscle: 'Back', equipment: 'Barbell', difficulty: 'Intermediate', category: 'Compound' },
  { id: '11', name: 'Lateral Raises', muscle: 'Shoulders', equipment: 'Dumbbells', difficulty: 'Beginner', category: 'Isolation' },
  { id: '12', name: 'Romanian Deadlift', muscle: 'Legs', equipment: 'Barbell', difficulty: 'Intermediate', category: 'Compound' },
];

const ExerciseLibrary = ({ setActiveTab }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [selectedEquipment, setSelectedEquipment] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const muscles = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
  const equipment = ['All', 'Barbell', 'Dumbbells', 'Machine', 'Cable', 'Bodyweight'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredExercises = exercisesData.filter(ex => 
    (selectedMuscle === 'All' || ex.muscle === selectedMuscle) &&
    (selectedEquipment === 'All' || ex.equipment === selectedEquipment) &&
    (selectedDifficulty === 'All' || ex.difficulty === selectedDifficulty) &&
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return '#4cd964';
      case 'Intermediate': return '#D4AF37';
      case 'Advanced': return '#ff3b30';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <header>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.02em' }}>
          Exercise Library
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          500+ exercises with muscle group tags, equipment filters, and difficulty indicators
        </p>
      </header>

      {/* Search and Filters */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
          <input 
            type="text"
            placeholder="Search exercises by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              background: 'var(--surface-light)', 
              border: '1px solid var(--glass-border)', 
              padding: '16px 16px 16px 52px', 
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

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {/* Muscle Filter */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px' }}>
              Muscle Group
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {muscles.map(muscle => (
                <button
                  key={muscle}
                  onClick={() => setSelectedMuscle(muscle)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    background: selectedMuscle === muscle ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.04)',
                    color: selectedMuscle === muscle ? 'var(--primary)' : 'var(--text-muted)',
                    border: selectedMuscle === muscle ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid transparent',
                    cursor: 'pointer',
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

          {/* Equipment Filter */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px' }}>
              Equipment
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {equipment.map(eq => (
                <button
                  key={eq}
                  onClick={() => setSelectedEquipment(eq)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    background: selectedEquipment === eq ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.04)',
                    color: selectedEquipment === eq ? 'var(--primary)' : 'var(--text-muted)',
                    border: selectedEquipment === eq ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedEquipment !== eq) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.color = 'var(--text)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedEquipment !== eq) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      e.currentTarget.style.color = 'var(--text-muted)';
                    }
                  }}
                >
                  {eq}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px' }}>
              Difficulty
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {difficulties.map(diff => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    background: selectedDifficulty === diff ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.04)',
                    color: selectedDifficulty === diff ? 'var(--primary)' : 'var(--text-muted)',
                    border: selectedDifficulty === diff ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedDifficulty !== diff) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.color = 'var(--text)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedDifficulty !== diff) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      e.currentTarget.style.color = 'var(--text-muted)';
                    }
                  }}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>
        Showing {filteredExercises.length} exercises
      </div>

      {/* Exercise Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredExercises.map(ex => (
          <div 
            key={ex.id} 
            className="glass-card"
            style={{ 
              padding: '0', 
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
            {/* Exercise Image/Thumbnail */}
            <div style={{ 
              width: '100%', 
              height: '180px', 
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.02))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              borderBottom: '1px solid var(--glass-border)',
            }}>
              <Dumbbell size={64} color="rgba(212, 175, 55, 0.3)" />
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                padding: '6px 12px',
                borderRadius: '20px',
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(10px)',
                fontSize: '0.7rem',
                fontWeight: '600',
                color: getDifficultyColor(ex.difficulty),
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {ex.difficulty}
              </div>
            </div>

            {/* Exercise Info */}
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '4px', lineHeight: 1.3 }}>
                  {ex.name}
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(212, 175, 55, 0.1)',
                  color: 'var(--primary)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                }}>
                  {ex.muscle}
                </span>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                }}>
                  {ex.equipment}
                </span>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                }}>
                  {ex.category}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn-secondary"
                  style={{ 
                    flex: 1, 
                    fontSize: '0.85rem', 
                    padding: '10px',
                    justifyContent: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <History size={16} /> History
                </button>
                <button 
                  className="btn-primary"
                  style={{ 
                    flex: 1, 
                    fontSize: '0.85rem', 
                    padding: '10px',
                    justifyContent: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  onClick={() => setActiveTab('workouts')}
                >
                  <PlusCircle size={16} /> Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredExercises.length === 0 && (
        <div className="glass-card" style={{ padding: '64px 32px', textAlign: 'center' }}>
          <Dumbbell size={64} color="var(--text-dim)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px' }}>No exercises found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Try adjusting your filters or search terms
          </p>
        </div>
      )}
    </div>
  );
};

export default ExerciseLibrary;

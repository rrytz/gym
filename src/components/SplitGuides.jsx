import React from 'react';
import { Info, BookOpen, Target, Calendar, Flame, Zap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const splitsData = [
  {
    id: 'bro',
    title: 'Bro Split',
    tag: 'Classic',
    icon: Flame,
    color: '#FF3B30',
    description: 'Each muscle group is trained once per week on its own dedicated day.',
    frequency: '5-6 Days / Week',
    pros: ['Maximum focus on specific muscles', 'Great for isolation', 'High volume per session'],
    cons: ['Low frequency per muscle', 'Long recovery times', 'Easy to miss days'],
    example: 'Mon: Chest, Tue: Back, Wed: Shoulders, Thu: Legs, Fri: Arms'
  },
  {
    id: 'ppl',
    title: 'PPL (Push Pull Legs)',
    tag: 'Highly Recommended',
    icon: Zap,
    color: '#00F2FF',
    description: 'Group muscles by function: pushing, pulling, or leg work.',
    frequency: '3 or 6 Days / Week',
    pros: ['High frequency (2x/week)', 'Logical grouping', 'Excellent for hypertrophy'],
    cons: ['Sessions can be long', 'Requires high commitment (6 days)'],
    example: 'Push (Chest/Tri/Shoulders), Pull (Back/Bi), Legs'
  },
  {
    id: 'ul',
    title: 'Upper / Lower',
    tag: 'Balanced',
    icon: Target,
    color: '#BD00FF',
    description: 'Alternating between upper body and lower body training sessions.',
    frequency: '4 Days / Week',
    pros: ['Balanced frequency', 'Great for strength & size', 'Flexible schedule'],
    cons: ['Upper days can be crowded', 'Can be taxing on the CNS'],
    example: 'Mon: Upper, Tue: Lower, Wed: Rest, Thu: Upper, Fri: Lower'
  },
  {
    id: 'full',
    title: 'Full Body',
    tag: 'Beginner Friendly',
    icon: Calendar,
    color: '#FFA500',
    description: 'Training every major muscle group in a single session.',
    frequency: '3 Days / Week',
    pros: ['Very time efficient', 'Maximum frequency', 'Great for beginners'],
    cons: ['Hard to focus on weak points', 'Low volume per muscle per session'],
    example: 'Mon: Full, Tue: Rest, Wed: Full, Thu: Rest, Fri: Full'
  }
];

const SplitGuides = ({ setActiveTab }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <header>
        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Training Split Guide</h2>
        <p style={{ color: 'var(--text-muted)' }}>Choose the right program based on your goals, schedule, and experience level.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        {splitsData.map((split) => {
          const Icon = split.icon;
          return (
            <motion.div 
              key={split.id}
              whileHover={{ y: -8 }}
              className="glass-card"
              style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ 
                  padding: '12px', 
                  borderRadius: '12px', 
                  background: `${split.color}15`, 
                  color: split.color 
                }}>
                  <Icon size={24} />
                </div>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: split.color, border: `1px solid ${split.color}30` }}>
                  {split.tag}
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{split.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>{split.description}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: '600' }}>
                <Calendar size={16} /> Frequency: {split.frequency}
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Pros</p>
                <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: '#4ade80' }}>
                  {split.pros.map((pro, i) => <li key={i} style={{ marginBottom: '4px' }}>{pro}</li>)}
                </ul>
              </div>

              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Cons</p>
                <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: '#ff8a80' }}>
                  {split.cons.map((con, i) => <li key={i} style={{ marginBottom: '4px' }}>{con}</li>)}
                </ul>
              </div>

              <div className="glass-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '4px' }}>EXAMPLE ROUTINE</p>
                <p style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>{split.example}</p>
              </div>

              <button 
                className="btn-primary" 
                style={{ width: '100%', marginTop: 'auto', justifyContent: 'center', gap: '10px' }}
                onClick={() => setActiveTab('routines')} 
              >
                <Sparkles size={18} /> Setup This Split
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SplitGuides;

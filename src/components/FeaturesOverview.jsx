import React from 'react';
import { Dumbbell, BookOpen, Calendar, TrendingUp, User, Clock } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, tag, onClick }) => (
  <div
    className="glass-card"
    onClick={onClick}
    style={{
      padding: '24px',
      borderRadius: '16px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      position: 'relative',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.4)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.borderColor = 'var(--glass-border)';
    }}
  >
    <div
      style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: 'rgba(201, 168, 76, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={24} color="#C9A84C" />
    </div>
    <div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text)' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
        {description}
      </p>
    </div>
    {tag && (
      <div
        style={{
          marginTop: '8px',
          display: 'inline-block',
          padding: '4px 10px',
          borderRadius: '20px',
          background: 'rgba(201, 168, 76, 0.2)',
          color: '#C9A84C',
          fontSize: '0.7rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {tag}
      </div>
    )}
  </div>
);

const FeaturesOverview = ({ setActiveTab }) => {
  const features = [
    {
      icon: Dumbbell,
      title: 'Workout logger',
      description: 'Log sets, reps, weight per exercise. Auto-save session history.',
      tag: null,
      tab: 'workouts',
    },
    {
      icon: BookOpen,
      title: 'Exercise library',
      description: '500+ exercises with muscle group tags. Filter by equipment available.',
      tag: 'PH: gym & bahay workout versions',
      tab: 'exercises',
    },
    {
      icon: Calendar,
      title: 'Workout plans',
      description: 'Pre-built beginner programs. Push/pull/legs, full body, 3-day splits.',
      tag: null,
      tab: 'routines',
    },
    {
      icon: TrendingUp,
      title: 'Progress tracking',
      description: 'Volume over time, personal records per exercise, streak counter.',
      tag: null,
      tab: 'stats',
    },
    {
      icon: User,
      title: 'User profile',
      description: 'Height, weight, fitness goal, experience level. BMI calculator.',
      tag: 'PH: kg default, Filipino units',
      tab: 'settings',
    },
    {
      icon: Clock,
      title: 'Rest timer',
      description: 'Between-set countdown with vibration. Customizable per exercise.',
      tag: null,
      tab: 'workouts',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: '700',
            marginBottom: '12px',
            letterSpacing: '-0.02em',
          }}
        >
          <span style={{ color: 'var(--text)' }}>tropa</span>
          <span style={{ color: 'var(--primary)' }}>fit</span>
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>
          Sama-Sama Tayo — Your complete fitness companion
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            tag={feature.tag}
            onClick={() => setActiveTab(feature.tab)}
          />
        ))}
      </div>

      {/* CTA Section */}
      <div
        className="glass-card"
        style={{
          padding: '32px',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto',
          border: '1px solid rgba(201, 168, 76, 0.3)',
          background: 'rgba(201, 168, 76, 0.05)',
        }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text)' }}>
          Ready to start?
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
          Log your first workout and begin your fitness journey with tropa fit.
        </p>
        <button
          className="btn-primary"
          onClick={() => setActiveTab('workouts')}
          style={{ padding: '14px 32px', fontSize: '1rem' }}
        >
          Begin Workout
        </button>
      </div>
    </div>
  );
};

export default FeaturesOverview;

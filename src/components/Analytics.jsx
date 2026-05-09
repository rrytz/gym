import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { Calculator, TrendingUp, Trophy, Target, Sparkles } from 'lucide-react';
import { calculateLinearRegression } from '../utils/regression';
import { supabase } from '../supabaseClient';

const Analytics = ({ userData, session }) => {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [oneRM, setOneRM] = useState(null);
  const [strengthTrend, setStrengthTrend] = useState(null);

  useEffect(() => {
    if (userData.workouts && userData.workouts.length > 1) {
      calculateStrengthTrend();
    }
  }, [userData.workouts]);

  const calculateStrengthTrend = () => {
    // Group volume by date for trend analysis
    const volumeData = userData.workouts.map((w, index) => ({
      x: index,
      y: parseFloat(w.volume) || 0
    })).reverse();

    const result = calculateLinearRegression(volumeData);
    if (result) {
      setStrengthTrend({
        prediction: result.predict(volumeData.length + 5).toFixed(0),
        growthRate: (result.slope * 100).toFixed(1),
        confidence: Math.round(result.rSquared * 100)
      });
    }
  };

  const calculate1RM = () => {
    if (weight && reps) {
      const result = parseFloat(weight) / (1.0278 - (0.0278 * parseInt(reps)));
      setOneRM(Math.round(result * 10) / 10);
    }
  };

  const muscleData = [
    { subject: 'Chest', A: 120, fullMark: 150 },
    { subject: 'Back', A: 98, fullMark: 150 },
    { subject: 'Legs', A: 86, fullMark: 150 },
    { subject: 'Shoulders', A: 99, fullMark: 150 },
    { subject: 'Arms', A: 85, fullMark: 150 },
    { subject: 'Core', A: 65, fullMark: 150 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <header>
        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Predictive <span className="neon-text">Analytics</span></h2>
        <p style={{ color: 'var(--text-muted)' }}>AI-driven insights based on your training history.</p>
      </header>

      {/* Regression Insights Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '24px', border: '1px solid rgba(0, 242, 255, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Sparkles className="neon-text" size={20} />
            <h3 style={{ fontSize: '1.1rem' }}>AI Performance Forecast</h3>
          </div>
          {strengthTrend ? (
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '10px' }}>
                Based on your last {userData.workouts.length} workouts, your volume is trending <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{strengthTrend.growthRate}%</span> per session.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Projected Next Volume</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary)' }}>{strengthTrend.prediction} <span style={{ fontSize: '0.9rem' }}>kg</span></div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Model Confidence</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{strengthTrend.confidence}%</div>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Log more workouts to generate AI forecasts.</p>
          )}
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Calculator color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem' }}>1RM Calculator</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <input 
                  type="number" 
                  placeholder="Weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  style={{ width: '100%', background: 'var(--surface-light)', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', color: '#fff' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <input 
                  type="number" 
                  placeholder="Reps"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  style={{ width: '100%', background: 'var(--surface-light)', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', color: '#fff' }}
                />
              </div>
            </div>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={calculate1RM}>
              Calculate Max
            </button>
            {oneRM && (
              <div className="animate-fade-in" style={{ textAlign: 'center', padding: '10px', background: 'rgba(0, 242, 255, 0.05)', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>{oneRM} kg</h4>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* Strength Progress Chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <TrendingUp color="var(--secondary)" />
            <h3>Volume Progression</h3>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userData.workouts.slice(0, 10).reverse().map(w => ({
                date: new Date(w.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                volume: w.volume
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'var(--surface-dark)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="volume" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Muscle Frequency */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Muscle Group Distribution</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={muscleData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <Radar
                  name="Training"
                  dataKey="A"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

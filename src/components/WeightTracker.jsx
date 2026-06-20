import React, { useState, useEffect } from 'react';
import { Scale, TrendingDown, Calendar, Plus, Camera, History, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../supabaseClient';
import { calculateLinearRegression } from '../utils/regression';

const WeightTracker = ({ session }) => {
  const [logs, setLogs] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    if (session) {
      fetchWeightLogs();
    }
  }, [session]);

  const fetchWeightLogs = async () => {
    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .order('log_date', { ascending: true });

    if (data && data.length > 0) {
      const formattedLogs = data.map(log => ({
        date: new Date(log.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: parseFloat(log.weight),
        rawDate: new Date(log.log_date).getTime()
      }));
      setLogs(formattedLogs);
      calculateTrend(formattedLogs);
    }
  };

  const calculateTrend = (data) => {
    if (data.length < 2) return;

    // Map dates to numbers (days since first log)
    const firstDate = data[0].rawDate;
    const regressionData = data.map(d => ({
      x: (d.rawDate - firstDate) / (1000 * 60 * 60 * 24),
      y: d.weight
    }));

    const result = calculateLinearRegression(regressionData);
    if (result) {
      // Predict weight 30 days from now
      const futureX = regressionData[regressionData.length - 1].x + 30;
      setPrediction({
        weight: result.predict(futureX).toFixed(1),
        slope: result.slope.toFixed(3),
        rSquared: result.rSquared.toFixed(2)
      });
    }
  };

  const logWeight = async () => {
    if (!newWeight) return;
    const { data, error } = await supabase
      .from('weight_logs')
      .insert([{
        user_id: session.user.id,
        weight: parseFloat(newWeight)
      }])
      .select();

    if (!error) {
      setNewWeight('');
      fetchWeightLogs();
    }
  };

  const currentWeight = logs.length > 0 ? logs[logs.length - 1].weight : 0;
  const startWeight = logs.length > 0 ? logs[0].weight : 0;
  const lost = (startWeight - currentWeight).toFixed(1);

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '4px' }}>Body <span className="neon-text">Metrics</span></h2>
          <p style={{ color: 'var(--text-muted)' }}>Track your weight and forecast your progress with AI.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="number" 
            placeholder="00.0"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            style={{ width: '80px', background: 'var(--surface-light)', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', color: '#fff' }}
          />
          <button className="btn-primary" onClick={logWeight}>
            <Plus size={20} /> Log
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div className="glass-card" style={{ padding: '24px', flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Current Weight</span>
            <Scale size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>{currentWeight} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>kg</span></div>
        </div>
        <div className="glass-card" style={{ padding: '24px', flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Total Progress</span>
            <TrendingDown size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)' }}>{lost > 0 ? `-${lost}` : lost} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>kg</span></div>
        </div>
        {prediction && (
          <div className="glass-card" style={{ padding: '24px', flex: 1, minWidth: '200px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: 'var(--text-muted)' }}>30-Day Forecast</span>
              <Target size={20} color="var(--secondary)" />
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--secondary)' }}>{prediction.weight} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>kg</span></div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Based on current trend ({prediction.slope} kg/day)</div>
          </div>
        )}
      </div>

      <div className="glass-card" style={{ padding: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0 }}>Weight Journey</h3>
          {prediction && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px' }}>
              Trend Confidence: <span style={{ color: 'var(--primary)' }}>{Math.round(prediction.rSquared * 100)}%</span>
            </div>
          )}
        </div>
        <div style={{ height: '350px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={logs}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--text-muted)" tickLine={false} axisLine={false} dy={10} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="var(--text-muted)" tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
              />
              <Area type="monotone" dataKey="weight" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="glass-card" style={{ flex: 1, padding: '24px' }}>
          <h3>Progress Photos</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '12px 0 20px' }}>Upload photos to see the physical changes.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ aspectRatio: '3/4', background: 'var(--surface-light)', borderRadius: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px dashed var(--glass-border)' }}>
              <Camera size={24} color="var(--text-muted)" />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>Add Front</span>
            </div>
            <div style={{ aspectRatio: '3/4', background: 'var(--surface-light)', borderRadius: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px dashed var(--glass-border)' }}>
              <Camera size={24} color="var(--text-muted)" />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>Add Side</span>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ flex: 1, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3>Log History</h3>
            <History size={20} color="var(--text-muted)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
            {logs.slice().reverse().map((log, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>{log.date}</span>
                <span style={{ fontWeight: '700' }}>{log.weight} kg</span>
              </div>
            ))}
            {logs.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No logs yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeightTracker;

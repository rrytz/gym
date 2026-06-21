import React, { useState, useEffect } from 'react';
import { Ruler, Plus, Trash2, TrendingUp, Calendar, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const BodyMeasurements = ({ session }) => {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'chart'
  const [chartType, setChartType] = useState('weight');

  const [newMeasurement, setNewMeasurement] = useState({
    weight: '',
    waist: '',
    chest: '',
    arms: '',
    forearms: '',
    shoulders: '',
    thighs: '',
    calves: '',
    neck: '',
    body_fat_percentage: '',
    notes: ''
  });

  useEffect(() => {
    if (session) {
      fetchMeasurements();
    }
  }, [session]);

  const fetchMeasurements = async () => {
    try {
      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', session.user.id)
        .order('measurement_date', { ascending: false });

      if (error) throw error;
      setMeasurements(data || []);
    } catch (error) {
      console.error('Error fetching measurements:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMeasurement = async () => {
    try {
      const { data, error } = await supabase
        .from('body_measurements')
        .insert([{
          user_id: session.user.id,
          weight: newMeasurement.weight ? parseFloat(newMeasurement.weight) : null,
          waist: newMeasurement.waist ? parseFloat(newMeasurement.waist) : null,
          chest: newMeasurement.chest ? parseFloat(newMeasurement.chest) : null,
          arms: newMeasurement.arms ? parseFloat(newMeasurement.arms) : null,
          forearms: newMeasurement.forearms ? parseFloat(newMeasurement.forearms) : null,
          shoulders: newMeasurement.shoulders ? parseFloat(newMeasurement.shoulders) : null,
          thighs: newMeasurement.thighs ? parseFloat(newMeasurement.thighs) : null,
          calves: newMeasurement.calves ? parseFloat(newMeasurement.calves) : null,
          neck: newMeasurement.neck ? parseFloat(newMeasurement.neck) : null,
          body_fat_percentage: newMeasurement.body_fat_percentage ? parseFloat(newMeasurement.body_fat_percentage) : null,
          notes: newMeasurement.notes || null
        }])
        .select()
        .single();

      if (error) throw error;

      setMeasurements(prev => [data, ...prev]);
      setShowAddForm(false);
      setNewMeasurement({
        weight: '',
        waist: '',
        chest: '',
        arms: '',
        forearms: '',
        shoulders: '',
        thighs: '',
        calves: '',
        neck: '',
        body_fat_percentage: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error adding measurement:', error);
      alert('Failed to add measurement. Please try again.');
    }
  };

  const deleteMeasurement = async (id) => {
    try {
      const { error } = await supabase
        .from('body_measurements')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;

      setMeasurements(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting measurement:', error);
      alert('Failed to delete measurement. Please try again.');
    }
  };

  const getChartData = () => {
    const chartData = measurements
      .filter(m => m[chartType] !== null)
      .map(m => ({
        date: new Date(m.measurement_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: m[chartType],
        fullDate: m.measurement_date
      }))
      .reverse();

    return chartData;
  };

  const getLatestMeasurement = (field) => {
    const withField = measurements.filter(m => m[field] !== null);
    if (withField.length === 0) return null;
    return withField[0][field];
  };

  const getMeasurementChange = (field) => {
    const withField = measurements.filter(m => m[field] !== null);
    if (withField.length < 2) return null;
    const latest = withField[0][field];
    const previous = withField[1][field];
    const change = latest - previous;
    return change.toFixed(1);
  };

  const measurementFields = [
    { key: 'weight', label: 'Weight (kg)', unit: 'kg' },
    { key: 'waist', label: 'Waist (cm)', unit: 'cm' },
    { key: 'chest', label: 'Chest (cm)', unit: 'cm' },
    { key: 'arms', label: 'Arms (cm)', unit: 'cm' },
    { key: 'forearms', label: 'Forearms (cm)', unit: 'cm' },
    { key: 'shoulders', label: 'Shoulders (cm)', unit: 'cm' },
    { key: 'thighs', label: 'Thighs (cm)', unit: 'cm' },
    { key: 'calves', label: 'Calves (cm)', unit: 'cm' },
    { key: 'neck', label: 'Neck (cm)', unit: 'cm' },
    { key: 'body_fat_percentage', label: 'Body Fat %', unit: '%' }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading measurements...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Body Measurements</h2>
          <p style={{ color: 'var(--text-muted)' }}>Track your body composition and progress over time.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddForm(true)}>
          <Plus size={20} /> Add Measurement
        </button>
      </header>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {measurementFields.slice(0, 4).map(field => {
          const latest = getLatestMeasurement(field.key);
          const change = getMeasurementChange(field.key);
          return (
            <div key={field.key} className="glass-card" style={{ padding: '20px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{field.label}</p>
              <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '4px' }}>
                {latest !== null ? latest : '—'}
              </h3>
              {change !== null && (
                <p style={{ 
                  fontSize: '0.8rem', 
                  color: change >= 0 ? '#4cd964' : '#ff3b30',
                  fontWeight: '600'
                }}>
                  {change >= 0 ? '↑' : '↓'} {Math.abs(change)} {field.unit}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* View Mode Toggle */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <button
          className="btn-secondary"
          onClick={() => setViewMode('list')}
          style={{ 
            background: viewMode === 'list' ? 'var(--primary)' : 'transparent',
            color: viewMode === 'list' ? '#141210' : 'var(--text)'
          }}
        >
          List View
        </button>
        <button
          className="btn-secondary"
          onClick={() => setViewMode('chart')}
          style={{ 
            background: viewMode === 'chart' ? 'var(--primary)' : 'transparent',
            color: viewMode === 'chart' ? '#141210' : 'var(--text)'
          }}
        >
          Chart View
        </button>
      </div>

      {viewMode === 'list' ? (
        /* List View */
        <div className="glass-card" style={{ padding: '24px' }}>
          {measurements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No measurements recorded yet. Click "Add Measurement" to get started.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {measurements.map(measurement => (
                <div key={measurement.id} style={{
                  padding: '16px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Calendar size={16} color="var(--primary)" />
                      <span style={{ fontWeight: '600' }}>
                        {new Date(measurement.measurement_date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.9rem' }}>
                      {measurement.weight && <span>Weight: {measurement.weight}kg</span>}
                      {measurement.waist && <span>Waist: {measurement.waist}cm</span>}
                      {measurement.chest && <span>Chest: {measurement.chest}cm</span>}
                      {measurement.arms && <span>Arms: {measurement.arms}cm</span>}
                      {measurement.shoulders && <span>Shoulders: {measurement.shoulders}cm</span>}
                      {measurement.thighs && <span>Thighs: {measurement.thighs}cm</span>}
                      {measurement.body_fat_percentage && <span>Body Fat: {measurement.body_fat_percentage}%</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMeasurement(measurement.id)}
                    style={{
                      background: 'rgba(255, 59, 48, 0.1)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px',
                      cursor: 'pointer',
                      color: '#ff3b30'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Chart View */
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Select Measurement to Chart
            </label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              style={{
                padding: '10px 16px',
                background: 'var(--surface-light)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text)',
                outline: 'none'
              }}
            >
              {measurementFields.map(field => (
                <option key={field.key} value={field.key}>{field.label}</option>
              ))}
            </select>
          </div>
          <div style={{ height: '300px' }}>
            {getChartData().length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'var(--surface)', 
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#D4AF37" 
                    strokeWidth={2}
                    dot={{ fill: '#D4AF37' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                color: 'var(--text-muted)'
              }}>
                No data available for this measurement
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Measurement Modal */}
      {showAddForm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-card" style={{ padding: '32px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.5rem' }}>Add Body Measurement</h3>
              <button
                onClick={() => setShowAddForm(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {measurementFields.map(field => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    {field.label}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMeasurement[field.key]}
                    onChange={(e) => setNewMeasurement(prev => ({ ...prev, [field.key]: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'var(--surface-light)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      color: 'var(--text)',
                      outline: 'none'
                    }}
                  />
                </div>
              ))}
            </div>
            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Notes
              </label>
              <textarea
                value={newMeasurement.notes}
                onChange={(e) => setNewMeasurement(prev => ({ ...prev, notes: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'var(--surface-light)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  outline: 'none',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                className="btn-secondary"
                onClick={() => setShowAddForm(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={addMeasurement}
                style={{ flex: 1 }}
              >
                <Save size={18} /> Save Measurement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BodyMeasurements;

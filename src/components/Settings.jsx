import React from 'react';
import { User, Bell, Shield, Smartphone, Globe, LogOut, Check, Scale } from 'lucide-react';

const Settings = ({ userData, setUserData }) => {
  // Safe extraction of settings
  const settings = userData?.settings || {
    unit: 'kg',
    restTimer: 60,
    autoStartRest: true,
    soundEnabled: true
  };

  const updateSetting = (key, value) => {
    if (!setUserData) return;
    setUserData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <header>
        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Settings</h2>
        <p style={{ color: 'var(--text-muted)' }}>Manage your training preferences, units, and timer options.</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px' }}>
        {/* ─── Training Preferences Card ────────────────────────── */}
        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#FFF' }}>
            <Smartphone size={20} color="var(--primary)" /> Training Preferences
          </h3>

          {/* Unit Selector */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '16px' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '600' }}>Weight Units</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Choose between kilograms (kg) and pounds (lbs).</p>
            </div>
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              {['kg', 'lbs'].map(u => (
                <button
                  key={u}
                  onClick={() => updateSetting('unit', u)}
                  style={{
                    background: settings.unit === u ? 'var(--primary)' : 'transparent',
                    color: settings.unit === u ? '#141210' : 'var(--text-muted)',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {u.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Default Rest Timer Selector */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '16px' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '600' }}>Default Rest Period</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Default rest timer countdown when checking off sets.</p>
            </div>
            <select
              value={settings.restTimer}
              onChange={(e) => updateSetting('restTimer', parseInt(e.target.value))}
              style={{
                background: 'rgba(0,0,0,0.2)',
                color: '#FFF',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                outline: 'none',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              {[30, 45, 60, 90, 120, 180].map(time => (
                <option key={time} value={time} style={{ background: '#141210' }}>
                  {time >= 60 ? `${time / 60}m` : `${time}s`} ({time}s)
                </option>
              ))}
            </select>
          </div>

          {/* Auto Start Timer Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '16px' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '600' }}>Auto-Start Rest Timer</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Automatically launch rest timer when completing a set.</p>
            </div>
            <div 
              onClick={() => updateSetting('autoStartRest', !settings.autoStartRest)}
              style={{ 
                width: '44px', 
                height: '24px', 
                background: settings.autoStartRest ? 'var(--primary)' : 'rgba(255,255,255,0.08)', 
                borderRadius: '12px', 
                position: 'relative', 
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              <div style={{ 
                width: '18px', 
                height: '18px', 
                background: '#141210', 
                borderRadius: '50%', 
                position: 'absolute', 
                left: settings.autoStartRest ? '23px' : '3px', 
                top: '3px',
                transition: 'left 0.2s'
              }}></div>
            </div>
          </div>

          {/* Sound Alerts Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '600' }}>Audio Completion Chime</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Play sound alerts when the rest timer countdown reaches zero.</p>
            </div>
            <div 
              onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
              style={{ 
                width: '44px', 
                height: '24px', 
                background: settings.soundEnabled ? 'var(--primary)' : 'rgba(255,255,255,0.08)', 
                borderRadius: '12px', 
                position: 'relative', 
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              <div style={{ 
                width: '18px', 
                height: '18px', 
                background: '#141210', 
                borderRadius: '50%', 
                position: 'absolute', 
                left: settings.soundEnabled ? '23px' : '3px', 
                top: '3px',
                transition: 'left 0.2s'
              }}></div>
            </div>
          </div>
        </div>

        {/* ─── Profile & Support Card ───────────────────────────── */}
        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#FFF' }}>
            <User size={20} color="var(--primary)" /> Profile & Privacy
          </h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '16px' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '600' }}>Privacy Level</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Choose who can view your workout statistics.</p>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', background: 'rgba(201, 168, 76, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>
              PRIVATE
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '600' }}>Workout Reminders</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Enable push notifications reminding you to exercise.</p>
            </div>
            <div style={{ width: '44px', height: '24px', background: 'rgba(255,255,255,0.08)', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
              <div style={{ width: '18px', height: '18px', background: '#141210', borderRadius: '50%', position: 'absolute', left: '3px', top: '3px' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

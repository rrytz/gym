import React from 'react';
import { User, Bell, Shield, Smartphone, Globe, LogOut } from 'lucide-react';

const SettingItem = ({ icon: Icon, title, description, toggle }) => (
  <div className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', color: 'var(--primary)' }}>
        <Icon size={20} />
      </div>
      <div>
        <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>{title}</h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{description}</p>
      </div>
    </div>
    {toggle ? (
      <div style={{ width: '44px', height: '24px', background: 'var(--primary)', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
        <div style={{ width: '18px', height: '18px', background: '#000', borderRadius: '50%', position: 'absolute', right: '3px', top: '3px' }}></div>
      </div>
    ) : (
      <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Edit</button>
    )}
  </div>
);

const Settings = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <header>
        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Settings</h2>
        <p style={{ color: 'var(--text-muted)' }}>Manage your profile, preferences, and account security.</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px' }}>
        <h3 style={{ fontSize: '1.2rem', marginTop: '10px' }}>Account</h3>
        <SettingItem 
          icon={User} 
          title="Profile Information" 
          description="Update your name, email, and body measurements." 
        />
        <SettingItem 
          icon={Smartphone} 
          title="App Preferences" 
          description="Change units (kg/lbs), rest timer defaults, and theme." 
        />
        
        <h3 style={{ fontSize: '1.2rem', marginTop: '20px' }}>Notifications</h3>
        <SettingItem 
          icon={Bell} 
          title="Workout Reminders" 
          description="Get notified when it's time to hit the gym." 
          toggle
        />
        <SettingItem 
          icon={Globe} 
          title="Social Sharing" 
          description="Automatically share PRs to your connected socials." 
          toggle
        />

        <h3 style={{ fontSize: '1.2rem', marginTop: '20px' }}>Security</h3>
        <SettingItem 
          icon={Shield} 
          title="Privacy Settings" 
          description="Control who can see your workout history." 
        />

        <button className="btn-secondary" style={{ color: 'var(--accent)', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px', width: 'fit-content' }}>
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default Settings;

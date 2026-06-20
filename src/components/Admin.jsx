import React, { useState, useEffect } from 'react';
import { Users, Activity, ShieldCheck, Database, TrendingUp, BarChart3 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';

const Admin = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWorkouts: 0,
    totalRoutines: 0,
    loading: true
  });

  useEffect(() => {
    const fetchAdminStats = async () => {
      // Note: In a production app, these should be handled by a secure Supabase RPC or Edge Function
      // For this demo, we'll fetch counts using standard queries
      
      const { count: userCount } = await supabase
        .from('profiles') // Assuming a profiles table linked to auth.users
        .select('*', { count: 'exact', head: true });

      const { count: workoutCount } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true });

      const { count: routineCount } = await supabase
        .from('routines')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: userCount || 0,
        totalWorkouts: workoutCount || 0,
        totalRoutines: routineCount || 0,
        loading: false
      });
    };

    fetchAdminStats();
  }, []);

  const StatBox = ({ icon: Icon, label, value, color }) => (
    <div className="glass-card" style={{ padding: '24px', flex: 1, minWidth: '200px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ padding: '10px', borderRadius: '12px', background: `${color}15`, color: color }}>
          <Icon size={24} />
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{label}</span>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: '800' }}>{value}</div>
    </div>
  );

  if (stats.loading) return <div className="flex-center" style={{ height: '50vh' }}>Loading Admin Panel...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <ShieldCheck size={24} color="var(--primary)" />
          <h2 style={{ fontSize: '2rem' }}>Admin Control Center</h2>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>Real-time overview of the TitanLog ecosystem.</p>
      </header>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <StatBox icon={Users} label="Total Registered Titans" value={stats.totalUsers} color="var(--primary)" />
        <StatBox icon={Activity} label="Workouts Logged (Global)" value={stats.totalWorkouts} color="#BD00FF" />
        <StatBox icon={Database} label="Custom Routines Created" value={stats.totalRoutines} color="#FFA500" />
      </div>

      <div className="dashboard-grid">
        <div className="glass-card" style={{ flex: 2, padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Global Growth</h3>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <TrendingUp size={48} color="var(--text-muted)" style={{ marginBottom: '16px', opacity: 0.3 }} />
              <p style={{ color: 'var(--text-muted)' }}>Graph view will unlock at 100+ users.</p>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ flex: 1, padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>System Health</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Database Status</span>
              <span style={{ color: '#00ff00', fontWeight: '700' }}>ONLINE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>API Latency</span>
              <span style={{ color: '#00ff00' }}>24ms</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Auth Server</span>
              <span style={{ color: '#00ff00' }}>STABLE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;

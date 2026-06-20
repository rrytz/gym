import { LayoutDashboard, Dumbbell, Calendar, Apple, Scale, ShieldCheck, LogOut } from 'lucide-react';
import { supabase } from '../supabaseClient';

const NavItem = ({ icon: Icon, label, active, onClick, isMobile }) => (
  <button
    onClick={onClick}
    className={`nav-item ${active ? 'active' : ''}`}
    style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: 'center',
      gap: isMobile ? '4px' : '14px',
      padding: isMobile ? '10px 8px' : '10px 16px',
      background: active ? 'rgba(201, 168, 76, 0.08)' : 'transparent',
      border: 'none',
      color: active ? 'var(--primary)' : 'var(--text-muted)',
      borderRadius: '6px',
      width: isMobile ? 'auto' : '100%',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontWeight: active ? '600' : '400',
      textAlign: isMobile ? 'center' : 'left',
    }}
    onMouseEnter={e => {
      if (!active) {
        e.currentTarget.style.color = 'var(--text)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
      }
    }}
    onMouseLeave={e => {
      if (!active) {
        e.currentTarget.style.color = 'var(--text-muted)';
        e.currentTarget.style.background = 'transparent';
      }
    }}
  >
    <Icon size={isMobile ? 20 : 16} strokeWidth={active ? 2 : 1.5} />
    <span style={{ fontSize: isMobile ? '0.58rem' : '0.85rem', letterSpacing: isMobile ? '0.02em' : '0.01em' }}>
      {label}
    </span>
  </button>
);

const Navbar = ({ activeTab, setActiveTab, session }) => {
  const isAdmin = session?.user?.email === 'ritzlloydsastrillas03@gmail.com';

  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'workouts', label: 'Workout', icon: Dumbbell },
    { id: 'nutrition', label: 'Fuel', icon: Apple },
    { id: 'progress', label: 'Progress', icon: Scale },
    { id: 'routines', label: 'Plans', icon: Calendar },
  ];

  if (isAdmin) {
    menuItems.push({ id: 'admin', label: 'Admin', icon: ShieldCheck });
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const username = session?.user?.email?.split('@')[0] || 'Titan';
  const initials = username.charAt(0).toUpperCase();

  return (
    <>
      {/* ─── Desktop Sidebar ─────────────────────────────────── */}
      <nav
        className="desktop-nav"
        style={{
          width: '220px',
          background: 'var(--surface)',
          borderRight: '1px solid var(--glass-border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '28px 16px',
          height: '100vh',
          position: 'sticky',
          top: 0,
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: '36px', paddingLeft: '4px' }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '800',
            color: 'var(--text)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}>
            Hyve<span style={{ color: 'var(--primary)' }}>.</span>
          </div>
          <div style={{
            fontSize: '0.65rem',
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginTop: '4px',
            fontWeight: '500',
          }}>
            Your Fitness Buddy
          </div>
        </div>

        {/* Nav Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
          {menuItems.map(item => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
            />
          ))}
        </div>

        {/* User Profile */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px',
          borderTop: '1px solid var(--glass-border)',
          marginTop: '16px',
        }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', minWidth: 0 }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'var(--primary)',
              color: '#0D0B09',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '0.75rem',
              flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '0.78rem', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {username}
              </p>
              <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                {isAdmin ? 'Admin' : 'Member'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              color: 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '4px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <LogOut size={14} />
          </button>
        </div>
      </nav>

      {/* ─── Mobile Bottom Nav ────────────────────────────────── */}
      <nav
        className="mobile-nav"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          justifyContent: 'space-around',
          padding: '8px 4px',
          zIndex: 1000,
          background: 'var(--surface)',
          borderTop: '1px solid var(--glass-border)',
        }}
      >
        {menuItems.map(item => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeTab === item.id}
            onClick={() => setActiveTab(item.id)}
            isMobile
          />
        ))}
      </nav>
    </>
  );
};

export default Navbar;

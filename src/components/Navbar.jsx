import { LayoutDashboard, Dumbbell, Calendar, Apple, Scale, ShieldCheck, Trophy, LogOut, BookOpen, Settings, ChevronRight, Droplets, Ruler, User, Bell } from 'lucide-react';
import { supabase } from '../supabaseClient';

const NavSection = ({ title, children }) => (
  <div style={{ marginBottom: '24px' }}>
    {title && (
      <div style={{
        fontSize: '0.65rem',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: 'var(--text-dim)',
        fontWeight: '600',
        marginBottom: '8px',
        paddingLeft: '12px',
      }}>
        {title}
      </div>
    )}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {children}
    </div>
  </div>
);

const NavItem = ({ icon: Icon, label, active, onClick, isMobile }) => (
  <button
    onClick={onClick}
    className={`nav-item ${active ? 'active' : ''}`}
    style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: 'center',
      gap: isMobile ? '4px' : '12px',
      padding: isMobile ? '10px 8px' : '12px 16px',
      background: active ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
      border: active ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid transparent',
      color: active ? 'var(--primary)' : 'var(--text-muted)',
      borderRadius: '12px',
      width: isMobile ? 'auto' : '100%',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      fontWeight: active ? '600' : '500',
      textAlign: isMobile ? 'center' : 'left',
      position: 'relative',
      overflow: 'hidden',
    }}
    onMouseEnter={e => {
      if (!active) {
        e.currentTarget.style.color = 'var(--text)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
        e.currentTarget.style.transform = 'translateX(4px)';
      }
    }}
    onMouseLeave={e => {
      if (!active) {
        e.currentTarget.style.color = 'var(--text-muted)';
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.transform = 'translateX(0)';
      }
    }}
  >
    <Icon size={isMobile ? 20 : 18} strokeWidth={active ? 2.5 : 2} />
    <span style={{ fontSize: isMobile ? '0.58rem' : '0.85rem', letterSpacing: '0.01em' }}>
      {label}
    </span>
    {active && !isMobile && (
      <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.7 }} />
    )}
  </button>
);

const Navbar = ({ activeTab, setActiveTab, session }) => {
  const isAdmin = session?.user?.email === 'ritzlloydsastrillas03@gmail.com';

  const mainItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workouts', label: 'Workout', icon: Dumbbell },
    { id: 'progress', label: 'Progress', icon: Scale },
    { id: 'measurements', label: 'Measurements', icon: Ruler },
  ];

  const trainingItems = [
    { id: 'exercises', label: 'Exercise Library', icon: BookOpen },
    { id: 'routines', label: 'Programs', icon: Calendar },
    { id: 'records', label: 'Personal Records', icon: Trophy },
  ];

  const toolsItems = [
    { id: 'nutrition', label: 'Nutrition', icon: Apple },
    { id: 'water', label: 'Water', icon: Droplets },
    { id: 'reminders', label: 'Reminders', icon: Bell },
    { id: 'weekly', label: 'Weekly Report', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (isAdmin) {
    toolsItems.push({ id: 'admin', label: 'Admin', icon: ShieldCheck });
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const username = session?.user?.email?.split('@')[0] || 'Tropa';
  const initials = username.charAt(0).toUpperCase();

  return (
    <>
      {/* ─── Desktop Sidebar ─────────────────────────────────── */}
      <nav
        className="desktop-nav"
        style={{
          width: '260px',
          background: 'var(--surface)',
          borderRight: '1px solid var(--glass-border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '32px 20px',
          height: '100vh',
          position: 'sticky',
          top: 0,
          flexShrink: 0,
        }}
      >
        {/* Logo — tropa fit */}
        <div style={{ marginBottom: '40px', paddingLeft: '4px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Circle Icon with 3 dots */}
          <svg width="48" height="48" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <circle cx="23" cy="23" r="21" stroke="#C9A84C" strokeWidth="2.5" fill="none" />
            <circle cx="13" cy="23" r="3.5" fill="#C9A84C" />
            <circle cx="23" cy="23" r="3.5" fill="#C9A84C" />
            <circle cx="33" cy="23" r="3.5" fill="#C9A84C" />
          </svg>

          {/* Text block */}
          <div style={{ textAlign: 'left' }}>
            <div style={{ lineHeight: 1, marginBottom: '2px' }}>
              <span style={{
                fontSize: '1.6rem',
                fontWeight: '700',
                color: '#F0EDE8',
                letterSpacing: '-0.01em',
                display: 'block',
              }}>
                tropa
              </span>
              <span style={{
                fontSize: '1.6rem',
                fontWeight: '700',
                color: '#C9A84C',
                letterSpacing: '-0.01em',
                display: 'block',
                borderBottom: '2px solid #C9A84C',
                paddingBottom: '2px',
                lineHeight: 1.1,
              }}>
                fit
              </span>
            </div>
            <div style={{
              fontSize: '0.65rem',
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              marginTop: '6px',
              fontWeight: '500',
            }}>
              Sama-Sama Tayo
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, overflowY: 'auto' }}>
          <NavSection title="Main">
            {mainItems.map(item => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
              />
            ))}
          </NavSection>

          <NavSection title="Training">
            {trainingItems.map(item => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
              />
            ))}
          </NavSection>

          <NavSection title="Tools">
            {toolsItems.map(item => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
              />
            ))}
          </NavSection>
        </div>

        {/* User Profile */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          borderTop: '1px solid var(--glass-border)',
          marginTop: '8px',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.02)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
          e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
          e.currentTarget.style.borderColor = 'var(--glass-border)';
        }}
        >
          <div 
            onClick={() => setActiveTab('settings')}
            style={{ display: 'flex', gap: '12px', alignItems: 'center', minWidth: 0, cursor: 'pointer', flex: 1 }}
            title="Open Settings"
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
              border: '2px solid var(--primary)',
            }}>
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face"
                alt="User Avatar"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement.style.background = 'linear-gradient(135deg, var(--primary), var(--primary-light))';
                  e.currentTarget.parentElement.style.display = 'flex';
                  e.currentTarget.parentElement.style.alignItems = 'center';
                  e.currentTarget.parentElement.style.justifyContent = 'center';
                  e.currentTarget.parentElement.style.color = '#0A0A0A';
                  e.currentTarget.parentElement.style.fontWeight = '800';
                  e.currentTarget.parentElement.style.fontSize = '0.85rem';
                  e.currentTarget.parentElement.textContent = initials;
                }}
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '0.85rem', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>
                {username}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '500' }}>
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
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--primary)';
              e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <LogOut size={16} />
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
          display: 'flex',
          justifyContent: 'space-around',
          padding: '12px 8px',
          zIndex: 1000,
          background: 'var(--surface)',
          borderTop: '1px solid var(--glass-border)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {[...mainItems.slice(0, 2), ...trainingItems.slice(0, 1), ...toolsItems.slice(0, 2)].map(item => (
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

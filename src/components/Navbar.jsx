import { LayoutDashboard, Dumbbell, Calendar, Apple, Scale, BookOpen, ShieldCheck, LogOut } from 'lucide-react';
import { supabase } from '../supabaseClient';

const NavItem = ({ icon: Icon, label, active, onClick, isMobile }) => (
  <button 
    onClick={onClick}
    className={`nav-item ${active ? 'active' : ''} ${isMobile ? 'mobile' : 'desktop'}`}
    style={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row', 
      alignItems: 'center', 
      gap: '12px',
      padding: isMobile ? '10px' : '12px 16px',
      background: active ? 'var(--primary)' : 'transparent',
      border: 'none',
      color: active ? '#000000' : 'var(--text-muted)',
      borderRadius: '12px',
      width: isMobile ? 'auto' : '100%',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontWeight: active ? '600' : '500'
    }}
  >
    <Icon size={20} strokeWidth={active ? 2.5 : 2} />
    <span style={{ fontSize: isMobile ? '0.65rem' : '0.9rem' }}>{label}</span>
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

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="desktop-nav" style={{ 
        width: '280px', 
        background: 'var(--surface)', 
        borderRight: '1px solid var(--glass-border)', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '2rem 1.5rem', 
        height: '100vh', 
        position: 'sticky', 
        top: 0,
        zIndex: 100
      }}>
        <div className="logo" style={{ 
          fontSize: '1.8rem', 
          fontWeight: 800, 
          background: 'linear-gradient(to right, var(--primary), var(--secondary))', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent', 
          marginBottom: '3rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px' 
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00f2fe" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
            <path d="M6 8H5a4 4 0 0 0 0 8h1"/>
            <line x1="2" y1="12" x2="6" y2="12"/>
            <line x1="18" y1="12" x2="22" y2="12"/>
            <rect x="6" y="4" width="12" height="16" rx="2"/>
          </svg>
          TitanLog
        </div>

        <div className="nav-items" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
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

        <div className="nav-profile glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div className="avatar" style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'var(--primary)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
              {session?.user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="info">
              <p className="name" style={{ fontSize: '0.8rem', fontWeight: '700' }}>{session?.user?.email?.split('@')[0]}</p>
              <p className="status" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{isAdmin ? 'Admin' : 'Member'}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav" style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        justifyContent: 'space-around', 
        padding: '10px', 
        zIndex: 1000, 
        background: 'var(--surface)',
        borderTop: '1px solid var(--glass-border)',
        borderRadius: '20px 20px 0 0' 
      }}>
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

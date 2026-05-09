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
      padding: isMobile ? '10px' : '12px 20px',
      background: active ? 'var(--primary-glow)' : 'transparent',
      border: 'none',
      color: active ? 'var(--primary)' : 'var(--text-muted)',
      borderRadius: '12px',
      width: isMobile ? 'auto' : '100%',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }}
  >
    <Icon size={22} strokeWidth={active ? 2.5 : 2} />
    <span style={{ fontSize: isMobile ? '0.65rem' : '0.9rem', fontWeight: active ? '700' : '500' }}>{label}</span>
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
      <nav className="desktop-nav glass-card" style={{ width: '260px', padding: '30px 20px', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
        <div className="nav-header" style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', letterSpacing: '2px', fontWeight: '900' }}>HYVE<span style={{ color: 'var(--primary)' }}>.</span></h1>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Fitness Buddy</p>
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
      <nav className="mobile-nav glass-card" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, justifyContent: 'space-around', padding: '10px', zIndex: 1000, borderRadius: '20px 20px 0 0' }}>
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

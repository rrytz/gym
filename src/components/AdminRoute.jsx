import React, { useEffect, useState } from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import { isAdmin } from '../utils/security';

const AdminRoute = ({ children, session }) => {
  const [isAdminUser, setIsAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!session || !session.user) {
        setIsAdminUser(false);
        setLoading(false);
        return;
      }

      const adminStatus = await isAdmin(session.user.id);
      setIsAdminUser(adminStatus);
      setLoading(false);
    };

    checkAdmin();
  }, [session]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '2px solid rgba(201, 168, 76, 0.15)',
          borderTop: '2px solid #C9A84C',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAdminUser) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: '20px',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(255, 59, 48, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Shield size={40} color="#FF3B30" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            You don't have permission to access this page. This area is restricted to administrators only.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;

import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        if (error) setErrorMessage(error.message);
        else alert('Success! Check your email for the confirmation link.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setErrorMessage(error.message);
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred.');
    }
    setLoading(false);
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--background)', padding: '20px' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card" 
        style={{ 
          padding: '40px', 
          width: '100%', 
          maxWidth: '420px', 
          textAlign: 'center',
          border: '1px solid rgba(0, 242, 255, 0.1)'
        }}
      >
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px' }}>TITAN<span className="neon-text">LOG</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '2px', fontWeight: '600' }}>PRO FITNESS TRACKER</p>
        </header>

        <h2 style={{ marginBottom: '30px', fontSize: '1.5rem' }}>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>

        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              background: 'rgba(255, 59, 48, 0.1)', 
              color: '#FF3B30', 
              padding: '12px', 
              borderRadius: '12px', 
              marginBottom: '20px',
              fontSize: '0.85rem',
              border: '1px solid rgba(255, 59, 48, 0.2)'
            }}
          >
            {errorMessage}
          </motion.div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="email" 
              className="auth-input"
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="password" 
              className="auth-input"
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '10px', height: '50px' }}>
            {loading ? 'Processing...' : isSignUp ? <><UserPlus size={20} /> Sign Up</> : <><LogIn size={20} /> Sign In</>}
          </button>
        </form>

        <p style={{ marginTop: '30px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button 
            onClick={() => setIsSignUp(!isSignUp)} 
            style={{ 
              color: 'var(--primary)', 
              background: 'none', 
              border: 'none',
              padding: '4px 8px',
              marginLeft: '4px', 
              cursor: 'pointer', 
              fontWeight: '700',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          >
            {isSignUp ? 'Log In' : 'Sign Up'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;

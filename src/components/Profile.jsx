import React, { useState, useEffect } from 'react';
import { User, Camera, Save, X, Check, Target, Activity, Award, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';

const Profile = ({ session }) => {
  const [profile, setProfile] = useState({
    full_name: '',
    username: '',
    age: '',
    gender: '',
    height_cm: '',
    weight_kg: '',
    fitness_goal: '',
    target_weight_kg: '',
    activity_level: '',
    experience_level: '',
    avatar_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (session) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, username, age, gender, height_cm, weight_kg, fitness_goal, target_weight_kg, activity_level, experience_level, avatar_url, onboarding_completed')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          username: data.username || '',
          age: data.age || '',
          gender: data.gender || '',
          height_cm: data.height_cm || '',
          weight_kg: data.weight_kg || '',
          fitness_goal: data.fitness_goal || '',
          target_weight_kg: data.target_weight_kg || '',
          activity_level: data.activity_level || '',
          experience_level: data.experience_level || '',
          avatar_url: data.avatar_url || ''
        });
        setAvatarPreview(data.avatar_url);

        // Show onboarding if profile is incomplete
        if (!data.onboarding_completed) {
          setShowOnboarding(true);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletion = () => {
    let completed = 0;
    const total = 9;
    if (profile.full_name) completed++;
    if (profile.username) completed++;
    if (profile.age) completed++;
    if (profile.gender) completed++;
    if (profile.height_cm) completed++;
    if (profile.weight_kg) completed++;
    if (profile.fitness_goal) completed++;
    if (profile.activity_level) completed++;
    if (profile.experience_level) completed++;
    return Math.round((completed / total) * 100);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const completion = calculateCompletion();

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          email: session.user.email,
          full_name: profile.full_name || null,
          username: profile.username || null,
          age: profile.age ? parseInt(profile.age) : null,
          gender: profile.gender || null,
          height_cm: profile.height_cm ? parseFloat(profile.height_cm) : null,
          weight_kg: profile.weight_kg ? parseFloat(profile.weight_kg) : null,
          fitness_goal: profile.fitness_goal || null,
          target_weight_kg: profile.target_weight_kg ? parseFloat(profile.target_weight_kg) : null,
          activity_level: profile.activity_level || null,
          experience_level: profile.experience_level || null,
          avatar_url: profile.avatar_url || null,
          profile_completion: completion,
          onboarding_completed: completion >= 80
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      alert('Profile saved successfully!');
      if (completion >= 80) {
        setShowOnboarding(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
        setProfile(prev => ({ ...prev, avatar_url: e.target.result }));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading avatar:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <header>
        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Profile</h2>
        <p style={{ color: 'var(--text-muted)' }}>Manage your personal information and fitness goals.</p>
      </header>

      {/* Profile Completion Widget */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'conic-gradient(var(--primary) 0%, var(--primary) ' + calculateCompletion() + '%, rgba(255,255,255,0.1) ' + calculateCompletion() + '%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: 'var(--surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute'
          }}>
            <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>{calculateCompletion()}%</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Profile Completion</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {calculateCompletion() >= 80 ? 'Great job! Your profile is complete.' : 'Complete your profile to get personalized recommendations.'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Avatar Section */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} color="var(--primary)" /> Avatar
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'var(--surface-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: '3px solid var(--primary)'
            }}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={48} color="var(--text-muted)" />
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <Camera size={16} /> Change Avatar
              </label>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={20} color="var(--primary)" /> Basic Information
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Full Name</label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--surface-light)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Username</label>
              <input
                type="text"
                value={profile.username}
                onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--surface-light)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Age</label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile(prev => ({ ...prev, age: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'var(--surface-light)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Gender</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile(prev => ({ ...prev, gender: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'var(--surface-light)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                    outline: 'none'
                  }}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Body Metrics */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="var(--primary)" /> Body Metrics
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Height (cm)</label>
                <input
                  type="number"
                  value={profile.height_cm}
                  onChange={(e) => setProfile(prev => ({ ...prev, height_cm: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'var(--surface-light)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Weight (kg)</label>
                <input
                  type="number"
                  value={profile.weight_kg}
                  onChange={(e) => setProfile(prev => ({ ...prev, weight_kg: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'var(--surface-light)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Target Weight (kg)</label>
              <input
                type="number"
                value={profile.target_weight_kg}
                onChange={(e) => setProfile(prev => ({ ...prev, target_weight_kg: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--surface-light)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Fitness Goals */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="var(--primary)" /> Fitness Goals
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Primary Goal</label>
              <select
                value={profile.fitness_goal}
                onChange={(e) => setProfile(prev => ({ ...prev, fitness_goal: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--surface-light)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  outline: 'none'
                }}
              >
                <option value="">Select your goal</option>
                <option value="lose_weight">Lose Weight</option>
                <option value="gain_muscle">Gain Muscle</option>
                <option value="maintain">Maintain</option>
                <option value="improve_endurance">Improve Endurance</option>
                <option value="increase_strength">Increase Strength</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Activity Level</label>
              <select
                value={profile.activity_level}
                onChange={(e) => setProfile(prev => ({ ...prev, activity_level: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--surface-light)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  outline: 'none'
                }}
              >
                <option value="">Select your activity level</option>
                <option value="sedentary">Sedentary (little or no exercise)</option>
                <option value="light">Light (1-3 days/week)</option>
                <option value="moderate">Moderate (3-5 days/week)</option>
                <option value="active">Active (6-7 days/week)</option>
                <option value="very_active">Very Active (intense daily)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Experience Level</label>
              <select
                value={profile.experience_level}
                onChange={(e) => setProfile(prev => ({ ...prev, experience_level: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--surface-light)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  outline: 'none'
                }}
              >
                <option value="">Select your experience</option>
                <option value="beginner">Beginner (0-6 months)</option>
                <option value="intermediate">Intermediate (6 months - 2 years)</option>
                <option value="advanced">Advanced (2+ years)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{ padding: '14px 32px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {saving ? 'Saving...' : <><Save size={18} /> Save Profile</>}
        </button>
      </div>

      {/* Onboarding Modal */}
      {showOnboarding && (
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
          <div className="glass-card" style={{ padding: '32px', maxWidth: '500px', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(212, 175, 55, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <User size={40} color="var(--primary)" />
              </div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Welcome to TropaFit!</h2>
              <p style={{ color: 'var(--text-muted)' }}>Complete your profile to get personalized recommendations and track your progress.</p>
            </div>
            <button
              className="btn-primary"
              onClick={() => setShowOnboarding(false)}
              style={{ width: '100%', padding: '14px' }}
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

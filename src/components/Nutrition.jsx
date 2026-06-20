import React, { useState, useEffect, useRef } from 'react';
import { Utensils, Zap, Flame, PieChart, Plus, Camera, Search, ChevronRight, X, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Nutrition = ({ userData, setUserData }) => {
  const [dailyGoal, setDailyGoal] = useState(2200);
  const [meals, setMeals] = useState([
    { id: 1, name: 'Greek Yogurt with Berries', calories: 250, protein: 15, carbs: 30, fat: 5, time: '08:30 AM' },
    { id: 2, name: 'Grilled Chicken Salad', calories: 450, protein: 40, carbs: 10, fat: 20, time: '12:45 PM' }
  ]);
  const [showCamera, setShowCamera] = useState(false);
  const [mealPhoto, setMealPhoto] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const totals = meals.reduce((acc, meal) => ({
    calories: acc.calories + meal.calories,
    protein: acc.protein + meal.protein,
    carbs: acc.carbs + meal.carbs,
    fat: acc.fat + meal.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Your browser does not support camera access. Please use Chrome, Firefox, or Safari.');
      return;
    }

    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      alert('Camera access requires HTTPS. Please use a secure connection.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setShowCamera(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert('Camera permission denied. Please enable camera access in your browser settings and try again.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        alert('No camera found on your device. Please check your camera connection.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        alert('Camera is already in use by another application. Please close other apps and try again.');
      } else {
        alert('Unable to access camera: ' + error.message + '. Please try uploading a photo instead.');
      }
      
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => {
        track.stop();
        track.enabled = false;
      });
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg');
    setMealPhoto(imageData);
    stopCamera();
    
    // Here you would typically analyze the meal photo with AI
    // For now, just show a success message
    alert('Meal photo captured! AI analysis would be implemented here.');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setMealPhoto(e.target.result);
      alert('Meal photo uploaded! AI analysis would be implemented here.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', marginBottom: '4px' }}>Fuel Your <span className="neon-text">Progress</span></h2>
          <p style={{ color: 'var(--text-muted)' }}>Log your meals and track your macros with ease.</p>
        </div>
        <button 
          className="btn-primary"
          onClick={startCamera}
          style={{ minWidth: 'fit-content' }}
        >
          <Camera size={20} /> Scan Meal
        </button>
      </header>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
        <div className="glass-card floating" style={{ padding: '20px', textAlign: 'center', border: '1px solid var(--primary-glow)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>Calories Left</p>
          <h3 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: '900', letterSpacing: '-1px' }}>{dailyGoal - totals.calories}</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '4px' }}>of {dailyGoal} kcal</p>
        </div>
        <div className="glass-card" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0, 119, 255, 0.1)', color: 'var(--secondary)' }}>
            <Zap size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Protein</p>
            <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{totals.protein}g / 150g</p>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0, 242, 254, 0.1)', color: 'var(--primary)' }}>
            <Flame size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Carbs</p>
            <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{totals.carbs}g / 220g</p>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(46, 196, 182, 0.1)', color: '#2EC4B6' }}>
            <PieChart size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fats</p>
            <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{totals.fat}g / 70g</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1.3rem' }}>Today's Meals</h3>
            <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Plus size={16} /> Add Meal
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {meals.map(meal => (
              <div key={meal.id} style={{ 
                padding: '14px', 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid var(--glass-border)',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, minWidth: '0' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--surface-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Utensils size={18} color="var(--primary)" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meal.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{meal.time} • {meal.protein}g P • {meal.carbs}g C • {meal.fat}g F</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>{meal.calories} kcal</p>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1.3rem' }}>Quick Estimates</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>Based on your activity, here is your target:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--secondary)', background: 'rgba(0, 119, 255, 0.1)' }}>
              <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>Maintenance</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '800' }}>2,450 kcal</p>
            </div>
            <div style={{ padding: '14px', borderRadius: '12px', background: 'var(--surface-light)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fat Loss (Cutting)</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '800' }}>1,950 kcal</p>
            </div>
            <div style={{ padding: '14px', borderRadius: '12px', background: 'var(--surface-light)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lean Gain (Bulking)</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '800' }}>2,750 kcal</p>
            </div>
          </div>
          <button className="btn-secondary" style={{ width: '100%', marginTop: '16px', padding: '12px' }}>Recalculate TDEE</button>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.9)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{ position: 'relative', maxWidth: '640px', width: '100%' }}>
            <div style={{ 
              position: 'absolute',
              top: '16px',
              left: '16px',
              background: 'rgba(0,0,0,0.6)',
              padding: '8px 16px',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.85rem',
              zIndex: 10,
            }}>
              Scan Meal
            </div>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                borderRadius: '12px',
                background: '#000',
                aspectRatio: '16/9',
              }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <button
              onClick={stopCamera}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                zIndex: 10,
              }}
            >
              <X size={20} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={capturePhoto}
              className="btn-primary"
              style={{ padding: '16px 32px', fontSize: '1rem' }}
            >
              <Camera size={20} /> Capture Photo
            </button>
            <button
              onClick={stopCamera}
              className="btn-secondary"
              style={{ padding: '16px 32px', fontSize: '1rem' }}
            >
              Cancel
            </button>
          </div>
          <div style={{ 
            marginTop: '16px', 
            color: 'rgba(255,255,255,0.6)', 
            fontSize: '0.8rem',
            textAlign: 'center'
          }}>
            If camera doesn't appear, please allow camera access in your browser
          </div>
        </div>
      )}
    </div>
  );
};

export default Nutrition;

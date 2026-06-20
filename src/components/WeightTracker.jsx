import React, { useState, useEffect, useRef } from 'react';
import { Scale, TrendingDown, Calendar, Plus, Camera, History, Target, X, Upload } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../supabaseClient';
import { calculateLinearRegression } from '../utils/regression';

const WeightTracker = ({ session }) => {
  const [logs, setLogs] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [frontPhoto, setFrontPhoto] = useState(null);
  const [sidePhoto, setSidePhoto] = useState(null);
  const [showCamera, setShowCamera] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (session) {
      fetchWeightLogs();
      fetchProgressPhotos();
    }
  }, [session]);

  const fetchWeightLogs = async () => {
    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .order('log_date', { ascending: true });

    if (data && data.length > 0) {
      const formattedLogs = data.map(log => ({
        date: new Date(log.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: parseFloat(log.weight),
        rawDate: new Date(log.log_date).getTime()
      }));
      setLogs(formattedLogs);
      calculateTrend(formattedLogs);
    }
  };

  const calculateTrend = (data) => {
    if (data.length < 2) return;

    // Map dates to numbers (days since first log)
    const firstDate = data[0].rawDate;
    const regressionData = data.map(d => ({
      x: (d.rawDate - firstDate) / (1000 * 60 * 60 * 24),
      y: d.weight
    }));

    const result = calculateLinearRegression(regressionData);
    if (result) {
      // Predict weight 30 days from now
      const futureX = regressionData[regressionData.length - 1].x + 30;
      setPrediction({
        weight: result.predict(futureX).toFixed(1),
        slope: result.slope.toFixed(3),
        rSquared: result.rSquared.toFixed(2)
      });
    }
  };

  const logWeight = async () => {
    if (!newWeight || isNaN(parseFloat(newWeight))) {
      alert('Please enter a valid weight');
      return;
    }
    
    if (!session || !session.user) {
      alert('You must be logged in to log weight');
      return;
    }

    try {
      console.log('Attempting to log weight:', parseFloat(newWeight));
      const { data, error } = await supabase
        .from('weight_logs')
        .insert([{
          user_id: session.user.id,
          weight: parseFloat(newWeight)
        }])
        .select();

      if (error) {
        console.error('Error logging weight:', error);
        alert('Failed to log weight: ' + error.message);
        return;
      }

      if (data) {
        console.log('Weight logged successfully:', data);
        setNewWeight('');
        fetchWeightLogs();
      }
    } catch (error) {
      console.error('Unexpected error logging weight:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const fetchProgressPhotos = async () => {
    const { data, error } = await supabase
      .from('user_progress_photos')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(2);

    if (data && data.length > 0) {
      data.forEach(photo => {
        if (photo.photo_type === 'front') {
          setFrontPhoto(photo.photo_url);
        } else if (photo.photo_type === 'side') {
          setSidePhoto(photo.photo_url);
        }
      });
    }
  };

  const startCamera = async (type) => {
    setShowCamera(type);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: type === 'front' ? 'user' : 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
      setShowCamera(null);
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
    setShowCamera(null);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg');
    
    if (showCamera === 'front') {
      setFrontPhoto(imageData);
      await savePhotoToSupabase(imageData, 'front');
    } else {
      setSidePhoto(imageData);
      await savePhotoToSupabase(imageData, 'side');
    }
    
    stopCamera();
  };

  const savePhotoToSupabase = async (imageData, type) => {
    try {
      // Convert base64 to blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      const fileName = `${session.user.id}_${type}_${Date.now()}.jpg`;
      
      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('progress-photos')
        .upload(fileName, blob);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('progress-photos')
        .getPublicUrl(fileName);
      
      // Save to database
      const { error: dbError } = await supabase
        .from('user_progress_photos')
        .insert([{
          user_id: session.user.id,
          photo_type: type,
          photo_url: publicUrl
        }]);
      
      if (dbError) throw dbError;
      
    } catch (error) {
      console.error('Error saving photo:', error);
      alert('Failed to save photo. Please try again.');
    }
  };

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target.result;
      if (type === 'front') {
        setFrontPhoto(imageData);
        await savePhotoToSupabase(imageData, 'front');
      } else {
        setSidePhoto(imageData);
        await savePhotoToSupabase(imageData, 'side');
      }
    };
    reader.readAsDataURL(file);
  };

  const currentWeight = logs.length > 0 ? logs[logs.length - 1].weight : 0;
  const startWeight = logs.length > 0 ? logs[0].weight : 0;
  const lost = (startWeight - currentWeight).toFixed(1);

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '4px' }}>Body <span className="neon-text">Metrics</span></h2>
          <p style={{ color: 'var(--text-muted)' }}>Track your weight and forecast your progress with AI.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="number" 
            placeholder="00.0"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            style={{ width: '80px', background: 'var(--surface-light)', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', color: '#fff' }}
          />
          <button className="btn-primary" onClick={logWeight}>
            <Plus size={20} /> Log
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div className="glass-card" style={{ padding: '24px', flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Current Weight</span>
            <Scale size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>{currentWeight} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>kg</span></div>
        </div>
        <div className="glass-card" style={{ padding: '24px', flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Total Progress</span>
            <TrendingDown size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)' }}>{lost > 0 ? `-${lost}` : lost} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>kg</span></div>
        </div>
        {prediction && (
          <div className="glass-card" style={{ padding: '24px', flex: 1, minWidth: '200px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: 'var(--text-muted)' }}>30-Day Forecast</span>
              <Target size={20} color="var(--secondary)" />
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--secondary)' }}>{prediction.weight} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>kg</span></div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Based on current trend ({prediction.slope} kg/day)</div>
          </div>
        )}
      </div>

      <div className="glass-card" style={{ padding: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0 }}>Weight Journey</h3>
          {prediction && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px' }}>
              Trend Confidence: <span style={{ color: 'var(--primary)' }}>{Math.round(prediction.rSquared * 100)}%</span>
            </div>
          )}
        </div>
        <div style={{ height: '350px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={logs}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--text-muted)" tickLine={false} axisLine={false} dy={10} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="var(--text-muted)" tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
              />
              <Area type="monotone" dataKey="weight" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="glass-card" style={{ flex: 1, padding: '24px' }}>
          <h3>Progress Photos</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '12px 0 20px' }}>Capture or upload photos to track your physical changes.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            {/* Front Photo */}
            <div style={{ position: 'relative' }}>
              {frontPhoto ? (
                <div style={{ aspectRatio: '3/4', borderRadius: '15px', overflow: 'hidden', position: 'relative' }}>
                  <img src={frontPhoto} alt="Front" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    onClick={() => setFrontPhoto(null)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(0,0,0,0.6)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div style={{ aspectRatio: '3/4', background: 'var(--surface-light)', borderRadius: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px dashed var(--glass-border)' }}>
                  <Camera size={24} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>Add Front</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                  onClick={() => startCamera('front')}
                  className="btn-secondary"
                  style={{ flex: 1, fontSize: '0.75rem', padding: '8px' }}
                >
                  <Camera size={14} /> Camera
                </button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'front')}
                  style={{ display: 'none' }}
                  id="front-upload"
                />
                <label
                  htmlFor="front-upload"
                  className="btn-secondary"
                  style={{ flex: 1, fontSize: '0.75rem', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer' }}
                >
                  <Upload size={14} /> Upload
                </label>
              </div>
            </div>

            {/* Side Photo */}
            <div style={{ position: 'relative' }}>
              {sidePhoto ? (
                <div style={{ aspectRatio: '3/4', borderRadius: '15px', overflow: 'hidden', position: 'relative' }}>
                  <img src={sidePhoto} alt="Side" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    onClick={() => setSidePhoto(null)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(0,0,0,0.6)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div style={{ aspectRatio: '3/4', background: 'var(--surface-light)', borderRadius: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px dashed var(--glass-border)' }}>
                  <Camera size={24} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>Add Side</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                  onClick={() => startCamera('side')}
                  className="btn-secondary"
                  style={{ flex: 1, fontSize: '0.75rem', padding: '8px' }}
                >
                  <Camera size={14} /> Camera
                </button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'side')}
                  style={{ display: 'none' }}
                  id="side-upload"
                />
                <label
                  htmlFor="side-upload"
                  className="btn-secondary"
                  style={{ flex: 1, fontSize: '0.75rem', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer' }}
                >
                  <Upload size={14} /> Upload
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ flex: 1, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3>Log History</h3>
            <History size={20} color="var(--text-muted)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
            {logs.slice().reverse().map((log, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>{log.date}</span>
                <span style={{ fontWeight: '700' }}>{log.weight} kg</span>
              </div>
            ))}
            {logs.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No logs yet.</p>}
          </div>
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
              {showCamera === 'front' ? 'Front View' : 'Side View'}
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
          <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
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

export default WeightTracker;

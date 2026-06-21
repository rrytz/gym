import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Check, Clock, Calendar, X, Dumbbell, Droplets, Utensils, Target, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';

const Reminders = ({ session }) => {
  const [reminders, setReminders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [newReminder, setNewReminder] = useState({
    reminder_type: 'workout',
    title: '',
    description: '',
    reminder_time: '09:00',
    reminder_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  });

  useEffect(() => {
    if (session) {
      fetchReminders();
      fetchNotifications();
      requestNotificationPermission();
    }
  }, [session]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const fetchReminders = async () => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('reminder_time', { ascending: true });

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(data || []);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const addReminder = async () => {
    try {
      const { error } = await supabase
        .from('reminders')
        .insert([{
          user_id: session.user.id,
          reminder_type: newReminder.reminder_type,
          title: newReminder.title,
          description: newReminder.description,
          reminder_time: newReminder.reminder_time,
          reminder_days: newReminder.reminder_days,
          is_enabled: true
        }]);

      if (error) throw error;

      setShowAddForm(false);
      setNewReminder({
        reminder_type: 'workout',
        title: '',
        description: '',
        reminder_time: '09:00',
        reminder_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      });

      fetchReminders();
    } catch (error) {
      console.error('Error adding reminder:', error);
      alert('Failed to add reminder. Please try again.');
    }
  };

  const deleteReminder = async (id) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting reminder:', error);
      alert('Failed to delete reminder. Please try again.');
    }
  };

  const toggleReminder = async (id, isEnabled) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ is_enabled: isEnabled })
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;
      setReminders(prev => prev.map(r => r.id === id ? { ...r, is_enabled: isEnabled } : r));
    } catch (error) {
      console.error('Error toggling reminder:', error);
      alert('Failed to toggle reminder. Please try again.');
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', session.user.id)
        .eq('is_read', false);

      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const sendTestNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('TropaFit Reminder', {
        body: 'This is a test notification from TropaFit',
        icon: '/icon-192.png'
      });
    } else {
      alert('Notifications are not enabled. Please enable them in your browser settings.');
    }
  };

  const getReminderIcon = (type) => {
    switch (type) {
      case 'workout': return Dumbbell;
      case 'water': return Droplets;
      case 'meal': return Utensils;
      case 'goal': return Target;
      default: return Bell;
    }
  };

  const getReminderTypeColor = (type) => {
    switch (type) {
      case 'workout': return '#D4AF37';
      case 'water': return '#007AFF';
      case 'meal': return '#FF9500';
      case 'goal': return '#4cd964';
      default: return 'var(--primary)';
    }
  };

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading reminders...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Reminders</h2>
          <p style={{ color: 'var(--text-muted)' }}>Set up reminders to stay on track with your fitness goals.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn-secondary"
            onClick={sendTestNotification}
            style={{ position: 'relative' }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#ff3b30',
                color: '#fff',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '0.7rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700'
              }}>
                {unreadCount}
              </span>
            )}
          </button>
          <button className="btn-primary" onClick={() => setShowAddForm(true)}>
            <Plus size={20} /> Add Reminder
          </button>
        </div>
      </header>

      {/* Notification Center */}
      {showNotificationCenter && (
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
          <div className="glass-card" style={{ padding: '32px', maxWidth: '500px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.5rem' }}>Notifications</h3>
              <button
                onClick={() => setShowNotificationCenter(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                No notifications yet
              </div>
            ) : (
              <>
                <button
                  className="btn-secondary"
                  onClick={markAllAsRead}
                  style={{ width: '100%', marginBottom: '16px' }}
                >
                  Mark All as Read
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      style={{
                        padding: '16px',
                        background: notification.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(212, 175, 55, 0.1)',
                        borderRadius: '12px',
                        border: notification.is_read ? '1px solid var(--glass-border)' : '1px solid var(--primary)',
                        cursor: 'pointer'
                      }}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '600' }}>{notification.title}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(notification.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{notification.message}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Reminders List */}
      <div className="glass-card" style={{ padding: '24px' }}>
        {reminders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No reminders set yet. Click "Add Reminder" to get started.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reminders.map(reminder => {
              const Icon = getReminderIcon(reminder.reminder_type);
              return (
                <div key={reminder.id} style={{
                  padding: '20px',
                  background: reminder.is_enabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: reminder.is_enabled ? 1 : 0.6
                }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: getReminderTypeColor(reminder.reminder_type) + '20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={24} color={getReminderTypeColor(reminder.reminder_type)} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '4px' }}>{reminder.title}</h4>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} /> {reminder.reminder_time}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} /> {reminder.reminder_days.slice(0, 3).join(', ')}
                          {reminder.reminder_days.length > 3 && '...'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => toggleReminder(reminder.id, !reminder.is_enabled)}
                      style={{
                        background: reminder.is_enabled ? 'rgba(76, 217, 100, 0.1)' : 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px',
                        cursor: 'pointer',
                        color: reminder.is_enabled ? '#4cd964' : 'var(--text-muted)'
                      }}
                    >
                      {reminder.is_enabled ? <Check size={16} /> : <AlertCircle size={16} />}
                    </button>
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      style={{
                        background: 'rgba(255, 59, 48, 0.1)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px',
                        cursor: 'pointer',
                        color: '#ff3b30'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Reminder Modal */}
      {showAddForm && (
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
          <div className="glass-card" style={{ padding: '32px', maxWidth: '500px', width: '100', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.5rem' }}>Add Reminder</h3>
              <button
                onClick={() => setShowAddForm(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Reminder Type
                </label>
                <select
                  value={newReminder.reminder_type}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, reminder_type: e.target.value }))}
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
                  <option value="workout">Workout</option>
                  <option value="water">Water</option>
                  <option value="meal">Meal</option>
                  <option value="goal">Goal</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Title
                </label>
                <input
                  type="text"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Morning Workout"
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
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Description (optional)
                </label>
                <textarea
                  value={newReminder.description}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add details about your reminder..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'var(--surface-light)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                    outline: 'none',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Time
                </label>
                <input
                  type="time"
                  value={newReminder.reminder_time}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, reminder_time: e.target.value }))}
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
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Repeat on
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      onClick={() => {
                        setNewReminder(prev => ({
                          ...prev,
                          reminder_days: prev.reminder_days.includes(day)
                            ? prev.reminder_days.filter(d => d !== day)
                            : [...prev.reminder_days, day]
                        }));
                      }}
                      style={{
                        padding: '8px 12px',
                        background: newReminder.reminder_days.includes(day) ? 'var(--primary)' : 'var(--surface-light)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '6px',
                        color: newReminder.reminder_days.includes(day) ? '#141210' : 'var(--text)',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        textTransform: 'capitalize'
                      }}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  className="btn-secondary"
                  onClick={() => setShowAddForm(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={addReminder}
                  style={{ flex: 1 }}
                >
                  Add Reminder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reminders;

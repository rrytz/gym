import React, { useState, useEffect } from 'react';
import { Utensils, Zap, Flame, PieChart, Plus, Camera, Search, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Nutrition = ({ userData, setUserData }) => {
  const [dailyGoal, setDailyGoal] = useState(2200);
  const [meals, setMeals] = useState([
    { id: 1, name: 'Greek Yogurt with Berries', calories: 250, protein: 15, carbs: 30, fat: 5, time: '08:30 AM' },
    { id: 2, name: 'Grilled Chicken Salad', calories: 450, protein: 40, carbs: 10, fat: 20, time: '12:45 PM' }
  ]);

  const totals = meals.reduce((acc, meal) => ({
    calories: acc.calories + meal.calories,
    protein: acc.protein + meal.protein,
    carbs: acc.carbs + meal.carbs,
    fat: acc.fat + meal.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '4px' }}>Fuel Your <span className="neon-text">Progress</span></h2>
          <p style={{ color: 'var(--text-muted)' }}>Log your meals and track your macros with ease.</p>
        </div>
        <button className="btn-primary">
          <Camera size={20} /> Scan Meal
        </button>
      </header>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div className="glass-card floating" style={{ padding: '24px', textAlign: 'center', border: '1px solid var(--primary-glow)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Calories Left</p>
          <h3 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-1px' }}>{dailyGoal - totals.calories}</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '4px' }}>of {dailyGoal} kcal</p>
        </div>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0, 119, 255, 0.1)', color: 'var(--secondary)' }}>
            <Zap size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Protein</p>
            <p style={{ fontWeight: '700' }}>{totals.protein}g / 150g</p>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0, 242, 255, 0.1)', color: '#00F2FF' }}>
            <Flame size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Carbs</p>
            <p style={{ fontWeight: '700' }}>{totals.carbs}g / 220g</p>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(46, 196, 182, 0.1)', color: '#2EC4B6' }}>
            <PieChart size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fats</p>
            <p style={{ fontWeight: '700' }}>{totals.fat}g / 70g</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="glass-card" style={{ flex: 2, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Today's Meals</h3>
            <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Plus size={16} /> Add Meal
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {meals.map(meal => (
              <div key={meal.id} style={{ 
                padding: '16px', 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid var(--glass-border)'
              }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--surface-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Utensils size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem' }}>{meal.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{meal.time} • {meal.protein}g P • {meal.carbs}g C • {meal.fat}g F</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: '700' }}>{meal.calories} kcal</p>
                  <ChevronRight size={18} color="var(--text-muted)" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ flex: 1, padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Quick Estimates</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>Based on your activity, here is your target:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', borderRadius: '16px', border: '1px solid var(--secondary)', background: 'rgba(0, 119, 255, 0.1)' }}>
              <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Maintenance</p>
              <p style={{ fontSize: '1.2rem', fontWeight: '800' }}>2,450 kcal</p>
            </div>
            <div style={{ padding: '16px', borderRadius: '16px', background: 'var(--surface-light)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fat Loss (Cutting)</p>
              <p style={{ fontSize: '1.2rem', fontWeight: '800' }}>1,950 kcal</p>
            </div>
            <div style={{ padding: '16px', borderRadius: '16px', background: 'var(--surface-light)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lean Gain (Bulking)</p>
              <p style={{ fontSize: '1.2rem', fontWeight: '800' }}>2,750 kcal</p>
            </div>
          </div>
          <button className="btn-secondary" style={{ width: '100%', marginTop: '20px' }}>Recalculate TDEE</button>
        </div>
      </div>
    </div>
  );
};

export default Nutrition;

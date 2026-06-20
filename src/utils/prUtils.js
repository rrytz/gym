/**
 * Personal record utilities — single source of truth for PR calculations.
 */

export const estimate1RM = (weight, reps) => {
  const w = parseFloat(weight) || 0;
  const r = parseInt(reps) || 0;
  if (w <= 0 || r <= 0) return 0;
  return Math.round(w * (1 + r / 30) * 10) / 10;
};

export const inferMuscleGroup = (name, fallback = 'General') => {
  if (!name) return fallback;
  const lower = name.toLowerCase();
  if (lower.includes('bench') || lower.includes('chest') || lower.includes('fly')) return 'Chest';
  if (lower.includes('squat') || lower.includes('leg') || lower.includes('calf') || lower.includes('lunge') || lower.includes('deadlift')) return 'Legs';
  if (lower.includes('pull') || lower.includes('row') || lower.includes('lat') || lower.includes('chin')) return 'Back';
  if (lower.includes('shoulder') || lower.includes('raise') || lower.includes('shrug')) return 'Shoulders';
  if (lower.includes('curl') || lower.includes('tricep') || lower.includes('bicep') || lower.includes('pushdown') || lower.includes('arm')) return 'Arms';
  if (lower.includes('plank') || lower.includes('crunch') || lower.includes('situp') || lower.includes('abs')) return 'Core';
  if (lower.includes('press')) return 'Chest';
  return fallback;
};

export const calculatePRsFromWorkouts = (workouts) => {
  const calculated = {};
  if (!workouts || !Array.isArray(workouts)) return calculated;

  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(a.start_time || a.date) - new Date(b.start_time || b.date)
  );

  sortedWorkouts.forEach(workout => {
    if (!workout.exercises || !Array.isArray(workout.exercises)) return;

    workout.exercises.forEach(ex => {
      if (!ex.name || !ex.sets || !Array.isArray(ex.sets)) return;

      const name = ex.name;
      const muscle = ex.muscle && ex.muscle !== 'Target' ? ex.muscle : inferMuscleGroup(name);

      ex.sets.forEach(set => {
        if (!set.completed) return;
        const weight = parseFloat(set.weight) || 0;
        const reps = parseInt(set.reps) || 0;
        if (weight <= 0 || reps <= 0) return;

        const est1RM = estimate1RM(weight, reps);
        const dateStr = workout.start_time || workout.date || new Date().toISOString();
        const formattedDate = new Date(dateStr).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });

        const setEntry = {
          weight,
          reps,
          est1RM,
          date: formattedDate,
          rawDate: dateStr,
          workoutTitle: workout.title || 'Workout'
        };

        if (!calculated[name]) {
          calculated[name] = {
            name,
            muscle,
            maxWeight: weight,
            maxReps: reps,
            maxEst1RM: est1RM,
            date: formattedDate,
            rawDate: dateStr,
            workoutTitle: workout.title || 'Workout',
            history: [setEntry]
          };
        } else {
          const current = calculated[name];
          if (weight > current.maxWeight || (weight === current.maxWeight && reps > current.maxReps)) {
            current.maxWeight = weight;
            current.maxReps = reps;
            current.date = formattedDate;
            current.rawDate = dateStr;
            current.workoutTitle = workout.title || 'Workout';
          }
          if (est1RM > current.maxEst1RM) {
            current.maxEst1RM = est1RM;
          }
          const exists = current.history.some(h => h.date === formattedDate && h.weight === weight);
          if (!exists) {
            current.history.push(setEntry);
          }
        }
      });
    });
  });

  Object.keys(calculated).forEach(key => {
    calculated[key].history.sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
  });

  return calculated;
};

export const detectSessionPRs = (sessionExercises, priorWorkouts) => {
  const sessionPRs = [];
  if (!sessionExercises || !Array.isArray(sessionExercises)) return sessionPRs;

  sessionExercises.forEach(ex => {
    const currentMaxSet = ex.sets
      ?.filter(s => s.completed)
      .reduce((max, s) => {
        const w = parseFloat(s.weight) || 0;
        const r = parseInt(s.reps) || 0;
        if (w > max.weight || (w === max.weight && r > max.reps)) {
          return { weight: w, reps: r };
        }
        return max;
      }, { weight: 0, reps: 0 }) || { weight: 0, reps: 0 };

    if (currentMaxSet.weight <= 0) return;

    const previousMaxWeight = (priorWorkouts || []).reduce((maxW, w) => {
      const matchEx = w.exercises?.find(prevEx => prevEx.name === ex.name);
      if (!matchEx) return maxW;
      const matchMax = matchEx.sets
        ?.filter(s => s.completed)
        .reduce((m, s) => Math.max(m, parseFloat(s.weight) || 0), 0) || 0;
      return Math.max(maxW, matchMax);
    }, 0);

    if (currentMaxSet.weight > previousMaxWeight) {
      sessionPRs.push({
        exerciseName: ex.name,
        weight: currentMaxSet.weight,
        reps: currentMaxSet.reps,
        isFirstTime: previousMaxWeight === 0
      });
    }
  });

  return sessionPRs;
};

export const getExercisePR = (exerciseName, prs) => {
  if (!exerciseName || !prs) return null;
  return prs[exerciseName] || null;
};

export const isSetPotentialPR = (exerciseName, weight, reps, prs) => {
  const w = parseFloat(weight) || 0;
  const r = parseInt(reps) || 0;
  if (w <= 0 || r <= 0) return false;

  const existing = getExercisePR(exerciseName, prs);
  if (!existing) return true;
  return w > existing.maxWeight || (w === existing.maxWeight && r > existing.maxReps);
};

export const getPRsThisWeek = (prs) => {
  if (!prs || typeof prs !== 'object') return [];
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  return Object.values(prs).filter(pr => {
    const d = new Date(pr.rawDate);
    return d >= weekAgo;
  });
};

export const mergeSessionPRsIntoStore = (currentPr, sessionPRs, workoutMeta = {}) => {
  const updated = { ...(currentPr || {}) };
  const now = workoutMeta.end_time || new Date().toISOString();
  const formattedDate = new Date(now).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  sessionPRs.forEach(pr => {
    updated[pr.exerciseName] = {
      name: pr.exerciseName,
      muscle: inferMuscleGroup(pr.exerciseName),
      maxWeight: pr.weight,
      maxReps: pr.reps,
      maxEst1RM: estimate1RM(pr.weight, pr.reps),
      date: formattedDate,
      rawDate: now,
      workoutTitle: workoutMeta.title || 'Workout',
      isFirstTime: pr.isFirstTime,
      history: []
    };
  });

  return updated;
};

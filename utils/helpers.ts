import AsyncStorage from '@react-native-async-storage/async-storage';

let cachedUserProfile: { age: string; gender: string; weight: string; height: string } | null = null;

// Call this function at app startup (or when profile changes) to cache the profile.
export const loadUserProfile = async (): Promise<void> => {
  try {
    const profileString = await AsyncStorage.getItem('userProfile');
    if (profileString) {
      cachedUserProfile = JSON.parse(profileString);
    }
  } catch (error) {
    console.error('Failed to load user profile:', error);
  }
};

export const getUserBodyWeight = (): number => {
  if (cachedUserProfile && cachedUserProfile.weight) {
    const bw = parseInt(cachedUserProfile.weight, 10);
    return isNaN(bw) ? 100 : bw;
  }
  // Default if profile not loaded
  return 100;
};

export const getCurrentWeek = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const week = getWeekNumber(now);
  return `${year}-W${week}`;
};

export const getWeekFromDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${week}`;
};

export const getMonthFromDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.toLocaleString('default', { month: 'long' });
  return `${month} ${year}`;
};

const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDays = Math.floor((date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
};

export const optimalSetRecommendations: Record<string, { min: string; optimal: string; upper: string }> = {
  "Chest": { min: "6-8", optimal: "12-18", upper: "20-25" },
  "Back": { min: "8-10", optimal: "14-20", upper: "22-25" },
  "Quads": { min: "6-10", optimal: "12-18", upper: "20-25" },
  "Hamstrings": { min: "5-8", optimal: "10-15", upper: "18-20" },
  "Shoulders": { min: "5-8", optimal: "10-15", upper: "18-20" },
  "Arms": { min: "6-10", optimal: "12-15", upper: "18-20" },
};

export const getVolumeStatus = (muscleGroup: string, totalWeeklySets: number): string => {
  const guideline = optimalSetRecommendations[muscleGroup];
  if (totalWeeklySets === 0)
    return "😴 No gains: Time to rise and shine in the gym! Add at least a few sets.";
  if (!guideline) return "No Guideline";

  // Parse the guideline boundaries 
  const minSets = parseInt(guideline.min.split('-')[0]);
  const optimalMin = parseInt(guideline.optimal.split('-')[0]);
  const optimalMax = parseInt(guideline.optimal.split('-')[1]);
  const maxSets = parseInt(guideline.upper.split('-')[0]);

  if (totalWeeklySets < minSets) {
    const diff = minSets - totalWeeklySets;
    return `😬 Too Low: Your muscles are snoozing—pump up the volume! Add ${diff} set${diff > 1 ? 's' : ''} to reach the minimum effective range.`;
  } else if (totalWeeklySets === minSets) {
    const diff = optimalMin - totalWeeklySets;
    return `👍 Minimum reached: Welcome to the gains club! Add ${diff} more set${diff > 1 ? 's' : ''} to hit the lower optimal threshold.`;
  } else if (totalWeeklySets > minSets && totalWeeklySets < optimalMin) {
    const diff = optimalMin - totalWeeklySets;
    return `🚀 Almost there: Just ${diff} more set${diff > 1 ? 's' : ''} and you'll be flexin' like a pro!`;
  } else if (totalWeeklySets === optimalMin) {
    const diff = optimalMax - totalWeeklySets;
    return `🎉 Lower optimal reached: Your gains are getting serious! Add ${diff} more set${diff > 1 ? 's' : ''} for maximum benefits.`;
  } else if (totalWeeklySets > optimalMin && totalWeeklySets < optimalMax) {
    return "💪 Optimal: Gains on point—keep rocking those weights!";
  } else if (totalWeeklySets === optimalMax) {
    return "🎊 Upper optimal reached: Maximum gains unlocked! You're right on target.";
  } else if (totalWeeklySets > optimalMax && totalWeeklySets <= maxSets) {
    const diff = totalWeeklySets - optimalMax;
    return `😎 Overachiever: Crushing it, but maybe ease off by ${diff} set${diff > 1 ? 's' : ''} to stay in the optimal zone.`;
  } else {
    const diff = totalWeeklySets - maxSets;
    return `⚠️ Danger: Overtraining detected! Reduce by ${diff} set${diff > 1 ? 's' : ''} to get back to safe territory.`;
  }
};



export const computeVolumeForExercise = (exercise: { exercise: string; sets: number; reps: number[]; weights: string[] }): number => {
  let volume = 0;
  const userBW = getUserBodyWeight();

  for (let i = 0; i < exercise.sets; i++) {
    const reps = exercise.reps[i] || 0;
    const weightStr = exercise.weights[i] || "0";
    let weight = parseInt(weightStr.replace(/\D/g, "")) || 0;

    // Handle pure bodyweight exercises
    if (weightStr.toLowerCase() === "bodyweight") {
      weight = userBW;
    }

    // Handle weighted bodyweight exercises (e.g., "Weighted Pull-ups")
    if (exercise.exercise.toLowerCase().includes("weighted") && weight > 0) {
      weight += userBW;
    }

    volume += reps * weight;
  }

  return volume;
};

export const getColorForTotalSets = (totalSets: number): string => {
  if (totalSets >= 20) return '#FF5722';
  if (totalSets >= 15) return '#FF8A65';
  if (totalSets >= 10) return '#FFCCBC';
  return '#eee';
};

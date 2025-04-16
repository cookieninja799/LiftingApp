// Analytics.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import StatsOverview from '../../components/analytics/StatsOverview';
import MuscleGroupStats from '../../components/analytics/MuscleGroupStats';
import CalendarHeatMap from '../../components/analytics/CalendarHeatMap';
import WorkoutLegend from '../../components/analytics/WorkoutLegend';
import { getCurrentWeek, getWeekFromDate, getVolumeStatus, computeVolumeForExercise } from '../../utils/helpers';

interface WorkoutSession {
  id: string;
  date: string;
  exercises: {
    exercise: string;
    sets: number;
    reps: number[];
    weights: string[];
    primaryMuscleGroup: string;
  }[];
}

interface WorkoutStats {
  totalWorkoutDays: number;
  mostCommonExercise: string;
  averageExercisesPerDay: number;
  averageSetsPerDay: number;
  muscleGroupStats: Record<string, { totalVolume: number; averageVolume: number; weeklySets: Record<string, number>; }>;
}

const Analytics: React.FC = () => {
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats>({
    totalWorkoutDays: 0,
    mostCommonExercise: '',
    averageExercisesPerDay: 0,
    averageSetsPerDay: 0,
    muscleGroupStats: {},
  });
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});

  const calculateStats = async () => {
    try {
      const storedSessions = await AsyncStorage.getItem('workoutSessions');
      if (!storedSessions) return;
  
      const sessions: WorkoutSession[] = JSON.parse(storedSessions);
      const dateTotalSets: Record<string, number> = {}; // ✅ Track sets per day for heat map
      const totalWorkoutDays = sessions.length;
      let totalExercises = 0;
      let totalSets = 0;
      const exerciseFrequency: Record<string, number> = {};
      
      const currentWeek = getCurrentWeek(); // ✅ Get the current week dynamically
      let totalWeeklySets = 0; // ✅ Track only this week's total sets
  
      // ✅ Use nested objects for weekly muscle group stats
      const weeklyMuscleGroupStats: Record<string, Record<string, { totalSets: number; totalVolume: number; sessionCount: number; weeklySets: Record<string, number> }>> = {};
  
      const muscleGroupSessionCount: Record<string, number> = {};
  
      sessions.forEach(session => {
        let dailyTotalSets = 0;
        session.exercises.forEach(ex => {
          dailyTotalSets += ex.sets; // ✅ Track total sets per day
        });
  
        dateTotalSets[session.date] = dailyTotalSets; // ✅ Store total sets per day
        const week = getWeekFromDate(session.date);
        if (!weeklyMuscleGroupStats[week]) {
          weeklyMuscleGroupStats[week] = {};
        }
  
        session.exercises.forEach(ex => {
          totalSets += ex.sets;
          totalExercises++; // ✅ Fix: Count total exercises properly
  
          const key = ex.exercise.toLowerCase();
          exerciseFrequency[key] = (exerciseFrequency[key] || 0) + 1;
  
          if (!weeklyMuscleGroupStats[week][ex.primaryMuscleGroup]) {
            weeklyMuscleGroupStats[week][ex.primaryMuscleGroup] = {
              totalSets: 0,
              totalVolume: 0,
              sessionCount: 0,
              weeklySets: {},
            };
          }
  
          const exerciseVolume = computeVolumeForExercise(ex);
  
          weeklyMuscleGroupStats[week][ex.primaryMuscleGroup].totalSets += ex.sets;
          weeklyMuscleGroupStats[week][ex.primaryMuscleGroup].totalVolume += exerciseVolume;
          weeklyMuscleGroupStats[week][ex.primaryMuscleGroup].sessionCount += 1;
          weeklyMuscleGroupStats[week][ex.primaryMuscleGroup].weeklySets[week] =
            (weeklyMuscleGroupStats[week][ex.primaryMuscleGroup].weeklySets[week] || 0) + ex.sets;
  
          // ✅ If the session is from this week, add sets to totalWeeklySets
          if (week === currentWeek) {
            totalWeeklySets += ex.sets;
          }
  
          if (!muscleGroupSessionCount[ex.primaryMuscleGroup]) {
            muscleGroupSessionCount[ex.primaryMuscleGroup] = 0;
          }
          muscleGroupSessionCount[ex.primaryMuscleGroup] += 1;
        });
      });
      setMarkedDates(dateTotalSets); // ✅ Update markedDates with total sets per day
      console.log("Marked Dates:", dateTotalSets); // ✅ Debugging
      const muscleGroupStats: Record<string, { totalVolume: number; averageVolume: number; weeklySets: Record<string, number> }> = {};
      const weeklySessionCounts: Record<string, Record<string, number>> = {}; // Tracks session count per muscle group per week

      Object.keys(weeklyMuscleGroupStats).forEach(week => {
        Object.keys(weeklyMuscleGroupStats[week]).forEach(group => {
          if (!muscleGroupStats[group]) {
            muscleGroupStats[group] = { totalVolume: 0, averageVolume: 0, weeklySets: {} };
          }
          if (!weeklySessionCounts[week]) {
            weeklySessionCounts[week] = {};
          }
          if (!weeklySessionCounts[week][group]) {
            weeklySessionCounts[week][group] = 0;
          }

          const totalVolume = weeklyMuscleGroupStats[week][group].totalVolume;
          const sessionCount = weeklyMuscleGroupStats[week][group].sessionCount; // Sessions that trained this muscle group

          muscleGroupStats[group].totalVolume += totalVolume;
          muscleGroupStats[group].weeklySets[week] = weeklyMuscleGroupStats[week][group].weeklySets[week];

          // Track the number of sessions for this muscle group in this week
          weeklySessionCounts[week][group] += sessionCount;
        });
      });

      // Compute the correct average volume per session for the current week only
      Object.keys(weeklySessionCounts).forEach(week => {
        if (week === currentWeek) { // ✅ Only process the current week
          Object.keys(weeklySessionCounts[week]).forEach(group => {
            if (muscleGroupStats[group].weeklySets[week]) {
              const totalVolume = weeklyMuscleGroupStats[week][group].totalVolume;
              const numSessions = weeklySessionCounts[week][group]; // Sessions for this muscle group in this week

              // ✅ Store only for the current week
              muscleGroupStats[group].averageVolume = numSessions > 0 
                ? totalVolume / numSessions 
                : 0;
            }
          });
        }
      });
  
      let mostCommonExercise = Object.keys(exerciseFrequency).reduce((a, b) =>
        exerciseFrequency[a] > exerciseFrequency[b] ? a : b, 'N/A');
  
      setWorkoutStats({
        totalWorkoutDays,
        mostCommonExercise,
        averageExercisesPerDay: totalWorkoutDays ? totalExercises / totalWorkoutDays : 0,
        averageSetsPerDay: totalWorkoutDays ? totalSets / totalWorkoutDays : 0,
        muscleGroupStats,
      });
  
      console.log(`Total weekly sets for this week (${currentWeek}):`, totalWeeklySets); // ✅ Debugging
    } catch (error) {
      console.error('Failed to calculate stats:', error);
    }
  };
  
  useFocusEffect(
    useCallback(() => {
      calculateStats();
    }, [])
  );

  return (
    <ScrollView>
      <StatsOverview stats={workoutStats} />
      <CalendarHeatMap markedDates={markedDates} />
      <WorkoutLegend />
      <MuscleGroupStats stats={workoutStats.muscleGroupStats} />
    </ScrollView>
  );
};

export default Analytics;

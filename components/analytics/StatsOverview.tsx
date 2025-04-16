// StatsOverview.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import styles from '../../styles/analyticsStyles';

interface StatsOverviewProps {
  stats: {
    totalWorkoutDays: number;
    mostCommonExercise: string;
    averageExercisesPerDay: number;
    averageSetsPerDay: number;
  };
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  return (
    <View style={styles.statsContainer}>
      <Text style={styles.subtitle}>Overview</Text>
      <Text style={styles.stat}>Total Workout Days: {stats.totalWorkoutDays}</Text>
      <Text style={styles.stat}>Most Common Exercise: {stats.mostCommonExercise || 'N/A'}</Text>
      <Text style={styles.stat}>Average Exercises per Day: {stats.averageExercisesPerDay.toFixed(1)}</Text>
      <Text style={styles.stat}>Average Sets per Day: {stats.averageSetsPerDay.toFixed(1)}</Text>
    </View>
  );
};


export default StatsOverview;

import React, { useState, useCallback, useMemo } from 'react';
import { ScrollView, Text, StyleSheet, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import PRSummaryCards, { PRMetric } from '../../components/analytics/PRSummaryCards';

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

const PRTab: React.FC = () => {
  const [prMetrics, setPRMetrics] = useState<PRMetric[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // This function calculates the PR for each exercise by checking each set’s weight.
  // It ignores volume and finds the set with the highest weight, along with the highest number of reps @ that weight and the date.
  const calculatePRMetrics = (sessions: WorkoutSession[]): PRMetric[] => {
    const prMetrics: Record<string, PRMetric> = {};
    sessions.forEach(session => {
      session.exercises.forEach(ex => {
        ex.weights.forEach((weightStr, i) => {
          const weight = parseFloat(weightStr) || 0;
          const reps = ex.reps[i] || 0;
          const key = ex.exercise.toLowerCase();
          // Update if no record exists, or if the weight is higher,
          // or if the weight is equal and the rep count is higher.
          if (
            !prMetrics[key] ||
            weight > prMetrics[key].maxWeight ||
            (weight === prMetrics[key].maxWeight && reps > prMetrics[key].reps)
          ) {
            prMetrics[key] = {
              exercise: ex.exercise,
              maxWeight: weight,
              reps: reps,
              date: session.date,
            };
          }
        });
      });
    });
    return Object.values(prMetrics);
  };
  

  // Load sessions and calculate PR metrics when the screen is focused.
  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const storedSessions = await AsyncStorage.getItem('workoutSessions');
          if (!storedSessions) return;
          const sessions: WorkoutSession[] = JSON.parse(storedSessions);
          const computedPRMetrics = calculatePRMetrics(sessions);
          setPRMetrics(computedPRMetrics);
        } catch (error) {
          console.error('Error loading sessions for PR Tab:', error);
        }
      })();
    }, [])
  );

  // Compute filtered metrics based on the search query.
  const filteredMetrics = useMemo(() => {
    if (!searchQuery.trim()) return prMetrics;
    return prMetrics.filter(metric =>
      metric.exercise.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, prMetrics]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Personal Records (All Time)</Text>
      {/* Search input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search exercises..."
        placeholderTextColor="#888" // Adjust this value to suit your design
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <PRSummaryCards prMetrics={filteredMetrics} period="All Time" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    fontSize: 16,
  },
});

export default PRTab;

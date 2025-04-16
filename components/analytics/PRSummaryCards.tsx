// PRSummaryCards.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface PRMetric {
  exercise: string;
  maxWeight: number;
  reps: number;
  date: string;
}

interface PRSummaryCardsProps {
  prMetrics: PRMetric[];
  period: string;
}

const PRSummaryCards: React.FC<PRSummaryCardsProps> = ({ prMetrics, period }) => {
  return (
    <View style={styles.container}>
      <View style={styles.cardsContainer}>
        {prMetrics.map((metric) => (
          <View key={metric.exercise} style={styles.card}>
            <Text style={styles.exerciseName}>{metric.exercise}</Text>
            <Text style={styles.prDetail}>Max Weight: {metric.maxWeight} lbs</Text>
            <Text style={styles.prDetail}>Reps: {metric.reps}</Text>
            <Text style={styles.prDetail}>Date: {metric.date}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 15, paddingHorizontal: 10 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  cardsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  exerciseName: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  prDetail: { fontSize: 14, marginBottom: 3 },
});

export default PRSummaryCards;

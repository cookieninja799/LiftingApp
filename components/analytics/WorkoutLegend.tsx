// WorkoutLegend.tsx
import React from 'react';
import { View, Text } from 'react-native';
import styles from '../../styles/analyticsStyles';
import { optimalSetRecommendations } from '../../utils/helpers';

const WorkoutLegend: React.FC = () => {
  return (
    <View style={styles.legendContainer}>
      <Text style={styles.legendTitle}>Legend</Text>
      
      {/* Optimal Set Recommendations Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Optimal Set Recommendations (per session):</Text>
        {Object.keys(optimalSetRecommendations).map((group) => {
          const rec = optimalSetRecommendations[group];
          return (
            <Text key={group} style={styles.legendText}>
              <Text style={styles.boldText}>{group}:</Text> Min {rec.min}, Optimal {rec.optimal}, Upper {rec.upper}
            </Text>
          );
        })}
      </View>
      
      {/* Calendar Heat Map Legend with Color Swatches */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Calendar Heat Map (Total Sets per Day):</Text>
        {[{color: '#eee', text: '1-9 sets: Very Light'},
          {color: '#FFCCBC', text: '10-14 sets: Light'},
          {color: '#FF8A65', text: '15-19 sets: Medium'},
          {color: '#FF5722', text: '20+ sets: Dark'}].map(({color, text}, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.colorSwatch, { backgroundColor: color }]} />
              <Text style={styles.legendText}>{text}</Text>
            </View>
        ))}
      </View>
    </View>
  );
};

export default WorkoutLegend;

// MuscleGroupStats.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { getCurrentWeek, getVolumeStatus } from '../../utils/helpers';
import styles from '../../styles/analyticsStyles';

interface MuscleGroupStatsProps {
    stats: Record<string, { 
      totalVolume: number;
      averageVolume: number;
      weeklySets: Record<string, number>;
    }>;
}
  
const MuscleGroupStats: React.FC<MuscleGroupStatsProps> = ({ stats }) => {
    const currentWeek = getCurrentWeek(); // ✅ Get the current week dynamically
    console.log("Current Week:", currentWeek);
    console.log("Available Weeks:", Object.keys(stats));
  
    return (
      <View style={styles.muscleGroupContainer}>
        <Text style={styles.subtitle}>Muscle Group Stats (Weekly Total Sets & Average Volume)</Text>
        {Object.keys(stats).map((group) => {
          const weeklyTotalSets = stats[group]?.weeklySets?.[currentWeek] || 0;
          console.log(`Group: ${group}, Week: ${currentWeek}, Sets: ${weeklyTotalSets}`);
          const statusMessage = getVolumeStatus(group, weeklyTotalSets);
          
          const averageVolume = stats[group].averageVolume && !isNaN(stats[group].averageVolume)
            ? stats[group].averageVolume.toFixed(0)
            : "N/A"; // ✅ Handle undefined or NaN values safely
  
          return (
            <View key={group} style={styles.muscleGroupItem}>
              <Text style={styles.muscleGroupText}>{group}:</Text>
              <Text style={styles.muscleGroupDetail}>
                <Text style={styles.boldText}>Total weekly sets:</Text> {weeklyTotalSets} {statusMessage}
              </Text>
              <Text style={styles.muscleGroupDetail}>
                <Text style={styles.boldText}>Average Volume (Per session):</Text> {averageVolume}
              </Text>
            </View>
          );
        })}
      </View>
    );
};

export default MuscleGroupStats;

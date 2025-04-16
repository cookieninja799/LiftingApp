// RightAction.tsx
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import React from 'react';
import Reanimated, { useAnimatedStyle } from 'react-native-reanimated';

type RightActionProps = {
  progress: Reanimated.SharedValue<number>;
  drag: Reanimated.SharedValue<number>;
  sessionId: string;
  onDelete: (sessionId: string) => void;
};

function RightAction({ progress, sessionId, onDelete }: RightActionProps) {
  // Animate based on progress: when progress is 0 (closed), the button is off-screen;
  // when progress is 1 (open), the button is fully revealed.
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: 60 * (1 - progress.value) }],
    };
  });

  return (
    <Reanimated.View style={[styles.rightActionContainer, animatedStyle]}>
      <TouchableOpacity onPress={() => onDelete(sessionId)} style={styles.rightActionButton}>
        <Text style={styles.rightActionText}>Delete Day</Text>
      </TouchableOpacity>
    </Reanimated.View>
  );
}

const styles = StyleSheet.create({
  rightActionContainer: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    // No absolute positioning here; the Swipeable component handles placement.
  },
  rightActionButton: {
    backgroundColor: '#ff3b30',
    height: 40,        // Fixed height for the button
    width: 60,         // Matches the container width
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  rightActionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default RightAction;

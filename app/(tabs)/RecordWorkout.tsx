//RecordWorkout.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

// Define types for exercises and sessions
type Exercise = {
  id: string;
  exercise: string;
  sets: number;
  reps: number[];
  weights: string[];
  primaryMuscleGroup?: string;
};

type WorkoutSession = {
  id: string;
  date: string;
  exercises: Exercise[];
};

type ParsedExercise = {
  id: string;
  date?: string;
  exercise?: string;
  sets?: number;
  reps?: number[];
  weights?: string[];
  primaryMuscleGroup?: string;
};

export default function RecordWorkout() {
  const [input, setInput] = useState('');
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getTodayDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    // Note: getMonth() returns 0-based month, so add 1 and pad with leading zero if necessary.
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  

  const generateId = (): string =>
    Date.now().toString() + Math.random().toString(36).substring(2, 8);

  useEffect(() => {
    const initializeThread = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://192.168.4.31:3000/thread');
        setThreadId(response.data.threadId);
      } catch (error) {
        console.error('Failed to create thread:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initializeThread();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const loadSessions = async () => {
        try {
          const storedSessions = await AsyncStorage.getItem('workoutSessions');
          if (storedSessions) {
            setSessions(JSON.parse(storedSessions));
          }
        } catch (error) {
          console.error('Failed to load workout sessions:', error);
        }
      };
      loadSessions();
    }, [])
  );

  const saveSessions = async (updatedSessions: WorkoutSession[]) => {
    try {
      await AsyncStorage.setItem('workoutSessions', JSON.stringify(updatedSessions));
    } catch (error) {
      console.error('Failed to save workout sessions:', error);
    }
  };

  const parseInputWithAssistant = async (userInput: string): Promise<ParsedExercise[] | null> => {
    if (!threadId) {
      Alert.alert('Error', 'Thread not initialized. Please wait a moment and try again.');
      return null;
    }
    try {
      const response = await axios.post('http://192.168.4.31:3000/message', {
        threadId,
        message: userInput,
      });
  
      console.log('Full assistant response:', JSON.stringify(response.data, null, 2));
  
      const jsonMessages = response.data?.messages?.flat()?.filter((msg: any) => {
        const trimmed = msg?.text?.value?.trim();
        return msg?.type === 'text' && (trimmed.startsWith('{') || trimmed.startsWith('['));
      });
  
      if (!jsonMessages.length) {
        console.error('No valid JSON messages found in response:', response.data);
        Alert.alert('Error', 'Unexpected response format. Please try again.');
        return null;
      }
  
      const parsedExercises: ParsedExercise[] = [];
  
      jsonMessages.forEach((msg: any) => {
        try {
          const trimmedText = msg.text.value.trim();
          const parsed = JSON.parse(trimmedText);
  
          if (Array.isArray(parsed)) {
            parsed.forEach((exercise: any) => {
              parsedExercises.push({
                id: generateId(),
                date: exercise.date || getTodayDate(),
                exercise: exercise.exercise || 'Unknown Exercise',
                sets: exercise.sets || 1,
                reps: Array.isArray(exercise.reps) ? exercise.reps : [],
                weights: Array.isArray(exercise.weights) ? exercise.weights : [],
                primaryMuscleGroup: exercise.primaryMuscleGroup,
              });
            });
          } else if (parsed.exercises && Array.isArray(parsed.exercises)) {
            parsed.exercises.forEach((exercise: any) => {
              parsedExercises.push({
                id: generateId(),
                date: exercise.date || getTodayDate(),
                exercise: exercise.exercise || 'Unknown Exercise',
                sets: exercise.sets || 1,
                reps: Array.isArray(exercise.reps) ? exercise.reps : [],
                weights: Array.isArray(exercise.weights) ? exercise.weights : [],
                primaryMuscleGroup: exercise.primaryMuscleGroup,
              });
            });
          } else {
            parsedExercises.push({
              id: generateId(),
              date: parsed.date || getTodayDate(),
              exercise: parsed.exercise || 'Unknown Exercise',
              sets: parsed.sets || 1,
              reps: Array.isArray(parsed.reps) ? parsed.reps : [],
              weights: Array.isArray(parsed.weights) ? parsed.weights : [],
              primaryMuscleGroup: parsed.primaryMuscleGroup,
            });
          }
        } catch (error) {
          console.error('Error parsing JSON response:', error);
        }
      });
  
      return parsedExercises;
    } catch (error) {
      console.error('Error parsing input with assistant:', error);
      Alert.alert('Error', 'Failed to parse input. Please try again.');
      return null;
    }
  };
  

  const handleLogWorkout = async () => {
    if (!input.trim()) {
      Alert.alert('Error', 'Please enter a valid workout description.');
      return;
    }
  
    setIsLoading(true);
    const parsedExercises = await parseInputWithAssistant(input.trim());
    setIsLoading(false);
  
    if (parsedExercises && parsedExercises.length > 0) {
      let updatedSessions = [...sessions];
  
      parsedExercises.forEach(parsedResult => {
        const sessionDate = parsedResult.date!;
        const newExercise: Exercise = {
          id: parsedResult.id,
          exercise: parsedResult.exercise!,
          sets: parsedResult.sets!,
          reps: parsedResult.reps || [],
          weights: parsedResult.weights || [],
          primaryMuscleGroup: parsedResult.primaryMuscleGroup,
        };
  
        const existingSessionIndex = updatedSessions.findIndex(session => session.date === sessionDate);
        if (existingSessionIndex !== -1) {
          updatedSessions[existingSessionIndex].exercises.push(newExercise);
        } else {
          updatedSessions.push({
            id: generateId(),
            date: sessionDate,
            exercises: [newExercise],
          });
        }
      });
  
      setSessions(updatedSessions);
      saveSessions(updatedSessions);
      setInput('');
    } else {
      Alert.alert('Error', 'Failed to log workout.');
    }
  };
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Record Workout</Text>
      <Text style={styles.description}>
      Record your workout in a snap! Just jot down what you did (e.g., 'smashed 3 sets of squats 💥, rocked the bench press 🏋️') and we'll do the nerd work for you.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your workout (e.g., Squats 3x10 @ 75 lbs)"
        placeholderTextColor="#888" 
        value={input}
        onChangeText={setInput}
      />
      <Button title="Log Workout" onPress={handleLogWorkout} disabled={isLoading} />
      {isLoading && <ActivityIndicator size="large" color="#6200EE" style={styles.spinner} />}
      <View style={styles.logPreview}>
        <Text style={styles.logTitle}>Recent Workout Sessions:</Text>
        {sessions
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3)
          .map(session => (
            <View key={session.id} style={styles.sessionItem}>
              <Text style={styles.sessionDate}>{session.date}</Text>
              {session.exercises.map(ex => (
                <Text key={ex.id} style={styles.exerciseItem}>
                  {`${ex.exercise}: ${ex.sets} sets, ${ex.reps.join(', ')} reps`}
                  {ex.primaryMuscleGroup ? ` [${ex.primaryMuscleGroup}]` : ''}
                </Text>
              ))}
            </View>
          ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  description: { fontSize: 16, color: '#555', marginBottom: 20, lineHeight: 22 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  spinner: { marginVertical: 15 },
  logPreview: { marginTop: 20 },
  logTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  sessionItem: { marginBottom: 15, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 5 },
  sessionDate: { fontSize: 16, fontWeight: 'bold' },
  exerciseItem: { fontSize: 14, marginTop: 5 },
});

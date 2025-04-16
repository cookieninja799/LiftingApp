// Logs.tsx
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  TextInput,
  Modal,
  Button,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { getWeekFromDate, getMonthFromDate } from '../../utils/helpers';
import styles from '../../styles/logStyles'; // Import your styles

// Group sessions using the provided helper functions.
const groupSessions = (
  sessions: WorkoutSession[],
  groupBy: 'week' | 'month'
) => {
  return sessions.reduce((acc, session) => {
    const key =
      groupBy === 'week'
        ? getWeekFromDate(session.date)
        : getMonthFromDate(session.date);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(session);
    return acc;
  }, {} as Record<string, WorkoutSession[]>);
};

// Define types for our data structures:
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
  date: string; // "YYYY-MM-DD"
  exercises: Exercise[];
};

type EditPayload = {
  sessionId: string;
  exercise: Exercise;
};

export default function Logs() {
  // State for workout sessions and UI controls.
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [currentEdit, setCurrentEdit] = useState<EditPayload | null>(null);

  // Local states for editing an exercise.
  const [editExerciseName, setEditExerciseName] = useState('');
  const [editSets, setEditSets] = useState('');
  const [editReps, setEditReps] = useState('');
  const [editWeights, setEditWeights] = useState('');
  const [editMuscleGroup, setEditMuscleGroup] = useState('');

  // State for the "Add New Exercise" modal.
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newSets, setNewSets] = useState('');
  const [newReps, setNewReps] = useState('');
  const [newWeights, setNewWeights] = useState('');
  const [newMuscleGroup, setNewMuscleGroup] = useState('');

  // States for filtering and grouping.
  const [filterDate, setFilterDate] = useState<string | null>(null);
  const [filterMuscleGroup, setFilterMuscleGroup] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<'week' | 'month'>('week');

  // State for exercise suggestions in the "Add New Exercise" modal.
  const [exerciseSuggestions, setExerciseSuggestions] = useState<string[]>([]);

  // Compute a unique list of previously performed exercises.
  const allExercises = useMemo(() => {
    const exerciseSet = new Set<string>();
    sessions.forEach(session => {
      session.exercises.forEach(ex => {
        if (ex.exercise) {
          exerciseSet.add(ex.exercise);
        }
      });
    });
    return Array.from(exerciseSet);
  }, [sessions]);

  // Update suggestions as user types.
  const handleNewExerciseNameChange = (text: string) => {
    setNewExerciseName(text);
    // Filter suggestions based on the text input (case-insensitive).
    const filtered = allExercises.filter(ex =>
      ex.toLowerCase().includes(text.toLowerCase())
    );
    setExerciseSuggestions(filtered);
  };

  // When a suggestion is tapped, update the field and clear suggestions.
  const handleSuggestionTap = (suggestion: string) => {
    setNewExerciseName(suggestion);
    setExerciseSuggestions([]);
  };

  // Load sessions from AsyncStorage when the component is focused.
  useFocusEffect(
    useCallback(() => {
      const loadSessions = async () => {
        try {
          const storedSessions = await AsyncStorage.getItem('workoutSessions');
          if (storedSessions) {
            setSessions(JSON.parse(storedSessions));
          }
        } catch (error) {
          console.error('Failed to load sessions:', error);
        }
      };
      loadSessions();
    }, [])
  );

  // Save sessions to AsyncStorage.
  const saveSessions = async (updatedSessions: WorkoutSession[]) => {
    try {
      await AsyncStorage.setItem('workoutSessions', JSON.stringify(updatedSessions));
    } catch (error) {
      console.error('Failed to save sessions:', error);
    }
  };

  // Delete an individual exercise.
  const deleteExercise = async (sessionId: string, exerciseId: string) => {
    const updatedSessions = sessions.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          exercises: session.exercises.filter(ex => ex.id !== exerciseId),
        };
      }
      return session;
    });
    console.log('Updated sessions after deletion:', updatedSessions);
    setSessions(updatedSessions);
    try {
      await saveSessions(updatedSessions);
      console.log('AsyncStorage updated after deleting exercise.');
    } catch (error) {
      console.error('Error saving updated sessions after deletion:', error);
    }
  };

  const confirmDeleteExercise = (sessionId: string, exerciseId: string) => {
    Alert.alert(
      'Delete Exercise',
      'Are you sure you want to delete this exercise?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => await deleteExercise(sessionId, exerciseId),
        },
      ]
    );
  };

  // Delete an entire session.
  const deleteSession = async (sessionId: string) => {
    const updatedSessions = sessions.filter(session => session.id !== sessionId);
    setSessions(updatedSessions);
    try {
      await saveSessions(updatedSessions);
      console.log('Session deleted and AsyncStorage updated.');
    } catch (error) {
      console.error('Error saving updated sessions after session deletion:', error);
    }
  };

  const confirmDeleteSession = (sessionId: string) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete the entire log for this day?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteSession(sessionId);
          },
        },
      ]
    );
  };

  // When an exercise is selected for editing, prefill the editing fields.
  const editExercise = (sessionId: string, exercise: Exercise) => {
    setCurrentEdit({ sessionId, exercise });
    setEditExerciseName(exercise.exercise);
    setEditSets(exercise.sets.toString());
    setEditReps(exercise.reps.join(', '));
    setEditWeights(exercise.weights.join(', '));
    setEditMuscleGroup(exercise.primaryMuscleGroup || '');
  };

  // Save the edited exercise back into the corresponding session.
  const saveEditedExercise = () => {
    if (!currentEdit) return;

    const updatedExercise: Exercise = {
      ...currentEdit.exercise,
      exercise: editExerciseName,
      sets: parseInt(editSets, 10) || 1,
      reps: editReps ? editReps.split(',').map(rep => parseInt(rep.trim(), 10)) : [],
      weights: editWeights ? editWeights.split(',').map(w => w.trim()) : [],
      primaryMuscleGroup: editMuscleGroup || undefined,
    };

    const updatedSessions = sessions.map(session => {
      if (session.id === currentEdit.sessionId) {
        return {
          ...session,
          exercises: session.exercises.map(ex =>
            ex.id === updatedExercise.id ? updatedExercise : ex
          ),
        };
      }
      return session;
    });

    setSessions(updatedSessions);
    saveSessions(updatedSessions);
    setCurrentEdit(null);
  };

  // Save a newly added exercise.
  const saveNewExercise = () => {
    if (!newExerciseName.trim()) {
      Alert.alert('Error', 'Please enter an exercise name.');
      return;
    }
    // Use provided date or default to today's date.
    const date = newDate.trim() || new Date().toISOString().split('T')[0];

    const newExercise: Exercise = {
      id: Date.now().toString() + '-' + Math.floor(Math.random() * 1000).toString(),
      exercise: newExerciseName,
      sets: parseInt(newSets, 10) || 1,
      reps: newReps ? newReps.split(',').map(rep => parseInt(rep.trim(), 10)) : [],
      weights: newWeights ? newWeights.split(',').map(w => w.trim()) : [],
      primaryMuscleGroup: newMuscleGroup || undefined,
    };

    let sessionExists = false;
    const updatedSessions = sessions.map(session => {
      if (session.date === date) {
        sessionExists = true;
        return { ...session, exercises: [...session.exercises, newExercise] };
      }
      return session;
    });
    if (!sessionExists) {
      updatedSessions.push({
        id: Date.now().toString() + '-' + Math.floor(Math.random() * 1000).toString(),
        date,
        exercises: [newExercise],
      });
    }

    setSessions(updatedSessions);
    saveSessions(updatedSessions);
    // Clear input fields and close the modal.
    setNewDate('');
    setNewExerciseName('');
    setNewSets('');
    setNewReps('');
    setNewWeights('');
    setNewMuscleGroup('');
    setIsAddModalVisible(false);
  };

  // Render a single exercise row.
  const renderExerciseItem = (sessionId: string, exercise: Exercise) => (
    <View key={exercise.id} style={styles.exerciseRow}>
      <Text style={styles.exerciseText}>
        {exercise.exercise} - {exercise.sets} sets, {exercise.reps.join(', ')} reps
        {exercise.primaryMuscleGroup ? ` [${exercise.primaryMuscleGroup}]` : ''}
      </Text>
      <View style={styles.exerciseButtons}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => editExercise(sessionId, exercise)}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmDeleteExercise(sessionId, exercise.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render a single session along with its exercises.
  const renderSessionItem = ({ item }: { item: WorkoutSession }) => {
    const isExpanded = expandedSessionId === item.id;
    return (
      <View key={item.id} style={styles.sessionContainer}>
        <View style={styles.sessionHeaderContainer}>
          <TouchableOpacity
            style={styles.sessionHeader}
            onPress={() =>
              setExpandedSessionId(isExpanded ? null : item.id)
            }
          >
            <Text style={styles.sessionDate}>{item.date}</Text>
            <Text style={styles.sessionSummary}>
              {item.exercises.length}{' '}
              {item.exercises.length === 1 ? 'exercise' : 'exercises'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sessionDeleteButton}
            onPress={() => confirmDeleteSession(item.id)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
        {isExpanded && (
          <View style={styles.sessionDetails}>
            {item.exercises.map(ex => renderExerciseItem(item.id, ex))}
          </View>
        )}
      </View>
    );
  };

  // Sort sessions by date (newest first).
  const sortedSessions = useMemo(() => {
    return sessions
      .slice()
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
  }, [sessions]);

  // Apply filters: by date and by muscle group.
  const filteredSessions = useMemo(() => {
    return sortedSessions
      .filter(session => !filterDate || session.date === filterDate)
      .map(session => ({
        ...session,
        exercises: session.exercises.filter(ex =>
          !filterMuscleGroup ||
          (ex.primaryMuscleGroup &&
            ex.primaryMuscleGroup.toLowerCase() ===
              filterMuscleGroup.toLowerCase())
        ),
      }))
      .filter(session => session.exercises.length > 0);
  }, [sortedSessions, filterDate, filterMuscleGroup]);

  // Group the filtered sessions by week or month.
  const groupedSessions = useMemo(() => {
    return groupSessions(filteredSessions, groupBy);
  }, [filteredSessions, groupBy]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Workout Logs</Text>

        {/* Grouping Toggle */}
        <View style={styles.groupByContainer}>
          <TouchableOpacity onPress={() => setGroupBy('week')}>
            <Text style={groupBy === 'week' ? styles.selectedGroupBy : styles.unselectedGroupBy}>
              Weekly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setGroupBy('month')}>
            <Text style={groupBy === 'month' ? styles.selectedGroupBy : styles.unselectedGroupBy}>
              Monthly
            </Text>
          </TouchableOpacity>
        </View>

        {/* Render Grouped Sessions */}
        {Object.entries(groupedSessions).length > 0 ? (
          Object.entries(groupedSessions).map(([groupKey, sessionsInGroup]) => (
            <View key={groupKey} style={styles.groupContainer}>
              <Text style={styles.groupTitle}>
                {groupBy === 'week' ? `Week: ${groupKey}` : `Month: ${groupKey}`}
              </Text>
              {sessionsInGroup.map(session => (
                <View key={session.id}>{renderSessionItem({ item: session })}</View>
              ))}
            </View>
          ))
        ) : (
          <Text style={styles.noLogsText}>
            No workout sessions available. Start recording your workouts!
          </Text>
        )}

        {/* Edit Exercise Modal */}
        {currentEdit && (
          <Modal visible={true} animationType="slide" transparent>
            <KeyboardAvoidingView
              style={styles.modalKeyboardAvoidingView}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <ScrollView contentContainerStyle={styles.modalContainer}>
                <Text style={styles.modalTitle}>Edit Exercise</Text>
                <Text style={styles.modalLabel}>Exercise:</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editExerciseName}
                  onChangeText={setEditExerciseName}
                  placeholder="Exercise"
                  placeholderTextColor="#888"
                />
                <Text style={styles.modalLabel}>Sets:</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editSets}
                  onChangeText={setEditSets}
                  placeholder="Sets"
                  keyboardType="numeric"
                  placeholderTextColor="#888"
                />
                <Text style={styles.modalLabel}>Reps (comma-separated):</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editReps}
                  onChangeText={setEditReps}
                  placeholder="e.g., 10, 8, 6"
                  placeholderTextColor="#888"
                />
                <Text style={styles.modalLabel}>Weights (comma-separated):</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editWeights}
                  onChangeText={setEditWeights}
                  placeholder="e.g., 75, 80, 85"
                  placeholderTextColor="#888"
                />
                <Text style={styles.modalLabel}>Primary Muscle Group:</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editMuscleGroup}
                  onChangeText={setEditMuscleGroup}
                  placeholder="e.g., Chest, Legs, Back"
                  placeholderTextColor="#888"
                />
                <Button title="Save" onPress={saveEditedExercise} />
                <Button title="Cancel" color="red" onPress={() => setCurrentEdit(null)} />
              </ScrollView>
            </KeyboardAvoidingView>
          </Modal>
        )}

        {/* Add New Exercise Modal */}
        {isAddModalVisible && (
          <Modal visible={true} animationType="slide" transparent>
            <KeyboardAvoidingView
              style={styles.modalKeyboardAvoidingView}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <ScrollView contentContainerStyle={styles.modalContainer}>
                <Text style={styles.modalTitle}>Add New Exercise</Text>
                <Text style={styles.modalLabel}>Date (YYYY-MM-DD):</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newDate}
                  onChangeText={setNewDate}
                  placeholder="e.g., 2024-12-01"
                  placeholderTextColor="#888"
                />
                <Text style={styles.modalLabel}>Exercise:</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newExerciseName}
                  onChangeText={handleNewExerciseNameChange}
                  placeholder="Exercise"
                  placeholderTextColor="#888"
                />
                {exerciseSuggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    {exerciseSuggestions.map(suggestion => (
                      <TouchableOpacity key={suggestion} onPress={() => handleSuggestionTap(suggestion)}>
                        <Text style={styles.suggestionItem}>{suggestion}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                <Text style={styles.modalLabel}>Sets:</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newSets}
                  onChangeText={setNewSets}
                  placeholder="Sets"
                  keyboardType="numeric"
                  placeholderTextColor="#888"
                />
                <Text style={styles.modalLabel}>Reps (comma-separated):</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newReps}
                  onChangeText={setNewReps}
                  placeholder="e.g., 10, 10, 10"
                  placeholderTextColor="#888"
                />
                <Text style={styles.modalLabel}>Weights (comma-separated):</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newWeights}
                  onChangeText={setNewWeights}
                  placeholder="e.g., 75, 75, 75 or bodyweight"
                  placeholderTextColor="#888"
                />
                <Text style={styles.modalLabel}>Primary Muscle Group:</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newMuscleGroup}
                  onChangeText={setNewMuscleGroup}
                  placeholder="e.g., Chest, Legs - Quads"
                  placeholderTextColor="#888"
                />
                <Button title="Save" onPress={saveNewExercise} />
                <Button title="Cancel" color="red" onPress={() => setIsAddModalVisible(false)} />
              </ScrollView>
            </KeyboardAvoidingView>
          </Modal>
        )}
      </ScrollView>

      {/* Plus Button for Adding a New Exercise */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsAddModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

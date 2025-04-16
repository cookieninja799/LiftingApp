import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  Alert, 
  Keyboard, 
  ScrollView,
  Pressable 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadUserProfile } from '../../utils/helpers';

const Profile: React.FC = () => {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  const handleSave = async () => {
    const profile = { age, gender, weight, height };
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
      // Immediately reload into our in‑memory cache
      await loadUserProfile();
      Alert.alert('Success', 'Profile saved and reloaded!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save profile.');
    }
  };

  return (
    <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
      <ScrollView 
        contentContainerStyle={styles.container} 
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>Profile</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your age"
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your gender"
            value={gender}
            onChangeText={setGender}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Weight</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your weight (e.g., lbs or kg)"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Height</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your height (e.g., inches or cm)"
            keyboardType="numeric"
            value={height}
            onChangeText={setHeight}
          />
        </View>

        <Button title="Save" onPress={handleSave} />
      </ScrollView>
    </Pressable>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
});

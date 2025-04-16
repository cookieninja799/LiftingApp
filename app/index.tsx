import React, { useState, useEffect } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [redirectTarget, setRedirectTarget] = useState<"/(tabs)/RecordWorkout" | "/(tabs)/Profile" | null>(null);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const profile = await AsyncStorage.getItem('userProfile');
        if (profile) {
          setRedirectTarget('/(tabs)/RecordWorkout');
        } else {
          setRedirectTarget('/(tabs)/Profile');
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        setRedirectTarget('/(tabs)/Profile');
      }
    };

    checkProfile();
  }, []);

  if (!redirectTarget) {
    // Optionally, render a loading spinner here
    return null;
  }

  return <Redirect href={redirectTarget} />;
}

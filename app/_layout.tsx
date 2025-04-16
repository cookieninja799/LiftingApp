import React from 'react';
import TabNavigator from './(tabs)/index';
import { useEffect } from 'react';
import { loadUserProfile } from '../utils/helpers';

export default function Layout() {
  useEffect(() => { loadUserProfile(); }, []);
  return <TabNavigator />;
}

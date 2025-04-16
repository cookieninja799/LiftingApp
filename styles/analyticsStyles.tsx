// analyticsStyles.ts
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
  statsContainer: { marginBottom: 20, padding: 15, backgroundColor: '#ffffff', borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  stat: { fontSize: 16, color: '#555', marginVertical: 5 },
  muscleGroupContainer: { marginBottom: 20, padding: 15, backgroundColor: '#f0f0f0', borderRadius: 8 },
  subtitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  muscleGroupItem: { marginBottom: 10, padding: 10, backgroundColor: '#ffffff', borderRadius: 6, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  muscleGroupText: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, color: '#444' },
  muscleGroupDetail: { fontSize: 16, marginVertical: 3, color: '#555' },
  boldText: { fontWeight: 'bold', color: '#222' },
  legendContainer: { marginTop: 20, padding: 15, backgroundColor: '#e9ecef', borderRadius: 8 },
  legendTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  legendText: { fontSize: 14, color: '#555', marginVertical: 2 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  colorSwatch: { width: 20, height: 20, marginRight: 8, borderRadius: 4 },
});

export default styles;

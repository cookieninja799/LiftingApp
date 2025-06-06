import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  noLogsText: { textAlign: 'center', color: '#888', fontSize: 16, marginTop: 20 },
  // Floating plus button style (if needed)
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    transform: [{ translateX: -30 }], // half the button width (60/2)
    zIndex: 999,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontSize: 28, lineHeight: 28 },
  sessionContainer: { 
    marginBottom: 15, 
    backgroundColor: '#f9f9f9', 
    borderRadius: 5, 
    overflow: 'hidden',
    zIndex: 1, // ensure the session content sits above the swipe action
  },
  sessionHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sessionHeader: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: '#ddd' },
  sessionDate: { fontSize: 16, fontWeight: 'bold' },
  sessionSummary: { fontSize: 16 },
  deleteSessionButton: { padding: 10 },
  deleteSessionText: { color: 'red', fontWeight: 'bold' },
  sessionDetails: { padding: 10 },
  exerciseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  exerciseText: { fontSize: 14, flex: 1 },
  exerciseButtons: { flexDirection: 'row' },
  editButton: { backgroundColor: 'blue', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 5, marginRight: 5 },
  deleteButton: { backgroundColor: 'red', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 5 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  modalKeyboardAvoidingView: { flex: 1, justifyContent: 'center', padding: 20 },
  modalContainer: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f9f9f9' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalLabel: { fontSize: 16, marginBottom: 5, fontWeight: 'bold' },
  modalInput: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5, fontSize: 16 },
  filterContainer: { marginBottom: 15 },
  filterInput: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5, fontSize: 16 },
  clearFilters: { color: 'blue', textAlign: 'center', marginBottom: 10 },
  groupByContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  selectedGroupBy: { fontWeight: 'bold', color: 'blue', fontSize: 16 },
  unselectedGroupBy: { fontWeight: 'normal', color: 'gray', fontSize: 16 },
  groupContainer: { marginBottom: 20, backgroundColor: '#f0f0f0', borderRadius: 5, padding: 10 },
  groupTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    maxHeight: 120,
    borderRadius: 5,
    marginBottom: 10,
  },
  suggestionItem: {
    padding: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    fontSize: 16,
  },
  sessionDeleteButton: {
    padding: 8,
    backgroundColor: '#FF0000',
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default styles;

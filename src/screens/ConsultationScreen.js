// src/screens/ConsultationScreen.js

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  Alert,
  ScrollView,
  KeyboardAvoidingView
} from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid
} from '@react-native-community/datetimepicker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { BASE_URL } from '../config';

export default function ConsultationScreen() {
  const [queue, setQueue] = useState([]);
  const current = queue[0] || null;

  // vitals
  const [bp, setBp] = useState('');
  const [spo2, setSpo2] = useState('');
  const [temperature, setTemperature] = useState('');
  const [hr, setHr] = useState('');

  // notes
  const [chiefComplaints, setChiefComplaints] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [allergies, setAllergies] = useState('');
  const [examination, setExamination] = useState('');
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');

  // follow-up date
  const [followupDate, setFollowupDate] = useState(new Date());
  const [showIOSPicker, setShowIOSPicker] = useState(false);

  // modal + PDF URI
  const [modalVisible, setModalVisible] = useState(false);
  const [pdfUri, setPdfUri] = useState('');

  // fetch queue
  const fetchQueue = async () => {
    try {
      const res = await fetch(`${BASE_URL}/patients/queue`);
      const data = await res.json();
      setQueue(data);
    } catch (e) {
      console.error('Queue fetch failed:', e);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  // reseed fields when current patient changes
  useEffect(() => {
    if (!current) return;
    setBp(current.bp || '');
    setSpo2(current.spo2 || '');
    setTemperature(current.temperature || '');
    setHr(current.hr || '');
    setChiefComplaints('');
    setMedicalHistory('');
    setAllergies('');
    setExamination('');
    setProvisionalDiagnosis('');
    setTreatment('');
    setFollowupDate(new Date());
    setShowIOSPicker(false);
  }, [current]);

  const openDatePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: followupDate,
        mode: 'date',
        is24Hour: true,
        onChange: (_e, d) => d && setFollowupDate(d)
      });
    } else {
      setShowIOSPicker(true);
    }
  };

  // helpers for vitals styling
  const getBpStyle = (bpValue) => {
    if (!bpValue) return {};
    const [sys, dia] = bpValue.split('/').map(Number);
    if (sys > 139 || dia > 89) {
      return { color: 'red', fontWeight: 'bold' };
    }
    return {};
  };
  const getSpo2Style = (val) =>
    val && Number(val) < 94 ? { color: 'red', fontWeight: 'bold' } : {};
  const getTempStyle = (val) =>
    val && Number(val) > 98.6 ? { color: 'red', fontWeight: 'bold' } : {};
  const getHrStyle = (val) =>
    val && Number(val) > 100 ? { color: 'red', fontWeight: 'bold' } : {};

  const handleSubmit = async () => {
    if (!current) {
      Alert.alert('Error', 'No patient in consultation.');
      return;
    }

    // 1) build record
    const record = {
      patientId: current._id,
      date: new Date().toISOString(),
      registration: {
        name: current.name,
        age: current.age,
        gender: current.gender,
        contact: current.contact,
        address: current.address
      },
      consultation: {
        bp,
        spo2,
        temperature,
        hr,
        chiefComplaints,
        medicalHistory,
        allergies,
        examination,
        provisionalDiagnosis,
        treatment,
        followupDate: followupDate.toISOString().split('T')[0]
      }
    };

    try {
      // 2) save record to backend
      const res = await fetch(`${BASE_URL}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      if (!res.ok) throw new Error('Failed to save record');

      // 3) mark patient as consulted
      await fetch(`${BASE_URL}/patients/queue/${current._id}/consulted`, {
        method: 'PATCH'
      });

      // 4) remove from local queue
      setQueue(prev => prev.filter(p => p._id !== current._id));

      // 5) generate PDF
      const html = `
        <html>
          <body>
            <h1>Patient Consultation Summary</h1>
            <p><b>Name:</b> ${current.name}</p>
            <p><b>Age/Gender:</b> ${current.age} / ${current.gender}</p>
            <p><b>BP:</b> ${bp}</p>
            <p><b>SPO2:</b> ${spo2}</p>
            <p><b>Temp:</b> ${temperature}</p>
            <p><b>HR:</b> ${hr}</p>
            <h3>Consultation Notes</h3>
            <p><b>Chief Complaints:</b> ${chiefComplaints}</p>
            <p><b>Medical History:</b> ${medicalHistory}</p>
            <p><b>Allergies:</b> ${allergies}</p>
            <p><b>Examination:</b> ${examination}</p>
            <p><b>Diagnosis:</b> ${provisionalDiagnosis}</p>
            <p><b>Treatment:</b> ${treatment}</p>
            <p><b>Follow-up Date:</b> ${followupDate.toLocaleDateString()}</p>
          </body>
        </html>
      `;
      const { uri: cacheUri } = await Print.printToFileAsync({ html });
      const fileName = `${current.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      const destUri = FileSystem.documentDirectory + fileName;
      await FileSystem.copyAsync({ from: cacheUri, to: destUri });
      setPdfUri(destUri);

      // 6) show modal
      setModalVisible(true);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const onModalOk = async () => {
    setModalVisible(false);
    if (pdfUri && await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(pdfUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Print or share patient record'
      });
    } else {
      Alert.alert('Sharing unavailable');
    }
  };

  if (!current) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No patient in consultation.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 20 })}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* patient header */}
          <View style={styles.header}>
            <Text style={styles.headerName}>{current.name}</Text>
            <View style={styles.headerRow}>
              <Text style={styles.headerText}>{current.age} yrs</Text>
              <Text style={styles.headerText}>{current.gender}</Text>
            </View>
            <View style={styles.vitalsRow}>
              <View style={styles.vitalItem}>
                <Text style={styles.vitalLabel}>BP</Text>
                <TextInput
                  style={[styles.vitalInput, getBpStyle(bp)]}
                  value={bp}
                  onChangeText={setBp}
                  placeholder="120/80"
                />
              </View>
              <View style={styles.vitalItem}>
                <Text style={styles.vitalLabel}>SPO2</Text>
                <TextInput
                  style={[styles.vitalInput, getSpo2Style(spo2)]}
                  value={spo2}
                  onChangeText={setSpo2}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={styles.vitalsRow}>
              <View style={styles.vitalItem}>
                <Text style={styles.vitalLabel}>Temp</Text>
                <TextInput
                  style={[styles.vitalInput, getTempStyle(temperature)]}
                  value={temperature}
                  onChangeText={setTemperature}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.vitalItem}>
                <Text style={styles.vitalLabel}>HR</Text>
                <TextInput
                  style={[styles.vitalInput, getHrStyle(hr)]}
                  value={hr}
                  onChangeText={setHr}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* consultation form */}
          {[
            { label: 'Chief Complaints', value: chiefComplaints, setter: setChiefComplaints },
            { label: 'Past Medical History', value: medicalHistory, setter: setMedicalHistory },
            { label: 'Allergies (if any)', value: allergies, setter: setAllergies },
            { label: 'Examination', value: examination, setter: setExamination },
            { label: 'Provisional Diagnosis', value: provisionalDiagnosis, setter: setProvisionalDiagnosis },
            { label: 'Treatment', value: treatment, setter: setTreatment }
          ].map((sec, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.label}>{sec.label}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={sec.value}
                onChangeText={sec.setter}
                multiline
                placeholder={`Enter ${sec.label.toLowerCase()}`}
              />
            </View>
          ))}

          {/* follow-up date */}
          <View style={styles.card}>
            <Text style={styles.label}>Follow-up Date</Text>
            <TouchableOpacity style={styles.dateInput} onPress={openDatePicker}>
              <Text style={styles.dateText}>{followupDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {Platform.OS === 'ios' && showIOSPicker && (
              <DateTimePicker
                value={followupDate}
                mode="date"
                display="inline"
                onChange={(_, d) => {
                  if (d) setFollowupDate(d);
                  setShowIOSPicker(false);
                }}
                style={{ width: '100%', marginTop: 8 }}
              />
            )}
          </View>

          {/* submit */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit Consultation</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={onModalOk}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Patient Record Saved.</Text>
            <TouchableOpacity style={styles.modalButton} onPress={onModalOk}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F2F2' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#999' },
  container: { padding: 20, paddingBottom: 40 },
  header: { backgroundColor: '#70C1B3', padding: 16, borderRadius: 8, marginBottom: 20, elevation: 4 },
  headerName: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  headerRow: { flexDirection: 'row', marginTop: 4 },
  headerText: { color: '#E0F2F1', fontSize: 16, marginRight: 16 },
  vitalsRow: { flexDirection: 'row', marginTop: 12 },
  vitalItem: { flex: 1, marginRight: 12 },
  vitalLabel: { color: '#E0F2F1', fontSize: 14, marginBottom: 4 },
  vitalInput: {
    backgroundColor: '#FFF',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 16
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  label: { fontSize: 16, fontWeight: '500', color: '#555', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333'
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  dateInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center'
  },
  dateText: { fontSize: 16, color: '#333' },
  submitBtn: {
    backgroundColor: '#70C1B3',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center'
  },
  submitText: { color: '#FFF', fontSize: 17, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 24,
    width: '80%',
    alignItems: 'center'
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    fontWeight: '700',
    textAlign: 'center'
  },
  modalButton: {
    backgroundColor: '#70C1B3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24
  },
  modalButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' }
});

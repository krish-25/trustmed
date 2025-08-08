// src/screens/PatientRegistrationScreen.js

import React, { useState, useContext } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { PatientContext } from '../context/PatientContext';

export default function PatientRegistrationScreen() {
  const { addPatient } = useContext(PatientContext);

  const [basic, setBasic] = useState({
    name: '',
    age: '',
    gender: '',
    contact: '',
    address: ''
  });
  const [bpSys, setBpSys] = useState('');
  const [bpDia, setBpDia] = useState('');
  const [vitals, setVitals] = useState({
    spo2: '',
    temperature: '',
    hr: ''
  });
  const [modalVisible, setModalVisible] = useState(false);

  const handleBasic = (key, value) =>
    setBasic(prev => ({ ...prev, [key]: value }));
  const handleVitals = (key, value) =>
    setVitals(prev => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    // contact validation
    if (!/^\d{10}$/.test(basic.contact)) {
      Alert.alert('Invalid Contact', 'Contact number must be exactly 10 digits.');
      return;
    }
    // gender validation
    if (!basic.gender) {
      Alert.alert('Select Gender', 'Please choose Male, Female or Other.');
      return;
    }
    // BP validation: both parts present
    if (!bpSys || !bpDia) {
      Alert.alert('Invalid BP', 'Enter both systolic and diastolic values.');
      return;
    }

    const record = {
      ...basic,
      bp: `${bpSys}/${bpDia}`,
      ...vitals
    };
    addPatient(record);

    // reset form
    setBasic({ name: '', age: '', gender: '', contact: '', address: '' });
    setBpSys('');
    setBpDia('');
    setVitals({ spo2: '', temperature: '', hr: '' });

    setModalVisible(true);
  };

  const contactValid = /^\d{10}$/.test(basic.contact);

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 20 })}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Basic Details */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Basic Details</Text>

            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={basic.name}
              onChangeText={v => handleBasic('name', v)}
              placeholder="Full name"
            />

            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={basic.age}
              onChangeText={v => handleBasic('age', v)}
              placeholder="e.g. 30"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Gender</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={basic.gender}
                onValueChange={v => handleBasic('gender', v)}
                style={styles.picker}
              >
                <Picker.Item label="Select gender" value="" />
                <Picker.Item label="Male" value="Male" />
                <Picker.Item label="Female" value="Female" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>

            <Text style={styles.label}>Contact No.</Text>
            <TextInput
              style={styles.input}
              value={basic.contact}
              onChangeText={v =>
                handleBasic('contact', v.replace(/[^0-9]/g, ''))
              }
              placeholder="10-digit phone"
              keyboardType="numeric"
              maxLength={10}
            />
            {!contactValid && basic.contact.length > 0 && (
              <Text style={styles.errorText}>
                Contact must be exactly 10 digits.
              </Text>
            )}

            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={basic.address}
              onChangeText={v => handleBasic('address', v)}
              placeholder="Address"
              multiline
            />
          </View>

          {/* Vital Parameters */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Vital Parameters</Text>

            <Text style={styles.label}>BP (Systolic / Diastolic)</Text>
            <View style={styles.bpRow}>
              <TextInput
                style={[styles.input, styles.bpInput]}
                value={bpSys}
                onChangeText={v => setBpSys(v.replace(/[^0-9]/g, ''))}
                placeholder="120"
                keyboardType="numeric"
                maxLength={3}
              />
              <Text style={styles.bpSlash}>/</Text>
              <TextInput
                style={[styles.input, styles.bpInput]}
                value={bpDia}
                onChangeText={v => setBpDia(v.replace(/[^0-9]/g, ''))}
                placeholder="80"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            <Text style={styles.label}>SPO2</Text>
            <TextInput
              style={styles.input}
              value={vitals.spo2}
              onChangeText={v => handleVitals('spo2', v)}
              placeholder="e.g. 98%"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Temperature (°C)</Text>
            <TextInput
              style={styles.input}
              value={vitals.temperature}
              onChangeText={v => handleVitals('temperature', v)}
              placeholder="e.g. 37.0"
              keyboardType="numeric"
            />

            <Text style={styles.label}>HR</Text>
            <TextInput
              style={styles.input}
              value={vitals.hr}
              onChangeText={v => handleVitals('hr', v)}
              placeholder="e.g. 72"
              keyboardType="numeric"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Confirmation Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Registration done.</Text>
            <Text style={styles.modalText}>Patient added to queue.</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
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
  container: { padding: 20, paddingBottom: 40 },
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
    marginTop: 10
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    marginTop: 4
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    marginTop: 4
  },
  picker: { height: 50, width: '100%' },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 4
  },
  bpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  bpInput: { flex: 1 },
  bpSlash: {
    marginHorizontal: 8,
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  submitBtn: {
    backgroundColor: '#70C1B3',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10
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
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '700'
  },
  modalButton: {
    backgroundColor: '#70C1B3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24
  },
  modalButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' }
});
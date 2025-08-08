// src/screens/PatientRecordsScreen.js

import React, { useContext, useMemo } from 'react';
import {
  SafeAreaView,
  SectionList,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { RecordContext } from '../context/RecordContext';

export default function PatientRecordsScreen() {
  const { records } = useContext(RecordContext);

  // Group records by date (YYYY-MM-DD), newest first
  const sections = useMemo(() => {
    const groups = {};
    records.forEach(rec => {
      const day = rec.date.split('T')[0];
      if (!groups[day]) groups[day] = [];
      groups[day].push(rec);
    });
    const days = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    const today = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    return days.map(day => {
      let title;
      if (day === today) title = 'Today';
      else if (day === yesterday) title = 'Yesterday';
      else {
        const [y, m, d] = day.split('-');
        title = `${d}-${m}-${y}`;
      }
      return {
        title,
        data: groups[day].sort((a, b) => b.date.localeCompare(a.date))
      };
    });
  }, [records]);

  const generatePDF = async rec => {
    // const html = `
    //   <html>
    //     <head>
    //       <meta charset="utf-8"/>
    //       <style>
    //         @page { size: A4; margin: 20mm; }
    //         body {
    //           margin: 0;
    //           font-family: Arial, sans-serif;
    //           font-size: 11px;
    //           color: #222;
    //           line-height: 1.4;
    //         }
    //         h1 {
    //           text-align: center;
    //           font-size: 16px;
    //           margin: 12px 0;
    //         }
    //         .section {
    //           margin-bottom: 10px;
    //           break-inside: avoid;
    //           page-break-inside: avoid;
    //         }
    //         .section-title {
    //           font-weight: bold;
    //           font-size: 13px;
    //           border-bottom: 1px solid #ddd;
    //           margin-bottom: 6px;
    //           padding-bottom: 2px;
    //         }
    //         .field {
    //           margin-bottom: 3px;
    //         }
    //         .label {
    //           font-weight: bold;
    //           display: inline-block;
    //           width: 120px;
    //         }
    //       </style>
    //     </head>
    //     <body>
    //       <h1>Patient Consultation Summary</h1>

    //       <div class="section">
    //         <div class="section-title">Basic Details</div>
    //         <div class="field"><span class="label">Date:</span> ${new Date(rec.date).toLocaleDateString()}</div>
    //         <div class="field"><span class="label">Name:</span> ${rec.registration.name}</div>
    //         <div class="field"><span class="label">Age:</span> ${rec.registration.age} yrs</div>
    //         <div class="field"><span class="label">Gender:</span> ${rec.registration.gender}</div>
    //         <div class="field"><span class="label">Contact:</span> ${rec.registration.contact}</div>
    //         <div class="field"><span class="label">Address:</span> ${rec.registration.address}</div>
    //       </div>

    //       <div class="section">
    //         <div class="section-title">Vital Parameters</div>
    //         <div class="field"><span class="label">BP:</span> ${rec.consultation.bp}</div>
    //         <div class="field"><span class="label">SPO2:</span> ${rec.consultation.spo2}</div>
    //         <div class="field"><span class="label">Temp:</span> ${rec.consultation.temperature}</div>
    //         <div class="field"><span class="label">HR:</span> ${rec.consultation.hr}</div>
    //       </div>

    //       <div class="section">
    //         <div class="section-title">Consultation Notes</div>
    //         <div class="field"><span class="label">Complaints:</span> ${rec.consultation.chiefComplaints || '—'}</div>
    //         <div class="field"><span class="label">History:</span> ${rec.consultation.medicalHistory || '—'}</div>
    //         <div class="field"><span class="label">Allergies:</span> ${rec.consultation.allergies || '—'}</div>
    //         <div class="field"><span class="label">Examination:</span> ${rec.consultation.examination || '—'}</div>
    //         <div class="field"><span class="label">Diagnosis:</span> ${rec.consultation.provisionalDiagnosis || '—'}</div>
    //         <div class="field"><span class="label">Treatment:</span> ${rec.consultation.treatment || '—'}</div>
    //         <div class="field"><span class="label">Follow-up:</span> ${rec.consultation.followupDate}</div>
    //       </div>
    //     </body>
    //   </html>
    // `;

    const html = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <title>TrustMed Clinic Consultation Sheet</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
    h1, h2, h3 { margin-bottom: 5px; }
    .header, .footer { text-align: center; }
    .section { margin-top: 20px; }
    .note { font-style: italic; color: #555; }
  </style>
</head>
<body>
  <div class="header">
    <h1>TRUSTMED CLINIC</h1>
    <p><strong>Dr Saurabh Pathak</strong>, MBBS, MD (AMU), PGCCD (Diabetes)</p>
    <p>Fellowship in Dialysis, Certificate in Renal Medicine (RCP London)</p>
    <p>Postgraduate Diploma in Echocardiography</p>
    <p>Ex-Physician (Nephrology), Nayati Medicity, Mathura</p>
    <p>Memberships: IMA, PDA, MLAG</p>
  </div>

  <div class="section">
    <h2>Vitals</h2>
    <ul>
      <li>BP</li>
      <li>PR</li>
      <li>Temp.</li>
      <li>SpO₂</li>
    </ul>
  </div>

  <div class="section">
    <h2>Investigations</h2>
    <ul>
      <li>गुर्दा रोग</li>
      <li>टीबी</li>
      <li>डायलिसिस रोगी</li>
      <li>सांस की बीमारी</li>
      <li>डायबिटीज</li>
      <li>पेट की बीमारी</li>
      <li>टीकाकरण</li>
      <li>बुखार</li>
      <li>सिरदर्द, मिरगी</li>
      <li>नेबुलाइजेशन</li>
      <li>शारीरिक कमजोरी, दर्द</li>
      <li>पैथोलोजी</li>
      <li>उच्च रक्तचाप</li>
      <li>फार्मेसी</li>
      <li>थायराइड</li>
      <li>कोलेस्ट्रॉल</li>
    </ul>
  </div>

  <div class="section">
    <h2>Instructions</h2>
    <ul>
      <li>कृपया डॉक्टर को अपने पहले से चल रहे रोग और उपचार के बारे में अवश्य बताएं</li>
      <li>यदि आपको किसी दवा या भोजन से एलर्जी है तो कृपया डॉक्टर को इसके बारे में अवश्य बताएं</li>
      <li>कृपया हर बार अपना पुराना उपचार पत्र साथ लाएं</li>
    </ul>
  </div>

  <div class="section">
    <h2>Consultation Hours</h2>
    <p>सोमवार से शनिवार: सुबह 10:00 बजे से दोपहर 12:30 बजे तक</p>
    <p>शाम 6:00 बजे से रात 8:00 बजे तक</p>
    <p>रविवार: अवकाश</p>
    <p><strong>परामर्श शुल्क</strong>: 5 दिनों के लिए मान्य (परामर्श के दिन और छुट्टियों सहित)</p>
  </div>

  <div class="section">
    <h2>Patient Details</h2>
    <p>Name: _____________</p>
    <p>Date: _____________</p>
    <p>Age/Gender: _____________</p>
    <p>Mobile: _____________</p>
    <p>Address: _____________</p>
  </div>

  <div class="section">
    <p class="note">This is a professional advice and not valid for medicolegal purpose</p>
  </div>

  <div class="footer">
    <p>Shop No. 1 & 2, Narmada Apartment, Opp. Galaxy Tower, Swarnajayanti Nagar, Ramghat Road, Aligarh–202001</p>
    <p>Email: trustmedclinicaligarh1204@gmail.com | Phone: +91-9557722879</p>
    <p>ECG</p>
  </div>
</body>
</html>`;

    try {
      // 1) render to temp file
      const { uri: tempUri } = await Print.printToFileAsync({ html });
      // 2) copy into DocumentDirectory for sharing
      const fileName = `${rec.registration.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      const finalUri = FileSystem.documentDirectory + fileName;
      await FileSystem.copyAsync({ from: tempUri, to: finalUri });
      // 3) open share/print dialog
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(finalUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Print or download record'
        });
      } else {
        Alert.alert('Sharing unavailable');
      }
    } catch (err) {
      Alert.alert('PDF Error', err.message);
    }
  };

  if (!records.length) {
    return (
      <SafeAreaView style={styles.root}>
        <Text style={styles.empty}>No records yet.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <SectionList
        sections={sections}
        keyExtractor={item => item.patientId + item.date}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>
              {item.registration.name} — {new Date(item.date).toLocaleString()}
            </Text>
            <TouchableOpacity
              style={styles.pdfBtn}
              onPress={() => generatePDF(item)}
            >
              <Text style={styles.pdfText}>Download PDF</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F2F2' },
  empty: { marginTop: 40, textAlign: 'center', color: '#999', fontSize: 16 },
  list: { padding: 20, paddingBottom: 40 },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  pdfBtn: {
    backgroundColor: '#70C1B3',
    padding: 10,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  pdfText: { color: '#FFF', fontWeight: '600' }
});
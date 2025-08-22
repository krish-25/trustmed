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
    const today = new Date();
const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    const html = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <title>TrustMed Clinic Consultation Sheet</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .header, .footer {
      text-align: center;
    }
    .header h1 {
      color: red;
      font-weight: bold;
      font-size: 42px;
    }
    .main-body {
      flex: 1;
      display: flex;
      gap: 40px;
    }
    .left {
      flex: 1;
      max-width: 33%;
      border-right: 2px solid #ccc;
      margin-left: 17px;
      padding-right: 7px;
    }
    .right {
      flex: 2;
      max-width: 67%;
      margin-left: -35px;
    }
    hr {
      border: none;
      border-top: 2px solid #aaa;
      margin-left: 2px;
      margin-right: 2px;
    }
    .note {
      font-style: italic;
      color: #555;
    }
    .section1 {
      text-align: center;
      padding-left: 5px;
      padding-right: 0px;
      font-size: 12px;
    }
    .section3 {
      display: flex;
      font-size: 12px;
      margin-top: -17px;
      margin-bottom: -20px;
    }
    .text-12 {
      font-size: 12px;
    }
    .section4 {
      margin-top: -5px;
      margin-bottom: -5px;
    }
    .section5 {
      text-align: center;
      font-size: 12px;
    }
    .footer {
      // margin-top: 20px;
      position: absolute;
      bottom: 0;
      left: 40px;
      right: 40px;
      margin-left: 40px;
      margin-right: 40px;
    }
    .footer-1{
      font-size: 8px;
    }
    .footer-2 {
      font-size: 10px;
      display: flex;
      justify-content: space-between;
      border-top: 2px solid #FFCE1B;
    }
    .section6 {
      font-size: 12px;
      margin-left: 40px;
      margin-right: 40px;
    }
    .line1, .line2, .line3 {
      display: flex;
      width: 100%;
      margin-bottom: 5px;
    }
    .line11 {
      width: 60%;
    }
    .line12 {
      flex: 1;
    }
    .line21 {
      width: 30%;
    }
    .line22 {
      flex: 1;
    }
    .line31 {
      flex: 1;
    }
    .line11, .line12, .line21, .line22, .line31 {
      border-bottom: 1px dotted #aaa;
      margin-left: 1px;
      margin-right: 1px;
    }
    .name1 {
      font-size: 16px;
    }
    .name2 {
      font-size: 14px;
    }
    .name3 {
      text-decoration: underline;
    }
    .section13{
      margin-top: 5px;
    }
    .section2 {
      font-size: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 5px;
      margin-bottom: 70px;
    }
    .section21{
      width: 50%;
    }
    .vitalsp{
      display: flex;
    }
    .vitals{
      flex: 1;
      border-bottom: 1px dotted #aaa;
    }
    .section22 {
      width: 100%;
      display: flex;
      justify-content: flex-start;
      text-align: left;
    }
    .section7 {
      font-size: 12px;
      margin: 20px 40px;
      margin-top: 20px;
    }

    .consult-block {
      margin-bottom: 10px;
    }

    .consult-title {
      font-weight: bold;
      text-decoration: underline;
      margin-bottom: 3px;
    }
    @media print {
      .footer {
        position: fixed;
        bottom: 0;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>TRUSTMED CLINIC</h1>
  </div>

  <div class="main-body">
    <div class="left">
      <div class="section1">
        <div class="section11">
          <strong class="name1">Dr Saurabh Pathak</strong><br>
          MBBS, MD (AMU), PGCCD (Diabetes)<br>
        </div>

        <div class="section12">
          <strong class="name2">Physician</strong><br>
          Fellowship in Dialysis<br>
          Certificate in Renal Medicine (RCP London)<br>
          Postgraduate Diploma in Echocardiography<br>
          Ex-Physician (Nephrology) at Nayati<br>
          Medicity, Mathura<br>
        </div>
      
        <div class="section13">
          <span class="name3">Memberships</span><br>
          Indian Medical Association (IMA)<br>
          Private Doctors Association (PDA) Aligarh<br>
          Medico Legal Action Group (MLAG)
        </div>
      </div>
      <hr>
      <div class="section2">
        <div class="section21">
          <div class="vitalsp">BP<div class="vitals">${rec.consultation.bp}</div></div>
          <div class="vitalsp">HR<div class="vitals">${rec.consultation.hr}</div></div>
          <div class="vitalsp">Temp.<div class="vitals">${rec.consultation.temp}</div></div>
          <div class="vitalsp">SpO₂<div class="vitals">${rec.consultation.spo2}</div></div>
        </div>
        <div class="section22">
        <span class="name3">Investigations-</span>
        </div>
      </div>
      <hr>
      <div class="section3">
        <ul class="">
          <li>गुर्दा रोग</li>
          <li>डायलिसिस रोगी</li>
          <li>डायबिटीज</li>
          <li>बुखार</li>
          <li>सिरदर्द, मिरगी</li>
          <li>शारीरिक कमजोरी, दर्द</li>
          <li>उच्च रक्तचाप</li>
          <li>थायराइड</li>
          <li>कोलेस्ट्रॉल</li>
        </ul>
        <ul class="">
          <li>टीबी</li>
          <li>सांस की बीमारी</li>
          <li>पेट की बीमारी</li>
          <li>टीकाकरण</li>
          <li>नेबुलाइजेशन</li>
          <li>ECG</li>
          <li>पैथोलोजी</li>
          <li>फार्मेसी</li>
        </ul>
      </div>
      <hr>
      <div class="section4">
        <ul class="text-12">
          <li>कृपया डॉक्टर को अपने पहले से चल रहे रोग और उपचार के बारे में अवश्य बताएं</li>
          <li>यदि आपको किसी दवा या भोजन से एलर्जी है तो कृपया डॉक्टर को इसके बारे में अवश्य बताएं</li>
          <li>कृपया हर बार अपना पुराना उपचार पत्र साथ लाएं</li>
        </ul>
      </div>

      <hr>

      <div class="section5">
        परामर्श समय
        <div>
          सोमवार से शनिवार <br> 
          सुबह 10:00 बजे से दोपहर 12:30 बजे तक <br>
          शाम 6:00 बजे से रात 8:00 बजे तक <br>
          रविवार- अवकाश <br>
          परामर्श शुल्क 5 दिनों के लिए मान्य (परामर्श के दिन और छुट्टियों सहित)
        </div>
      </div>
    </div>

    <div class="right">
      <div class="section6">
        <div class="line1">
          Name:
          <div class="line11">${rec.registration.name}</div>
          Date:
          <div class="line12">${formattedDate}</div>
        </div>
        <div class="line2">
          Age/Gender:
          <div class="line21">${rec.registration.age}/${rec.registration.gender}</div>
          Mob:
          <div class="line22">${rec.registration.mobile}</div>
        </div>
        <div class="line3">
          Add:
          <div class="line31">${rec.registration.address}</div>
        </div>
      </div>
      <div class="section7">
        <div class="consult-block">
          <div class="consult-title">Chief Complaints</div>
          <div>${rec.consultation.chiefComplaints || '—'}</div>
        </div>
        <div class="consult-block">
          <div class="consult-title">Past Medical History</div>
          <div>${rec.consultation.pastHistory || '—'}</div>
        </div>
        <div class="consult-block">
          <div class="consult-title">Allergies (if any)</div>
          <div>${rec.consultation.allergies || '—'}</div>
        </div>
        <div class="consult-block">
          <div class="consult-title">Examination</div>
          <div>${rec.consultation.examination || '—'}</div>
        </div>
        <div class="consult-block">
          <div class="consult-title">Provisional Diagnosis</div>
          <div>${rec.consultation.diagnosis || '—'}</div>
        </div>
        <div class="consult-block">
          <div class="consult-title">Treatment</div>
          <div>${rec.consultation.treatment || '—'}</div>
        </div>
        <div class="consult-block">
          <div class="consult-title">Follow-up Date</div>
          <div>${rec.consultation.followUpDate || '—'}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-1">
      This is a professional advice and not valid for medicolegal purpose
    </div>
    <div class="footer-2">
      <div>
        Shop No. 1 & 2- Narmada Apartment, Opposite Galaxy Tower,<br>
        Swarnajayanti Nagar, Ramghat Road, Aligarh- 202001
      </div>
      <div>
        trustmedclinicaligarh1204@gmail.com<br>
        +91-9557722879
      </div>
    </div>
  </div>
</body>
</html> `;

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
// src/screens/PatientQueueScreen.js

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { BASE_URL } from '../config';

export default function PatientQueueScreen() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchQueue = async () => {
    try {
      setError('');
      setLoading(true);
      const res = await fetch(`${BASE_URL}/patients/queue`);
      if (!res.ok) throw new Error('Failed to fetch patient queue');
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchQueue();
    setRefreshing(false);
  };

  const renderItem = ({ item, index }) => {
    const isActive = index === 0;

    return (
      <View style={styles.card}>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.details}>
            <Text style={styles.detailText}>{item.age} yrs</Text>
            <Text style={styles.detailText}>{item.gender}</Text>
            {item.contact && <Text style={styles.detailText}>{item.contact}</Text>}
          </View>
        </View>

        <Text
          style={[
            styles.status,
            isActive ? styles.consulting : styles.waiting
          ]}
        >
          {isActive ? 'Consulting' : 'Queued'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#70C1B3"
          style={{ marginTop: 20 }}
        />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : patients.length === 0 ? (
        <Text style={styles.empty}>No patients registered.</Text>
      ) : (
        <FlatList
          data={patients}
          keyExtractor={(item, i) => item.id?.toString() || i.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F2F2F2'
  },
  list: {
    padding: 20,
    paddingBottom: 40
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  info: {
    flex: 1
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4
  },
  detailText: {
    marginRight: 16,
    fontSize: 14,
    fontWeight: '500',
    color: '#555'
  },
  status: {
    fontSize: 14,
    fontWeight: '700',
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    textTransform: 'capitalize'
  },
  waiting: {
    backgroundColor: '#C8E6C9',
    color: '#2E7D32'
  },
  consulting: {
    backgroundColor: '#FFE082',
    color: '#333'
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
    fontSize: 16
  },
  error: {
    textAlign: 'center',
    color: '#FF3B30',
    marginTop: 40,
    fontSize: 16
  }
});

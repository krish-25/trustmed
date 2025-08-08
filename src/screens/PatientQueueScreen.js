// src/screens/PatientQueueScreen.js

import React, { useContext, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  StyleSheet,
  Animated
} from 'react-native';
import { PatientContext } from '../context/PatientContext';

export default function PatientQueueScreen() {
  const { patients } = useContext(PatientContext);

  // Animated value for blinking
  const blinkOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start blinking animation loop once
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.timing(blinkOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        })
      ])
    ).start();
  }, [blinkOpacity]);

  const renderItem = ({ item, index }) => {
    const isActive = index === 0;
    const Indicator = isActive ? Animated.View : View;
    const indicatorStyle = isActive
      ? [styles.indicator, styles.indicatorActive, { opacity: blinkOpacity }]
      : styles.indicator;

    return (
      <View style={styles.card}>
        <Indicator style={indicatorStyle} />

        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.details}>
            <Text style={styles.detailText}>{item.age} yrs</Text>
            <Text style={styles.detailText}>{item.gender}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <FlatList
        data={patients}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No patients registered.</Text>
        }
      />
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
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
    marginRight: 12
  },
  indicatorActive: {
    backgroundColor: '#70C1B3'
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
    marginTop: 4
  },
  detailText: {
    marginRight: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#555'
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
    fontSize: 16
  }
});
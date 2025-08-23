import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { BASE_URL } from '../config';

export default function OutOfStockScreen() {
  const [outOfStock, setOutOfStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchOutOfStock = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/stock`);
      if (!res.ok) throw new Error('Failed to fetch stock data');
      const data = await res.json();
      const filtered = data.filter(item => item.quantity === 0);
      setOutOfStock(filtered);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutOfStock();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOutOfStock();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <Text style={styles.itemText}>{item.name}</Text>
      <Text style={styles.itemQty}>Out of Stock</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Out of Stock Medicines</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#70C1B3" style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : outOfStock.length === 0 ? (
        <Text style={styles.emptyText}>All medicines are in stock 🎉</Text>
      ) : (
        <FlatList
          data={outOfStock}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    padding: 16
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    alignSelf: 'center'
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFE5E5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8
  },
  itemText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  itemQty: {
    fontSize: 16,
    fontWeight: '500',
    color: '#D9534F'
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 24
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 24
  }
});
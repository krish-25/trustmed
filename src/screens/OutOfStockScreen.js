// src/screens/OutOfStockScreen.js
import React, { useContext, useMemo } from 'react';
import { SafeAreaView, View, Text, FlatList, StyleSheet } from 'react-native';
import { StockContext } from '../context/StockContext';

export default function OutOfStockScreen() {
  const { stock } = useContext(StockContext);

  const outOfStock = useMemo(() => {
    return stock.filter(m => m.quantity === 0);
  }, [stock]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.qty}>0 units</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      <FlatList
        data={outOfStock}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>All medicines in stock!</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 12,
  },
  listContent: {
    paddingBottom: 20,
    marginVertical: 16
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 20,         // 👈 horizontal margins added!
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  qty: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D32F2F',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 40,
  },
});


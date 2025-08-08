import React, { useContext, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StockContext } from '../context/StockContext';

export default function StockListScreen() {
  const { stock } = useContext(StockContext);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return q
      ? stock.filter(m => m.name.toLowerCase().includes(q))
      : stock;
  }, [searchQuery, stock]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.qty}>{item.quantity} units</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search medicines..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <View style={styles.listContainer}>
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.empty}>No medicines found.</Text>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnText}>Add to Store</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F2F2F2'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    paddingHorizontal: 16,
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 10,
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333'
  },
  listContainer: {
    flex: 1,
    marginHorizontal: 20
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  qty: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555'
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 40
  },
  footer: {
    padding: 20,
    backgroundColor: '#F2F2F2',
    borderTopWidth: 1,
    borderColor: '#EEE'
  },
  addBtn: {
    backgroundColor: '#70C1B3',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center'
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600'
  }
});
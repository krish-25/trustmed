import React, { useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../config';

export default function StockListScreen() {
  const [stock, setStock] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('');

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editQty, setEditQty] = useState('');

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/stock`);
      if (!res.ok) throw new Error('Failed to fetch stock');
      const data = await res.json();
      setStock(data);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const fetchStock = async () => {
        const res = await fetch(`${BASE_URL}/stock`);
        const data = await res.json();
        setStock(data);
      };
      fetchStock();
    }, [])
  );

  const handleAddStock = async () => {
    if (!newName.trim()) {
      Alert.alert('Validation', 'Medicine name is required');
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          quantity: parseInt(newQty) || 0
        })
      });

      if (!res.ok) throw new Error('Failed to add stock');
      const added = await res.json();
      setStock(prev => [...prev, added]);
      setModalVisible(false);
      setNewName('');
      setNewQty('');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleEditSubmit = async () => {
    const qty = parseInt(editQty);
    if (isNaN(qty) || qty < 0) {
      Alert.alert('Validation', 'Enter a valid quantity');
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/stock/${editTarget._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: qty })
      });

      if (!res.ok) throw new Error('Failed to update quantity');
      const updated = await res.json();

      setStock(prev =>
        prev.map(m => (m._id === updated._id ? { ...m, quantity: updated.quantity } : m))
      );
      setEditModalVisible(false);
      setEditTarget(null);
      setEditQty('');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return q
      ? stock.filter(m => m.name.toLowerCase().includes(q))
      : stock;
  }, [searchQuery, stock]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.qty}>{item.quantity} units</Text>
      </View>
      <TouchableOpacity
        style={styles.editIcon}
        onPress={() => {
          setEditTarget(item);
          setEditQty(String(item.quantity));
          setEditModalVisible(true);
        }}
      >
        <Ionicons name="create-outline" size={20} color="#555" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <ActivityIndicator size="large" color="#70C1B3" style={{ marginTop: 20 }} />
      </SafeAreaView>
    );
  }

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
          keyExtractor={i => i._id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.empty}>Stock empty.</Text>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>Add to Store</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 Modal for adding new stock */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add Medicine</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Medicine name"
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Quantity"
              value={newQty}
              onChangeText={setNewQty}
              keyboardType="numeric"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity style={styles.modalBtn} onPress={handleAddStock}>
                <Text style={styles.modalBtnText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#CCC' }]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ✏️ Modal for editing quantity */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit Quantity</Text>
            <Text style={[styles.modalInput, { color: '#555' }]}>
              {editTarget?.name}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="New quantity"
              value={editQty}
              onChangeText={setEditQty}
              keyboardType="numeric"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity style={styles.modalBtn} onPress={handleEditSubmit}>
                <Text style={styles.modalBtnText}>Update</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#CCC' }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F2F2' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    paddingHorizontal: 16,
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 10,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalBox: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    elevation: 5
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333'
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16
  },
  modalBtn: {
    backgroundColor: '#70C1B3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8
  },
  modalBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600'
  },
  editIcon: {
  padding: 10,
  backgroundColor: '#E1C17E',
  borderRadius: 8,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2
},

modalInputReadonly: {
  borderWidth: 1,
  borderColor: '#DDD',
  borderRadius: 8,
  padding: 12,
  marginBottom: 12,
  fontSize: 16,
  backgroundColor: '#F5F5F5',
  color: '#555'
}
});
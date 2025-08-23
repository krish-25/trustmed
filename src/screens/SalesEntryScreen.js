import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { StockContext } from '../context/StockContext';
import { BASE_URL } from '../config';

export default function SalesEntryScreen({ navigation }) {
  const { stock, setStock } = useContext(StockContext);
  const [selectedMed, setSelectedMed] = useState(stock[0]?.id);
  const [units, setUnits] = useState('');
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState('');

  const addEntry = () => {
    const saleQty = Number(units);
    if (!units || saleQty <= 0) return;

    const originalQty = stock.find(m => m.id === selectedMed)?.quantity || 0;
    const existing = entries.find(e => e.id === selectedMed);
    const alreadySold = existing ? existing.sold : 0;
    const available = originalQty - alreadySold;

    if (saleQty > available) {
      setError(`You can add maximum ${available} units.`);
      return;
    }

    setEntries(prev => {
      if (existing) {
        return prev.map(e =>
          e.id === selectedMed
            ? { ...e, sold: e.sold + saleQty }
            : e
        );
      } else {
        const med = stock.find(m => m.id === selectedMed);
        return [...prev, { id: med.id, name: med.name, sold: saleQty }];
      }
    });
    setUnits('');
  };

  const updateStock = async () => {
    try {
      const res = await fetch(`${BASE_URL}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to record sales');
      }

      const updated = stock.map(m => {
        const e = entries.find(x => x.id === m.id);
        return e ? { ...m, quantity: m.quantity - e.sold } : m;
      });

      setStock(updated);
      navigation.goBack();
    } catch (err) {
      setError(err.message);
    }
  };

  const renderEntry = ({ item, index }) => (
    <View style={[
      styles.entryRow,
      index % 2 === 0 && styles.entryRowAlt
    ]}>
      <Text style={styles.entryText}>{item.name}</Text>
      <Text style={styles.entryText}>{item.sold}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Modal
        transparent
        visible={!!error}
        animationType="fade"
        onRequestClose={() => setError('')}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{error}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setError('')}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.formCard}>
        <Text style={styles.label}>Select Medicine</Text>
        <View style={styles.dropdown}>
          <Picker
            selectedValue={selectedMed}
            onValueChange={v => setSelectedMed(v)}
            mode={Platform.OS === 'android' ? 'dialog' : 'dropdown'}
            dropdownIconColor="transparent"
            style={[
              styles.picker,
              Platform.OS === 'web' && styles.pickerWeb
            ]}
            itemStyle={styles.pickerItem}
          >
            {stock.map(m => (
              <Picker.Item key={m.id} label={m.name} value={m.id} />
            ))}
          </Picker>
          <Ionicons
            name="chevron-down"
            size={20}
            color="#555"
            style={styles.arrow}
          />
        </View>

        <Text style={styles.label}>Units Sold</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={units}
          onChangeText={text =>
            setUnits(text.replace(/[^0-9]/g, ''))
          }
          placeholder="e.g. 5"
          placeholderTextColor="#888"
        />

        <TouchableOpacity style={styles.addButton} onPress={addEntry}>
          <Text style={styles.addButtonText}>Add Entry</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.historyCard}>
        <Text style={styles.historyTitle}>Sales Detail</Text>
        <View style={styles.billContainer}>
          <View style={styles.billHeaderRow}>
            <Text style={[styles.entryText, styles.billHeaderText]}>
              Medicine
            </Text>
            <Text style={[styles.entryText, styles.billHeaderText]}>
              Qty
            </Text>
          </View>
          <FlatList
            data={entries}
            keyExtractor={(_, i) => i.toString()}
            renderItem={renderEntry}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No entries yet.</Text>
            }
          />
        </View>

        <TouchableOpacity style={styles.updateButton} onPress={updateStock}>
          <Text style={styles.updateText}>Update Stocks</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },

  formCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },

  historyCard: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },

  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    alignSelf: 'center'
  },

  label: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginTop: 8
  },

  dropdown: {
    position: 'relative',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
    backgroundColor: '#fafafa'
  },
  picker: {
    height: 60,
    width: '100%',
    color: '#333',
    fontSize: 18,
    fontWeight: '700',
    paddingLeft: 12,
    paddingRight: 40
  },
  pickerWeb: {
    appearance: 'none',
    WebkitAppearance: 'none',
    outlineWidth: 0,
    outlineColor: 'transparent'
  },
  pickerItem: {
    fontSize: 18,
    height: 60,
    fontWeight: '700'
  },
  arrow: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -10
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    height: 50,
    borderRadius: 6,
    fontSize: 18,
    marginTop: 8,
    color: '#333'
  },

  addButton: {
    marginTop: 16,
    backgroundColor: '#70C1B3',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  addButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600'
  },

  billContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden'
  },
  billHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#E1C17E'
  },
  billHeaderText: {
    fontWeight: '700',
    color: '#333',
    fontSize: 16
  },

  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F9EBC4'
  },
  entryRowAlt: {
    backgroundColor: '#FFF3D1'
  },
  entryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },

  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    padding: 16
  },

  updateButton: {
    marginTop: 16,
    backgroundColor: '#70C1B3',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  updateText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700'
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center'
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    textAlign: 'center'
  },
  modalButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});
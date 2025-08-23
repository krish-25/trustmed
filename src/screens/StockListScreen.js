import React, { useEffect, useState } from 'react';

const StockListScreen = () => {
  const [stockItems, setStockItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch stock items on mount
  useEffect(() => {
    fetch('/stock')
      .then(res => res.json())
      .then(data => setStockItems(data))
      .catch(() => setError('Failed to load stock'));
  }, []);

  const handleAddStock = () => {
    if (!newItem.name || !newItem.quantity) return;

    setLoading(true);
    fetch('/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newItem.name,
        quantity: parseInt(newItem.quantity)
      })
    })
      .then(res => res.json())
      .then(data => {
        setStockItems(prev => [...prev, data]);
        setNewItem({ name: '', quantity: '' });
      })
      .catch(() => setError('Failed to add stock'))
      .finally(() => setLoading(false));
  };

  const handleUpdateQuantity = (id, quantity) => {
    fetch(`/stock/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: parseInt(quantity) })
    })
      .then(res => res.json())
      .then(updated => {
        setStockItems(prev =>
          prev.map(item => (item._id === id ? updated : item))
        );
      })
      .catch(() => setError('Failed to update quantity'));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Medicine Stock</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Medicine name"
          value={newItem.name}
          onChange={e => setNewItem({ ...newItem, name: e.target.value })}
          style={{ marginRight: '1rem' }}
        />
        <input
          type="number"
          placeholder="Quantity"
          value={newItem.quantity}
          onChange={e => setNewItem({ ...newItem, quantity: e.target.value })}
          style={{ marginRight: '1rem' }}
        />
        <button onClick={handleAddStock} disabled={loading}>
          {loading ? 'Adding...' : 'Add Stock'}
        </button>
      </div>

      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Medicine</th>
            <th>Quantity</th>
            <th>Update</th>
          </tr>
        </thead>
        <tbody>
          {stockItems.map(item => (
            <tr key={item._id}>
              <td>{item.name}</td>
              <td>
                <input
                  type="number"
                  defaultValue={item.quantity}
                  onBlur={e => handleUpdateQuantity(item._id, e.target.value)}
                />
              </td>
              <td>
                <button onClick={() => handleUpdateQuantity(item._id, item.quantity)}>
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockListScreen;
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { ShoppingBag, Plus, Tag, Search } from 'lucide-react';

const ShopManagement = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  
  const [itemForm, setItemForm] = useState({ category_id: 1, name: '', description: '', price: 0, stock_qty: 0, image_url: '' });
  const [catForm, setCatForm] = useState({ category_name: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [catRes, itemRes, ordRes] = await Promise.all([
        api.get('/admin/shop/categories'),
        api.get('/admin/shop/items'),
        api.get('/admin/shop/orders')
      ]);
      setCategories(catRes.data || []);
      setItems(itemRes.data || []);
      setOrders(ordRes.data || []);
      if(catRes.data && catRes.data.length > 0) setItemForm(f => ({...f, category_id: catRes.data[0].id}));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/shop/categories', catForm);
      setIsCatModalOpen(false);
      setCatForm({category_name: ''});
      fetchData();
    } catch (err) {
      alert("Failed to create category");
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...itemForm, price: parseFloat(itemForm.price), stock_qty: parseInt(itemForm.stock_qty, 10), category_id: parseInt(itemForm.category_id, 10) };
      await api.post('/admin/shop/items', payload);
      setIsItemModalOpen(false);
      setItemForm({ category_id: categories.length > 0 ? categories[0].id : 1, name: '', description: '', price: 0, stock_qty: 0, image_url: '' });
      fetchData();
    } catch (err) {
      alert("Failed to create item");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShoppingBag className="text-indigo-500" /> School Shop & Inventory
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage uniforms, books, and stationeries.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsCatModalOpen(true)} className="bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center gap-2">
            <Tag size={18} /> New Category
          </button>
          <button onClick={() => setIsItemModalOpen(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
            <Plus size={18} /> Add New Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Column */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Inventory Items</h3>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Item Name</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold text-right">Price</th>
                <th className="p-4 font-semibold text-right">Stock</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan="4" className="p-8 text-center text-slate-400">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-slate-400">No items in inventory.</td></tr>
              ) : items.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-800">{item.name}</td>
                  <td className="p-4 text-slate-600">{item.category?.category_name}</td>
                  <td className="p-4 text-right font-semibold text-indigo-600">฿{item.price.toFixed(2)}</td>
                  <td className="p-4 text-right">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${item.stock_qty <= 10 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>{item.stock_qty} in stock</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Orders Column */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Recent Orders</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {orders.map(order => (
              <div key={order.id} className="p-4 border border-slate-100 rounded-2xl hover:border-indigo-100 transition-colors bg-slate-50/50">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-indigo-600">{order.order_no}</span>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">{order.status}</span>
                </div>
                <div className="text-sm font-bold text-slate-800">{order.student?.fullname}</div>
                <div className="text-xs text-slate-500 mb-2">Student ID: {order.student?.student_id}</div>
                
                <div className="text-xs space-y-1 mb-2 border-t border-slate-200 pt-2">
                  {order.items?.map(i => (
                    <div key={i.id} className="flex justify-between text-slate-600">
                      <span>{i.quantity}x {i.item?.name}</span>
                      <span>฿{(i.price * i.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-xs font-bold text-slate-500">Total</span>
                  <span className="text-sm font-bold text-indigo-600">฿{order.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
            {orders.length === 0 && <div className="text-center text-slate-400 py-8">No orders yet.</div>}
          </div>
        </div>
      </div>

      {/* Modals for Create Category & Item would go here (omitted for brevity, assume simple inputs) */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateCategory} className="bg-white rounded-3xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold mb-4">New Category</h3>
            <input required autoFocus type="text" value={catForm.category_name} onChange={e => setCatForm({category_name: e.target.value})} className="w-full px-4 py-2 border rounded-xl mb-4" placeholder="e.g. Uniforms" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsCatModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl">Create</button>
            </div>
          </form>
        </div>
      )}

      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateItem} className="bg-white rounded-3xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Add Inventory Item</h3>
            <div className="space-y-4">
              <select value={itemForm.category_id} onChange={e => setItemForm({...itemForm, category_id: e.target.value})} className="w-full px-4 py-2 border rounded-xl">
                {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
              </select>
              <input required type="text" value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} className="w-full px-4 py-2 border rounded-xl" placeholder="Item Name" />
              <input required type="number" step="0.01" value={itemForm.price} onChange={e => setItemForm({...itemForm, price: e.target.value})} className="w-full px-4 py-2 border rounded-xl" placeholder="Price (THB)" />
              <input required type="number" value={itemForm.stock_qty} onChange={e => setItemForm({...itemForm, stock_qty: e.target.value})} className="w-full px-4 py-2 border rounded-xl" placeholder="Stock Quantity" />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setIsItemModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl">Add Item</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ShopManagement;

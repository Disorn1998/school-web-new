import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { ShoppingBag, ShoppingCart, Plus, Minus, Check } from 'lucide-react';

const StudentShopView = ({ currentStudent }) => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentStudent?.id) {
      fetchData();
    }
  }, [currentStudent]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [catRes, itemRes, ordRes] = await Promise.all([
        api.get('/student/shop/categories'),
        api.get('/student/shop/items'),
        api.get(`/student/shop/orders/me?student_id=${currentStudent.id}`)
      ]);
      setCategories(catRes.data || []);
      setItems(itemRes.data || []);
      setOrders(ordRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (item) => {
    if (item.stock_qty <= 0) return;
    setCart(prev => {
      const existing = prev.find(i => i.item_id === item.id);
      if (existing) {
        if (existing.quantity >= item.stock_qty) return prev;
        return prev.map(i => i.item_id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { item_id: item.id, item: item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(i => i.item_id !== itemId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const payload = {
        student_id: currentStudent.id,
        items: cart.map(c => ({ item_id: c.item_id, quantity: c.quantity }))
      };
      await api.post('/student/shop/orders', payload);
      setCart([]);
      fetchData();
      alert('Order placed! An invoice has been generated for payment.');
    } catch (err) {
      alert('Failed to place order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cartTotal = cart.reduce((sum, i) => sum + (i.item.price * i.quantity), 0);
  const filteredItems = activeCategory === 'All' ? items : items.filter(i => i.category?.category_name === activeCategory);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
          <ShoppingBag size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">School Shop</h2>
          <p className="text-slate-500 text-sm">Purchase uniforms, books, and stationeries.</p>
        </div>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Main Store Area */}
        <div className="flex-1 space-y-6">
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button 
              onClick={() => setActiveCategory('All')}
              className={`px-4 py-2 rounded-xl whitespace-nowrap font-bold text-sm transition-all ${activeCategory === 'All' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
              All Items
            </button>
            {categories.map(c => (
              <button 
                key={c.id}
                onClick={() => setActiveCategory(c.category_name)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap font-bold text-sm transition-all ${activeCategory === c.category_name ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
              >
                {c.category_name}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {isLoading ? (
              <div className="col-span-full py-12 text-center text-slate-400">Loading products...</div>
            ) : filteredItems.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">No items available.</div>
            ) : filteredItems.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow group">
                <div className="w-full h-32 bg-slate-100 rounded-xl mb-3 flex items-center justify-center text-slate-300 relative overflow-hidden">
                  <ShoppingBag size={32} />
                  {item.stock_qty <= 0 && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center font-bold text-red-500">Out of Stock</div>
                  )}
                </div>
                <h3 className="font-bold text-slate-800 text-sm line-clamp-2 mb-1 flex-1">{item.name}</h3>
                <div className="flex justify-between items-end mt-2">
                  <span className="font-extrabold text-indigo-600">฿{item.price.toFixed(0)}</span>
                  <button 
                    onClick={() => addToCart(item)}
                    disabled={item.stock_qty <= 0}
                    className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors disabled:opacity-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Cart & Orders */}
        <div className="w-full lg:w-80 space-y-6">
          {/* Cart */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sticky top-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <ShoppingCart className="text-indigo-500" size={20} /> Your Cart
            </h3>
            
            {cart.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm">Cart is empty</div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                  {cart.map(c => (
                    <div key={c.item_id} className="flex justify-between items-start text-sm">
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800 line-clamp-1">{c.item.name}</div>
                        <div className="text-slate-500 text-xs">฿{c.item.price} x {c.quantity}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">฿{c.item.price * c.quantity}</span>
                        <button onClick={() => removeFromCart(c.item_id)} className="text-red-400 hover:text-red-600"><XCircle size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-slate-100 pt-3">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-slate-500">Total</span>
                    <span className="text-xl font-black text-indigo-600">฿{cartTotal.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting ? 'Processing...' : 'Checkout & Generate Invoice'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Past Orders */}
          {orders.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-bold text-slate-800 mb-4">Recent Orders</h3>
              <div className="space-y-3">
                {orders.slice(0, 3).map(o => (
                  <div key={o.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-500">{o.order_no}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{o.status}</span>
                    </div>
                    <div className="font-bold text-sm text-slate-800">฿{o.total.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentShopView;

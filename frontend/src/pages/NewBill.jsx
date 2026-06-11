import { useEffect, useState } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Search, Plus, Minus, Trash2, Send, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NewBill() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paid, setPaid] = useState(true);
  const [sendWhatsApp, setSendWhatsApp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    api.get('/api/products').then(r => setProducts(r.data.products)).catch(() => {});
    api.get('/api/customers').then(r => setCustomers(r.data.customers)).catch(() => {});
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) && p.quantity > 0
  );

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.phone && c.phone.includes(customerSearch))
  );

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product_id: product.id, product_name: product.name, quantity: 1, unit_price: product.selling_price, max_qty: product.quantity }];
    });
    setProductSearch('');
  };

  const updateQty = (productId, delta) => {
    setCartItems(prev => prev.map(i => {
      if (i.product_id !== productId) return i;
      const newQty = i.quantity + delta;
      if (newQty <= 0) return null;
      if (newQty > i.max_qty) { toast.error(`Only ${i.max_qty} in stock`); return i; }
      return { ...i, quantity: newQty };
    }).filter(Boolean));
  };

  const removeItem = (productId) => setCartItems(prev => prev.filter(i => i.product_id !== productId));

  const total = cartItems.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

  const handleBill = async () => {
    if (cartItems.length === 0) { toast.error('Add at least one item'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/api/bills', {
        customer_id: selectedCustomer?.id || null,
        customer_name: selectedCustomer?.name || customerName || 'Walk-in Customer',
        customer_phone: selectedCustomer?.phone || customerPhone || null,
        items: cartItems,
        paid,
        send_whatsapp: sendWhatsApp,
      });

      if (sendWhatsApp && data.bill?.id && (selectedCustomer?.phone || customerPhone)) {
        try {
          await api.post(`/api/whatsapp/send/${data.bill.id}`);
          toast.success('WhatsApp receipt sent! 📱');
        } catch { toast.error('Bill created but WhatsApp failed'); }
      }

      setSuccess(data.bill);
      toast.success('Bill created successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create bill');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-24 flex flex-col items-center text-center">
      <div className="bg-success-50 p-5 rounded-full mb-4">
        <CheckCircle size={48} className="text-success-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Bill Created!</h2>
      <p className="text-gray-500 text-sm mb-2">Total: <span className="font-bold text-gray-900 text-lg">₹{success.total_amount?.toFixed(2)}</span></p>
      <p className="text-gray-400 text-sm mb-6">Customer: {success.customer_name}</p>
      <div className="flex gap-3 w-full">
        <button onClick={() => { setSuccess(null); setCartItems([]); setSelectedCustomer(null); setCustomerName(''); setCustomerPhone(''); }} className="btn-secondary flex-1">New Bill</button>
        <button onClick={() => navigate('/bills')} className="btn-primary flex-1">View Bills</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-4 pb-32 space-y-4">
      <h1 className="text-xl font-bold text-gray-900">New Bill</h1>

      {/* Customer Section */}
      <div className="card space-y-3">
        <h3 className="font-semibold text-gray-700 text-sm">Customer</h3>
        {selectedCustomer ? (
          <div className="flex items-center justify-between bg-primary-50 rounded-xl p-3">
            <div>
              <p className="font-semibold text-primary-800">{selectedCustomer.name}</p>
              <p className="text-xs text-primary-500">{selectedCustomer.phone}</p>
            </div>
            <button onClick={() => setSelectedCustomer(null)} className="text-primary-400 hover:text-primary-600 text-xs">Change</button>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input className="input pl-9" placeholder="Search existing customer..."
                value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} />
            </div>
            {customerSearch && filteredCustomers.length > 0 && (
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                {filteredCustomers.slice(0, 4).map(c => (
                  <button key={c.id} onClick={() => { setSelectedCustomer(c); setCustomerSearch(''); }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-0 text-sm">
                    <p className="font-medium text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.phone}</p>
                  </button>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <input className="input text-sm" placeholder="Walk-in name" value={customerName} onChange={e => setCustomerName(e.target.value)} />
              <input className="input text-sm" placeholder="Phone (WhatsApp)" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
            </div>
          </>
        )}
      </div>

      {/* Product Search */}
      <div className="card space-y-3">
        <h3 className="font-semibold text-gray-700 text-sm">Add Products</h3>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input className="input pl-9" placeholder="Search product to add..."
            value={productSearch} onChange={e => setProductSearch(e.target.value)} />
        </div>
        {productSearch && filteredProducts.length > 0 && (
          <div className="border border-gray-100 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
            {filteredProducts.slice(0, 6).map(p => (
              <button key={p.id} onClick={() => addToCart(p)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-0 flex items-center justify-between">
                <span className="text-sm text-gray-800">{p.name}</span>
                <span className="text-xs text-gray-400">₹{p.selling_price} · {p.quantity} left</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cart */}
      {cartItems.length > 0 && (
        <div className="card space-y-2">
          <h3 className="font-semibold text-gray-700 text-sm">Items ({cartItems.length})</h3>
          {cartItems.map(item => (
            <div key={item.product_id} className="flex items-center gap-2 py-2 border-b last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.product_name}</p>
                <p className="text-xs text-gray-400">₹{item.unit_price} each</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQty(item.product_id, -1)} className="p-1 bg-gray-100 rounded-lg hover:bg-gray-200"><Minus size={12} /></button>
                <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                <button onClick={() => updateQty(item.product_id, 1)} className="p-1 bg-gray-100 rounded-lg hover:bg-gray-200"><Plus size={12} /></button>
              </div>
              <p className="text-sm font-bold text-gray-900 w-14 text-right">₹{(item.unit_price * item.quantity).toFixed(0)}</p>
              <button onClick={() => removeItem(item.product_id)} className="p-1 text-danger-400 hover:text-danger-600"><Trash2 size={14} /></button>
            </div>
          ))}
          <div className="flex justify-between items-center pt-1">
            <span className="font-bold text-gray-900">Total</span>
            <span className="text-xl font-bold text-primary-600">₹{total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Options */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">Payment Received</p>
            <p className="text-xs text-gray-400">{paid ? 'Paid in full' : 'Add to credit/udhar'}</p>
          </div>
          <button onClick={() => setPaid(p => !p)}
            className={`w-12 h-6 rounded-full transition-all ${paid ? 'bg-success-500' : 'bg-gray-300'}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-all mx-0.5 ${paid ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">Send WhatsApp Receipt</p>
            <p className="text-xs text-gray-400">Requires customer phone number</p>
          </div>
          <button onClick={() => setSendWhatsApp(p => !p)}
            className={`w-12 h-6 rounded-full transition-all ${sendWhatsApp ? 'bg-success-500' : 'bg-gray-300'}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-all mx-0.5 ${sendWhatsApp ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      {/* Generate Bill Button */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-gray-100">
        <div className="max-w-lg mx-auto">
          <button onClick={handleBill} disabled={loading || cartItems.length === 0}
            className="btn-primary w-full flex items-center justify-center gap-2">
            <Send size={16} />
            {loading ? 'Creating Bill...' : `Generate Bill · ₹${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

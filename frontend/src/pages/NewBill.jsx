import { useEffect, useState } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, Minus, Trash2, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SearchSelect from '../components/SearchSelect';
import BillReceipt from '../components/BillReceipt';

export default function NewBill() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
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

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        cost_price: product.purchase_price || 0,
        unit_price: product.selling_price || 0,
        discount: 0,
        max_qty: product.quantity,
      }];
    });
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

  const updateField = (productId, field, value) => {
    setCartItems(prev => prev.map(i => i.product_id === productId ? { ...i, [field]: parseFloat(value) || 0 } : i));
  };

  const removeItem = (productId) => setCartItems(prev => prev.filter(i => i.product_id !== productId));

  const total = cartItems.reduce((sum, i) => sum + (i.unit_price - (i.discount || 0)) * i.quantity, 0);

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
    <div className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-4">
      <h2 className="text-xl font-bold text-gray-900 text-center">✅ Bill Created!</h2>
      <BillReceipt bill={success} />
      <div className="flex gap-3">
        <button onClick={() => {
          setSuccess(null); setCartItems([]); setSelectedCustomer(null); setCustomerName(''); setCustomerPhone('');
          api.get('/api/products').then(r => setProducts(r.data.products)).catch(() => {});
        }} className="btn-secondary flex-1">New Bill</button>
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
            <SearchSelect
              items={customers}
              getLabel={c => c.name}
              getSubLabel={c => c.phone}
              placeholder="Select or search customer..."
              onSelect={setSelectedCustomer}
              renderRight={c => c.total_credit > 0 ? `₹${c.total_credit.toFixed(0)} due` : null}
            />
            <p className="text-xs text-gray-400 text-center">— or enter walk-in customer below —</p>
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
        <SearchSelect
          items={products.filter(p => p.quantity > 0)}
          getLabel={p => p.name}
          getSubLabel={p => `${p.quantity} ${p.unit} in stock`}
          placeholder="Select or search product..."
          onSelect={addToCart}
          renderRight={p => `₹${p.selling_price}`}
        />
      </div>

      {/* Cart */}
      {cartItems.length > 0 && (
        <div className="card space-y-3">
          <h3 className="font-semibold text-gray-700 text-sm">Items ({cartItems.length})</h3>
          {cartItems.map(item => (
            <div key={item.product_id} className="border border-gray-100 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800 truncate">{item.product_name}</p>
                <button onClick={() => removeItem(item.product_id)} className="p-1 text-danger-400 hover:text-danger-600"><Trash2 size={14} /></button>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => updateQty(item.product_id, -1)} className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200"><Minus size={12} /></button>
                <span className="text-sm font-bold w-8 text-center">{item.quantity}</span>
                <button onClick={() => updateQty(item.product_id, 1)} className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200"><Plus size={12} /></button>
                <span className="text-xs text-gray-400 ml-1">in stock: {item.max_qty}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-0.5">Cost Price</label>
                  <input type="number" className="input text-xs py-1.5" step="0.01" value={item.cost_price}
                    onChange={e => updateField(item.product_id, 'cost_price', e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-0.5">Selling Price</label>
                  <input type="number" className="input text-xs py-1.5" step="0.01" value={item.unit_price}
                    onChange={e => updateField(item.product_id, 'unit_price', e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-0.5">Discount</label>
                  <input type="number" className="input text-xs py-1.5" step="0.01" value={item.discount}
                    onChange={e => updateField(item.product_id, 'discount', e.target.value)} />
                </div>
              </div>

              <div className="flex justify-between text-xs text-gray-500 pt-1 border-t border-gray-50">
                <span>Margin: ₹{((item.unit_price - item.cost_price - item.discount) * item.quantity).toFixed(2)}</span>
                <span className="font-bold text-gray-900">Subtotal: ₹{((item.unit_price - item.discount) * item.quantity).toFixed(2)}</span>
              </div>
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

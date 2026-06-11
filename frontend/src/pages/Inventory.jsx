import { useEffect, useState } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, Search, Package, Pencil, Trash2, X, ScanLine } from 'lucide-react';
import { Link } from 'react-router-dom';

const emptyForm = { name: '', quantity: '', unit: 'pcs', purchase_price: '', selling_price: '' };

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/api/products');
      setProducts(data.products);
      setFiltered(data.products);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(products.filter(p => p.name.toLowerCase().includes(q)));
  }, [search, products]);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setModal(true); };
  const openEdit = (p) => { setForm({ name: p.name, quantity: p.quantity, unit: p.unit, purchase_price: p.purchase_price, selling_price: p.selling_price }); setEditId(p.id); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Product name required'); return; }
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/api/products/${editId}`, form);
        toast.success('Product updated');
      } else {
        await api.post('/api/products', form);
        toast.success('Product added');
      }
      setModal(false);
      fetchProducts();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/api/products/${id}`);
      toast.success('Deleted');
      fetchProducts();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Inventory</h1>
        <div className="flex gap-2">
          <Link to="/scan" className="btn-secondary py-2 px-3 flex items-center gap-1.5 text-sm">
            <ScanLine size={16} /> Scan
          </Link>
          <button onClick={openAdd} className="btn-primary py-2 px-3 flex items-center gap-1.5 text-sm">
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-3 text-gray-400" />
        <input className="input pl-9" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Stats */}
      <div className="flex gap-2 mb-4 text-xs text-gray-500">
        <span className="badge-indigo">{products.length} total</span>
        <span className="badge-red">{products.filter(p => p.quantity <= 5).length} low stock</span>
        <span className="badge-yellow">{products.filter(p => p.quantity === 0).length} out of stock</span>
      </div>

      {/* Product List */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Package size={40} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">{search ? 'No products match your search' : 'No products yet'}</p>
          {!search && <button onClick={openAdd} className="mt-3 text-primary-600 text-sm font-medium">Add your first product →</button>}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => (
            <div key={p.id} className="card flex items-center gap-3">
              <div className={`w-2 h-10 rounded-full flex-shrink-0 ${p.quantity === 0 ? 'bg-danger-500' : p.quantity <= 5 ? 'bg-warning-500' : 'bg-success-500'}`} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{p.name}</p>
                <p className="text-xs text-gray-400">{p.unit} · Buy ₹{p.purchase_price} · Sell ₹{p.selling_price}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-lg font-bold ${p.quantity === 0 ? 'text-danger-500' : p.quantity <= 5 ? 'text-warning-500' : 'text-gray-900'}`}>{p.quantity}</p>
                <p className="text-xs text-gray-400">{p.unit}</p>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editId ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <div><label className="label">Product Name *</label><input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Quantity</label><input type="number" className="input" min="0" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} /></div>
                <div><label className="label">Unit</label>
                  <select className="input" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}>
                    {['pcs','kg','g','l','ml','box','pack','dozen'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Buy Price (₹)</label><input type="number" className="input" step="0.01" value={form.purchase_price} onChange={e => setForm(p => ({ ...p, purchase_price: e.target.value }))} /></div>
                <div><label className="label">Sell Price (₹)</label><input type="number" className="input" step="0.01" value={form.selling_price} onChange={e => setForm(p => ({ ...p, selling_price: e.target.value }))} /></div>
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : editId ? 'Update Product' : 'Add Product'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

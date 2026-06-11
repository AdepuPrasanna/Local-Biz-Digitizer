import { useState, useRef } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Camera, Upload, CheckCircle, X, Edit2, ScanLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ScanBill() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [editedItems, setEditedItems] = useState([]);
  const [applying, setApplying] = useState(false);
  const [done, setDone] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setResult(null);
    handleScan(file);
  };

  const handleScan = async (file) => {
    setScanning(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await api.post('/api/ocr/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(data);
      setEditedItems(data.items.map(i => ({ ...i })));
      if (data.items.length === 0) toast.error('Could not detect items. Try a clearer image.');
      else toast.success(`Detected ${data.items.length} items!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  const updateItem = (i, field, value) => {
    setEditedItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };

  const removeItem = (i) => setEditedItems(prev => prev.filter((_, idx) => idx !== i));

  const addItem = () => setEditedItems(prev => [...prev, { name: '', quantity: 1, purchase_price: 0 }]);

  const handleApply = async () => {
    const valid = editedItems.filter(i => i.name.trim());
    if (valid.length === 0) { toast.error('No valid items to apply'); return; }
    setApplying(true);
    try {
      const { data } = await api.post(`/api/ocr/apply/${result.scan_id}`, { items: valid });
      setDone(data);
      toast.success(`✅ ${data.added} added, ${data.updated} updated!`);
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to apply'); }
    finally { setApplying(false); }
  };

  if (done) return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-24 flex flex-col items-center text-center">
      <div className="bg-success-50 p-5 rounded-full mb-4">
        <CheckCircle size={48} className="text-success-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Inventory Updated!</h2>
      <p className="text-gray-600 text-sm mb-1">✅ {done.added} new products added</p>
      <p className="text-gray-600 text-sm mb-6">🔄 {done.updated} existing products updated</p>
      <div className="flex gap-3 w-full">
        <button onClick={() => { setDone(null); setPreview(null); setResult(null); setEditedItems([]); }} className="btn-secondary flex-1">Scan Another</button>
        <button onClick={() => navigate('/inventory')} className="btn-primary flex-1">View Inventory</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-4 pb-24 space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Scan Supply Bill</h1>
      <p className="text-sm text-gray-500">Take a photo of your supplier's invoice to auto-update inventory</p>

      {/* Upload Area */}
      <div
        onClick={() => !scanning && fileRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all
          ${scanning ? 'border-primary-300 bg-primary-50' : 'border-gray-200 hover:border-primary-400 hover:bg-primary-50'}`}
      >
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
        {preview ? (
          <img src={preview} alt="Scanned bill" className="max-h-40 mx-auto rounded-xl object-contain" />
        ) : (
          <div className="space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Camera size={24} className="text-primary-600" />
            </div>
            <p className="text-sm font-medium text-gray-700">Tap to take photo or upload</p>
            <p className="text-xs text-gray-400">JPG, PNG up to 10MB</p>
          </div>
        )}
        {scanning && (
          <div className="mt-3 flex items-center justify-center gap-2 text-primary-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600" />
            <span className="text-sm font-medium">Reading bill with AI...</span>
          </div>
        )}
      </div>

      {preview && !scanning && (
        <button onClick={() => fileRef.current?.click()} className="btn-secondary w-full flex items-center justify-center gap-2 text-sm">
          <Upload size={16} /> Upload Different Image
        </button>
      )}

      {/* OCR Results */}
      {result && editedItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Detected Items</h3>
            <span className="badge-indigo">{editedItems.length} items</span>
          </div>
          <p className="text-xs text-gray-400 flex items-center gap-1"><Edit2 size={10} /> Edit values before applying</p>

          <div className="space-y-2">
            {editedItems.map((item, i) => (
              <div key={i} className="card grid grid-cols-12 gap-2 items-center">
                <input className="input col-span-5 text-xs" placeholder="Product name" value={item.name}
                  onChange={e => updateItem(i, 'name', e.target.value)} />
                <input type="number" className="input col-span-2 text-xs text-center" placeholder="Qty" min="1" value={item.quantity}
                  onChange={e => updateItem(i, 'quantity', parseInt(e.target.value) || 1)} />
                <input type="number" className="input col-span-3 text-xs" placeholder="₹ price" step="0.01" value={item.purchase_price}
                  onChange={e => updateItem(i, 'purchase_price', parseFloat(e.target.value) || 0)} />
                <button onClick={() => removeItem(i)} className="col-span-2 p-1 text-danger-400 hover:text-danger-600 flex justify-center">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <button onClick={addItem} className="btn-secondary w-full text-sm">+ Add Item Manually</button>

          <button onClick={handleApply} disabled={applying}
            className="btn-primary w-full flex items-center justify-center gap-2">
            <ScanLine size={16} />
            {applying ? 'Applying...' : `Apply ${editedItems.length} Items to Inventory`}
          </button>
        </div>
      )}

      {result && result.unrecognized?.length > 0 && (
        <div className="card bg-warning-50 border-warning-100">
          <p className="text-xs font-semibold text-warning-700 mb-1">⚠️ Unrecognized lines ({result.unrecognized.length})</p>
          <p className="text-xs text-warning-600">These lines could not be parsed automatically:</p>
          <div className="mt-2 space-y-0.5">
            {result.unrecognized.slice(0, 5).map((line, i) => (
              <p key={i} className="text-xs text-warning-500 font-mono bg-white/50 rounded px-2 py-0.5 truncate">{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

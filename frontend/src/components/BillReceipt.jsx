import { useShop } from '../context/ShopContext';

export default function BillReceipt({ bill }) {
  const { shop } = useShop();
  if (!bill) return null;

  const date = new Date(bill.created_at || Date.now());

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 text-sm">
      {/* Header */}
      <div className="text-center border-b border-dashed border-gray-200 pb-3 mb-3">
        <h3 className="font-bold text-gray-900 text-base">{shop?.shop_name || 'My Shop'}</h3>
        {shop?.address && <p className="text-xs text-gray-400">{shop.address}</p>}
        {shop?.phone && <p className="text-xs text-gray-400">📞 {shop.phone}</p>}
        <p className="text-xs text-gray-400 mt-1">
          {date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} ·{' '}
          {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Customer */}
      <div className="flex justify-between text-xs text-gray-500 mb-2">
        <span>Bill To: <span className="font-semibold text-gray-700">{bill.customer_name}</span></span>
        {bill.customer_phone && <span>{bill.customer_phone}</span>}
      </div>

      {/* Items Table */}
      <table className="w-full text-xs mb-3">
        <thead>
          <tr className="border-b border-gray-200 text-gray-400">
            <th className="text-left py-1.5 font-medium">Item</th>
            <th className="text-center py-1.5 font-medium">Qty</th>
            <th className="text-right py-1.5 font-medium">Price</th>
            <th className="text-right py-1.5 font-medium">Disc.</th>
            <th className="text-right py-1.5 font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {bill.bill_items?.map((item, i) => (
            <tr key={i} className="border-b border-gray-50">
              <td className="py-1.5 text-gray-800">{item.product_name}</td>
              <td className="py-1.5 text-center text-gray-600">{item.quantity}</td>
              <td className="py-1.5 text-right text-gray-600">₹{Number(item.unit_price).toFixed(2)}</td>
              <td className="py-1.5 text-right text-gray-400">{item.discount ? `-₹${Number(item.discount).toFixed(2)}` : '-'}</td>
              <td className="py-1.5 text-right font-semibold text-gray-900">₹{Number(item.total_price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="border-t border-dashed border-gray-200 pt-2 space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Items</span>
          <span>{bill.bill_items?.reduce((s, i) => s + i.quantity, 0)}</span>
        </div>
        <div className="flex justify-between text-base font-bold text-gray-900">
          <span>Grand Total</span>
          <span className="text-primary-600">₹{Number(bill.total_amount).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Payment Status</span>
          <span className={bill.paid ? 'text-success-600 font-semibold' : 'text-warning-600 font-semibold'}>
            {bill.paid ? 'Paid' : 'Pending / Credit'}
          </span>
        </div>
      </div>

      <p className="text-center text-xs text-gray-300 mt-3">Thank you for shopping with us! 🙏</p>
    </div>
  );
}

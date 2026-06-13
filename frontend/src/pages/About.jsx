import { Link } from 'react-router-dom';
import { ArrowLeft, Store } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 mb-6 text-sm">
          <ArrowLeft size={16} /> Back
        </Link>

        <div className="text-center mb-6">
          <div className="inline-flex bg-primary-100 text-primary-600 p-4 rounded-2xl mb-3">
            <Store size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">About BizEase</h1>
        </div>

        <div className="card space-y-3 text-sm text-gray-600 leading-relaxed">
          <p>
            <strong>BizEase</strong> is a mobile-first Micro-SaaS built for small neighborhood
            businesses — kirana stores, cafes, and pharmacies — who can't afford or don't need
            heavy enterprise billing software.
          </p>
          <p>
            With BizEase, shop owners can scan supplier invoices using their phone camera and let
            AI/OCR automatically update inventory, generate bills in seconds with full price and
            discount breakdowns, track customer credit (udhar), and send digital receipts straight
            to a customer's WhatsApp — no printer required.
          </p>
          <p>
            Our mission is simple: bring affordable digital tools to every local shop, with zero
            training required.
          </p>
        </div>

        <div className="card mt-4 space-y-2 text-sm text-gray-600">
          <p className="font-semibold text-gray-800">Key Features</p>
          <ul className="space-y-1.5 list-disc list-inside">
            <li>Smart inventory scanning with OCR</li>
            <li>One-click billing with cost, selling price & discounts</li>
            <li>Automated WhatsApp digital receipts</li>
            <li>Customer credit (udhar) tracking</li>
            <li>Real-time dashboard & low-stock alerts</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

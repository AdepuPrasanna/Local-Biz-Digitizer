import { Link } from 'react-router-dom';
import { Store, ScanLine, MessageCircle, Wallet, ArrowRight } from 'lucide-react';

const features = [
  { icon: ScanLine, title: 'Smart Scan', desc: 'Snap a photo of supplier bills — AI updates your inventory instantly.' },
  { icon: Wallet, title: 'Quick Billing', desc: 'Create bills in seconds with cost, selling price & discounts.' },
  { icon: MessageCircle, title: 'WhatsApp Receipts', desc: 'Send digital receipts directly to customers, paperless.' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-900 text-white">
      <div className="max-w-lg mx-auto px-4 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex bg-white/20 backdrop-blur p-4 rounded-2xl mb-4">
            <Store size={40} />
          </div>
          <h1 className="text-3xl font-bold">BizEase</h1>
          <p className="text-primary-200 mt-2 text-sm">
            Digitize your shop — billing, inventory & WhatsApp receipts, all from your phone.
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <Link to="/register" className="bg-white text-primary-700 font-semibold py-2.5 px-5 rounded-xl flex items-center gap-1.5">
              Get Started <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="bg-white/10 border border-white/30 font-semibold py-2.5 px-5 rounded-xl">
              Login
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-10">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white/10 backdrop-blur rounded-2xl p-4 flex gap-3 items-start">
              <div className="bg-white/20 p-2 rounded-xl"><Icon size={20} /></div>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-primary-200 text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center text-primary-200 text-xs">
          <Link to="/about" className="underline">Learn more about BizEase</Link>
        </div>
      </div>
    </div>
  );
}

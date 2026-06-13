import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

/**
 * SearchSelect — a combobox with a dropdown of default options AND a type-to-filter input.
 *
 * props:
 *  - items: array of objects
 *  - getLabel: (item) => string  (main display text)
 *  - getSubLabel: (item) => string (secondary text, optional)
 *  - onSelect: (item) => void
 *  - placeholder: string
 *  - renderRight: (item) => node (optional extra info on right side of each row)
 */
export default function SearchSelect({ items = [], getLabel, getSubLabel, onSelect, placeholder = 'Search or select...', renderRight }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query
    ? items.filter(i =>
        getLabel(i).toLowerCase().includes(query.toLowerCase()) ||
        (getSubLabel && getSubLabel(i)?.toLowerCase().includes(query.toLowerCase()))
      )
    : items;

  const handleSelect = (item) => {
    onSelect(item);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-3 text-gray-400" />
        <input
          className="input pl-9 pr-9"
          placeholder={placeholder}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
        />
        <button type="button" onClick={() => setOpen(o => !o)} className="absolute right-3 top-3 text-gray-400">
          <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-3">No matches found</p>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-0 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{getLabel(item)}</p>
                  {getSubLabel && <p className="text-xs text-gray-400 truncate">{getSubLabel(item)}</p>}
                </div>
                {renderRight && <div className="flex-shrink-0 text-xs text-gray-400">{renderRight(item)}</div>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { API_BASE } from '../api/config';

export default function EditAssetModal({ item, onClose, onSaved }) {
  const [condition, setCondition] = useState(item.condition_lot || '');
  const [remarks, setRemarks] = useState(item.remarks || '');
  const [lastInspection, setLastInspection] = useState(item.last_inspection ? item.last_inspection.split('T')[0] : '');
  const [isSaving, setIsSaving] = useState(false);

  const save = async () => {
    setIsSaving(true);
    try {
      // Send URL-encoded form data to mimic your existing POST route
      const body = new URLSearchParams();
      body.append('condition_lot', condition);
      body.append('remarks', remarks);
      body.append('last_inspection', lastInspection);

      const res = await fetch(`${API_BASE}/assets/${encodeURIComponent(item.uid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });
      const json = await res.json();
      if (res.ok) {
        onSaved && onSaved(json.item);
      } else {
        alert('Update failed: ' + (json.error || 'Server error'));
      }
    } catch (err) {
      console.error(err);
      alert('A network error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-xl card p-6">
        <h3 className="text-xl font-semibold mb-4">Edit Asset: {item.uid}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted">Condition</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full mt-1 bg-gray-900 p-2 rounded border border-slate-700">
              <option value="">Select</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Needs Repair">Needs Repair</option>
              <option value="Need Replacement">Need Replacement</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-muted">Last inspection</label>
            <input value={lastInspection} onChange={(e) => setLastInspection(e.target.value)} type="date" className="w-full mt-1 bg-gray-900 p-2 rounded border border-slate-700" />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm text-muted">Remarks</label>
          <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} className="w-full mt-1 bg-gray-900 p-2 rounded border border-slate-700" rows="3" />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600">Cancel</button>
          <button onClick={save} disabled={isSaving} className="px-4 py-2 rounded bg-accent text-black hover:bg-blue-400 disabled:opacity-50">{isSaving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}
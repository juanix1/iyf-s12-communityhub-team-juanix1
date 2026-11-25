import { useState } from 'react';
import { Flag, X, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { REPORT_REASONS } from '../utils/constants';
import { useToast } from '../context/ToastContext';

export default function ReportModal({ postId, onClose }) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/reports', { postId, reason, details });
      showToast('Report submitted. Thank you for helping keep Njia accurate and safe.');
      onClose();
    } catch (err) {
      setError(err.friendlyMessage || 'Could not submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div className="card w-full max-w-md p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-rose-700">
            <Flag className="h-5 w-5" />
            <h2 id="report-modal-title" className="text-base font-bold text-slate-900">
              Report Route Update
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="report-reason" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Why are you flagging this post?
            </label>
            <select
              id="report-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-field"
            >
              {REPORT_REASONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="report-details" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Additional context (optional)
            </label>
            <textarea
              id="report-details"
              rows={3}
              maxLength={400}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Explain what seems inaccurate or inappropriate..."
              className="input-field"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-danger">
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

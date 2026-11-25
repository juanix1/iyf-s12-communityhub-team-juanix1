import { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Trash2,
  CheckCircle,
  UserX,
  UserCheck,
  Users,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatTimeAgo } from '../utils/dateHelpers';
import { useToast } from '../context/ToastContext';

export default function AdminDashboardPage() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ pendingReports: 0, totalUsers: 0, activePosts: 0 });
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const { data } = await api.get('/admin/reports', { params });
      setReports(data.reports || []);
      setStats(data.stats || { pendingReports: 0, totalUsers: 0, activePosts: 0 });
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to load moderation queue.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleResolveReport = async (reportId, action) => {
    const confirmMsg =
      action === 'remove_post'
        ? 'Remove this reported post from the public feed?'
        : 'Dismiss this report and leave the post visible?';

    if (!window.confirm(confirmMsg)) return;

    try {
      const { data } = await api.patch(`/admin/reports/${reportId}`, { action });
      showToast(data.message);
      fetchReports();
    } catch (err) {
      showToast(err.friendlyMessage || 'Moderation action failed.', 'error');
    }
  };

  const handleToggleSuspend = async (userObj) => {
    if (!userObj?._id) return;
    const nextSuspended = !userObj.isSuspended;
    const reason = nextSuspended
      ? window.prompt('Enter suspension reason (visible to the user):', 'Repeated misleading updates')
      : '';

    if (nextSuspended && reason === null) return;

    try {
      const { data } = await api.patch(`/admin/users/${userObj._id}/suspend`, {
        isSuspended: nextSuspended,
        suspensionReason: reason,
      });
      showToast(data.message);
      fetchReports();
    } catch (err) {
      showToast(err.friendlyMessage || 'Could not update account status.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-amber-700">
            <ShieldAlert className="h-6 w-6" />
            <h1 className="text-2xl font-extrabold text-slate-900">Safety & Moderation</h1>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Review community-flagged updates, remove harmful content, and manage account access.
          </p>
        </div>

        <select
          aria-label="Filter reports by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-full sm:w-48"
        >
          <option value="pending">Pending Review</option>
          <option value="reviewed_removed">Removed Posts</option>
          <option value="dismissed">Dismissed Reports</option>
          <option value="all">All Reports</option>
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Pending Reports</p>
            <p className="text-2xl font-extrabold text-slate-900">{stats.pendingReports}</p>
          </div>
        </div>

        <div className="card flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-njia-50 text-njia-700">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Active Route Updates</p>
            <p className="text-2xl font-extrabold text-slate-900">{stats.activePosts}</p>
          </div>
        </div>

        <div className="card flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Registered Commuters</p>
            <p className="text-2xl font-extrabold text-slate-900">{stats.totalUsers}</p>
          </div>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <LoadingSpinner label="Loading reported content..." />
      ) : error ? (
        <div className="card border-rose-200 bg-rose-50 p-6 text-center text-sm font-semibold text-rose-800">
          {error}
        </div>
      ) : reports.length === 0 ? (
        <div className="card p-10 text-center">
          <CheckCircle className="mx-auto h-10 w-10 text-emerald-600" />
          <h2 className="mt-3 text-base font-bold text-slate-900">Queue is clear</h2>
          <p className="mt-1 text-sm text-slate-600">
            No reports found under the selected filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const postAuthor = report.post?.author;
            return (
              <div key={report._id} className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">
                      {report.reason}
                    </span>
                    <span className="text-xs text-slate-500">
                      Reported by <strong>@{report.reportedBy?.username || 'user'}</strong> •{' '}
                      {formatTimeAgo(report.createdAt)}
                    </span>
                  </div>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase text-slate-700">
                    {report.status.replace('_', ' ')}
                  </span>
                </div>

                {report.details && (
                  <p className="mt-3 text-xs italic text-slate-600">
                    Reporter note: “{report.details}”
                  </p>
                )}

                {report.post ? (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                      <span>
                        Author: <strong>{postAuthor?.fullName}</strong> (@{postAuthor?.username})
                        {postAuthor?.isSuspended && (
                          <span className="ml-2 rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            SUSPENDED
                          </span>
                        )}
                      </span>
                      <span>
                        {report.post.route} • KSh {report.post.fareKsh} •{' '}
                        {report.post.trafficStatus}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-800">{report.post.description}</p>
                  </div>
                ) : (
                  <p className="mt-3 text-xs italic text-slate-400">
                    Original post has already been deleted.
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  {postAuthor && postAuthor.role !== 'admin' ? (
                    <button
                      type="button"
                      onClick={() => handleToggleSuspend(postAuthor)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {postAuthor.isSuspended ? (
                        <>
                          <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                          Reinstate @{postAuthor.username}
                        </>
                      ) : (
                        <>
                          <UserX className="h-3.5 w-3.5 text-rose-600" />
                          Suspend @{postAuthor.username}
                        </>
                      )}
                    </button>
                  ) : (
                    <span />
                  )}

                  {report.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleResolveReport(report._id, 'dismiss')}
                        className="btn-secondary py-1.5 text-xs"
                      >
                        Dismiss Report
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResolveReport(report._id, 'remove_post')}
                        className="btn-danger py-1.5 text-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove Post
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

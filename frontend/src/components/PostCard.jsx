import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ThumbsUp,
  MessageSquare,
  MapPin,
  Clock,
  AlertTriangle,
  Pencil,
  Trash2,
  Flag,
  Banknote,
} from 'lucide-react';
import Avatar from './Avatar';
import TrafficBadge from './TrafficBadge';
import ReportModal from './ReportModal';
import { formatTimeAgo, formatFullDateTime, getFreshnessStatus } from '../utils/dateHelpers';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function PostCard({ post, onDeleted, onUpdated, showFullDate = false }) {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [helpfulVotes, setHelpfulVotes] = useState(post.helpfulVotes || []);
  const [voting, setVoting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const author = post.author || {};
  const isOwner = user && author._id === user._id;
  const canDelete = isOwner || isAdmin;
  const hasVoted = user && helpfulVotes.some((id) => id === user._id || id?._id === user._id);

  const displayRoute =
    post.route === 'Other' && post.customRouteName
      ? `${post.customRouteName} (Other)`
      : post.route;

  const freshness = getFreshnessStatus(post.createdAt);

  const handleToggleHelpful = async () => {
    if (!isAuthenticated) {
      showToast('Please log in to mark updates as helpful.', 'info');
      return;
    }
    if (voting) return;

    setVoting(true);
    try {
      const { data } = await api.post(`/posts/${post._id}/helpful`);
      setHelpfulVotes(data.helpfulVotes);
      if (onUpdated) {
        onUpdated({ ...post, helpfulVotes: data.helpfulVotes });
      }
    } catch (err) {
      showToast(err.friendlyMessage || 'Could not record vote.', 'error');
    } finally {
      setVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this route update permanently?')) return;
    setDeleting(true);
    try {
      await api.delete(`/posts/${post._id}`);
      showToast('Route update deleted.');
      if (onDeleted) onDeleted(post._id);
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to delete update.', 'error');
      setDeleting(false);
    }
  };

  return (
    <>
      <article className="card p-5 transition hover:border-slate-300">
        {/* Top author + route meta */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to={author._id ? `/users/${author._id}` : '#'}>
              <Avatar name={author.fullName || 'Commuter'} src={author.avatarUrl} size="md" />
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={author._id ? `/users/${author._id}` : '#'}
                  className="text-sm font-bold text-slate-900 hover:text-njia-700"
                >
                  {author.fullName || 'Commuter'}
                </Link>
                {author.username && (
                  <span className="text-xs text-slate-500">@{author.username}</span>
                )}
                {author.role === 'admin' && (
                  <span className="rounded-md bg-njia-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-njia-800">
                    Moderator
                  </span>
                )}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span
                  title={formatFullDateTime(post.createdAt)}
                  className="inline-flex items-center gap-1"
                >
                  <Clock className="h-3.5 w-3.5" />
                  {showFullDate ? formatFullDateTime(post.createdAt) : formatTimeAgo(post.createdAt)}
                </span>
                <span>•</span>
                <span className="italic text-slate-400">Community-submitted</span>
              </div>
            </div>
          </div>

          <TrafficBadge status={post.trafficStatus} />
        </div>

        {/* Route & Fare Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
            <MapPin className="h-3.5 w-3.5 text-njia-700" />
            {displayRoute}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900 ring-1 ring-inset ring-amber-200/80">
            <Banknote className="h-3.5 w-3.5 text-amber-600" />
            Fare: KSh {post.fareKsh}
          </span>
        </div>

        {/* Stale / Age Warning Banner */}
        {freshness.isStale && (
          <div
            className={`mt-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium ${
              freshness.severity === 'old'
                ? 'border-amber-300 bg-amber-50/90 text-amber-900'
                : 'border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>{freshness.label}</span>
          </div>
        )}

        {/* Commuter Update Body */}
        <Link to={`/posts/${post._id}`} className="mt-3.5 block group">
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-800 group-hover:text-slate-950">
            {post.description}
          </p>
        </Link>

        {/* Action Footer */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleHelpful}
              disabled={voting}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                hasVoted
                  ? 'bg-njia-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-njia-50 hover:text-njia-800'
              }`}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>Helpful ({helpfulVotes.length})</span>
            </button>

            <Link
              to={`/posts/${post._id}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200/70"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>
                {post.commentCount || 0} {post.commentCount === 1 ? 'Comment' : 'Comments'}
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-1.5">
            {isOwner && (
              <Link
                to={`/posts/${post._id}/edit`}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                title="Edit update"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Edit</span>
              </Link>
            )}

            {canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                title="Delete update"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{deleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            )}

            {isAuthenticated && !isOwner && (
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-rose-600"
                title="Report inaccurate or unsafe content"
              >
                <Flag className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Report</span>
              </button>
            )}
          </div>
        </div>
      </article>

      {showReportModal && (
        <ReportModal postId={post._id} onClose={() => setShowReportModal(false)} />
      )}
    </>
  );
}

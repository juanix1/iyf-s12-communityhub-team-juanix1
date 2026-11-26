import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, Trash2, Reply, MessageSquare } from 'lucide-react';
import api from '../services/api';
import PostCard from '../components/PostCard';
import Avatar from '../components/Avatar';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatTimeAgo } from '../utils/dateHelpers';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  const loadPostAndComments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [postRes, commentsRes] = await Promise.all([
        api.get(`/posts/${id}`),
        api.get(`/posts/${id}/comments`),
      ]);
      setPost(postRes.data.post);
      setComments(commentsRes.data.comments || []);
    } catch (err) {
      setError(err.friendlyMessage || 'Could not load this route update.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPostAndComments();
  }, [loadPostAndComments]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      const { data } = await api.post(`/posts/${id}/comments`, {
        content: commentText.trim(),
        parentComment: replyingTo?._id || null,
      });
      setComments((prev) => [...prev, data.comment]);
      setPost((prev) => (prev ? { ...prev, commentCount: data.commentCount } : prev));
      setCommentText('');
      setReplyingTo(null);
      showToast('Comment posted.');
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to post comment.', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      const { data } = await api.delete(`/comments/${commentId}`);
      setComments((prev) =>
        prev.filter((c) => c._id !== commentId && c.parentComment !== commentId)
      );
      setPost((prev) => (prev ? { ...prev, commentCount: data.commentCount } : prev));
      showToast('Comment removed.');
    } catch (err) {
      showToast(err.friendlyMessage || 'Could not delete comment.', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading route update and discussion..." />;
  }

  if (error || !post) {
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <p className="text-base font-bold text-rose-700">{error || 'Post not found.'}</p>
        <Link to="/feed" className="btn-secondary mt-4">
          Back to Feed
        </Link>
      </div>
    );
  }

  // Group top-level comments and replies
  const topLevelComments = comments.filter((c) => !c.parentComment);
  const repliesByParent = comments.reduce((acc, c) => {
    if (c.parentComment) {
      acc[c.parentComment] = acc[c.parentComment] || [];
      acc[c.parentComment].push(c);
    }
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to="/feed"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-njia-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Community Feed
      </Link>

      <PostCard
        post={post}
        showFullDate
        onUpdated={(updated) => setPost(updated)}
        onDeleted={() => navigate('/feed')}
      />

      {/* Discussion Section */}
      <section className="card p-5 sm:p-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <MessageSquare className="h-5 w-5 text-njia-700" />
          <h2 className="text-base font-bold text-slate-900">
            Commuter Discussion ({comments.length})
          </h2>
        </div>

        {/* Add Comment Form */}
        {isAuthenticated ? (
          <form onSubmit={handleAddComment} className="mt-4 space-y-3">
            {replyingTo && (
              <div className="flex items-center justify-between rounded-xl bg-njia-50 px-3.5 py-2 text-xs text-njia-900">
                <span>
                  Replying to <strong>{replyingTo.author?.fullName}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="font-bold text-njia-700 hover:underline"
                >
                  Cancel reply
                </button>
              </div>
            )}

            <div className="flex gap-3">
              <Avatar name={user?.fullName} src={user?.avatarUrl} size="sm" />
              <div className="flex-1 space-y-2.5">
                <textarea
                  rows={2}
                  maxLength={500}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Ask about stage queues, alternative routes, or confirm current fare..."
                  className="input-field"
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingComment || !commentText.trim()}
                    className="btn-primary py-2 text-xs"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {submittingComment ? 'Posting...' : replyingTo ? 'Post Reply' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-600">
            <Link to="/login" className="font-bold text-njia-700 hover:underline">
              Log in
            </Link>{' '}
            or{' '}
            <Link to="/register" className="font-bold text-njia-700 hover:underline">
              create an account
            </Link>{' '}
            to ask questions or reply to fellow commuters.
          </div>
        )}

        {/* Comments List */}
        <div className="mt-6 space-y-4">
          {topLevelComments.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              No comments yet. Start the conversation below!
            </p>
          ) : (
            topLevelComments.map((comment) => {
              const canDeleteComment =
                user && (comment.author?._id === user._id || isAdmin);
              const replies = repliesByParent[comment._id] || [];

              return (
                <div key={comment._id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        name={comment.author?.fullName || 'Commuter'}
                        src={comment.author?.avatarUrl}
                        size="sm"
                      />
                      <div>
                        <Link
                          to={comment.author?._id ? `/users/${comment.author._id}` : '#'}
                          className="text-xs font-bold text-slate-900 hover:text-njia-700"
                        >
                          {comment.author?.fullName || 'Commuter'}
                        </Link>
                        <span className="ml-2 text-xs text-slate-400">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isAuthenticated && (
                        <button
                          type="button"
                          onClick={() => setReplyingTo(comment)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-njia-700"
                        >
                          <Reply className="h-3.5 w-3.5" />
                          Reply
                        </button>
                      )}
                      {canDeleteComment && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comment._id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline"
                          title="Delete comment"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="mt-2.5 pl-10 text-sm leading-relaxed text-slate-800">
                    {comment.content}
                  </p>

                  {/* Nested Replies */}
                  {replies.length > 0 && (
                    <div className="mt-3 space-y-2.5 border-l-2 border-njia-200 pl-4 ml-6">
                      {replies.map((reply) => {
                        const canDeleteReply =
                          user && (reply.author?._id === user._id || isAdmin);
                        return (
                          <div key={reply._id} className="rounded-lg bg-white p-3 shadow-2xs">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Avatar
                                  name={reply.author?.fullName || 'Commuter'}
                                  src={reply.author?.avatarUrl}
                                  size="sm"
                                />
                                <span className="text-xs font-bold text-slate-900">
                                  {reply.author?.fullName}
                                </span>
                                <span className="text-xs text-slate-400">
                                  {formatTimeAgo(reply.createdAt)}
                                </span>
                              </div>
                              {canDeleteReply && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteComment(reply._id)}
                                  className="text-rose-600 hover:text-rose-800"
                                  title="Delete reply"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                            <p className="mt-1.5 pl-10 text-xs leading-relaxed text-slate-700 sm:text-sm">
                              {reply.content}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

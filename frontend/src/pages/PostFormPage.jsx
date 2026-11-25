import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, AlertCircle, Info } from 'lucide-react';
import api from '../services/api';
import { SUGGESTED_ROUTES, TRAFFIC_STATUSES } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function PostFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [route, setRoute] = useState(user?.mainRoute || 'Thika Road');
  const [customRouteName, setCustomRouteName] = useState('');
  const [fareKsh, setFareKsh] = useState('');
  const [trafficStatus, setTrafficStatus] = useState('Slow');
  const [description, setDescription] = useState('');

  const [loadingPost, setLoadingPost] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEditMode) return;
    let active = true;

    const loadPost = async () => {
      try {
        const { data } = await api.get(`/posts/${id}`);
        if (!active) return;
        const p = data.post;
        if (p.author?._id !== user?._id) {
          showToast('You can only edit your own updates.', 'error');
          navigate('/feed');
          return;
        }
        setRoute(p.route);
        setCustomRouteName(p.customRouteName || '');
        setFareKsh(String(p.fareKsh));
        setTrafficStatus(p.trafficStatus);
        setDescription(p.description);
      } catch (err) {
        if (active) setError(err.friendlyMessage || 'Could not load route update.');
      } finally {
        if (active) setLoadingPost(false);
      }
    };

    loadPost();
    return () => {
      active = false;
    };
  }, [id, isEditMode, user, navigate, showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (route === 'Other' && !customRouteName.trim()) {
      setError('Please enter the name of your route when "Other" is selected.');
      return;
    }

    if (fareKsh === '' || Number(fareKsh) < 0) {
      setError('Please enter a valid matatu/bus fare in KSh.');
      return;
    }

    if (description.trim().length < 10) {
      setError('Please write at least 10 characters with helpful stage or traffic details.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        route,
        customRouteName: route === 'Other' ? customRouteName.trim() : '',
        fareKsh: Number(fareKsh),
        trafficStatus,
        description: description.trim(),
      };

      if (isEditMode) {
        await api.put(`/posts/${id}`, payload);
        showToast('Your route update has been edited.');
        navigate(`/posts/${id}`);
      } else {
        const { data } = await api.post('/posts', payload);
        showToast('Route update published to the community feed!');
        navigate(`/posts/${data.post._id}`);
      }
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to save your update.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPost) {
    return <LoadingSpinner label="Loading update for editing..." />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to="/feed"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-njia-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Community Feed
      </Link>

      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold text-slate-900">
          {isEditMode ? 'Edit Route Update' : 'Share a Commuter Update'}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Help fellow travellers with current matatu fares, traffic bottlenecks, and stage queues.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm font-medium text-rose-800">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Route Selection */}
          <div>
            <label htmlFor="route" className="mb-1.5 block text-sm font-semibold text-slate-800">
              Corridor / Route *
            </label>
            <select
              id="route"
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              className="input-field"
              required
            >
              {SUGGESTED_ROUTES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {route === 'Other' && (
            <div>
              <label
                htmlFor="customRouteName"
                className="mb-1.5 block text-sm font-semibold text-slate-800"
              >
                Specify Route Name *
              </label>
              <input
                id="customRouteName"
                type="text"
                maxLength={80}
                value={customRouteName}
                onChange={(e) => setCustomRouteName(e.target.value)}
                placeholder="e.g. Lang'ata Road, Outering Road, Limuru Road"
                className="input-field"
                required
              />
            </div>
          )}

          {/* Fare Input */}
          <div>
            <label htmlFor="fareKsh" className="mb-1.5 block text-sm font-semibold text-slate-800">
              Current Fare (KSh) *
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-2.5 text-sm font-bold text-slate-500">
                KSh
              </span>
              <input
                id="fareKsh"
                type="number"
                min="0"
                max="10000"
                step="5"
                value={fareKsh}
                onChange={(e) => setFareKsh(e.target.value)}
                placeholder="100"
                className="input-field pl-12"
                required
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Enter 0 if reporting road traffic only without a matatu fare.
            </p>
          </div>

          {/* Traffic Status Radio Cards */}
          <div>
            <span className="mb-2 block text-sm font-semibold text-slate-800">
              Traffic Condition *
            </span>
            <div className="grid gap-3 sm:grid-cols-3">
              {TRAFFIC_STATUSES.map((status) => {
                const selected = trafficStatus === status.value;
                return (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() => setTrafficStatus(status.value)}
                    className={`rounded-xl border p-3.5 text-left transition ${
                      selected
                        ? 'border-njia-700 bg-njia-50/70 ring-2 ring-njia-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${status.dotClass}`} />
                      <span className="text-sm font-bold text-slate-900">{status.label}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">{status.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="description" className="text-sm font-semibold text-slate-800">
                What is happening on the road? *
              </label>
              <span className="text-xs text-slate-400">{description.length}/1000</span>
            </div>
            <textarea
              id="description"
              rows={4}
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Example: Traffic is moving slowly around Roysambu. Current fare is KSh 100. Matatus are available, but queues are increasing."
              className="input-field"
              required
            />
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-njia-700" />
            <span>
              Your post will be timestamped and displayed as a community-submitted update so other
              commuters know when you observed these conditions.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link to="/feed" className="btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={submitting} className="btn-primary">
              <Send className="h-4 w-4" />
              {submitting
                ? isEditMode
                  ? 'Saving Changes...'
                  : 'Publishing...'
                : isEditMode
                ? 'Save Changes'
                : 'Publish Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

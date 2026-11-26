import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, FileText, Pencil, Save, X, Mail } from 'lucide-react';
import api from '../services/api';
import Avatar from '../components/Avatar';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { SUGGESTED_ROUTES } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser, updateUserState } = useAuth();
  const { showToast } = useToast();

  const targetUserId = id || currentUser?._id;
  const isOwnProfile = Boolean(currentUser && targetUserId === currentUser._id);

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    avatarUrl: '',
    mainRoute: 'Thika Road',
    bio: '',
  });

  const fetchProfileData = useCallback(async () => {
    if (!targetUserId) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/users/${targetUserId}`);
      setProfile(data.user);
      setPosts(data.posts || []);
      setEditForm({
        fullName: data.user.fullName || '',
        avatarUrl: data.user.avatarUrl || '',
        mainRoute: data.user.mainRoute || 'Thika Road',
        bio: data.user.bio || '',
      });
    } catch (err) {
      setError(err.friendlyMessage || 'Could not load commuter profile.');
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/users/me', editForm);
      setProfile((prev) => ({ ...prev, ...data.user }));
      updateUserState(data.user);
      setEditing(false);
      showToast('Profile updated successfully.');
    } catch (err) {
      showToast(err.friendlyMessage || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading commuter profile..." />;
  }

  if (error || !profile) {
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <p className="font-bold text-rose-700">{error || 'Profile not found.'}</p>
        <Link to="/feed" className="btn-secondary mt-4">
          Back to Feed
        </Link>
      </div>
    );
  }

  const joinedDate = new Date(profile.createdAt).toLocaleDateString('en-KE', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Profile Header Card */}
      <section className="card overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-njia-900 via-njia-700 to-emerald-600" />
        <div className="px-6 pb-6">
          <div className="-mt-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="flex items-end gap-4">
              <div className="rounded-full bg-white p-1 shadow-md">
                <Avatar name={profile.fullName} src={profile.avatarUrl} size="lg" />
              </div>
              <div className="pb-1">
                <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                  {profile.fullName}
                </h1>
                <p className="text-sm font-medium text-slate-500">@{profile.username}</p>
              </div>
            </div>

            {isOwnProfile && !editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="btn-secondary self-start sm:self-auto"
              >
                <Pencil className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>

          {!editing ? (
            <div className="mt-5 space-y-4">
              {profile.bio && (
                <p className="max-w-2xl text-sm leading-relaxed text-slate-700">{profile.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-njia-50 px-3 py-1.5 font-semibold text-njia-800">
                  <MapPin className="h-3.5 w-3.5" />
                  Main Route: {profile.mainRoute}
                </span>

                {isOwnProfile && currentUser?.email && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {currentUser.email}
                  </span>
                )}

                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Joined {joinedDate}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  {posts.length} {posts.length === 1 ? 'Update' : 'Updates'} shared
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="mt-6 space-y-4 border-t border-slate-100 pt-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="edit-fullName" className="mb-1 block text-xs font-bold text-slate-700">
                    Full Name
                  </label>
                  <input
                    id="edit-fullName"
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm((p) => ({ ...p, fullName: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-mainRoute" className="mb-1 block text-xs font-bold text-slate-700">
                    Main Commuting Route
                  </label>
                  <select
                    id="edit-mainRoute"
                    value={editForm.mainRoute}
                    onChange={(e) => setEditForm((p) => ({ ...p, mainRoute: e.target.value }))}
                    className="input-field"
                  >
                    {SUGGESTED_ROUTES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="edit-avatarUrl" className="mb-1 block text-xs font-bold text-slate-700">
                  Profile Picture URL (optional)
                </label>
                <input
                  id="edit-avatarUrl"
                  type="url"
                  value={editForm.avatarUrl}
                  onChange={(e) => setEditForm((p) => ({ ...p, avatarUrl: e.target.value }))}
                  placeholder="https://example.com/photo.jpg (leave blank for initials avatar)"
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="edit-bio" className="mb-1 block text-xs font-bold text-slate-700">
                  Short Biography
                </label>
                <textarea
                  id="edit-bio"
                  rows={3}
                  maxLength={280}
                  value={editForm.bio}
                  onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))}
                  className="input-field"
                />
              </div>

              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="btn-secondary py-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary py-2">
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* User's Route Update History */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {isOwnProfile ? 'My Route Update History' : `Updates by ${profile.fullName}`}
          </h2>
          {isOwnProfile && (
            <Link to="/share" className="btn-primary py-2 text-xs">
              + Share New Update
            </Link>
          )}
        </div>

        {posts.length === 0 ? (
          <EmptyState
            title="No route updates yet"
            description={
              isOwnProfile
                ? 'You have not shared any traffic or fare reports yet.'
                : 'This commuter has not published any route updates yet.'
            }
            action={
              isOwnProfile ? (
                <Link to="/share" className="btn-primary">
                  Share Your First Update
                </Link>
              ) : null
            }
          />
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDeleted={(deletedId) =>
                  setPosts((prev) => prev.filter((item) => item._id !== deletedId))
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

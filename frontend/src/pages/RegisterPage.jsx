import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SUGGESTED_ROUTES } from '../utils/constants';
import Logo from '../components/Logo';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    mainRoute: 'Thika Road',
    bio: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      await register(formData);
      showToast('Account created! Welcome to Njia CommunityHub.');
      navigate('/feed');
    } catch (err) {
      setError(err.friendlyMessage || 'Registration failed. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg py-4">
      <div className="card p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <Logo />
          <h1 className="mt-5 text-2xl font-extrabold text-slate-900">Join Njia CommunityHub</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create your free commuter profile to share updates and ask route questions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Full Name *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Wanjiku Kamau"
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Username *
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="e.g. wanjiku_k"
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="input-field"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="mainRoute" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Main Commuting Route
              </label>
              <select
                id="mainRoute"
                name="mainRoute"
                value={formData.mainRoute}
                onChange={handleChange}
                className="input-field"
              >
                {SUGGESTED_ROUTES.map((route) => (
                  <option key={route} value={route}>
                    {route}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Short Commuter Bio (optional)
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={2}
              maxLength={280}
              value={formData.bio}
              onChange={handleChange}
              placeholder="e.g. Daily commuter between Ruiru and CBD."
              className="input-field"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
            <UserPlus className="h-4 w-4" />
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-njia-700 hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}

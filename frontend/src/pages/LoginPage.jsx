import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Logo from '../components/Logo';

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from?.pathname || '/feed';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login({ emailOrUsername, password });
      showToast('Welcome back to Njia CommunityHub!');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.friendlyMessage || 'Invalid credentials. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-4">
      <div className="card p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <Logo />
          <h1 className="mt-5 text-2xl font-extrabold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-600">
            Log in to share route updates and connect with commuters.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="emailOrUsername"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
              Email or Username
            </label>
            <input
              id="emailOrUsername"
              type="text"
              autoComplete="username"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              placeholder="e.g. brian@example.com or brian_thika"
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="input-field"
              required
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
            <LogIn className="h-4 w-4" />
            {submitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          New to Njia CommunityHub?{' '}
          <Link to="/register" className="font-bold text-njia-700 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

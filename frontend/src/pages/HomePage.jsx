import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Banknote,
  Clock,
  Users,
  ShieldCheck,
  MapPin,
  PlusCircle,
} from 'lucide-react';
import api from '../services/api';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { SUGGESTED_ROUTES } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let active = true;
    const fetchHighlights = async () => {
      try {
        const { data } = await api.get('/posts?limit=3');
        if (active) setRecentPosts(data.posts || []);
      } catch {
        // Silent fail on home highlights; full feed handles errors explicitly
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchHighlights();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-njia-900 via-njia-800 to-slate-900 px-6 py-12 text-white shadow-xl sm:px-12 sm:py-16">
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-amber-300 ring-1 ring-white/20">
            <MapPin className="h-3.5 w-3.5" />
            Crowdsourced Nairobi & Kenyan Commuter Network
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl">
            Know the fare, traffic, and stage queue{' '}
            <span className="text-amber-400">before you step out.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-emerald-50/90 sm:text-lg">
            Njia CommunityHub connects everyday commuters travelling along Thika Road, Mombasa
            Road, Ngong Road, Waiyaki Way, and beyond to share honest updates on matatu fares,
            bottlenecks, and stage availability.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <Link
              to="/feed"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-md transition hover:bg-amber-300"
            >
              Browse Community Feed
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={isAuthenticated ? '/share' : '/register'}
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-xs transition hover:bg-white/20"
            >
              <PlusCircle className="h-4 w-4" />
              {isAuthenticated ? 'Share Route Update' : 'Create Free Account'}
            </Link>
          </div>
        </div>

        {/* Decorative subtle grid */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-16 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl" />
      </section>

      {/* Popular Routes Quick Filter */}
      <section>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Popular Commuter Corridors</h2>
            <p className="text-sm text-slate-600">
              Jump straight into recent reports for your daily route.
            </p>
          </div>
          <Link to="/feed" className="text-sm font-semibold text-njia-700 hover:underline">
            View all routes →
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SUGGESTED_ROUTES.filter((r) => r !== 'Other').map((route) => (
            <Link
              key={route}
              to={`/feed?route=${encodeURIComponent(route)}`}
              className="card group flex items-center justify-between p-4 transition hover:border-njia-500 hover:bg-njia-50/40"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-njia-50 text-njia-700 group-hover:bg-njia-700 group-hover:text-white">
                  <MapPin className="h-4 w-4" />
                </span>
                <span className="text-sm font-bold text-slate-800">{route}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-njia-700" />
            </Link>
          ))}
        </div>
      </section>

      {/* Value Props */}
      <section className="grid gap-5 md:grid-cols-3">
        <div className="card p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Banknote className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">Transparent Matatu Fares</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
            Avoid peak-hour fare surprises. See what fellow passengers just paid in KSh along
            your stage before boarding.
          </p>
        </div>

        <div className="card p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-njia-50 text-njia-700">
            <Clock className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">Honest Timestamp Clarity</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
            Every update displays when it was posted and flags older reports clearly—no misleading
            “live” claims on crowdsourced notes.
          </p>
        </div>

        <div className="card p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">Peer Q&A & Safety Reporting</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
            Ask commuters on the road about alternative service lanes, stage queues, or SGR
            connections, backed by community moderation.
          </p>
        </div>
      </section>

      {/* Latest Community Updates Preview */}
      <section>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Latest Commuter Updates</h2>
            <p className="text-sm text-slate-600">
              Recent unverified reports shared by fellow travellers.
            </p>
          </div>
          <Link to="/feed" className="btn-secondary py-2">
            Open Full Feed
          </Link>
        </div>

        <div className="mt-5">
          {loading ? (
            <LoadingSpinner />
          ) : recentPosts.length > 0 ? (
            <div className="grid gap-4">
              {recentPosts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onDeleted={(id) => setRecentPosts((prev) => prev.filter((p) => p._id !== id))}
                />
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center text-sm text-slate-600">
              No updates posted yet.{' '}
              <Link to="/share" className="font-semibold text-njia-700 underline">
                Share the first route report!
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Trust Note */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <ShieldCheck className="h-6 w-6 shrink-0 text-njia-700" />
          <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
            <strong className="text-slate-900">Community-Driven Information:</strong> Updates on
            Njia CommunityHub are contributed by commuters like you and are not verified by
            transport authorities. Always check the timestamp and confirm fares directly with the
            conductor.
          </p>
        </div>
      </section>
    </div>
  );
}

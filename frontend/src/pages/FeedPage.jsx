import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, Search, PlusCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { SUGGESTED_ROUTES, TRAFFIC_STATUSES } from '../utils/constants';

export default function FeedPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [routeFilter, setRouteFilter] = useState(searchParams.get('route') || 'All');
  const [trafficFilter, setTrafficFilter] = useState(searchParams.get('trafficStatus') || 'All');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [activeSearch, setActiveSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 8 };
      if (routeFilter !== 'All') params.route = routeFilter;
      if (trafficFilter !== 'All') params.trafficStatus = trafficFilter;
      if (activeSearch.trim()) params.search = activeSearch.trim();

      const { data } = await api.get('/posts', { params });
      setPosts(data.posts || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to load community updates.');
    } finally {
      setLoading(false);
    }
  }, [page, routeFilter, trafficFilter, activeSearch]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    const nextParams = {};
    if (routeFilter !== 'All') nextParams.route = routeFilter;
    if (trafficFilter !== 'All') nextParams.trafficStatus = trafficFilter;
    if (activeSearch.trim()) nextParams.search = activeSearch.trim();
    if (page > 1) nextParams.page = String(page);
    setSearchParams(nextParams, { replace: true });
  }, [routeFilter, trafficFilter, activeSearch, page, setSearchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchInput);
  };

  const handleResetFilters = () => {
    setRouteFilter('All');
    setTrafficFilter('All');
    setSearchInput('');
    setActiveSearch('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Community Route Feed
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Sorted by newest • User-submitted commuter reports (unverified)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchPosts}
            className="btn-secondary py-2"
            title="Refresh feed"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link to="/share" className="btn-primary py-2">
            <PlusCircle className="h-4 w-4" />
            Share Update
          </Link>
        </div>
      </div>

      {/* Filters Card */}
      <div className="card p-4 sm:p-5">
        <div className="grid gap-4 md:grid-cols-12">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="md:col-span-5">
            <label htmlFor="feed-search" className="mb-1 block text-xs font-semibold text-slate-600">
              Search stage, landmark, or keyword
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  id="feed-search"
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="e.g. Roysambu, Express, Super Metro..."
                  className="input-field pl-9"
                />
              </div>
              <button type="submit" className="btn-secondary px-3.5">
                Search
              </button>
            </div>
          </form>

          {/* Route Filter */}
          <div className="md:col-span-4">
            <label htmlFor="route-filter" className="mb-1 block text-xs font-semibold text-slate-600">
              Filter by Corridor / Route
            </label>
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <select
                id="route-filter"
                value={routeFilter}
                onChange={(e) => {
                  setRouteFilter(e.target.value);
                  setPage(1);
                }}
                className="input-field pl-9"
              >
                <option value="All">All Routes</option>
                {SUGGESTED_ROUTES.map((route) => (
                  <option key={route} value={route}>
                    {route}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Traffic Filter */}
          <div className="md:col-span-3">
            <label
              htmlFor="traffic-filter"
              className="mb-1 block text-xs font-semibold text-slate-600"
            >
              Traffic Condition
            </label>
            <select
              id="traffic-filter"
              value={trafficFilter}
              onChange={(e) => {
                setTrafficFilter(e.target.value);
                setPage(1);
              }}
              className="input-field"
            >
              <option value="All">All Conditions</option>
              {TRAFFIC_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(routeFilter !== 'All' || trafficFilter !== 'All' || activeSearch) && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
            <span className="text-slate-600">
              Showing <strong>{pagination.total}</strong> matching{' '}
              {pagination.total === 1 ? 'update' : 'updates'}
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="font-semibold text-njia-700 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Feed Content */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="card border-rose-200 bg-rose-50 p-6 text-center">
          <p className="text-sm font-semibold text-rose-800">{error}</p>
          <button type="button" onClick={fetchPosts} className="btn-secondary mt-3">
            Try Again
          </button>
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          title="No commuter updates match your filters"
          description="Try clearing your search filters or share a fresh update if you are currently on this route."
          action={
            <div className="flex flex-wrap justify-center gap-2.5">
              {(routeFilter !== 'All' || trafficFilter !== 'All' || activeSearch) && (
                <button type="button" onClick={handleResetFilters} className="btn-secondary">
                  Reset Filters
                </button>
              )}
              <Link to="/share" className="btn-primary">
                <PlusCircle className="h-4 w-4" />
                Share Route Update
              </Link>
            </div>
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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn-secondary py-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <span className="text-xs font-semibold text-slate-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="btn-secondary py-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

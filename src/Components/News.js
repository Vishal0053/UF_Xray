import React, { useEffect, useState } from "react";
import { api } from "../utils/api";

const FALLBACK_IMG = 'https://source.unsplash.com/featured/800x450?cyber,security,hacking,news';

export default function News() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(24);

  const fetchNews = async (lim = limit) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/api/news?limit=${lim}`);
      setItems(data?.items || []);
    } catch (e) {
      setError(e.message || 'Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-black py-12 px-4 isolate text-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-black dark:text-white drop-shadow-md">Security News</h1>
            <p className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Latest headlines from cybersecurity and threat intelligence.</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value, 10))}
              className="border border-gray-300 rounded px-2 py-1 text-sm bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            >
              {[12, 24, 36, 48].map(n => (
                <option key={n} value={n}>{n} items</option>
              ))}
            </select>
            <button
              onClick={() => fetchNews(limit)}
              className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(loading && items.length === 0 ? Array.from({ length: 12 }) : items).map((it, i) => (
            <article key={i} className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow hover:shadow-lg transition dark:bg-black dark:border-black dark:shadow-none text-black dark:text-white opacity-100 mix-blend-normal">
              <div className="aspect-video w-full bg-gray-100 dark:bg-black overflow-hidden -mb-px rounded-t-2xl">
                {it ? (
                  <img
                    src={it.imageUrl || FALLBACK_IMG}
                    alt={it.title || 'news image'}
                    className="block w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                    onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-white dark:from-black dark:to-black" />
                )}
              </div>
              <div className="p-5 bg-white text-black dark:bg-black dark:text-white rounded-b-2xl">
                <h3 className="text-lg font-bold group-hover:text-brand transition">
                  {it ? (it.title || '(no title)') : 'Loading…'}
                </h3>
                <p className="mt-2 text-[0.95rem] text-gray-900 dark:text-gray-200 line-clamp-3">
                  {it ? (it.summary || '') : 'Fetching latest security headlines…'}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-300">
                    {it ? `${it.source || ''} ${it.publishedAt ? '· ' + new Date(it.publishedAt).toLocaleString() : ''}` : ''}
                  </span>
                  {it?.link ? (
                    <a href={it.link} target="_blank" rel="noreferrer" className="text-sm text-brand hover:text-brand-dark">Read more</a>
                  ) : (
                    <span className="text-sm text-gray-400">…</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

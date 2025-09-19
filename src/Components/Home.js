import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import '../App.css';

export default function Container1() {
    const [news, setNews] = useState([]);
    const [newsLoading, setNewsLoading] = useState(false);
    const [newsError, setNewsError] = useState(null);

    const fetchNews = async () => {
        setNewsLoading(true);
        setNewsError(null);
        try {
            const { data } = await api.get(`/api/news?limit=9`);
            setNews(data?.items || []);
        } catch (e) {
            setNewsError(e.message || 'Failed to load news');
        } finally {
            setNewsLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    return (
        <>
            <section className="relative overflow-hidden z-0">
                <img alt="A computer setup with multiple screens displaying code and data visualizations, with a colorful keyboard and other tech gadgets"
                    className="w-full h-[520px] object-cover"
                    src="https://static.sitemantic.com/webbuilder/templates/images/information-technology/information-technology-1170-570-1.jpg"
                    />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent dark:from-black/80 dark:via-black/60 z-0 pointer-events-none" />
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-xl">
                        Securing digital future by empowering security
                    </h1>
                    <p className="text-lg sm:text-2xl mt-4 text-white/90 drop-shadow md:max-w-2xl">
                        Detect. Protect. Defend.
                    </p>
                    {/* Scan tiles */}
                    <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
                      <Link to="/AnalyzeURL" className="group flex items-center gap-3 rounded-xl bg-white/90 dark:bg-white/10 backdrop-blur px-5 py-4 hover:bg-white dark:hover:bg-white/20 border border-white/40 dark:border-white/10 transition">
                        <span className="text-2xl">🔗</span>
                        <div className="text-left">
                          <div className="font-semibold text-gray-900 dark:text-white">Analyze URL</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Liveness, patterns, risk</div>
                        </div>
                      </Link>
                      <Link to="/AnalyzeFile" className="group flex items-center gap-3 rounded-xl bg-white/90 dark:bg-white/10 backdrop-blur px-5 py-4 hover:bg-white dark:hover:bg-white/20 border border-white/40 dark:border-white/10 transition">
                        <span className="text-2xl">🗂️</span>
                        <div className="text-left">
                          <div className="font-semibold text-gray-900 dark:text-white">Analyze File</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">YARA, AV, PE insights</div>
                        </div>
                      </Link>
                      <Link to="/AnalyzeLog" className="group flex items-center gap-3 rounded-xl bg-white/90 dark:bg-white/10 backdrop-blur px-5 py-4 hover:bg-white dark:hover:bg-white/20 border border-white/40 dark:border-white/10 transition">
                        <span className="text-2xl">📝</span>
                        <div className="text-left">
                          <div className="font-semibold text-gray-900 dark:text-white">Analyze Logs</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Errors, anomalies, risk</div>
                        </div>
                      </Link>
                    </div>
                </div>
            </section>
            <section id="news" className="news-section relative z-50 max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black rounded-2xl opacity-100 isolate">
                <div className="mb-8 flex items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-black dark:text-white drop-shadow-md">Security News</h2>
                        <p className="text-base text-gray-900 dark:text-white">Latest headlines from cybersecurity and threat intelligence.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Link to="/News" className="text-sm text-blue-700 dark:text-blue-400 hover:text-brand">View more</Link>
                      <button onClick={fetchNews} className="text-blue-700 dark:text-blue-400 hover:text-brand-dark">{newsLoading ? 'Refreshing…' : 'Refresh'}</button>
                    </div>
                </div>
                {newsError && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{newsError}</div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(newsLoading && news.length === 0 ? Array.from({ length: 6 }) : news).map((item, idx) => (
                        <article key={idx} className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow hover:shadow-lg transition dark:bg-black dark:border-black dark:shadow-none text-black dark:text-white opacity-100 mix-blend-normal antialiased">
                            <div className="aspect-video w-full bg-gray-100 dark:bg-black overflow-hidden -mb-px">
                                {item ? (
                                    <img
                                      src={item.imageUrl || 'https://source.unsplash.com/featured/800x450?cyber,security,hacking,news'}
                                      alt={item.title || 'news image'}
                                      className="block w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                                      onError={(e) => { e.currentTarget.src = 'https://source.unsplash.com/featured/800x450?cyber,security,hacking,news'; }}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-white dark:from-black dark:to-black" />
                                )}
                            </div>
                            <div className="p-5 bg-white text-black dark:bg-black dark:text-white mix-blend-normal">
                                <h3 className="text-lg font-bold group-hover:text-brand transition text-black dark:text-white">
                                    {newsLoading && !item ? 'Loading…' : (item?.title || '(no title)')}
                                </h3>
                                <p className="mt-2 text-[0.95rem] text-gray-900 dark:text-gray-200 line-clamp-3">
                                    {newsLoading && !item ? 'Fetching latest security headlines…' : (item?.summary || '')}
                                </p>
                                <div className="mt-4 flex items-center justify-between mix-blend-normal">
                                    <span className="text-xs font-medium text-gray-900 dark:text-gray-300">
                                        {newsLoading && !item ? '' : `${item?.source || ''} ${item?.publishedAt ? '· ' + new Date(item.publishedAt).toLocaleString() : ''}`}
                                    </span>
                                    {(!newsLoading && item?.link) ? (
                                        <a href={item.link} target="_blank" rel="noreferrer" className="text-sm text-brand hover:text-brand-dark">Read more</a>
                                    ) : (
                                        <span className="text-sm text-gray-400">…</span>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </>

    );
}

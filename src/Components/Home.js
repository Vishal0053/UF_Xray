import React from 'react';
import { useNavigate } from "react-router-dom";
// import home from './Imgs/bg-image.jpg';
import '../App.css';

export default function Container1() {
    const navigate = useNavigate(); // Initialize navigation

    const handleRedirect = () => {
        navigate("/AnalyzeFile"); // Redirects to the /scan-results route
    };
    return (
        <>
            <section className="relative">
                <img alt="A computer setup with multiple screens displaying code and data visualizations, with a colorful keyboard and other tech gadgets"
                    className="w-full h-[520px] object-cover"
                    src="https://static.sitemantic.com/webbuilder/templates/images/information-technology/information-technology-1170-570-1.jpg"
                    />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                        Securing digital future by empowering security
                    </h1>
                    <p className="text-lg sm:text-2xl mt-4 text-white/90 max-w-2xl">
                        Detect. Protect. Defend.
                    </p>
                    <div className="mt-8 flex gap-4">
                        <button className="px-6 py-3 rounded-lg bg-brand hover:bg-brand-dark text-white shadow-lg transition" onClick={handleRedirect}>
                            Start Now
                        </button>
                        <a href="#news" className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white shadow-lg backdrop-blur transition">
                            News
                        </a>
                    </div>
                </div>
            </section>
            <section id="news" className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Security News</h2>
                        <p className="text-gray-600 dark:text-gray-300">Latest headlines from cybersecurity and threat intelligence.</p>
                    </div>
                    <a className="text-brand hover:text-brand-dark" href="#">View all</a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1,2,3,4,5,6].map((i) => (
                        <article key={i} className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow hover:shadow-lg transition dark:bg-gray-900 dark:border-gray-800">
                            <div className="aspect-video w-full bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-900" />
                            <div className="p-5">
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand transition dark:text-gray-100">
                                    Major phishing campaign targets financial sector with new lures
                                </h3>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                                    Researchers observed a surge in credential harvesting attempts leveraging lookalike domains and advanced URL evasion.
                                </p>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Today</span>
                                    <a href="#" className="text-sm text-brand hover:text-brand-dark">Read more</a>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </>

    );
}

import React, { useState } from 'react';
import logo from './Imgs/logo-r.png';
import { Link } from "react-router-dom";
import '../App.css';
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isScanMobileOpen, setIsScanMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 text-gray-900 border-b border-gray-200 shadow-sm backdrop-blur supports-[backdrop-filter]:backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src={logo} className="h-9 w-auto" alt="site logo" />
          </a>

          <div className="flex items-center gap-2">
            <button
              aria-label="Toggle menu"
              className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-100"
              onClick={() => {
                if (isMenuOpen) setIsScanMobileOpen(false);
                setIsMenuOpen(!isMenuOpen);
              }}
            >
              {isMenuOpen ? '✖' : '☰'}
            </button>
          </div>

          <ul className="hidden md:flex items-center gap-6">
            <li>
              <Link className="text-gray-700 font-medium hover:text-brand" aria-current="page" to="/">Home</Link>
            </li>

            <li className="relative" onMouseLeave={() => setIsScanOpen(false)}>
              <button
                className="text-gray-700 font-medium hover:text-brand inline-flex items-center gap-1"
                onMouseEnter={() => setIsScanOpen(true)}
                onClick={() => setIsScanOpen(!isScanOpen)}
              >
                Scan
                <span className="text-xs">▾</span>
              </button>
              {isScanOpen && (
                <div
                  className="absolute top-full left-0 w-44 bg-white border border-gray-200 rounded-md shadow-lg py-2"
                  onMouseEnter={() => setIsScanOpen(true)}
                  onMouseLeave={() => setIsScanOpen(false)}
                >
                  <Link to="/AnalyzeFile" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">Analyze File</Link>
                  <Link to="/AnalyzeURL" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">Analyze URL</Link>
                  <Link to="/AnalyzeLog" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">Analyze Log</Link>
                </div>
              )}
            </li>

            <li>
              <Link className="text-gray-700 font-medium hover:text-brand" to="/About">About Us</Link>
            </li>
            <li>
              <Link className="text-gray-700 font-medium hover:text-brand" to="/Contact">Contact</Link>
            </li>


          </ul>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pt-2 pb-4 border-t border-gray-200">
            <ul className="flex flex-col gap-2">
              <li>
                <Link className="block px-2 py-1 rounded hover:bg-gray-100" to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
              </li>
              <li className="mt-1">
                <button
                  className="w-full flex items-center justify-between px-2 py-2 rounded hover:bg-gray-100"
                  aria-expanded={isScanMobileOpen}
                  onClick={() => setIsScanMobileOpen((v) => !v)}
                >
                  <span className="text-sm font-medium">Scan</span>
                  <span className={`text-xs transition-transform ${isScanMobileOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {isScanMobileOpen && (
                  <div className="mt-1 ml-2 flex flex-col gap-1">
                    <Link
                      className="block px-2 py-1 rounded hover:bg-gray-100"
                      to="/AnalyzeFile"
                      onClick={() => { setIsScanMobileOpen(false); setIsMenuOpen(false); }}
                    >
                      Analyze File
                    </Link>
                    <Link
                      className="block px-2 py-1 rounded hover:bg-gray-100"
                      to="/AnalyzeURL"
                      onClick={() => { setIsScanMobileOpen(false); setIsMenuOpen(false); }}
                    >
                      Analyze URL
                    </Link>
                    <Link
                      className="block px-2 py-1 rounded hover:bg-gray-100"
                      to="/AnalyzeLog"
                      onClick={() => { setIsScanMobileOpen(false); setIsMenuOpen(false); }}
                    >
                      Analyze Log
                    </Link>
                  </div>
                )}
              </li>
              <li>
                <Link className="block px-2 py-1 rounded hover:bg-gray-100" to="/About" onClick={() => setIsMenuOpen(false)}>About Us</Link>
              </li>
              <li>
                <Link className="block px-2 py-1 rounded hover:bg-gray-100" to="/Contact" onClick={() => setIsMenuOpen(false)}>Contact</Link>
              </li>

            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};
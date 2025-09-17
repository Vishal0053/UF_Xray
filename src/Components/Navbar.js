import React, { useContext, useEffect, useState } from 'react';
import logo from './Imgs/logo-r.png';
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from './context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import '../App.css';
export default function Navbar() {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white text-gray-900 border-b border-gray-200 shadow-sm dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src={logo} className="h-9 w-auto" alt="site logo" />
          </a>

          <div className="flex items-center gap-2">
            <button
              aria-label="Toggle theme"
              className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            {!currentUser && (
              <div className="md:hidden">
                <Link to="/login" className="inline-flex items-center px-3 py-1.5 rounded-md text-gray-900 hover:text-brand font-medium transition dark:text-gray-100">
                  Login
                </Link>
              </div>
            )}
            <button
              aria-label="Toggle menu"
              className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? '✖' : '☰'}
            </button>
          </div>

          <ul className="hidden md:flex items-center gap-6">
            <li>
              <Link className="hover:text-brand" aria-current="page" to="/">Home</Link>
            </li>

            {currentUser && (
              <>
                <li>
                  <ProtectedRoute>
                    <Link className="hover:text-brand" to="/AnalyzeFile">Analyze File</Link>
                  </ProtectedRoute>
                </li>
                <li>
                  <ProtectedRoute>
                    <Link className="hover:text-brand" to="/AnalyzeURL">Analyze URL</Link>
                  </ProtectedRoute>
                </li>
                <li>
                  <ProtectedRoute>
                    <Link className="hover:text-brand" to="/Report">Reports</Link>
                  </ProtectedRoute>
                </li>
              </>
            )}

            <li>
              <Link className="hover:text-brand" to="/about">About Us</Link>
            </li>
            <li>
              <Link className="hover:text-brand" to="/Contact">Contact</Link>
            </li>

            {currentUser ? (
              <li>
                <button className="hover:text-red-600" onClick={handleLogout}>Logout</button>
              </li>
            ) : (
              <>
                <li>
                  <Link className="hover:text-brand font-medium" to="/login">Login</Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pt-2 pb-4 border-t border-gray-200 dark:border-gray-800">
            <ul className="flex flex-col gap-2">
              <li>
                <Link className="block px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
              </li>
              {currentUser && (
                <>
                  <li>
                    <Link className="block px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" to="/AnalyzeFile" onClick={() => setIsMenuOpen(false)}>Analyze File</Link>
                  </li>
                  <li>
                    <Link className="block px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" to="/AnalyzeURL" onClick={() => setIsMenuOpen(false)}>Analyze URL</Link>
                  </li>
                  <li>
                    <Link className="block px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" to="/Report" onClick={() => setIsMenuOpen(false)}>Reports</Link>
                  </li>
                </>
              )}
              <li>
                <Link className="block px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" to="/about" onClick={() => setIsMenuOpen(false)}>About Us</Link>
              </li>
              <li>
                <Link className="block px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" to="/Contact" onClick={() => setIsMenuOpen(false)}>Contact</Link>
              </li>
              {currentUser ? (
                <li>
                  <button className="block text-left w-full px-2 py-1 rounded hover:bg-gray-100 text-red-600 dark:hover:bg-gray-800" onClick={() => { setIsMenuOpen(false); handleLogout(); }}>Logout</button>
                </li>
              ) : (
                <li>
                  <Link className="block px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};
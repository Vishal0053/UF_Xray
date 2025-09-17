import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { apiUrl } from '../api';

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Full name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Enter a valid email address';
    if (form.password.length < 8) nextErrors.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await axios.post(apiUrl('/api/auth/signup'), {
        username: form.name,
        email: form.email,
        password: form.password,
      });
      navigate('/login');
    } catch (err) {
      setErrors({ submit: err?.response?.data?.message || 'Signup failed. Try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-900 via-gray-900 to-black text-gray-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 px-4 sm:px-6 lg:px-8 py-10">
        {/* Left brand hero */}
        <div className="hidden lg:flex relative items-center justify-center overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-800/80 to-gray-900/60">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,white,transparent_35%),radial-gradient(circle_at_80%_0%,white,transparent_35%),radial-gradient(circle_at_50%_80%,white,transparent_35%)]" />
          <div className="relative z-10 max-w-lg p-12 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight">Welcome to UF XRAY</h1>
            <p className="mt-4 text-lg text-gray-300">Securely scan files and URLs powered by modern detection techniques.</p>
            <div className="mt-8 grid grid-cols-3 gap-4 text-sm text-left">
              <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/50">
                <div className="text-brand font-semibold">Real-time</div>
                <div className="text-gray-400">Fast, reliable scanning engine.</div>
              </div>
              <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/50">
                <div className="text-brand font-semibold">Privacy</div>
                <div className="text-gray-400">Data handled with care.</div>
              </div>
              <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/50">
                <div className="text-brand font-semibold">Reports</div>
                <div className="text-gray-400">Detailed, exportable results.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right form card */}
        <div className="flex items-center justify-center">
          <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl border border-gray-800 bg-gray-900 p-8 shadow-2xl">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold">Create your account</h2>
              <p className="mt-1 text-sm text-gray-400">Or <a href="#/login" className="text-brand hover:text-brand-dark font-medium">sign in to your account</a></p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-200">Full Name</label>
                <input id="name" name="name" type="text" value={form.name} onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-gray-700 bg-gray-900 text-gray-100 px-3 py-2 shadow-sm focus:border-brand focus:ring-2 focus:ring-brand/30 outline-none" />
                {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-200">Email</label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-gray-700 bg-gray-900 text-gray-100 px-3 py-2 shadow-sm focus:border-brand focus:ring-2 focus:ring-brand/30 outline-none" />
                {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200">Password</label>
                <input id="password" name="password" type="password" value={form.password} onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-gray-700 bg-gray-900 text-gray-100 px-3 py-2 shadow-sm focus:border-brand focus:ring-2 focus:ring-brand/30 outline-none" />
                {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200">Confirm Password</label>
                <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-gray-700 bg-gray-900 text-gray-100 px-3 py-2 shadow-sm focus:border-brand focus:ring-2 focus:ring-brand/30 outline-none" />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>}
              </div>
            </div>

            {errors.submit && <p className="mt-3 text-sm text-red-400 text-center">{errors.submit}</p>}

            <button type="submit" disabled={submitting}
              className="mt-6 w-full inline-flex justify-center items-center rounded-md bg-brand text-white px-4 py-2.5 font-semibold hover:bg-brand-dark transition disabled:opacity-60">
              {submitting ? 'Creating account…' : 'Sign up'}
            </button>

            <div className="mt-6 text-center text-sm text-gray-400">
              By signing up, you agree to our <a href="#" className="text-brand hover:text-brand-dark">Terms</a> and <a href="#" className="text-brand hover:text-brand-dark">Privacy Policy</a>.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
export default Signup;
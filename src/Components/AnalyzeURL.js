import React, { useState } from 'react';
import './CSS/AnalyzeURL.css'

export default function AnalyzeURL() {
  const [url, setUrl] = useState('');
  const [scanResults, setScanResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isValidUrl = (value) => {
    try {
      // If protocol omitted, add http for validation attempt
      const toTest = /^https?:\/\//i.test(value) ? value : `http://${value}`;
      // eslint-disable-next-line no-new
      new URL(toTest);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleScan = async () => {
    if (!isValidUrl(url)) {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    setLoading(true);
    setError(null);
    setScanResults(null);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to scan URL');
      }

      const data = await response.json();
      setScanResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleScan();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900" id='bg-image'>
      <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 bg-opacity-90 p-8 rounded-lg shadow-lg w-11/12 sm:w-4/5 md:w-2/3 lg:w-1/2 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600 dark:text-gray-100">
          URL Analysis
        </h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            className="flex-1 border border-gray-300 dark:border-gray-700 rounded-md p-2 shadow-sm focus:ring-brand focus:border-brand transition duration-150 ease-in-out bg-white dark:bg-gray-900 dark:text-gray-100"
            placeholder="Enter URL to analyze"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={onKeyDown}
            required
          />
          <button
            className="w-full sm:w-auto bg-brand text-white font-semibold px-4 py-2 rounded-md hover:bg-brand-dark transition duration-200"
            onClick={handleScan}
            disabled={loading}
          >
            {loading ? "Scanning..." : "Scan URL"}
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-md text-center">
            {error}
          </div>
        )}

        {scanResults && (
          <div className="mt-6 p-4 rounded-md border border-gray-200 bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100">
              Scan Results
            </h2>
            <div className="mt-2 text-gray-600 dark:text-gray-300">
              <p><span className="font-medium">URL:</span> {scanResults.url}</p>
              <p className={`font-semibold ${
                scanResults.prediction === 1 ? "text-red-500" : "text-green-500"
              }`}>
                Prediction: {scanResults.prediction === 1 ? "Phishing 🚨" : "Safe ✅"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
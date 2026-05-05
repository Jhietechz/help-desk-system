import React, { useState } from 'react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Get token from URL
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setMessage('Invalid or missing reset token.');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Password reset successful! You can now log in.');
      } else {
        setMessage(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setMessage('An error occurred.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-[#111112] p-8 rounded-lg shadow-lg w-full max-w-md border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Reset Password</h2>
        {message && <div className="mb-4 text-sm text-blue-400">{message}</div>}
        <div className="mb-4">
          <label className="block text-gray-400 mb-1 text-sm">New Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-white/10 focus:outline-none"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-400 mb-1 text-sm">Confirm Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-white/10 focus:outline-none"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-bold transition-all"
          disabled={loading}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}

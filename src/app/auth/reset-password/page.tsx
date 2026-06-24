'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please check your email link.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          temp_password: tempPassword,
          new_password: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Reset failed. Token may have expired.');
      } else {
        setSuccess('Password reset successful! Redirecting to login...');
        setTimeout(() => router.push('/auth/login'), 2500);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Reset Your Password</h2>
        <p style={styles.subtitle}>
          Enter the temporary password from your email, then choose a new password.
        </p>

        {/* Expiry warning */}
        <div style={styles.warningBox}>
          ⚠️ Your temporary password expires in <strong>30 minutes</strong> from when the email was sent.
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Temporary Password (from email)</label>
            <input
              type="password"
              value={tempPassword}
              onChange={e => setTempPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="Paste your temporary password"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="Choose a strong new password"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="Repeat your new password"
            />
          </div>

          <button type="submit" disabled={loading || !token} style={styles.button}>
            {loading ? 'Resetting...' : 'Reset Password →'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have your password?{' '}
          <a href="/auth/login" style={styles.link}>Go to Login</a>
        </p>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f4f8',
    padding: '20px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '40px',
    maxWidth: '460px',
    width: '100%',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  title: {
    color: '#1a73e8',
    marginBottom: '8px',
    fontSize: '24px',
  },
  subtitle: {
    color: '#555',
    fontSize: '14px',
    marginBottom: '16px',
  },
  warningBox: {
    backgroundColor: '#fff8e1',
    border: '1px solid #f9a825',
    borderRadius: '6px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#7a5700',
    marginBottom: '20px',
  },
  errorBox: {
    backgroundColor: '#fdecea',
    border: '1px solid #d93025',
    borderRadius: '6px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#d93025',
    marginBottom: '16px',
  },
  successBox: {
    backgroundColor: '#e6f4ea',
    border: '1px solid #34a853',
    borderRadius: '6px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#1e7e34',
    marginBottom: '16px',
  },
  field: {
    marginBottom: '18px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#1a73e8',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '8px',
  },
  footer: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#666',
    marginTop: '20px',
  },
  link: {
    color: '#1a73e8',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
};
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ADMIN_FLAG_KEY = 'yh_admin_auth';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const expected = process.env.REACT_APP_ADMIN_CODE || 'admin123';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim() === expected) {
      localStorage.setItem(ADMIN_FLAG_KEY, 'true');
      const redirectTo = location.state?.from || '/admin';
      navigate(redirectTo, { replace: true });
    } else {
      setError('Mã truy cập không đúng');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <form onSubmit={handleSubmit} style={{ border: '1px solid #eee', padding: 24, borderRadius: 8, minWidth: 360 }}>
        <h2>Đăng nhập Admin</h2>
        <p>Nhập mã truy cập để vào trang quản trị.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          <input
            type="password"
            placeholder="Mã truy cập"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 6 }}
          />
          {error && <div style={{ color: '#ef4444' }}>{error}</div>}
          <button type="submit" style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #e5e7eb', cursor: 'pointer' }}>
            Đăng nhập
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminLogin;


import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const DEMO_USERS = [
  {
    id: 1,
    name: 'Admin Jaga Rumah',
    email: 'admin@jagarumah.id',
    password: 'admin123',
    role: 'admin',
    avatar: 'AJ',
    phone: '08123456789',
    createdAt: '2024-01-01',
  },
  {
    id: 2,
    name: 'Operator Satu',
    email: 'operator@jagarumah.id',
    password: 'operator123',
    role: 'operator',
    avatar: 'OS',
    phone: '08234567890',
    createdAt: '2024-02-15',
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('jaga_rumah_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    await new Promise(r => setTimeout(r, 800));
    const found = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Email atau password salah');
    const { password: _, ...safeUser } = found;
    setUser(safeUser);
    localStorage.setItem('jaga_rumah_user', JSON.stringify(safeUser));
    return safeUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jaga_rumah_user');
  };

  const updateProfile = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('jaga_rumah_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7f6' }}>
        <h2 style={{ color: '#6E38F7' }}>Loading...</h2>
      </div>
    );
  }

  if (!token) {
    // Jika tidak ada token (belum login), tendang ke halaman login
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

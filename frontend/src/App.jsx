import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login/Login';
import BaseLayout from './components/layout/BaseLayout';
import DashboardAnalyst from './pages/Dashboard/DashboardAnalyst';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
      <Routes>
        {/* Halaman Login berdiri sendiri tanpa BaseLayout */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Halaman lain yang menggunakan Sidebar/Navbar akan diletakkan di dalam rute ini nanti */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <BaseLayout>
              <DashboardAnalyst />
            </BaseLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login/Login';
import BaseLayout from './components/layout/BaseLayout';
import DashboardAnalyst from './pages/Dashboard/DashboardAnalyst';
import ChartsList from './pages/Charts/ChartsList';
import ChartBuilder from './pages/Charts/ChartBuilder';
import ChartDetail from './pages/Charts/ChartDetail';
import IframeEmbed from './pages/Embed/IframeEmbed';
import RolesList from './pages/Roles/RolesList';
import UsersList from './pages/Users/UsersList';
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

        <Route path="/charts" element={
          <ProtectedRoute>
            <BaseLayout>
              <ChartsList />
            </BaseLayout>
          </ProtectedRoute>
        } />

        <Route path="/chart-builder" element={
          <ProtectedRoute>
            <BaseLayout>
              <ChartBuilder />
            </BaseLayout>
          </ProtectedRoute>
        } />

        <Route path="/charts/:id" element={
          <ProtectedRoute>
            <BaseLayout>
              <ChartDetail />
            </BaseLayout>
          </ProtectedRoute>
        } />

        {/* ROLES ROUTE */}
        <Route path="/roles" element={
          <ProtectedRoute>
            <BaseLayout>
              <RolesList />
            </BaseLayout>
          </ProtectedRoute>
        } />

        {/* USERS ROUTE */}
        <Route path="/users" element={
          <ProtectedRoute>
            <BaseLayout>
              <UsersList />
            </BaseLayout>
          </ProtectedRoute>
        } />
        
        {/* PUBLIC ROUTE FOR IFRAME */}
        <Route path="/embed/:token" element={<IframeEmbed />} />
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;

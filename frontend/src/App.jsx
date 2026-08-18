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
import DashboardViewer from './pages/Dashboard/DashboardViewer';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

const AppRoutes = () => {
  const { user } = React.useContext(AuthContext) || {};
  const isAnalyst = user?.role?.name === 'Data Analyst';

  return (
    <Routes>
      {/* Halaman Login berdiri sendiri tanpa BaseLayout */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* Dashboard Route */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <BaseLayout>
            {isAnalyst ? <DashboardAnalyst /> : <DashboardViewer />}
          </BaseLayout>
        </ProtectedRoute>
      } />

      {/* Restricted Routes for Analyst Only */}
      {isAnalyst && (
        <>
          <Route path="/charts" element={
            <ProtectedRoute>
              <BaseLayout><ChartsList /></BaseLayout>
            </ProtectedRoute>
          } />
          <Route path="/chart-builder" element={
            <ProtectedRoute>
              <BaseLayout><ChartBuilder /></BaseLayout>
            </ProtectedRoute>
          } />
          <Route path="/charts/:id" element={
            <ProtectedRoute>
              <BaseLayout><ChartDetail /></BaseLayout>
            </ProtectedRoute>
          } />
          <Route path="/roles" element={
            <ProtectedRoute>
              <BaseLayout><RolesList /></BaseLayout>
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute>
              <BaseLayout><UsersList /></BaseLayout>
            </ProtectedRoute>
          } />
        </>
      )}
      
      {/* PUBLIC ROUTE FOR IFRAME */}
      <Route path="/embed/:token" element={<IframeEmbed />} />

      {/* Fallback Catch-All Route (Akan otomatis dialihkan ke /dashboard atau /login) */}
      <Route path="*" element={<ProtectedRoute><BaseLayout>{isAnalyst ? <DashboardAnalyst /> : <DashboardViewer />}</BaseLayout></ProtectedRoute>} />
    </Routes>
  );
};

export default App;

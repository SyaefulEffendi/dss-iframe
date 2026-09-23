import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, LayoutDashboard, Eye, Pin } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { AuthContext } from '../../context/AuthContext';
import './DashboardsList.css';

const MySwal = withReactContent(Swal);

const DashboardsList = () => {
  const [dashboards, setDashboards] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user, fetchUser } = useContext(AuthContext) || {};
  
  const isAnalyst = user?.role?.name === 'Data Analyst';

  useEffect(() => {
    fetchDashboards();
  }, []);

  const fetchDashboards = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/dashboards');
      if (response.data.success) {
        setDashboards(response.data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error);
      MySwal.fire('Error', 'Gagal memuat daftar dashboard', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDashboard = async () => {
    const { value: title } = await MySwal.fire({
      title: 'Buat Dashboard Baru',
      input: 'text',
      inputLabel: 'Judul Dashboard',
      inputPlaceholder: 'Masukkan judul dashboard...',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'Judul dashboard tidak boleh kosong!'
        }
      }
    });

    if (title) {
      try {
        const response = await axios.post('/api/dashboards', { title });
        if (response.data.success) {
          MySwal.fire('Berhasil', 'Dashboard dibuat', 'success');
          setDashboards([...dashboards, response.data.data]);
        }
      } catch (error) {
        MySwal.fire('Error', 'Gagal membuat dashboard', 'error');
      }
    }
  };

  const handleEditTitle = async (dashboard) => {
    const { value: title } = await MySwal.fire({
      title: 'Edit Judul Dashboard',
      input: 'text',
      inputValue: dashboard.title,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'Judul dashboard tidak boleh kosong!'
        }
      }
    });

    if (title && title !== dashboard.title) {
      try {
        const response = await axios.put(`/api/dashboards/${dashboard.id}`, { title });
        if (response.data.success) {
          MySwal.fire('Berhasil', 'Judul diperbarui', 'success');
          setDashboards(dashboards.map(d => d.id === dashboard.id ? { ...d, title } : d));
        }
      } catch (error) {
        MySwal.fire('Error', 'Gagal memperbarui judul', 'error');
      }
    }
  };

  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: 'Apakah Anda yakin?',
      text: "Dashboard yang dihapus tidak bisa dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`/api/dashboards/${id}`);
        if (response.data.success) {
          MySwal.fire({
            icon: 'success',
            title: 'Terhapus!',
            text: 'Dashboard berhasil dihapus.',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
          setDashboards(dashboards.filter(d => d.id !== id));
        }
      } catch (error) {
        MySwal.fire('Error', 'Gagal menghapus dashboard', 'error');
      }
    }
  };

  const filteredDashboards = dashboards.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.creator?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="dashboards-container">
      <div className="dashboards-header">
        <div className="dashboards-title">
          <h1>Dashboards</h1>
          <p>Daftar visualisasi data yang digabungkan dalam satu tampilan.</p>
        </div>
        
        <div className="dashboards-actions">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Cari dashboard..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {isAnalyst && (
            <button className="create-btn" onClick={handleCreateDashboard}>
              <Plus size={18} />
              <span>Create Dashboard</span>
            </button>
          )}
        </div>
      </div>

      <div className="dashboards-card">
        {isLoading ? (
          <div className="empty-state">
            <p>Memuat data dashboard...</p>
          </div>
        ) : filteredDashboards.length === 0 ? (
          <div className="empty-state">
            <LayoutDashboard size={48} className="empty-icon" />
            <h3>Belum ada dashboard</h3>
            <p>{searchQuery ? "Tidak ditemukan dashboard yang cocok." : "Belum ada dashboard yang dibuat."}</p>
          </div>
        ) : (
          <table className="dashboards-table">
            <thead>
              <tr>
                <th>Judul Dashboard</th>
                <th>Dibuat Oleh</th>
                <th>Tanggal Dibuat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredDashboards.map((dashboard) => (
                <tr key={dashboard.id}>
                  <td><strong>{dashboard.title}</strong></td>
                  <td>{dashboard.creator?.name || 'Sistem'}</td>
                  <td>{formatDate(dashboard.created_at)}</td>
                  <td>
                    <div className="action-btns">
                      <button 
                        className="btn-icon btn-view" 
                        title="Lihat Dashboard"
                        onClick={() => navigate(`/dashboard/${dashboard.id}`)}
                      >
                        <Eye size={16} />
                      </button>
                      {!isAnalyst && (
                        <button 
                          className={`btn-icon ${user?.pinnedDashboards?.find(p => p.id === dashboard.id) ? 'btn-unpin' : 'btn-pin'}`} 
                          title={user?.pinnedDashboards?.find(p => p.id === dashboard.id) ? 'Unpin Dashboard' : 'Pin Dashboard'}
                          onClick={async () => {
                            try {
                              const res = await axios.post(`/api/dashboards/${dashboard.id}/pin`);
                              if (res.data.success) {
                                MySwal.fire({
                                  icon: 'success',
                                  title: 'Berhasil',
                                  text: res.data.message,
                                  toast: true,
                                  position: 'top-end',
                                  showConfirmButton: false,
                                  timer: 3000
                                });
                                if (fetchUser) await fetchUser();
                              }
                            } catch (e) {}
                          }}
                        >
                          <Pin size={16} fill={user?.pinnedDashboards?.find(p => p.id === dashboard.id) ? "currentColor" : "none"} />
                        </button>
                      )}
                      {isAnalyst && (
                        <>
                          <button 
                            className="btn-icon btn-edit" 
                            title="Edit Judul"
                            onClick={() => handleEditTitle(dashboard)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className="btn-icon btn-delete" 
                            title="Hapus Dashboard"
                            onClick={() => handleDelete(dashboard.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DashboardsList;

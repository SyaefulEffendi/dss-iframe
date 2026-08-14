import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, BarChart2, PieChart, TrendingUp } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import './ChartsList.css';

const MySwal = withReactContent(Swal);

const ChartsList = () => {
  const [charts, setCharts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch charts on mount
  useEffect(() => {
    fetchCharts();
  }, []);

  const fetchCharts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/charts');
      if (response.data.success) {
        setCharts(response.data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data chart:", error);
      MySwal.fire('Error', 'Gagal memuat daftar grafik', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: 'Apakah Anda yakin?',
      text: "Grafik yang dihapus tidak bisa dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`/api/charts/${id}`);
        if (response.data.success) {
          MySwal.fire({
            icon: 'success',
            title: 'Terhapus!',
            text: 'Grafik berhasil dihapus.',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
          // Update state locally
          setCharts(charts.filter(chart => chart.id !== id));
        }
      } catch (error) {
        MySwal.fire('Error', 'Gagal menghapus grafik', 'error');
      }
    }
  };

  // Filter charts based on search query
  const filteredCharts = charts.filter(chart => 
    chart.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chart.creator?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getChartIcon = (type) => {
    switch (type) {
      case 'bar': return <BarChart2 size={16} />;
      case 'pie': return <PieChart size={16} />;
      case 'line': return <TrendingUp size={16} />;
      default: return <BarChart2 size={16} />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="charts-container">
      <div className="charts-header">
        <div className="charts-title">
          <h1>Charts Management</h1>
          <p>Kelola semua grafik visualisasi data Anda di sini.</p>
        </div>
        
        <div className="charts-actions">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Cari grafik..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="create-btn" onClick={() => navigate('/chart-builder')}>
            <Plus size={18} />
            <span>Create New Chart</span>
          </button>
        </div>
      </div>

      <div className="charts-card">
        {isLoading ? (
          <div className="empty-state">
            <p>Memuat data grafik...</p>
          </div>
        ) : filteredCharts.length === 0 ? (
          <div className="empty-state">
            <BarChart2 size={48} className="empty-icon" />
            <h3>Belum ada grafik</h3>
            <p>{searchQuery ? "Tidak ditemukan grafik yang cocok dengan pencarian Anda." : "Klik 'Create New Chart' untuk membuat visualisasi pertama Anda."}</p>
          </div>
        ) : (
          <table className="charts-table">
            <thead>
              <tr>
                <th>Judul Grafik</th>
                <th>Tipe</th>
                <th>Dibuat Oleh</th>
                <th>Tanggal Dibuat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredCharts.map((chart) => (
                <tr key={chart.id}>
                  <td><strong>{chart.title}</strong></td>
                  <td>
                    <span className={`chart-type-badge type-${chart.chart_type || 'default'}`}>
                      {chart.chart_type || 'Unknown'}
                    </span>
                  </td>
                  <td>{chart.creator?.name || 'Sistem'}</td>
                  <td>{formatDate(chart.created_at)}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon btn-edit" title="Edit Grafik">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="btn-icon btn-delete" 
                        title="Hapus Grafik"
                        onClick={() => handleDelete(chart.id)}
                      >
                        <Trash2 size={16} />
                      </button>
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

export default ChartsList;

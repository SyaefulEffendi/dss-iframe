import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Shield } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import './RolesList.css';

const MySwal = withReactContent(Swal);

const RolesList = () => {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/roles');
      if (res.data.success) {
        setRoles(res.data.data);
      }
    } catch (err) {
      MySwal.fire('Error', 'Gagal memuat daftar role', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (role = null) => {
    setEditRole(role);
    setFormData({ name: role ? role.name : '' });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditRole(null);
    setFormData({ name: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return MySwal.fire('Error', 'Nama Jabatan harus diisi', 'error');
    
    setIsSaving(true);
    try {
      if (editRole) {
        await axios.put(`/api/roles/${editRole.id}`, formData);
        MySwal.fire({ icon: 'success', title: 'Tersimpan', text: 'Jabatan diperbarui!', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
      } else {
        await axios.post('/api/roles', formData);
        MySwal.fire({ icon: 'success', title: 'Tersimpan', text: 'Jabatan ditambahkan!', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
      }
      handleCloseModal();
      fetchRoles();
    } catch (err) {
      MySwal.fire('Gagal', err.response?.data?.message || 'Terjadi kesalahan', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: 'Hapus Jabatan?',
      text: "Karyawan dengan jabatan ini akan kehilangan akses jabatannya (namun akunnya tidak dihapus).",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/roles/${id}`);
        MySwal.fire({ icon: 'success', title: 'Terhapus!', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
        fetchRoles();
      } catch (err) {
        MySwal.fire('Error', 'Gagal menghapus jabatan', 'error');
      }
    }
  };

  return (
    <div className="roles-container">
      <div className="roles-header">
        <div className="roles-title">
          <h1>Role Management</h1>
          <p>Kelola daftar jabatan dan hak akses departemen.</p>
        </div>
        <button className="create-btn" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          <span>Tambah Jabatan</span>
        </button>
      </div>

      <div className="roles-card">
        {isLoading ? (
          <div className="empty-state">Memuat data...</div>
        ) : roles.length === 0 ? (
          <div className="empty-state">Belum ada data jabatan.</div>
        ) : (
          <table className="roles-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama Jabatan (Role)</th>
                <th width="150">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td>{role.id}</td>
                  <td>
                    <div className="role-name-cell">
                      <Shield size={16} className="role-icon" />
                      <strong>{role.name}</strong>
                    </div>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon btn-edit" onClick={() => handleOpenModal(role)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-icon btn-delete" onClick={() => handleDelete(role.id)}>
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content-sm">
            <div className="modal-header">
              <h2>{editRole ? 'Edit Jabatan' : 'Tambah Jabatan Baru'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Nama Jabatan</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="Misal: Data Analyst"
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseModal} disabled={isSaving}>Batal</button>
                <button type="submit" className="submit-btn" disabled={isSaving}>
                  {isSaving ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesList;

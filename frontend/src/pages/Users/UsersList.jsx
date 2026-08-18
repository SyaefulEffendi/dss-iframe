import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, UserCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import './UsersList.css'; // Kita bisa gunakan styling yang mirip dengan Roles

const MySwal = withReactContent(Swal);

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role_id: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      MySwal.fire('Error', 'Gagal memuat daftar pengguna', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get('/api/roles');
      if (res.data.success) {
        setRoles(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenModal = (user = null) => {
    setEditUser(user);
    setFormData({ 
      name: user ? user.name : '', 
      email: user ? user.email : '',
      password: '', 
      role_id: user ? (user.role_id || '') : ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditUser(null);
    setFormData({ name: '', email: '', password: '', role_id: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return MySwal.fire('Error', 'Nama dan Email wajib diisi', 'error');
    if (!editUser && !formData.password) return MySwal.fire('Error', 'Password wajib diisi untuk pengguna baru', 'error');
    
    setIsSaving(true);
    try {
      const payload = { ...formData };
      if (!payload.role_id) payload.role_id = null;

      if (editUser) {
        if (!payload.password) delete payload.password; // Jangan kirim jika kosong (tidak ubah password)
        await axios.put(`/api/users/${editUser.id}`, payload);
        MySwal.fire({ icon: 'success', title: 'Tersimpan', text: 'Data pengguna diperbarui!', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
      } else {
        await axios.post('/api/users', payload);
        MySwal.fire({ icon: 'success', title: 'Tersimpan', text: 'Pengguna ditambahkan!', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
      }
      handleCloseModal();
      fetchUsers();
    } catch (err) {
      MySwal.fire('Gagal', err.response?.data?.message || 'Terjadi kesalahan', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: 'Hapus Pengguna?',
      text: "Pengguna tidak akan bisa mengakses sistem lagi.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/users/${id}`);
        MySwal.fire({ icon: 'success', title: 'Terhapus!', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
        fetchUsers();
      } catch (err) {
        MySwal.fire('Error', err.response?.data?.message || 'Gagal menghapus pengguna', 'error');
      }
    }
  };

  return (
    <div className="roles-container">
      <div className="roles-header">
        <div className="roles-title">
          <h1>User Management</h1>
          <p>Kelola akun karyawan dan pasangkan dengan jabatannya.</p>
        </div>
        <button className="create-btn" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          <span>Tambah User</span>
        </button>
      </div>

      <div className="roles-card">
        {isLoading ? (
          <div className="empty-state">Memuat data...</div>
        ) : users.length === 0 ? (
          <div className="empty-state">Belum ada data pengguna.</div>
        ) : (
          <table className="roles-table">
            <thead>
              <tr>
                <th>Pengguna</th>
                <th>Email</th>
                <th>Jabatan (Role)</th>
                <th width="150">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="role-name-cell">
                      <UserCircle size={24} className="role-icon" style={{ color: '#6366f1' }}/>
                      <strong>{user.name}</strong>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    {user.role ? (
                      <span className="badge-role">{user.role.name}</span>
                    ) : (
                      <span style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.85rem' }}>Tidak Ada Jabatan</span>
                    )}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon btn-edit" onClick={() => handleOpenModal(user)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-icon btn-delete" onClick={() => handleDelete(user.id)}>
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
          <div className="modal-content-sm" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>{editUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Nama Lengkap</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Jabatan (Role)</label>
                <select value={formData.role_id} onChange={(e) => setFormData({...formData, role_id: e.target.value})} className="config-select" style={{ width: '100%', marginTop: '0.5rem' }}>
                  <option value="">-- Tanpa Jabatan --</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Password {editUser && <span style={{ color: '#9ca3af', fontWeight: 'normal' }}>(Kosongkan jika tidak ingin diubah)</span>}</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>
              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
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

export default UsersList;

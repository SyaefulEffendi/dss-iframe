import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import './DataExplorer.css';

const MySwal = withReactContent(Swal);

function DataExplorer() {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [loadingTables, setLoadingTables] = useState(true);
    const [loadingData, setLoadingData] = useState(false);

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        setLoadingTables(true);
        try {
            const response = await axios.get('/api/schema/tables');
            if (response.data.success) {
                setTables(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching tables:', error);
            MySwal.fire({
                icon: 'error',
                title: 'Gagal Memuat Tabel',
                text: 'Terjadi kesalahan saat memuat daftar tabel.',
                confirmButtonColor: '#4f46e5'
            });
        } finally {
            setLoadingTables(false);
        }
    };

    const handleTableClick = async (tableName) => {
        setSelectedTable(tableName);
        setLoadingData(true);
        try {
            const response = await axios.get(`/api/schema/preview/${tableName}`);
            if (response.data.success) {
                setTableData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching table data:', error);
            MySwal.fire({
                icon: 'error',
                title: 'Gagal Memuat Data',
                text: error.response?.data?.message || 'Terjadi kesalahan saat memuat data tabel.',
                confirmButtonColor: '#4f46e5'
            });
            setTableData([]);
        } finally {
            setLoadingData(false);
        }
    };

    return (
        <div className="data-explorer-container fade-in">
            <div className="explorer-header">
                <h2><i className="fi fi-rr-database"></i> Data Explorer (Preview)</h2>
                <p>Lihat pratinjau mentah hingga 100 baris teratas dari setiap tabel untuk membantu merakit kueri Anda.</p>
            </div>

            <div className="explorer-layout">
                {/* Sidebar (List Tabel) */}
                <div className="explorer-sidebar">
                    <h3 className="sidebar-title">Daftar Tabel</h3>
                    {loadingTables ? (
                        <div className="loading-state">Memuat tabel...</div>
                    ) : tables.length === 0 ? (
                        <div className="empty-state">Tidak ada tabel ditemukan.</div>
                    ) : (
                        <ul className="table-list">
                            {tables.map((table) => (
                                <li 
                                    key={table} 
                                    className={`table-item ${selectedTable === table ? 'active' : ''}`}
                                    onClick={() => handleTableClick(table)}
                                >
                                    <i className="fi fi-rr-table"></i> {table}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Konten Utama (Preview Data) */}
                <div className="explorer-main">
                    {!selectedTable ? (
                        <div className="empty-data-state">
                            <div className="empty-icon">
                                <i className="fi fi-rr-search-alt"></i>
                            </div>
                            <h3>Pilih Tabel</h3>
                            <p>Silakan klik salah satu tabel di sebelah kiri untuk melihat isinya.</p>
                        </div>
                    ) : (
                        <div className="data-preview-section">
                            <div className="preview-header">
                                <h3>Tabel: <span>{selectedTable}</span></h3>
                                {tableData.length > 0 && (
                                    <span className="badge-count">Menampilkan {tableData.length} baris (Top 100)</span>
                                )}
                            </div>

                            {loadingData ? (
                                <div className="loading-data-state">
                                    <div className="spinner"></div>
                                    <p>Mengambil data...</p>
                                </div>
                            ) : tableData.length === 0 ? (
                                <div className="no-data-msg">
                                    <i className="fi fi-rr-info"></i> Tabel ini masih kosong.
                                </div>
                            ) : (
                                <div className="table-responsive-wrapper">
                                    <table className="modern-table explorer-table">
                                        <thead>
                                            <tr>
                                                {Object.keys(tableData[0]).map((col) => (
                                                    <th key={col}>{col}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tableData.map((row, index) => (
                                                <tr key={index}>
                                                    {Object.values(row).map((val, idx) => (
                                                        <td key={idx}>
                                                            {val !== null ? String(val) : <span className="null-val">NULL</span>}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DataExplorer;

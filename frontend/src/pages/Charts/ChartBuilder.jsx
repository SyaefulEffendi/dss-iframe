import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ArrowLeft, Database, AlertCircle } from 'lucide-react';
import axios from 'axios';
import './ChartBuilder.css';

const ChartBuilder = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('SELECT * FROM users LIMIT 10;');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunQuery = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/charts/run-query', { query });
      if (response.data.success) {
        setResults(response.data);
      }
    } catch (err) {
      setResults(null);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Terjadi kesalahan saat mengeksekusi kueri.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Mendapatkan daftar nama kolom dari hasil query
  const getColumns = () => {
    if (!results || !results.data || results.data.length === 0) return [];
    return Object.keys(results.data[0]);
  };

  return (
    <div className="builder-container">
      <div className="builder-header">
        <div className="builder-title">
          <button className="back-btn" onClick={() => navigate('/charts')} title="Kembali">
            <ArrowLeft size={20} />
          </button>
          <h1>Chart Builder</h1>
        </div>
      </div>

      <div className="builder-layout">
        
        {/* Editor SQL */}
        <div className="editor-section">
          <div className="editor-header">
            <div className="editor-title">
              <Database size={16} />
              <span>SQL Editor (Read-Only)</span>
            </div>
            <button 
              className="run-btn" 
              onClick={handleRunQuery}
              disabled={isLoading}
            >
              <Play size={16} />
              <span>{isLoading ? 'Running...' : 'Run Query'}</span>
            </button>
          </div>
          <textarea
            className="sql-textarea"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik kueri SELECT Anda di sini..."
            spellCheck="false"
          />
        </div>

        {/* Pesan Error */}
        {error && (
          <div className="alert-box">
            <AlertCircle size={18} style={{ marginBottom: '-3px', marginRight: '8px' }} />
            {error}
          </div>
        )}

        {/* Tabel Hasil */}
        <div className="results-section">
          <div className="results-header">
            <h3>Data Preview</h3>
            {results && (
              <span className="results-meta">
                {results.count} Baris
              </span>
            )}
          </div>
          
          <div className="results-table-container">
            {!results && !isLoading && !error && (
              <div className="empty-results">
                <Database size={48} style={{ opacity: 0.2 }} />
                <p>Klik "Run Query" untuk melihat hasil tabel.</p>
              </div>
            )}

            {isLoading && (
              <div className="empty-results">
                <p>Mengeksekusi kueri...</p>
              </div>
            )}

            {results && results.data.length === 0 && (
              <div className="empty-results">
                <p>Kueri dieksekusi dengan sukses, namun tidak mengembalikan data (0 baris).</p>
              </div>
            )}

            {results && results.data.length > 0 && (
              <table className="results-table">
                <thead>
                  <tr>
                    {getColumns().map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {getColumns().map((col) => (
                        <td key={`${rowIndex}-${col}`}>{row[col] !== null ? String(row[col]) : <em>null</em>}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChartBuilder;

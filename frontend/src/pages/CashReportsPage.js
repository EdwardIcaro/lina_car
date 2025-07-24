import React, { useEffect, useState } from 'react';
import { getCashReports, getCashHistory } from '../services/api';

const CashReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('reports');

  useEffect(() => {
    fetchReports();
    fetchMovements();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getCashReports();
      setReports(data);
    } catch (err) {
      setError('Erro ao carregar relatórios.');
    }
    setLoading(false);
  };

  const fetchMovements = async () => {
    try {
      const { data } = await getCashHistory();
      setMovements(data);
    } catch (err) {}
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', background: '#fff', borderRadius: 12, padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>Relatórios de Caixa</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <button
          onClick={() => setActiveTab('reports')}
          style={{
            padding: '10px 24px',
            background: activeTab === 'reports' ? '#1976d2' : '#eee',
            color: activeTab === 'reports' ? '#fff' : '#333',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >Relatórios</button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '10px 24px',
            background: activeTab === 'history' ? '#1976d2' : '#eee',
            color: activeTab === 'history' ? '#fff' : '#333',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >Histórico de Movimentações</button>
      </div>
      {activeTab === 'reports' && (
        loading ? (
          <div>Carregando...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: 8, border: '1px solid #eee' }}>Data Abertura</th>
                <th style={{ padding: 8, border: '1px solid #eee' }}>Data Fechamento</th>
                <th style={{ padding: 8, border: '1px solid #eee' }}>Valor Abertura</th>
                <th style={{ padding: 8, border: '1px solid #eee' }}>Observação</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(rep => (
                <tr key={rep.id}>
                  <td style={{ padding: 8, border: '1px solid #eee' }}>{new Date(rep.createdAt).toLocaleString('pt-BR')}</td>
                  <td style={{ padding: 8, border: '1px solid #eee' }}>{rep.closedAt ? new Date(rep.closedAt).toLocaleString('pt-BR') : '-'}</td>
                  <td style={{ padding: 8, border: '1px solid #eee' }}>R$ {rep.amount?.toFixed(2)}</td>
                  <td style={{ padding: 8, border: '1px solid #eee', color: rep.observation ? '#e53935' : '#388e3c' }}>{rep.observation || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
      {activeTab === 'history' && (
        <div>
          <h3 style={{ marginBottom: 16 }}>Histórico de Movimentações</h3>
          {movements.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', padding: 40 }}>
              Nenhuma movimentação encontrada.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: 8, border: '1px solid #eee' }}>Tipo</th>
                  <th style={{ padding: 8, border: '1px solid #eee' }}>Valor</th>
                  <th style={{ padding: 8, border: '1px solid #eee' }}>Motivo</th>
                  <th style={{ padding: 8, border: '1px solid #eee' }}>Funcionário</th>
                  <th style={{ padding: 8, border: '1px solid #eee' }}>Data/Hora</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id} style={{ background: movement.type === 'entrada' ? '#e8f5e9' : '#fff3e0' }}>
                    <td style={{ padding: 8, border: '1px solid #eee', fontWeight: 600 }}>
                      {movement.type === 'entrada' ? 'Abertura' : 'Saída'}
                    </td>
                    <td style={{ padding: 8, border: '1px solid #eee', color: movement.type === 'entrada' ? '#388e3c' : '#f57c00', fontWeight: 700 }}>
                      {movement.type === 'entrada' ? '+' : '-'} R$ {movement.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: 8, border: '1px solid #eee' }}>
                      {movement.reason || (movement.type === 'entrada' ? 'Abertura de caixa' : '-')}
                    </td>
                    <td style={{ padding: 8, border: '1px solid #eee' }}>
                      {movement.employee?.name || movement.employeeName || '-'}
                    </td>
                    <td style={{ padding: 8, border: '1px solid #eee', fontSize: 13, color: '#666' }}>
                      {new Date(movement.createdAt).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default CashReportsPage; 
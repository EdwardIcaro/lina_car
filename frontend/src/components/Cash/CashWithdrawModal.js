import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CashWithdrawModal = ({ onClose, onSuccess }) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawReason, setWithdrawReason] = useState('');
  const [withdrawType, setWithdrawType] = useState('sangria');
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data } = await axios.get('/api/employees');
      setEmployees(data);
    } catch (error) {}
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('Por favor, informe um valor válido para saída.');
      return;
    }
    if (!withdrawReason.trim()) {
      alert('Por favor, informe o motivo da saída.');
      return;
    }
    if (withdrawType === 'vale' && !employeeId) {
      alert('Por favor, selecione um funcionário.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/cash/withdraw', {
        amount: parseFloat(withdrawAmount),
        reason: withdrawReason,
        type: withdrawType,
        employeeId: withdrawType === 'vale' ? employeeId : null
      });
      setWithdrawAmount('');
      setWithdrawReason('');
      setWithdrawType('sangria');
      setEmployeeId('');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      alert('Erro ao registrar saída: ' + (error.response?.data?.message || 'Erro interno'));
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 32,
        minWidth: 340,
        maxWidth: '90vw',
        boxShadow: '0 2px 16px #0003',
        textAlign: 'center',
        position: 'relative'
      }}>
        <h2 style={{ marginBottom: 24 }}>Registrar Saída</h2>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Valor da Saída:</label>
          <input
            type="number"
            value={withdrawAmount}
            onChange={e => setWithdrawAmount(e.target.value)}
            placeholder="0,00"
            step="0.01"
            style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 6, fontSize: 16 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Motivo:</label>
          <input
            type="text"
            value={withdrawReason}
            onChange={e => setWithdrawReason(e.target.value)}
            placeholder="Motivo da saída"
            style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 6, fontSize: 16 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Tipo de Saída:</label>
          <select
            value={withdrawType}
            onChange={e => { setWithdrawType(e.target.value); if (e.target.value !== 'vale') setEmployeeId(''); }}
            style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 6, fontSize: 16 }}
          >
            <option value="sangria">Sangria</option>
            <option value="vale">Vale Funcionário</option>
            <option value="outro">Outro</option>
          </select>
        </div>
        {withdrawType === 'vale' && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Funcionário:</label>
            <select
              value={employeeId}
              onChange={e => setEmployeeId(e.target.value)}
              style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 6, fontSize: 16 }}
            >
              <option value="">Selecione um funcionário</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
        )}
        <div style={{ display: 'flex', gap: 16, marginTop: 24, justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              background: '#eee',
              color: '#333',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              cursor: 'pointer'
            }}
            disabled={loading}
          >Cancelar</button>
          <button
            onClick={handleWithdraw}
            style={{
              padding: '10px 24px',
              background: '#f57c00',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1
            }}
            disabled={loading}
          >{loading ? 'Registrando...' : 'Registrar Saída'}</button>
        </div>
      </div>
    </div>
  );
};

export default CashWithdrawModal; 
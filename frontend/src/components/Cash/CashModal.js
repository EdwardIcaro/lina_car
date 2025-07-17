import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaMinus, FaHistory } from 'react-icons/fa';
import axios from 'axios';

const CashModal = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('open'); // 'open', 'withdraw', 'history'
    const [cashData, setCashData] = useState({
        openingAmount: '',
        withdrawAmount: '',
        withdrawReason: '',
        withdrawType: 'sangria' // 'sangria', 'vale', 'outro'
    });
    const [cashHistory, setCashHistory] = useState([]);
    const [currentBalance, setCurrentBalance] = useState(0);
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        fetchCashHistory();
        fetchCurrentBalance();
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const { data } = await axios.get('/api/employees');
            setEmployees(data);
        } catch (error) {
            console.error('Erro ao carregar funcionários:', error);
        }
    };

    const fetchCashHistory = async () => {
        try {
            const { data } = await axios.get('/api/cash/history');
            setCashHistory(data);
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
        }
    };

    const fetchCurrentBalance = async () => {
        try {
            const { data } = await axios.get('/api/cash/balance');
            setCurrentBalance(data.balance);
        } catch (error) {
            console.error('Erro ao carregar saldo:', error);
        }
    };

    const handleOpenCash = async () => {
        if (!cashData.openingAmount || parseFloat(cashData.openingAmount) <= 0) {
            alert('Por favor, informe um valor válido para abertura do caixa.');
            return;
        }

        try {
            await axios.post('/api/cash/open', {
                amount: parseFloat(cashData.openingAmount)
            });
            alert('Caixa aberto com sucesso!');
            setCashData({ ...cashData, openingAmount: '' });
            fetchCashHistory();
            fetchCurrentBalance();
        } catch (error) {
            alert('Erro ao abrir caixa: ' + error.response?.data?.message || 'Erro interno');
        }
    };

    const handleWithdraw = async () => {
        if (!cashData.withdrawAmount || parseFloat(cashData.withdrawAmount) <= 0) {
            alert('Por favor, informe um valor válido para saída.');
            return;
        }

        if (!cashData.withdrawReason.trim()) {
            alert('Por favor, informe o motivo da saída.');
            return;
        }

        if (cashData.withdrawType === 'vale' && !cashData.employeeId) {
            alert('Por favor, selecione um funcionário.');
            return;
        }

        try {
            await axios.post('/api/cash/withdraw', {
                amount: parseFloat(cashData.withdrawAmount),
                reason: cashData.withdrawReason,
                type: cashData.withdrawType,
                employeeId: cashData.withdrawType === 'vale' ? cashData.employeeId : null
            });
            alert('Saída registrada com sucesso!');
            setCashData({ ...cashData, withdrawAmount: '', withdrawReason: '', employeeId: '' });
            fetchCashHistory();
            fetchCurrentBalance();
        } catch (error) {
            alert('Erro ao registrar saída: ' + error.response?.data?.message || 'Erro interno');
        }
    };

    const getWithdrawTypeLabel = (type) => {
        switch (type) {
            case 'sangria': return 'Sangria';
            case 'vale': return 'Vale Funcionário';
            case 'outro': return 'Outro';
            default: return type;
        }
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
            zIndex: 1000
        }}>
            <div style={{
                background: '#fff',
                borderRadius: 12,
                padding: 24,
                maxWidth: 600,
                width: '90%',
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h2 style={{ margin: 0, color: '#333' }}>Controle de Caixa</h2>
                    <button 
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: 24,
                            cursor: 'pointer',
                            color: '#666'
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Saldo atual */}
                <div style={{
                    background: '#e8f5e9',
                    padding: 16,
                    borderRadius: 8,
                    marginBottom: 24,
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#388e3c' }}>
                        Saldo Atual: R$ {currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', marginBottom: 24, borderBottom: '1px solid #eee' }}>
                    <button
                        onClick={() => setActiveTab('open')}
                        style={{
                            padding: '12px 24px',
                            background: activeTab === 'open' ? '#1976d2' : 'transparent',
                            color: activeTab === 'open' ? '#fff' : '#666',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 600,
                            borderBottom: activeTab === 'open' ? '3px solid #1976d2' : 'none'
                        }}
                    >
                        <FaPlus style={{ marginRight: 8 }} />
                        Abertura
                    </button>
                    <button
                        onClick={() => setActiveTab('withdraw')}
                        style={{
                            padding: '12px 24px',
                            background: activeTab === 'withdraw' ? '#1976d2' : 'transparent',
                            color: activeTab === 'withdraw' ? '#fff' : '#666',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 600,
                            borderBottom: activeTab === 'withdraw' ? '3px solid #1976d2' : 'none'
                        }}
                    >
                        <FaMinus style={{ marginRight: 8 }} />
                        Saída
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        style={{
                            padding: '12px 24px',
                            background: activeTab === 'history' ? '#1976d2' : 'transparent',
                            color: activeTab === 'history' ? '#fff' : '#666',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 600,
                            borderBottom: activeTab === 'history' ? '3px solid #1976d2' : 'none'
                        }}
                    >
                        <FaHistory style={{ marginRight: 8 }} />
                        Histórico
                    </button>
                </div>

                {/* Conteúdo das tabs */}
                {activeTab === 'open' && (
                    <div>
                        <h3 style={{ marginBottom: 16 }}>Abertura de Caixa</h3>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                                Valor de Abertura:
                            </label>
                            <input
                                type="number"
                                value={cashData.openingAmount}
                                onChange={(e) => setCashData({ ...cashData, openingAmount: e.target.value })}
                                placeholder="0,00"
                                step="0.01"
                                style={{
                                    width: '100%',
                                    padding: 12,
                                    border: '1px solid #ddd',
                                    borderRadius: 6,
                                    fontSize: 16
                                }}
                            />
                        </div>
                        <button
                            onClick={handleOpenCash}
                            style={{
                                width: '100%',
                                padding: 12,
                                background: '#388e3c',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: 16
                            }}
                        >
                            Abrir Caixa
                        </button>
                    </div>
                )}

                {activeTab === 'withdraw' && (
                    <div>
                        <h3 style={{ marginBottom: 16 }}>Registrar Saída</h3>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                                Tipo de Saída:
                            </label>
                            <select
                                value={cashData.withdrawType}
                                onChange={(e) => setCashData({ ...cashData, withdrawType: e.target.value, employeeId: '' })}
                                style={{
                                    width: '100%',
                                    padding: 12,
                                    border: '1px solid #ddd',
                                    borderRadius: 6,
                                    fontSize: 16
                                }}
                            >
                                <option value="sangria">Sangria</option>
                                <option value="vale">Vale Funcionário</option>
                                <option value="outro">Outro</option>
                            </select>
                        </div>

                        {cashData.withdrawType === 'vale' && (
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                                    Funcionário:
                                </label>
                                <select
                                    value={cashData.employeeId}
                                    onChange={(e) => setCashData({ ...cashData, employeeId: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: 12,
                                        border: '1px solid #ddd',
                                        borderRadius: 6,
                                        fontSize: 16
                                    }}
                                >
                                    <option value="">Selecione um funcionário</option>
                                    {employees.map(employee => (
                                        <option key={employee.id} value={employee.id}>
                                            {employee.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                                Valor:
                            </label>
                            <input
                                type="number"
                                value={cashData.withdrawAmount}
                                onChange={(e) => setCashData({ ...cashData, withdrawAmount: e.target.value })}
                                placeholder="0,00"
                                step="0.01"
                                style={{
                                    width: '100%',
                                    padding: 12,
                                    border: '1px solid #ddd',
                                    borderRadius: 6,
                                    fontSize: 16
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                                Motivo:
                            </label>
                            <textarea
                                value={cashData.withdrawReason}
                                onChange={(e) => setCashData({ ...cashData, withdrawReason: e.target.value })}
                                placeholder="Descreva o motivo da saída..."
                                rows="3"
                                style={{
                                    width: '100%',
                                    padding: 12,
                                    border: '1px solid #ddd',
                                    borderRadius: 6,
                                    fontSize: 16,
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                        <button
                            onClick={handleWithdraw}
                            style={{
                                width: '100%',
                                padding: 12,
                                background: '#f57c00',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: 16
                            }}
                        >
                            Registrar Saída
                        </button>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div>
                        <h3 style={{ marginBottom: 16 }}>Histórico de Movimentações</h3>
                        {cashHistory.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#666', padding: 40 }}>
                                Nenhuma movimentação encontrada.
                            </div>
                        ) : (
                            <div style={{ maxHeight: 400, overflow: 'auto' }}>
                                {cashHistory.map((movement) => (
                                    <div
                                        key={movement.id}
                                        style={{
                                            padding: 12,
                                            border: '1px solid #eee',
                                            borderRadius: 6,
                                            marginBottom: 8,
                                            background: movement.type === 'entrada' ? '#e8f5e9' : '#fff3e0'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>
                                                    {movement.type === 'entrada' ? 'Abertura' : getWithdrawTypeLabel(movement.withdrawType)}
                                                </div>
                                                <div style={{ fontSize: 14, color: '#666' }}>
                                                    {movement.reason || 'Abertura de caixa'}
                                                    {movement.employeeName && ` - ${movement.employeeName}`}
                                                </div>
                                                <div style={{ fontSize: 12, color: '#999' }}>
                                                    {new Date(movement.createdAt).toLocaleString('pt-BR')}
                                                </div>
                                            </div>
                                            <div style={{
                                                fontWeight: 700,
                                                color: movement.type === 'entrada' ? '#388e3c' : '#f57c00'
                                            }}>
                                                {movement.type === 'entrada' ? '+' : '-'} R$ {movement.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CashModal;
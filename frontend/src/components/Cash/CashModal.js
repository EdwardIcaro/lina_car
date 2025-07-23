import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaMinus, FaHistory, FaCog } from 'react-icons/fa';
import axios from 'axios';

const CashModal = ({ onClose, initialTab }) => {
    const [activeTab, setActiveTab] = useState(initialTab || 'open'); // 'open', 'withdraw', 'history'
    const [cashData, setCashData] = useState({
        openingAmount: '',
        withdrawAmount: '',
        withdrawReason: '',
        withdrawType: 'sangria' // 'sangria', 'vale', 'outro'
    });
    const [cashHistory, setCashHistory] = useState([]);
    const [currentBalance, setCurrentBalance] = useState(0);
    const [employees, setEmployees] = useState([]);
    const [isCashOpen, setIsCashOpen] = useState(false);
    const [todayAbertura, setTodayAbertura] = useState(null);
    const [closeData, setCloseData] = useState({
        dinheiro: '',
        cartao: '',
        pix: '',
        localiza: '',
        saidas: ''
    });
    const [closeStep, setCloseStep] = useState(false);
    const [closeSuccess, setCloseSuccess] = useState(false);
    const [closeErrors, setCloseErrors] = useState({});
    const [closeLoading, setCloseLoading] = useState(false);
    const [closeDiffs, setCloseDiffs] = useState(null);
    const [closeObservation, setCloseObservation] = useState('');
    const [closeObservationError, setCloseObservationError] = useState('');
    // Remover qualquer referência a showOptions, menu de opções, e a aba/fluxo de saída (withdraw) do modal de caixa.
    // Remover o bloco de activeTab === 'withdraw' e a lógica relacionada.

    useEffect(() => {
        fetchCashHistory();
        fetchCurrentBalance();
        fetchEmployees();
        checkCashOpen();
    }, []);

    useEffect(() => {
        if (closeStep) {
            localStorage.setItem('cashCloseProgress', JSON.stringify({ closeData, closeDiffs, closeObservation }));
        } else {
            localStorage.removeItem('cashCloseProgress');
        }
    }, [closeStep, closeData, closeDiffs, closeObservation]);

    useEffect(() => {
        const saved = localStorage.getItem('cashCloseProgress');
        if (saved) {
            const { closeData: cd, closeDiffs: diffs, closeObservation: obs } = JSON.parse(saved);
            setCloseData(cd || closeData);
            setCloseDiffs(diffs || null);
            setCloseObservation(obs || '');
            setCloseStep(true);
        }
    }, []);

    useEffect(() => {
        if (initialTab) setActiveTab(initialTab);
    }, [initialTab]);

    useEffect(() => {
        if (closeStep) {
            const beforeUnload = (e) => {
                e.preventDefault();
                e.returnValue = '';
            };
            window.addEventListener('beforeunload', beforeUnload);
            return () => window.removeEventListener('beforeunload', beforeUnload);
        }
    }, [closeStep]);

    const checkCashOpen = async () => {
        // Busca as movimentações do dia e verifica se já existe uma abertura
        try {
            const { data } = await axios.get('/api/cash/history');
            const start = new Date();
            start.setHours(0,0,0,0);
            const end = new Date();
            end.setHours(23,59,59,999);
            const todayMovements = data.filter(mov => {
                const d = new Date(mov.createdAt);
                return d >= start && d <= end;
            });
            // Considere o caixa aberto apenas se houver uma entrada sem closedAt
            const abertura = todayMovements.find(m => m.type === 'entrada' && !m.closedAt);
            setTodayAbertura(abertura || null);
            setIsCashOpen(!!abertura);
        } catch (error) {
            setIsCashOpen(false);
        }
    };

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
            setCashData({ ...cashData, openingAmount: '' });
            fetchCashHistory();
            fetchCurrentBalance();
            checkCashOpen();
            onClose(); // Fechar o modal imediatamente após abrir o caixa
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

    const validateCloseData = async () => {
        setCloseLoading(true);
        setCloseErrors({});
        setCloseDiffs(null);
        try {
            // Buscar pagamentos do dia
            const paymentsRes = await axios.get('/api/payments?hoje=1');
            const payments = paymentsRes.data;
            // Somar por método
            let dinheiro = 0, cartao = 0, pix = 0, localiza = 0;
            payments.forEach(p => {
                if (p.method === 'cash') dinheiro += p.amount;
                else if (p.method === 'credit' || p.method === 'debit') cartao += p.amount;
                else if (p.method === 'pix') pix += p.amount;
                if (p.workOrder?.isLocaliza) localiza += p.amount;
            });
            // Buscar saídas do dia
            const cashRes = await axios.get('/api/cash/history');
            const start = new Date();
            start.setHours(0,0,0,0);
            const end = new Date();
            end.setHours(23,59,59,999);
            const saidas = cashRes.data.filter(mov => {
                const d = new Date(mov.createdAt);
                return d >= start && d <= end && mov.type === 'saida';
            }).reduce((sum, mov) => sum + mov.amount, 0);
            // Calcular diferenças
            const diffs = {
                dinheiro: {
                    digitado: parseFloat(closeData.dinheiro || 0),
                    computado: dinheiro,
                    diff: parseFloat(closeData.dinheiro || 0) - dinheiro
                },
                cartao: {
                    digitado: parseFloat(closeData.cartao || 0),
                    computado: cartao,
                    diff: parseFloat(closeData.cartao || 0) - cartao
                },
                pix: {
                    digitado: parseFloat(closeData.pix || 0),
                    computado: pix,
                    diff: parseFloat(closeData.pix || 0) - pix
                },
                localiza: {
                    digitado: parseFloat(closeData.localiza || 0),
                    computado: localiza,
                    diff: parseFloat(closeData.localiza || 0) - localiza
                },
                saidas: {
                    digitado: parseFloat(closeData.saidas || 0),
                    computado: saidas,
                    diff: parseFloat(closeData.saidas || 0) - saidas
                }
            };
            setCloseDiffs(diffs);
            setCloseLoading(false);
            return true; // Sempre permite fechar
        } catch (err) {
            setCloseLoading(false);
            alert('Erro ao validar fechamento: ' + (err.response?.data?.message || 'Erro interno'));
            return false;
        }
    };

    const handleCloseCash = async () => {
        const valid = await validateCloseData();
        if (!valid) return;
        setCloseStep(true); // Mostra a tabela de diferenças antes de fechar
    };

    const confirmCloseCash = async () => {
        // Se houver diferença, observação é obrigatória
        const hasDiff = closeDiffs && Object.values(closeDiffs).some(val => Math.abs(val.diff) > 0.01);
        if (hasDiff && !closeObservation.trim()) {
            setCloseObservationError('Observação obrigatória para fechar com diferença.');
            return;
        }
        setCloseObservationError('');
        try {
            await axios.post('/api/cash/close', {
                observation: hasDiff ? closeObservation : ''
            });
            setCloseSuccess(true);
            setIsCashOpen(false);
            setActiveTab('open');
            setCloseData({ dinheiro: '', cartao: '', pix: '', localiza: '', saidas: '' });
            setCloseDiffs(null);
            setCloseStep(false);
            setCloseObservation('');
            fetchCashHistory();
            fetchCurrentBalance();
            checkCashOpen();
            onClose(); // Fechar o modal após fechar o caixa
        } catch (error) {
            alert('Erro ao fechar caixa: ' + (error.response?.data?.message || 'Erro interno'));
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

    const handleClose = () => {
        if (closeStep) {
            alert('Finalize o fechamento do caixa para sair.');
            return;
        }
        onClose();
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
                        onClick={handleClose}
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
                {/* Fluxo de abertura */}
                {!isCashOpen && (
                    <div>
                        <h3 style={{ marginBottom: 16 }}>Abertura de Caixa</h3>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                                Fundo de caixa:
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
                {/* Fluxo de fechamento */}
                {isCashOpen && (
                    <div>
                        <h3 style={{ marginBottom: 16 }}>Fechamento de Caixa</h3>
                        {!closeStep && (
                        <>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Dinheiro:</label>
                            <input
                                type="number"
                                value={closeData.dinheiro}
                                onChange={e => setCloseData({ ...closeData, dinheiro: e.target.value })}
                                placeholder="0,00"
                                step="0.01"
                                style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 6, fontSize: 16 }}
                            />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Cartão:</label>
                            <input
                                type="number"
                                value={closeData.cartao}
                                onChange={e => setCloseData({ ...closeData, cartao: e.target.value })}
                                placeholder="0,00"
                                step="0.01"
                                style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 6, fontSize: 16 }}
                            />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Pix:</label>
                            <input
                                type="number"
                                value={closeData.pix}
                                onChange={e => setCloseData({ ...closeData, pix: e.target.value })}
                                placeholder="0,00"
                                step="0.01"
                                style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 6, fontSize: 16 }}
                            />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Localiza:</label>
                            <input
                                type="number"
                                value={closeData.localiza}
                                onChange={e => setCloseData({ ...closeData, localiza: e.target.value })}
                                placeholder="0,00"
                                step="0.01"
                                style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 6, fontSize: 16 }}
                            />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Saídas:</label>
                            <input
                                type="number"
                                value={closeData.saidas}
                                onChange={e => setCloseData({ ...closeData, saidas: e.target.value })}
                                placeholder="0,00"
                                step="0.01"
                                style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 6, fontSize: 16 }}
                            />
                        </div>
                        <button
                            style={{
                                width: '100%',
                                padding: 12,
                                background: '#388e3c',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                cursor: closeLoading ? 'not-allowed' : 'pointer',
                                fontWeight: 600,
                                fontSize: 16,
                                opacity: closeLoading ? 0.7 : 1
                            }}
                            onClick={handleCloseCash}
                            disabled={closeLoading}
                        >
                            {closeLoading ? 'Validando...' : 'Finalizar Fechamento'}
                        </button>
                        <button
                            style={{
                                width: '100%',
                                padding: 12,
                                background: '#ccc',
                                color: '#333',
                                border: 'none',
                                borderRadius: 6,
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: 16,
                                marginTop: 8
                            }}
                            onClick={() => setActiveTab('open')}
                        >
                            Cancelar
                        </button>
                        </>
                        )}
                        {/* Resumo/conferência dos valores antes da confirmação final */}
                        {closeStep && (
                        <>
                        <h4 style={{ margin: '24px 0 8px 0' }}>Resumo do Fechamento</h4>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
                            <thead>
                                <tr style={{ background: '#f5f5f5' }}>
                                    <th style={{ padding: 8, border: '1px solid #eee' }}>Tipo</th>
                                    <th style={{ padding: 8, border: '1px solid #eee' }}>Valor Digitado</th>
                                    <th style={{ padding: 8, border: '1px solid #eee' }}>Valor Computado</th>
                                    <th style={{ padding: 8, border: '1px solid #eee' }}>Diferença</th>
                                </tr>
                            </thead>
                            <tbody>
                                {closeDiffs && Object.entries(closeDiffs).map(([tipo, val]) => (
                                    <tr key={tipo}>
                                        <td style={{ padding: 8, border: '1px solid #eee', fontWeight: 600 }}>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</td>
                                        <td style={{ padding: 8, border: '1px solid #eee' }}>R$ {val.digitado.toFixed(2)}</td>
                                        <td style={{ padding: 8, border: '1px solid #eee' }}>R$ {val.computado.toFixed(2)}</td>
                                        <td style={{ padding: 8, border: '1px solid #eee', color: Math.abs(val.diff) > 0.01 ? '#e53935' : '#388e3c', fontWeight: 600 }}>
                                            {val.diff.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* Campo de observação obrigatório se houver diferença */}
                        {closeDiffs && Object.values(closeDiffs).some(val => Math.abs(val.diff) > 0.01) && (
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Observação (obrigatória para fechar com diferença):</label>
                                <textarea
                                    value={closeObservation}
                                    onChange={e => setCloseObservation(e.target.value)}
                                    rows={3}
                                    style={{ width: '100%', padding: 12, border: closeObservationError ? '2px solid #e53935' : '1px solid #ddd', borderRadius: 6, fontSize: 16 }}
                                />
                                {closeObservationError && <div style={{ color: '#e53935', fontWeight: 600 }}>{closeObservationError}</div>}
                            </div>
                        )}
                        <button
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
                            onClick={confirmCloseCash}
                        >
                            Confirmar Fechamento
                        </button>
                        {closeSuccess && (
                            <div style={{ marginTop: 24, background: '#e8f5e9', color: '#388e3c', padding: 16, borderRadius: 8, textAlign: 'center', fontWeight: 600 }}>
                                Caixa fechado com sucesso!
                            </div>
                        )}
                        </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CashModal;
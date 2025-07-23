import React, { useEffect, useState } from 'react';
import KanbanBoard from '../components/Kanban/KanbanBoard';
import CashModal from '../components/Cash/CashModal';
import CashWithdrawModal from '../components/Cash/CashWithdrawModal';
import axios from 'axios';
import { FaCashRegister, FaEye, FaEyeSlash, FaPlusCircle, FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [kpis, setKpis] = useState({
        andamento: 0,
        faturamento: 0,
        finalizadas: 0,
        localiza: 0
    });
    const [showCashModal, setShowCashModal] = useState(false);
    const [cashBalance, setCashBalance] = useState(null);
    const [showBalance, setShowBalance] = useState(false);
    const [cashModalTab, setCashModalTab] = useState(null); // 'open', 'close', etc.
    const [showOptions, setShowOptions] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);

    const handleOpenCashModal = (tab = null) => {
        setCashModalTab(tab);
        setShowCashModal(true);
    };

    // Buscar status do caixa aberto
    const [isCashOpen, setIsCashOpen] = useState(false);
    useEffect(() => {
        const checkCashOpen = async () => {
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
                setIsCashOpen(!!abertura);
            } catch (error) {
                setIsCashOpen(false);
            }
        };
        checkCashOpen();
    }, [showCashModal]);

    useEffect(() => {
        const fetchKpis = async () => {
            try {
                const { data: andamento } = await axios.get('/api/orders/dashboard');
                const { data: finalizadas } = await axios.get('/api/orders?finalizadasHoje=1');
                const { data: pagamentos } = await axios.get('/api/payments?hoje=1');
                const localizaPagamentos = pagamentos.filter(p => p.method === 'localiza');
                const faturamento = pagamentos.reduce((sum, p) => sum + p.amount, 0);
                setKpis({
                    andamento: andamento.length,
                    faturamento,
                    finalizadas: finalizadas.length,
                    localiza: localizaPagamentos.reduce((sum, p) => sum + p.amount, 0)
                });
            } catch (e) {
                setKpis({ andamento: 0, faturamento: 0, finalizadas: 0, localiza: 0 });
            }
        };
        fetchKpis();
    }, []);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const { data } = await axios.get('/api/cash/balance');
                setCashBalance(data.balance);
            } catch (e) {
                setCashBalance(0);
            }
        };
        fetchBalance();
    }, [showCashModal]);

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <h1 style={{ color: '#1976d2', margin: 0 }}>Dashboard</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative' }}>
                    {/* Botão de opções do caixa */}
                    <button
                        onClick={() => setShowOptions((v) => !v)}
                        style={{
                            background: '#e3f2fd',
                            border: 'none',
                            borderRadius: 8,
                            padding: 8,
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px #0001',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }}
                        title="Opções do Caixa"
                    >
                        <FaCog size={20} />
                        Opções
                    </button>
                    {showOptions && (
                        <div style={{
                            position: 'absolute',
                            right: 0,
                            top: 60,
                            background: '#fff',
                            borderRadius: 8,
                            boxShadow: '0 2px 16px #0002',
                            padding: 16,
                            zIndex: 3000,
                            minWidth: 180
                        }}>
                            <div style={{ fontWeight: 600, marginBottom: 8 }}>Ações do Caixa</div>
                            <button
                                style={{
                                    width: '100%',
                                    padding: 10,
                                    background: '#fff',
                                    border: '1px solid #eee',
                                    borderRadius: 6,
                                    marginBottom: 8,
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                                onClick={() => {
                                    setShowWithdrawModal(true);
                                    setShowOptions(false);
                                }}
                            >Registrar Saída</button>
                            {/* Outras opções futuras */}
                        </div>
                    )}
                    {showWithdrawModal && (
                        <CashWithdrawModal
                            onClose={() => setShowWithdrawModal(false)}
                            onSuccess={() => {
                                setShowWithdrawModal(false);
                                // Atualizar dados do dashboard se necessário
                            }}
                        />
                    )}
                    {/* Botão de caixa unificado */}
                    <button
                        onClick={() => handleOpenCashModal(isCashOpen ? 'close' : 'open')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '12px 20px',
                            background: isCashOpen ? '#f57c00' : '#1976d2',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: 16
                        }}
                    >
                        <FaCashRegister size={20} style={isCashOpen ? { transform: 'rotate(180deg)' } : {}} />
                        {isCashOpen ? 'Fechar Caixa' : 'Abrir Caixa'}
                    </button>
                    <button
                        onClick={() => navigate('/new-order')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '12px 20px',
                            background: '#43a047',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: 16
                        }}
                    >
                        <FaPlusCircle size={20} />
                        Nova Ordem
                    </button>
                </div>
            </div>
            {/* KPIs principais */}
            <div style={{ display: 'flex', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 220, background: '#e3f2fd', borderRadius: 12, padding: 24, textAlign: 'center', boxShadow: '0 2px 8px #0001' }}>
                    <div style={{ fontSize: 32, fontWeight: 700 }}>{kpis.andamento}</div>
                    <div style={{ color: '#1976d2', fontWeight: 600 }}>Ordens em andamento</div>
                </div>
                <div style={{ flex: 1, minWidth: 220, background: '#e8f5e9', borderRadius: 12, padding: 24, textAlign: 'center', boxShadow: '0 2px 8px #0001' }}>
                    <div style={{ fontSize: 32, fontWeight: 700 }}>R$ {kpis.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <div style={{ color: '#388e3c', fontWeight: 600 }}>Faturamento do dia</div>
                </div>
                <div style={{ flex: 1, minWidth: 220, background: '#fff3e0', borderRadius: 12, padding: 24, textAlign: 'center', boxShadow: '0 2px 8px #0001' }}>
                    <div style={{ fontSize: 32, fontWeight: 700 }}>{kpis.finalizadas}</div>
                    <div style={{ color: '#f57c00', fontWeight: 600 }}>Finalizadas hoje</div>
                </div>
                <div style={{ flex: 1, minWidth: 220, background: '#fce4ec', borderRadius: 12, padding: 24, textAlign: 'center', boxShadow: '0 2px 8px #0001' }}>
                    <div style={{ fontSize: 32, fontWeight: 700 }}>R$ {kpis.localiza.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <div style={{ color: '#c2185b', fontWeight: 600 }}>Pagamentos Localiza</div>
                </div>
            </div>
            {/* KanbanBoard abaixo dos KPIs */}
            <KanbanBoard />
            
            {/* Modal de Caixa */}
            {showCashModal && (
                <CashModal onClose={() => setShowCashModal(false)} initialTab={cashModalTab} />
            )}
        </div>
    );
};

export default DashboardPage; 
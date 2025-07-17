import React, { useEffect, useState } from 'react';
import KanbanBoard from '../components/Kanban/KanbanBoard';
import CashModal from '../components/Cash/CashModal';
import axios from 'axios';
import { FaCashRegister, FaEye, FaEyeSlash } from 'react-icons/fa';

const DashboardPage = () => {
    const [kpis, setKpis] = useState({
        andamento: 0,
        faturamento: 0,
        finalizadas: 0,
        localiza: 0
    });
    const [showCashModal, setShowCashModal] = useState(false);
    const [cashBalance, setCashBalance] = useState(null);
    const [showBalance, setShowBalance] = useState(false);

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
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{
                        background: '#e8f5e9',
                        borderRadius: 8,
                        padding: '12px 28px',
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: 700,
                        color: '#388e3c',
                        fontSize: 22,
                        minWidth: 220
                    }}>
                        Saldo Atual:&nbsp;
                        {showBalance
                            ? `R$ ${Number(cashBalance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                            : '****'}
                        <button
                            onClick={() => setShowBalance(v => !v)}
                            style={{
                                background: 'none',
                                border: 'none',
                                marginLeft: 12,
                                cursor: 'pointer',
                                color: '#388e3c',
                                fontSize: 26
                            }}
                            title={showBalance ? 'Ocultar valores' : 'Mostrar valores'}
                        >
                            {showBalance ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    <button
                        onClick={() => setShowCashModal(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '12px 20px',
                            background: '#1976d2',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: 16
                        }}
                    >
                        <FaCashRegister size={20} />
                        Caixa
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
                <CashModal onClose={() => setShowCashModal(false)} />
            )}
        </div>
    );
};

export default DashboardPage; 
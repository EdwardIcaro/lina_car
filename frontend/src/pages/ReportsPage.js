import React, { useState, useEffect } from 'react';
import { FaFilter, FaDownload, FaChartBar, FaCalendarAlt, FaMoneyBillWave, FaCreditCard, FaQrcode } from 'react-icons/fa';
import axios from 'axios';

const ReportsPage = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    method: '',
    employee: '',
    minAmount: '',
    maxAmount: ''
  });
  const [employees, setEmployees] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchEmployees();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [payments, filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/payments');
      setPayments(data);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
    } finally {
      setLoading(false);
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

  const applyFilters = () => {
    let filtered = [...payments];

    if (filters.dateFrom) {
      filtered = filtered.filter(payment => 
        new Date(payment.createdAt) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(payment => 
        new Date(payment.createdAt) <= new Date(filters.dateTo + 'T23:59:59')
      );
    }

    if (filters.method) {
      filtered = filtered.filter(payment => payment.method === filters.method);
    }

    if (filters.employee) {
      filtered = filtered.filter(payment => 
        payment.workOrder?.employee?.id === filters.employee
      );
    }

    if (filters.minAmount) {
      filtered = filtered.filter(payment => 
        payment.amount >= parseFloat(filters.minAmount)
      );
    }

    if (filters.maxAmount) {
      filtered = filtered.filter(payment => 
        payment.amount <= parseFloat(filters.maxAmount)
      );
    }

    setFilteredPayments(filtered);
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'pix': return <FaQrcode color="#32CD32" />;
      case 'cash': return <FaMoneyBillWave color="#FFD700" />;
      case 'debit': return <FaCreditCard color="#4169E1" />;
      case 'credit': return <FaCreditCard color="#FF4500" />;
      default: return <FaMoneyBillWave color="#666" />;
    }
  };

  const getMethodName = (method) => {
    switch (method) {
      case 'pix': return 'PIX';
      case 'cash': return 'Dinheiro';
      case 'debit': return 'Débito';
      case 'credit': return 'Crédito';
      default: return method;
    }
  };

  const calculateStats = () => {
    const stats = {
      total: 0,
      count: filteredPayments.length,
      byMethod: { pix: 0, cash: 0, debit: 0, credit: 0 },
      byEmployee: {},
      average: 0
    };

    filteredPayments.forEach(payment => {
      stats.total += payment.amount;
      stats.byMethod[payment.method] += payment.amount;
      
      const employeeName = payment.workOrder?.employee?.name || 'Sem funcionário';
      stats.byEmployee[employeeName] = (stats.byEmployee[employeeName] || 0) + payment.amount;
    });

    stats.average = stats.count > 0 ? stats.total / stats.count : 0;
    return stats;
  };

  const exportToCSV = () => {
    const headers = ['Data', 'Método', 'Valor', 'Cliente', 'Placa', 'Funcionário', 'Serviços'];
    const csvContent = [
      headers.join(','),
      ...filteredPayments.map(payment => [
        new Date(payment.createdAt).toLocaleDateString('pt-BR'),
        getMethodName(payment.method),
        payment.amount.toFixed(2),
        payment.workOrder?.vehicle?.customer?.name || '',
        payment.workOrder?.vehicle?.plate || '',
        payment.workOrder?.employee?.name || '',
        payment.workOrder?.services?.map(s => s.service.name).join('; ') || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_pagamentos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Carregando relatórios...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, color: '#333' }}>Relatórios de Pagamentos</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            <FaFilter />
            Filtros
          </button>
          <button
            onClick={exportToCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: '#388e3c',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            <FaDownload />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div style={{
          background: '#f5f5f5',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Filtros</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Data Inicial:</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Data Final:</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Método:</label>
              <select
                value={filters.method}
                onChange={(e) => setFilters(prev => ({ ...prev, method: e.target.value }))}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="">Todos</option>
                <option value="pix">PIX</option>
                <option value="cash">Dinheiro</option>
                <option value="debit">Débito</option>
                <option value="credit">Crédito</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Funcionário:</label>
              <select
                value={filters.employee}
                onChange={(e) => setFilters(prev => ({ ...prev, employee: e.target.value }))}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="">Todos</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Valor Mínimo:</label>
              <input
                type="number"
                value={filters.minAmount}
                onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                placeholder="0,00"
                step="0.01"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Valor Máximo:</label>
              <input
                type="number"
                value={filters.maxAmount}
                onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                placeholder="0,00"
                step="0.01"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Estatísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{
          background: '#e3f2fd',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>
            R$ {stats.total.toFixed(2)}
          </div>
          <div style={{ color: '#666' }}>Total Recebido</div>
        </div>
        <div style={{
          background: '#e8f5e9',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#388e3c' }}>
            {stats.count}
          </div>
          <div style={{ color: '#666' }}>Pagamentos</div>
        </div>
        <div style={{
          background: '#fff3e0',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f57c00' }}>
            R$ {stats.average.toFixed(2)}
          </div>
          <div style={{ color: '#666' }}>Média por Pagamento</div>
        </div>
      </div>

      {/* Estatísticas por Método */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>Por Método de Pagamento</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          {Object.entries(stats.byMethod).map(([method, amount]) => (
            <div key={method} style={{
              background: '#f5f5f5',
              padding: '16px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {getMethodIcon(method)}
              <div>
                <div style={{ fontWeight: 'bold' }}>R$ {amount.toFixed(2)}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{getMethodName(method)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de Pagamentos */}
      <div>
        <h3 style={{ marginBottom: '16px' }}>
          Pagamentos ({filteredPayments.length} registros)
        </h3>
        <div style={{
          background: '#fff',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '120px 100px 120px 1fr 100px 120px 1fr',
            gap: '16px',
            padding: '16px',
            background: '#f5f5f5',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            <div>Data</div>
            <div>Método</div>
            <div>Valor</div>
            <div>Cliente</div>
            <div>Placa</div>
            <div>Funcionário</div>
            <div>Serviços</div>
          </div>
          {filteredPayments.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              Nenhum pagamento encontrado com os filtros aplicados.
            </div>
          ) : (
            filteredPayments.map((payment) => (
              <div key={payment.id} style={{
                display: 'grid',
                gridTemplateColumns: '120px 100px 120px 1fr 100px 120px 1fr',
                gap: '16px',
                padding: '16px',
                borderBottom: '1px solid #eee',
                alignItems: 'center'
              }}>
                {/* Data */}
                <div style={{ fontSize: '14px' }}>
                  {new Date(payment.createdAt).toLocaleDateString('pt-BR')}
                </div>
                {/* Método */}
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                    {getMethodName(payment.method)}
                  </div>
                </div>
                {/* Valor */}
                <div style={{ fontWeight: 'bold', color: '#1976d2' }}>
                  R$ {payment.amount.toFixed(2)}
                </div>
                {/* Cliente */}
                <div style={{ fontSize: '14px' }}>
                  {payment.workOrder?.vehicle?.customer?.name || '-'}
                </div>
                {/* Placa */}
                <div style={{ fontSize: '14px', color: '#f57c00' }}>
                  {payment.workOrder?.vehicle?.plate || '-'}
                </div>
                {/* Funcionário */}
                <div style={{ fontSize: '14px' }}>
                  {payment.workOrder?.employee?.name || '-'}
                </div>
                {/* Serviços */}
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {payment.workOrder?.customService || payment.workOrder?.services?.map(s => s.service.name).join(', ') || '-'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage; 
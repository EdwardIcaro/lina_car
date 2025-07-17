import React, { useState } from 'react';
import { FaCreditCard, FaMoneyBillWave, FaQrcode, FaCalculator, FaPlus, FaTrash } from 'react-icons/fa';

const PaymentModal = ({ order, onClose, onComplete }) => {
  const [payments, setPayments] = useState([]);
  const [currentPayment, setCurrentPayment] = useState({ method: '', amount: '', received: '' });
  const [showCalculator, setShowCalculator] = useState(false);

  const paymentMethods = [
    { id: 'pix', name: 'PIX', icon: FaQrcode, color: '#32CD32' },
    { id: 'cash', name: 'Dinheiro', icon: FaMoneyBillWave, color: '#FFD700' },
    { id: 'debit', name: 'Débito', icon: FaCreditCard, color: '#4169E1' },
    { id: 'credit', name: 'Crédito', icon: FaCreditCard, color: '#FF4500' }
  ];

  const totalPaid = payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
  const remaining = order.totalPrice - totalPaid;
  const isComplete = remaining <= 0;

  const handleMethodSelect = (method) => {
    setCurrentPayment(prev => ({ ...prev, method: method.id }));
    setShowCalculator(method.id === 'cash');
  };

  const handleAddPayment = () => {
    if (!currentPayment.method || !currentPayment.amount) return;
    
    const newPayment = {
      id: Date.now(),
      method: currentPayment.method,
      amount: parseFloat(currentPayment.amount),
      received: currentPayment.received ? parseFloat(currentPayment.received) : null,
      change: currentPayment.received ? parseFloat(currentPayment.received) - parseFloat(currentPayment.amount) : null
    };

    setPayments(prev => [...prev, newPayment]);
    setCurrentPayment({ method: '', amount: '', received: '' });
    setShowCalculator(false);
  };

  const handleRemovePayment = (paymentId) => {
    setPayments(prev => prev.filter(p => p.id !== paymentId));
  };

  const handleCompletePayment = () => {
    if (!isComplete) return;

    const paymentData = {
      payments: payments,
      totalPaid: totalPaid,
      change: payments.reduce((total, payment) => {
        return total + (payment.change || 0);
      }, 0)
    };

    onComplete(order.id, paymentData);
  };

  const getMethodInfo = (methodId) => {
    return paymentMethods.find(m => m.id === methodId);
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, color: '#333' }}>Finalizar Pedido</h2>
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
            ×
          </button>
        </div>

        {/* Informações do pedido */}
        <div style={{ 
          background: '#f5f5f5', 
          padding: 16, 
          borderRadius: 8, 
          marginBottom: 20 
        }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>
            {order.customService ? `Serviço: ${order.customService}` : `Placa: ${order.vehicle?.plate}`}
          </div>
          <div style={{ marginBottom: 4 }}>
            Cliente: {order.vehicle?.customer?.name}
          </div>
          <div style={{ marginBottom: 4 }}>
            Serviços: {order.customService || order.services.map(s => s.service.name).join(', ')}
          </div>
          <div style={{ fontWeight: 600, fontSize: 18, color: '#1976d2' }}>
            Total: R$ {order.totalPrice.toFixed(2)}
          </div>
        </div>

        {/* Resumo dos pagamentos */}
        {payments.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 12, color: '#333' }}>Pagamentos Realizados:</h3>
            {payments.map((payment) => {
              const methodInfo = getMethodInfo(payment.method);
              return (
                <div key={payment.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#f9f9f9',
                  borderRadius: 6,
                  marginBottom: 8
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <methodInfo.icon color={methodInfo.color} size={16} />
                    <span style={{ fontWeight: 600 }}>{methodInfo.name}</span>
                    <span>R$ {payment.amount.toFixed(2)}</span>
                    {payment.change !== null && (
                      <span style={{ fontSize: 12, color: '#666' }}>
                        (recebido: R$ {payment.received.toFixed(2)}, troco: R$ {payment.change.toFixed(2)})
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemovePayment(payment.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ff6b6b',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                    title="Remover pagamento"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              );
            })}
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px',
              background: '#e8f5e9',
              borderRadius: 6,
              fontWeight: 600
            }}>
              <span>Total Pago:</span>
              <span>R$ {totalPaid.toFixed(2)}</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 12px',
              background: remaining > 0 ? '#fff3e0' : '#e8f5e9',
              borderRadius: 6,
              fontWeight: 600,
              color: remaining > 0 ? '#f57c00' : '#388e3c'
            }}>
              <span>{remaining > 0 ? 'Faltando:' : 'Pagamento Completo!'}</span>
              <span>R$ {Math.abs(remaining).toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Adicionar novo pagamento */}
        {!isComplete && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16, color: '#333' }}>
              {payments.length === 0 ? 'Escolha o método de pagamento:' : 'Adicionar pagamento:'}
            </h3>
            
            {/* Métodos de pagamento */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: 12,
              marginBottom: 16
            }}>
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleMethodSelect(method)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '16px 12px',
                    border: currentPayment.method === method.id ? `2px solid ${method.color}` : '2px solid #e0e0e0',
                    borderRadius: 8,
                    background: currentPayment.method === method.id ? `${method.color}15` : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: 80
                  }}
                  onMouseEnter={(e) => {
                    if (currentPayment.method !== method.id) {
                      e.target.style.borderColor = method.color;
                      e.target.style.background = `${method.color}10`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPayment.method !== method.id) {
                      e.target.style.borderColor = '#e0e0e0';
                      e.target.style.background = '#fff';
                    }
                  }}
                >
                  <method.icon 
                    size={24} 
                    color={method.color} 
                    style={{ marginBottom: 6 }}
                  />
                  <span style={{ 
                    fontWeight: 600, 
                    color: '#333',
                    fontSize: 12
                  }}>
                    {method.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Campo de valor */}
            {currentPayment.method && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                  Valor para {getMethodInfo(currentPayment.method)?.name}:
                </label>
                <input
                  type="number"
                  value={currentPayment.amount}
                  onChange={(e) => setCurrentPayment(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder={`Máximo: R$ ${remaining.toFixed(2)}`}
                  max={remaining}
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    fontSize: 16
                  }}
                />
              </div>
            )}

            {/* Calculadora para dinheiro */}
            {showCalculator && currentPayment.amount && (
              <div style={{ 
                background: '#f9f9f9', 
                padding: 16, 
                borderRadius: 8, 
                marginBottom: 16 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                  <FaCalculator style={{ marginRight: 8, color: '#666' }} />
                  <span style={{ fontWeight: 600 }}>Valor recebido:</span>
                </div>
                <input
                  type="number"
                  value={currentPayment.received}
                  onChange={(e) => setCurrentPayment(prev => ({ ...prev, received: e.target.value }))}
                  placeholder="0,00"
                  min={currentPayment.amount}
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    fontSize: 16,
                    marginBottom: 8
                  }}
                />
                {currentPayment.received && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderTop: '1px solid #ddd'
                  }}>
                    <span>Troco:</span>
                    <span style={{ 
                      fontWeight: 600, 
                      color: (parseFloat(currentPayment.received) - parseFloat(currentPayment.amount)) >= 0 ? '#388e3c' : '#f44336'
                    }}>
                      R$ {(parseFloat(currentPayment.received) - parseFloat(currentPayment.amount)).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Botão adicionar pagamento */}
            {currentPayment.method && currentPayment.amount && (
              <button
                onClick={handleAddPayment}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1976d2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <FaPlus size={14} />
                Adicionar Pagamento
              </button>
            )}
          </div>
        )}

        {/* Botões de ação */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: 6,
              background: '#fff',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleCompletePayment}
            disabled={!isComplete}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: 6,
              background: isComplete ? '#388e3c' : '#ccc',
              color: '#fff',
              cursor: isComplete ? 'pointer' : 'not-allowed',
              fontWeight: 600
            }}
          >
            Finalizar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 
import React, { useState } from 'react';
import { FaUserCircle, FaArrowRight, FaTrash } from 'react-icons/fa';

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `há ${diffMin}min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `há ${diffD}d`;
}

const WorkOrderCard = ({ order, onFinish, onDelete, onFinalize }) => {
  const [showActions, setShowActions] = useState(false);
  const employee = order.employee;
  const customer = order.vehicle?.customer;

  const handleAdvance = () => {
    if (order.status === 'AWAITING') {
      onFinish(order.id, 'WASHING');
    } else if (order.status === 'WASHING') {
      onFinish(order.id, 'READY');
    }
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir este pedido?')) {
      onDelete(order.id);
    }
  };

  return (
    <div 
      className="workorder-card" 
      style={{ 
        border: order.isLocaliza ? '3px solid #43a047' : 'none',
        borderRadius: 12, 
        padding: 16, 
        marginBottom: 8, 
        background: '#fff', 
        boxShadow: '0 2px 8px #0002', 
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 2 }}>
        {order.customService ? `Serviço: ${order.customService}` : `Placa: ${order.vehicle?.plate}`}
      </div>
      <div style={{ color: '#1976d2', fontWeight: 500, marginBottom: 2 }}>Cliente: {customer?.name}</div>
      <div style={{ marginBottom: 2 }}>
        <b>Serviços:</b> 
        <span title={order.customService || order.services.map(s => s.service.name).join(', ')}>
          {order.customService || order.services.map(s => s.service.name).join(', ')}
        </span>
      </div>
      <div style={{ marginBottom: 2 }}><b>Total:</b> R$ {order.totalPrice.toFixed(2)}</div>
      {employee && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span title={`Funcionário: ${employee.name}\nGanho: ${order.employeePercentage || employee.percentage}%\nCliente: ${customer?.name}\nTelefone: ${customer?.phone}`}
                style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
            <span style={{
              width: 28, height: 28, borderRadius: '50%', background: '#1976d2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16
            }}>{employee.name[0]}</span>
            <span style={{ fontWeight: 500 }}>{employee.name}</span>
            <span style={{ color: '#888', fontSize: 13 }}>({order.employeePercentage || employee.percentage}%)</span>
          </span>
        </div>
      )}
      <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Criado {timeAgo(order.createdAt)}</div>
      
      {/* Botão de finalizar quando estiver pronto */}
      {order.status === 'READY' && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onFinalize(order);
          }}
          style={{ 
            marginTop: 10, 
            background: '#388e3c', 
            color: '#fff', 
            border: 'none', 
            borderRadius: 6, 
            padding: '8px 16px', 
            cursor: 'pointer', 
            fontWeight: 600,
            width: '100%'
          }}
        >
          Finalizar e Pagar
        </button>
      )}
      
      {/* Ações que aparecem no hover */}
      {showActions && (
        <div style={{ 
          position: 'absolute', 
          top: 8, 
          right: 8, 
          display: 'flex', 
          gap: 8,
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 6,
          padding: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {/* Lixeira sutil */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#ff6b6b', 
              cursor: 'pointer', 
              padding: '4px',
              borderRadius: 4,
              transition: 'all 0.2s ease',
              fontSize: 12
            }}
            onMouseEnter={(e) => e.target.style.background = '#ffebee'}
            onMouseLeave={(e) => e.target.style.background = 'none'}
            title="Excluir pedido"
          >
            <FaTrash />
          </button>
          
          {/* Seta para avançar (só aparece se não estiver no último status) */}
          {order.status !== 'READY' && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleAdvance();
              }}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#388e3c', 
                cursor: 'pointer', 
                padding: '4px',
                borderRadius: 4,
                transition: 'all 0.2s ease',
                fontSize: 12
              }}
              onMouseEnter={(e) => e.target.style.background = '#e8f5e8'}
              onMouseLeave={(e) => e.target.style.background = 'none'}
              title={order.status === 'AWAITING' ? 'Iniciar lavagem' : 'Finalizar pedido'}
            >
              <FaArrowRight />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkOrderCard; 
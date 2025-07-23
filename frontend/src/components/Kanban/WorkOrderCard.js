import React, { useState } from 'react';
import { FaUserCircle, FaArrowRight, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
    setShowDeleteConfirm(true);
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
        <span title={order.customService || (Array.isArray(order.services) ? order.services.map(s => s.service.name).join(', ') : '')}>
          {order.customService || (Array.isArray(order.services) ? order.services.map(s => s.service.name).join(', ') : '')}
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
      {/* Modal de confirmação de exclusão */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 10,
            padding: 32,
            boxShadow: '0 2px 16px #0003',
            minWidth: 320,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Confirmar exclusão</div>
            <div style={{ marginBottom: 24 }}>Tem certeza que deseja excluir este pedido?</div>
            <button
              style={{
                background: '#ff6b6b',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '8px 24px',
                fontWeight: 600,
                marginRight: 16,
                cursor: 'pointer'
              }}
              onClick={() => {
                setShowDeleteConfirm(false);
                onDelete(order.id);
                toast.success('Ordem de serviço excluída com sucesso!');
              }}
            >Excluir</button>
            <button
              style={{
                background: '#eee',
                color: '#333',
                border: 'none',
                borderRadius: 6,
                padding: '8px 24px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              onClick={() => setShowDeleteConfirm(false)}
            >Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrderCard; 
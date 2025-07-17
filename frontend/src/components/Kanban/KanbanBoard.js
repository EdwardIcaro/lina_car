import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { getDashboardOrders, updateOrderStatus, deleteOrder } from '../../services/api';
import WorkOrderCard from './WorkOrderCard';
import PaymentModal from '../Payment/PaymentModal';
import './Kanban.css';
import axios from 'axios';

const KanbanBoard = () => {
    const [columns, setColumns] = useState({
        AWAITING: { name: 'Aguardando', items: [] },
        WASHING: { name: 'Em Lavagem', items: [] },
        READY: { name: 'Pronto p/ Retirada', items: [] },
    });
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const columnColors = {
        AWAITING: '#e3f2fd', // azul claro
        WASHING: '#fff3e0', // laranja claro
        READY: '#e8f5e9',   // verde claro
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
            const { data: orders } = await getDashboardOrders();
            const newColumns = {
                AWAITING: { name: 'Aguardando', items: [] },
                WASHING: { name: 'Em Lavagem', items: [] },
                READY: { name: 'Pronto p/ Retirada', items: [] },
            };
            orders.forEach(order => {
                    if (selectedEmployee && order.employee && order.employee.id !== selectedEmployee) return;
                if (newColumns[order.status]) {
                    newColumns[order.status].items.push(order);
                }
            });
            setColumns(newColumns);
            } catch (error) {
                // Silenciar erros de sincronização automática para não poluir o console
                if (error.response && error.response.status === 500) {
                    console.warn('Erro temporário na sincronização - tentando novamente em breve');
                } else {
                    console.error('Erro ao sincronizar ordens:', error);
                }
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
        fetchOrders();
        fetchEmployees();
    }, [selectedEmployee]);

    // Sincronização automática a cada 5 segundos
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data: orders } = await getDashboardOrders();
                const newColumns = {
                    AWAITING: { name: 'Aguardando', items: [] },
                    WASHING: { name: 'Em Lavagem', items: [] },
                    READY: { name: 'Pronto p/ Retirada', items: [] },
                };
                orders.forEach(order => {
                    if (selectedEmployee && order.employee && order.employee.id !== selectedEmployee) return;
                    if (newColumns[order.status]) {
                        newColumns[order.status].items.push(order);
                    }
                });
                setColumns(newColumns);
            } catch (error) {
                // Silenciar erros de sincronização automática para não poluir o console
                if (error.response && error.response.status === 500) {
                    console.warn('Erro temporário na sincronização - tentando novamente em breve');
                } else {
                    console.error('Erro ao sincronizar ordens:', error);
                }
            }
        };

        // Primeira busca imediata
        fetchOrders();

        // Configurar intervalo com retry em caso de erro
        const interval = setInterval(async () => {
            try {
                await fetchOrders();
            } catch (error) {
                // Em caso de erro, aguarda um pouco mais antes da próxima tentativa
                if (error.response && error.response.status === 500) {
                    console.warn('Erro na sincronização - aguardando antes da próxima tentativa');
                    // Não faz nada, apenas aguarda o próximo intervalo
                }
            }
        }, 5000); // Sincroniza a cada 5 segundos

        return () => clearInterval(interval);
    }, [selectedEmployee]);

    const onDragEnd = async (result) => {
        const { source, destination } = result;
        if (!destination) return;

        // Verifica se as colunas existem
        if (!columns[source.droppableId] || !columns[destination.droppableId]) {
            console.error('Coluna não encontrada:', { source: source.droppableId, destination: destination.droppableId });
            return;
        }

        const sourceColumn = columns[source.droppableId];
        const destColumn = columns[destination.droppableId];
        const sourceItems = [...sourceColumn.items];
        const [removed] = sourceItems.splice(source.index, 1);

        // Atualiza o estado local primeiro
        const newColumns = { ...columns };

        if (source.droppableId === destination.droppableId) {
            sourceItems.splice(destination.index, 0, removed);
            newColumns[source.droppableId] = { ...sourceColumn, items: sourceItems };
        } else {
            const destItems = [...destColumn.items];
            destItems.splice(destination.index, 0, removed);
            newColumns[source.droppableId] = { ...sourceColumn, items: sourceItems };
            newColumns[destination.droppableId] = { ...destColumn, items: destItems };
        }
        
        setColumns(newColumns);

        // Atualiza o status no backend apenas se mudou de coluna
        if (source.droppableId !== destination.droppableId) {
            try {
            await updateOrderStatus(removed.id, destination.droppableId);
            } catch (error) {
                console.error('Erro ao atualizar status:', error);
                // Reverte as mudanças se houver erro
                const { data: orders } = await getDashboardOrders();
                const revertedColumns = {
                    AWAITING: { name: 'Aguardando', items: [] },
                    WASHING: { name: 'Em Lavagem', items: [] },
                    READY: { name: 'Pronto p/ Retirada', items: [] },
                };
                orders.forEach(order => {
                    if (selectedEmployee && order.employee && order.employee.id !== selectedEmployee) return;
                    if (revertedColumns[order.status]) {
                        revertedColumns[order.status].items.push(order);
                    }
                });
                setColumns(revertedColumns);
            }
        }
    };

    // Função para avançar status
    const handleAdvance = async (orderId, nextStatus) => {
        await updateOrderStatus(orderId, nextStatus);
        // Atualiza as colunas após avançar
        const { data: orders } = await getDashboardOrders();
        const newColumns = {
            AWAITING: { name: 'Aguardando', items: [] },
            WASHING: { name: 'Em Lavagem', items: [] },
            READY: { name: 'Pronto p/ Retirada', items: [] },
        };
        orders.forEach(order => {
            if (selectedEmployee && order.employee && order.employee.id !== selectedEmployee) return;
            if (newColumns[order.status]) {
                newColumns[order.status].items.push(order);
            }
        });
        setColumns(newColumns);
    };

    // Função para deletar ordem
    const handleDelete = async (orderId) => {
        await deleteOrder(orderId);
        // Atualiza as colunas após deletar
        const { data: orders } = await getDashboardOrders();
        const newColumns = {
            AWAITING: { name: 'Aguardando', items: [] },
            WASHING: { name: 'Em Lavagem', items: [] },
            READY: { name: 'Pronto p/ Retirada', items: [] },
        };
        orders.forEach(order => {
            if (selectedEmployee && order.employee && order.employee.id !== selectedEmployee) return;
            if (newColumns[order.status]) {
                newColumns[order.status].items.push(order);
            }
        });
        setColumns(newColumns);
    };

    // Função para finalizar pedido
    const handleFinalize = (order) => {
        if (order.isLocaliza) {
            if (window.confirm('Deseja finalizar este serviço da Localiza? O pagamento será registrado automaticamente como Pagamento Localiza.')) {
                // Cria pagamento automático Localiza
                const paymentData = {
                    payments: [{
                        method: 'localiza',
                        amount: order.totalPrice,
                        received: null,
                        change: null
                    }]
                };
                handleCompletePayment(order.id, paymentData);
            }
        } else {
            setSelectedOrder(order);
            setShowPaymentModal(true);
        }
    };

    // Função para completar pagamento
    const handleCompletePayment = async (orderId, paymentData) => {
        try {
            // Aqui você pode adicionar lógica para salvar os dados de pagamento
            console.log('Pagamento finalizado:', paymentData);
            
            // Atualiza o status para FINISHED com os dados de pagamento
            await updateOrderStatus(orderId, 'FINISHED', paymentData.payments);
            
            // Fecha a modal e atualiza as colunas
            setShowPaymentModal(false);
            setSelectedOrder(null);
            
            // Recarrega as ordens
            const { data: orders } = await getDashboardOrders();
            const newColumns = {
                AWAITING: { name: 'Aguardando', items: [] },
                WASHING: { name: 'Em Lavagem', items: [] },
                READY: { name: 'Pronto p/ Retirada', items: [] },
            };
            orders.forEach(order => {
                if (selectedEmployee && order.employee && order.employee.id !== selectedEmployee) return;
                if (newColumns[order.status]) {
                    newColumns[order.status].items.push(order);
                }
            });
            setColumns(newColumns);
        } catch (error) {
            console.error('Erro ao finalizar pagamento:', error);
        }
    };

    return (
        <div className="kanban-board">
            <DragDropContext onDragEnd={onDragEnd}>
                {!columns || Object.values(columns).every(col => !col || col.items.length === 0) ? (
                    <div style={{ textAlign: 'center', width: '100%' }}>
                        <p>Nenhuma ordem de serviço encontrada.</p>
                    </div>
                ) : (
                    Object.entries(columns).map(([columnId, column]) => {
                        // Verifica se a coluna é válida
                        if (!column || !column.items) {
                            console.warn('Coluna inválida:', columnId, column);
                            return null;
                        }
                        
                        return (
                    <Droppable key={columnId} droppableId={columnId}>
                        {(provided) => (
                            <div className="kanban-column" ref={provided.innerRef} {...provided.droppableProps}>
                                <h3>{column.name}</h3>
                                        {column.items.map((item, index) => {
                                            // Verifica se o item é válido
                                            if (!item || !item.id) {
                                                console.warn('Item inválido:', item);
                                                return null;
                                            }
                                            
                                            return (
                                                <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                            <WorkOrderCard 
                                                                order={item} 
                                                                onFinish={handleAdvance} 
                                                                onDelete={handleDelete}
                                                                onFinalize={handleFinalize}
                                                            />
                                            </div>
                                        )}
                                    </Draggable>
                                            );
                                        })}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                        );
                    }).filter(Boolean) // Remove colunas inválidas
                )}
            </DragDropContext>
            
            {/* Modal de Pagamento */}
            {showPaymentModal && selectedOrder && (
                <PaymentModal
                    order={selectedOrder}
                    onClose={() => {
                        setShowPaymentModal(false);
                        setSelectedOrder(null);
                    }}
                    onComplete={handleCompletePayment}
                />
            )}
        </div>
    );
};

export default KanbanBoard; 
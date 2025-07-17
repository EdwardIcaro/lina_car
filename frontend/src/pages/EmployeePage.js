import React, { useEffect, useState } from 'react';
import { FaUser, FaMoneyBillWave, FaChartBar, FaCar } from 'react-icons/fa';
import axios from 'axios';

const EmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const statusMap = {
    AWAITING: 'Aguardando',
    WASHING: 'Em lavagem',
    READY: 'Pronto',
    FINISHED: 'Finalizado',
  };

  useEffect(() => {
    fetchEmployees();
    fetchAllOrders();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchOrders(selectedEmployee);
    }
  }, [selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      const { data } = await axios.get('/api/employees');
      setEmployees(data);
    } catch (err) {
      console.error('Erro ao carregar funcionários:', err);
      setEmployees([]);
    }
  };

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/orders/all');
      setAllOrders(data);
    } catch (err) {
      console.error('Erro ao carregar todas as ordens:', err);
      setAllOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async (employeeId) => {
    try {
      const { data } = await axios.get(`/api/orders?employeeId=${employeeId}`);
      setOrders(data);
    } catch (err) {
      console.error('Erro ao carregar ordens do funcionário:', err);
      setOrders([]);
    }
  };

  const handleSelectEmployee = (e) => {
    const empId = e.target.value;
    setSelectedEmployee(empId);
  };

  const calculateEmployeeStats = () => {
    if (!selectedEmployee) return null;

    const employee = employees.find(emp => emp.id === selectedEmployee);
    if (!employee) return null;

    const finishedOrders = orders.filter(order => order.status === 'FINISHED');
    const totalServices = finishedOrders.length;
    const totalRevenue = finishedOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    
    // Usa a porcentagem armazenada na ordem ou fallback para a do funcionário
    const employeeEarnings = finishedOrders.reduce((sum, order) => {
      const percentage = order.employeePercentage || order.employee?.percentage || 0;
      return sum + (order.totalPrice * (percentage / 100));
    }, 0);
    
    const companyRevenue = totalRevenue - employeeEarnings;

    return {
      employee,
      totalServices,
      totalRevenue,
      employeeEarnings,
      companyRevenue,
      percentage: employee.percentage
    };
  };

  const calculateGlobalStats = () => {
    const finishedOrders = allOrders.filter(order => order.status === 'FINISHED');
    const totalRevenue = finishedOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalEmployeeEarnings = finishedOrders.reduce((sum, order) => {
      if (order.employee) {
        // Usa a porcentagem armazenada na ordem ou fallback para a do funcionário
        const percentage = order.employeePercentage || order.employee.percentage || 0;
        return sum + (order.totalPrice * (percentage / 100));
      }
      return sum;
    }, 0);
    const totalCompanyRevenue = totalRevenue - totalEmployeeEarnings;

    return {
      totalServices: finishedOrders.length,
      totalRevenue,
      totalEmployeeEarnings,
      totalCompanyRevenue,
      ordersByEmployee: finishedOrders.reduce((acc, order) => {
        const employeeName = order.employee?.name || 'Sem funcionário';
        if (!acc[employeeName]) {
          acc[employeeName] = {
            count: 0,
            revenue: 0,
            earnings: 0
          };
        }
        acc[employeeName].count++;
        acc[employeeName].revenue += order.totalPrice;
        if (order.employee) {
          // Usa a porcentagem armazenada na ordem ou fallback para a do funcionário
          const percentage = order.employeePercentage || order.employee.percentage || 0;
          acc[employeeName].earnings += order.totalPrice * (percentage / 100);
        }
        return acc;
      }, {})
    };
  };

  const employeeStats = calculateEmployeeStats();
  const globalStats = calculateGlobalStats();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Carregando dados...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, color: '#333' }}>Gestão de Funcionários</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FaUser size={24} color="#1976d2" />
          <select 
            value={selectedEmployee || ''} 
            onChange={handleSelectEmployee}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px',
              minWidth: '200px'
            }}
          >
            <option value="">Todos os Funcionários</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name} ({emp.percentage}%)</option>
            ))}
          </select>
        </div>
      </div>

      {/* Estatísticas */}
      {selectedEmployee && employeeStats ? (
        // Estatísticas do funcionário selecionado
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ marginBottom: '20px', color: '#333' }}>
            Estatísticas de {employeeStats.employee.name}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{
              background: '#e3f2fd',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <FaCar size={32} color="#1976d2" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>
                {employeeStats.totalServices}
              </div>
              <div style={{ color: '#666' }}>Serviços Realizados</div>
            </div>
            <div style={{
              background: '#e8f5e9',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <FaMoneyBillWave size={32} color="#388e3c" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#388e3c' }}>
                R$ {employeeStats.totalRevenue.toFixed(2)}
              </div>
              <div style={{ color: '#666' }}>Receita Total</div>
            </div>
            <div style={{
              background: '#fff3e0',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <FaUser size={32} color="#f57c00" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f57c00' }}>
                R$ {employeeStats.employeeEarnings.toFixed(2)}
              </div>
              <div style={{ color: '#666' }}>Ganho do Funcionário ({employeeStats.percentage}%)</div>
            </div>
            <div style={{
              background: '#fce4ec',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <FaChartBar size={32} color="#c2185b" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#c2185b' }}>
                R$ {employeeStats.companyRevenue.toFixed(2)}
              </div>
              <div style={{ color: '#666' }}>Ganho da Empresa</div>
            </div>
          </div>
        </div>
      ) : (
        // Estatísticas globais
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ marginBottom: '20px', color: '#333' }}>
            Estatísticas Gerais
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{
              background: '#e3f2fd',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <FaCar size={32} color="#1976d2" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>
                {globalStats.totalServices}
              </div>
              <div style={{ color: '#666' }}>Total de Serviços</div>
            </div>
            <div style={{
              background: '#e8f5e9',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <FaMoneyBillWave size={32} color="#388e3c" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#388e3c' }}>
                R$ {globalStats.totalRevenue.toFixed(2)}
              </div>
              <div style={{ color: '#666' }}>Receita Total</div>
            </div>
            <div style={{
              background: '#fff3e0',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <FaUser size={32} color="#f57c00" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f57c00' }}>
                R$ {globalStats.totalEmployeeEarnings.toFixed(2)}
              </div>
              <div style={{ color: '#666' }}>Total Funcionários</div>
            </div>
            <div style={{
              background: '#fce4ec',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <FaChartBar size={32} color="#c2185b" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#c2185b' }}>
                R$ {globalStats.totalCompanyRevenue.toFixed(2)}
              </div>
              <div style={{ color: '#666' }}>Ganho da Empresa</div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Serviços */}
      <div>
        <h3 style={{ marginBottom: '16px', color: '#333' }}>
          {selectedEmployee ? `Serviços de ${employeeStats?.employee.name}` : 'Todos os Serviços'}
        </h3>
        <div style={{
          background: '#fff',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '120px 1fr 120px 120px 120px 120px',
            gap: '16px',
            padding: '16px',
            background: '#f5f5f5',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            <div>Data</div>
            <div>Veículo/Cliente</div>
            <div>Valor</div>
            <div>Funcionário</div>
            <div>Ganho Func.</div>
            <div>Status</div>
          </div>
          {(selectedEmployee ? orders : allOrders).length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              Nenhum serviço encontrado.
            </div>
          ) : (
            (selectedEmployee ? orders : allOrders)
              .filter(order => order.status === 'FINISHED')
              .map((order) => (
                <div key={order.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr 120px 120px 120px 120px',
                  gap: '16px',
                  padding: '16px',
                  borderBottom: '1px solid #eee',
                  alignItems: 'center'
                }}>
                  <div style={{ fontSize: '14px' }}>
                    {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                      {order.customService || `${order.vehicle?.plate} - ${order.vehicle?.model}`}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {order.vehicle?.customer?.name}
                    </div>
                  </div>
                  <div style={{ fontWeight: 'bold', color: '#1976d2' }}>
                    R$ {order.totalPrice.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    {order.employee?.name || '-'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#f57c00' }}>
                    {order.employee ? 
                      `R$ ${(order.totalPrice * ((order.employeePercentage || order.employee.percentage) / 100)).toFixed(2)}` : 
                      '-'
                    }
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    background: order.status === 'FINISHED' ? '#e8f5e9' : '#fff3e0',
                    color: order.status === 'FINISHED' ? '#388e3c' : '#f57c00',
                    fontWeight: 'bold'
                  }}>
                    {statusMap[order.status] || order.status}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeePage; 
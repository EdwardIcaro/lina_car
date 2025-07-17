import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaCar } from 'react-icons/fa';
import './SettingsPage.css';

const SettingsPage = () => {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ name: '', price: '', type: 'carro' });
  const [editingId, setEditingId] = useState(null);
  const [editingService, setEditingService] = useState({ name: '', price: '', type: 'carro' });
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({ name: '', percentage: '' });
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState({ name: '', percentage: '' });

  useEffect(() => {
    fetchServices();
    fetchEmployees();
  }, []);

  const fetchServices = async () => {
    try {
      const { data } = await axios.get('/api/services');
      setServices(data);
    } catch (err) {
      setServices([]);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data } = await axios.get('/api/employees');
      setEmployees(data);
    } catch (err) {
      setEmployees([]);
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!newService.name || !newService.price) return;
    try {
      await axios.post('/api/services', { ...newService, price: parseFloat(newService.price) });
      setNewService({ name: '', price: '', type: 'carro' });
      fetchServices();
    } catch (err) {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja realmente excluir este serviço?')) return;
    try {
      await axios.delete(`/api/services/${id}`);
      fetchServices();
    } catch (err) {}
  };

  const handleEdit = (service) => {
    setEditingId(service.id);
    setEditingService({ name: service.name, price: service.price, type: service.type });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingService(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (id) => {
    try {
      await axios.put(`/api/services/${id}`, { ...editingService, price: parseFloat(editingService.price) });
      setEditingId(null);
      fetchServices();
    } catch (err) {}
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.percentage) return;
    try {
      await axios.post('/api/employees', { ...newEmployee, percentage: parseFloat(newEmployee.percentage) });
      setNewEmployee({ name: '', percentage: '' });
      fetchEmployees();
    } catch (err) {}
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Deseja realmente excluir este funcionário?')) return;
    try {
      await axios.delete(`/api/employees/${id}`);
      fetchEmployees();
    } catch (err) {}
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployeeId(employee.id);
    setEditingEmployee({ name: employee.name, percentage: employee.percentage });
  };

  const handleEditEmployeeChange = (e) => {
    const { name, value } = e.target;
    setEditingEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEditEmployee = async (id) => {
    try {
      await axios.put(`/api/employees/${id}`, { ...editingEmployee, percentage: parseFloat(editingEmployee.percentage) });
      setEditingEmployeeId(null);
      fetchEmployees();
    } catch (err) {}
  };

  return (
    <div className="settings-container">
      <h2>Configurações do Sistema</h2>
      
      {/* Seção Localiza */}
      <div className="localiza-section">
        <h3>
          <FaCar style={{ color: '#00a651', marginRight: '8px' }} />
          Configurações Localiza
        </h3>
        <p>Gerencie os serviços e configurações específicas para veículos da Localiza.</p>
        <Link to="/localiza-config" className="localiza-config-link">
          <button className="localiza-config-button">
            Gerenciar Configurações Localiza
          </button>
        </Link>
      </div>
      
      <h3>Serviços</h3>
      <form className="add-service-form" onSubmit={handleAddService}>
        <input
          type="text"
          placeholder="Nome do serviço"
          value={newService.name}
          onChange={e => setNewService(prev => ({ ...prev, name: e.target.value }))}
          required
        />
        <input
          type="number"
          placeholder="Preço"
          value={newService.price}
          onChange={e => setNewService(prev => ({ ...prev, price: e.target.value }))}
          required
          min="0"
          step="0.01"
        />
        <select
          value={newService.type || 'carro'}
          onChange={e => setNewService(prev => ({ ...prev, type: e.target.value }))}
          required
        >
          <option value="carro">Carro</option>
          <option value="moto">Moto</option>
        </select>
        <button type="submit">Adicionar</button>
      </form>
      <table className="services-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Preço (R$)</th>
            <th>Tipo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {services.map(service => (
            <tr key={service.id}>
              <td>
                {editingId === service.id ? (
                  <input
                    type="text"
                    name="name"
                    value={editingService.name}
                    onChange={handleEditChange}
                  />
                ) : (
                  service.name
                )}
              </td>
              <td>
                {editingId === service.id ? (
                  <input
                    type="number"
                    name="price"
                    value={editingService.price}
                    onChange={handleEditChange}
                    min="0"
                    step="0.01"
                  />
                ) : (
                  service.price.toFixed(2)
                )}
              </td>
              <td>
                {editingId === service.id ? (
                  <select
                    name="type"
                    value={editingService.type}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="carro">Carro</option>
                    <option value="moto">Moto</option>
                  </select>
                ) : (
                  service.type
                )}
              </td>
              <td>
                {editingId === service.id ? (
                  <>
                    <button onClick={() => handleSaveEdit(service.id)}>Salvar</button>
                    <button onClick={() => setEditingId(null)}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(service)}>Editar</button>
                    <button onClick={() => handleDelete(service.id)}>Excluir</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Funcionários</h3>
      <form className="add-service-form" onSubmit={handleAddEmployee}>
        <input
          type="text"
          placeholder="Nome do funcionário"
          value={newEmployee.name}
          onChange={e => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
          required
        />
        <input
          type="number"
          placeholder="% de ganho"
          value={newEmployee.percentage}
          onChange={e => setNewEmployee(prev => ({ ...prev, percentage: e.target.value }))}
          required
          min="0"
          max="100"
          step="0.01"
        />
        <button type="submit">Adicionar</button>
      </form>
      <table className="services-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>% de Ganho</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(employee => (
            <tr key={employee.id}>
              <td>
                {editingEmployeeId === employee.id ? (
                  <input
                    type="text"
                    name="name"
                    value={editingEmployee.name}
                    onChange={handleEditEmployeeChange}
                  />
                ) : (
                  employee.name
                )}
              </td>
              <td>
                {editingEmployeeId === employee.id ? (
                  <input
                    type="number"
                    name="percentage"
                    value={editingEmployee.percentage}
                    onChange={handleEditEmployeeChange}
                    min="0"
                    max="100"
                    step="0.01"
                  />
                ) : (
                  `${employee.percentage}%`
                )}
              </td>
              <td>
                {editingEmployeeId === employee.id ? (
                  <>
                    <button onClick={() => handleSaveEditEmployee(employee.id)}>Salvar</button>
                    <button onClick={() => setEditingEmployeeId(null)}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEditEmployee(employee)}>Editar</button>
                    <button onClick={() => handleDeleteEmployee(employee.id)}>Excluir</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SettingsPage; 
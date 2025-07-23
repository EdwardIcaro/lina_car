import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom'; // Added Link import
import './LocalizaConfigPage.css';

const LocalizaConfigPage = () => {
  const [config, setConfig] = useState({ percentage: 30 });
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [newService, setNewService] = useState({ name: '', price: '' });

  useEffect(() => {
    fetchConfig();
    fetchServices();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data } = await axios.get('/api/orders/localiza/config');
      setConfig(data);
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const { data } = await axios.get('/api/orders/localiza/services');
      setServices(data);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
    }
  };

  const updateConfig = async (updates) => {
    try {
      setLoading(true);
      const { data } = await axios.put('/api/orders/localiza/config', updates);
      setConfig(data);
    } catch (error) {
      alert('Erro ao atualizar configuração');
    } finally {
      setLoading(false);
    }
  };

  const addService = async () => {
    try {
      setLoading(true);
      await axios.post('/api/orders/localiza/services', newService);
      setNewService({ name: '', price: '' });
      setShowAddService(false);
      fetchServices();
    } catch (error) {
      alert('Erro ao adicionar serviço');
    } finally {
      setLoading(false);
    }
  };

  const updateService = async (id, updates) => {
    try {
      setLoading(true);
      await axios.put(`/api/orders/localiza/services/${id}`, updates);
      setEditingService(null);
      fetchServices();
    } catch (error) {
      alert('Erro ao atualizar serviço');
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este serviço?')) return;
    
    try {
      setLoading(true);
      await axios.delete(`/api/orders/localiza/services/${id}`);
      fetchServices();
    } catch (error) {
      alert('Erro ao deletar serviço');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="localiza-config-container">
      <div className="config-header">
        <Link to="/settings" className="back-button"><FaArrowLeft /> Voltar</Link>
        <h1>Configuração Localiza</h1>
      </div>
      <div className="config-sections">
        {/* Configuração Geral */}
        <div className="config-section">
          <h2>Configuração Geral</h2>
          <div className="config-card">
            <div className="config-item">
              <label>Porcentagem de Ganho do Funcionário (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={config.percentage}
                onChange={(e) => updateConfig({ percentage: parseFloat(e.target.value) })}
                className="percentage-input"
                disabled={loading}
              />
            </div>
          </div>
        </div>
        {/* Serviços */}
        <div className="config-section">
          <div className="section-header">
            <h2>Serviços Disponíveis</h2>
            <button
              className="add-button"
              onClick={() => setShowAddService(true)}
              disabled={loading}
            >
              <FaPlus /> Adicionar Serviço
            </button>
          </div>
          <div className="services-grid">
            {services.map(service => (
              <div key={service.id} className="service-card">
                <div className="service-header">
                  <h3>{service.name}</h3>
                  <div className="service-actions">
                    <button
                      className="edit-button"
                      onClick={() => setEditingService(service)}
                      disabled={loading}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => deleteService(service.id)}
                      disabled={loading}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <div className="service-details">
                  <p className="service-price">R$ {service.price.toFixed(2)}</p>
                  <span className="service-status active">Ativo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Modal Adicionar Serviço */}
      {showAddService && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Adicionar Serviço</h3>
            <div className="form-group">
              <label>Nome do Serviço</label>
              <input
                type="text"
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                placeholder="Ex: Lavagem Completa"
              />
            </div>
            <div className="form-group">
              <label>Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newService.price}
                onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                placeholder="0,00"
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowAddService(false)}>Cancelar</button>
              <button onClick={addService} disabled={loading || !newService.name || !newService.price}>
                {loading ? 'Adicionando...' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Editar Serviço */}
      {editingService && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Editar Serviço</h3>
            <div className="form-group">
              <label>Nome do Serviço</label>
              <input
                type="text"
                value={editingService.name}
                onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={editingService.price}
                onChange={(e) => setEditingService({ ...editingService, price: parseFloat(e.target.value) })}
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setEditingService(null)}>Cancelar</button>
              <button 
                onClick={() => updateService(editingService.id, {
                  name: editingService.name,
                  price: editingService.price
                })} 
                disabled={loading || !editingService.name || !editingService.price}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocalizaConfigPage; 
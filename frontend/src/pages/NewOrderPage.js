import React, { useState, useEffect } from 'react';
import PlateReader from '../components/OCR/PlateReader';
import { createOrder, fetchVehicleInfoByPlate } from '../services/api';
import './NewOrderPage.css';
import axios from 'axios';
import { FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';

const vehicleModels = [
  "Honda Titan 160", "Honda Biz", "Honda Bros", "Honda CG 160", "Honda Civic", "Honda Fit",
  "Toyota Corolla", "Toyota Hilux", "Chevrolet Onix", "Chevrolet S10", "Volkswagen Gol",
  "Volkswagen Polo", "Fiat Uno", "Fiat Strada", "Yamaha Fazer 250", "Yamaha Factor 150",
  "Renault Kwid", "Ford Ka", "Hyundai HB20"
];
const colorOptions = [
  "Preto", "Branco", "Prata", "Cinza", "Vermelho", "Azul", "Verde", "Amarelo", "Marrom",
  "Laranja", "Roxo", "Bege", "Outro"
];

const carModels = [
  "Honda Civic", "Honda Fit", "Toyota Corolla", "Toyota Hilux", "Chevrolet Onix", "Chevrolet S10", "Volkswagen Gol", "Volkswagen Polo", "Fiat Uno", "Fiat Strada", "Renault Kwid", "Ford Ka", "Hyundai HB20"
];
const motoModels = [
  "Honda Titan 160", "Honda Biz", "Honda Bros", "Honda CG 160", "Yamaha Fazer 250", "Yamaha Factor 150"
];

const colorMap = {
  'Preto': '#222',
  'Branco': '#fff',
  'Prata': '#c0c0c0',
  'Cinza': '#888',
  'Vermelho': '#d32f2f',
  'Azul': '#1976d2',
  'Verde': '#388e3c',
  'Amarelo': '#fbc02d',
  'Marrom': '#795548',
  'Laranja': '#ff9800',
  'Roxo': '#8e24aa',
  'Bege': '#f5f5dc',
  'Outro': '#eee'
};

const NewOrderPage = () => {
  const [formData, setFormData] = useState({
    plate: '',
    model: '',
    color: '',
    customerName: '',
    customerPhone: '',
    serviceIds: [],
    customService: '',
    customPrice: '',
  });
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [services, setServices] = useState([]);
  const [step, setStep] = useState(0); // 0: escolha cliente, 1: escolha tipo, 2: formulário, 3: busca cliente, 4: seleção veículo
  const [vehicleType, setVehicleType] = useState('carro');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerVehicles, setCustomerVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [localizaServices, setLocalizaServices] = useState([]);
  const [selectedLocalizaServices, setSelectedLocalizaServices] = useState([]);
  const [localizaConfig, setLocalizaConfig] = useState(null);

  useEffect(() => {
    async function fetchServices() {
      try {
        const { data } = await axios.get('/api/services');
        setServices(data);
      } catch (err) {
        setServices([]);
      }
    }
    async function fetchEmployees() {
      try {
        const { data } = await axios.get('/api/employees');
        setEmployees(data);
      } catch (err) {
        setEmployees([]);
      }
    }
    async function fetchLocalizaServices() {
      try {
        const { data } = await axios.get('/api/orders/localiza/services');
        setLocalizaServices(data);
      } catch (err) {
        setLocalizaServices([]);
      }
    }
    async function fetchLocalizaConfig() {
      try {
        const { data } = await axios.get('/api/orders/localiza/config');
        setLocalizaConfig(data);
      } catch (err) {
        setLocalizaConfig({ isActive: false, percentage: 30 });
      }
    }
    fetchServices();
    fetchEmployees();
    fetchLocalizaServices();
    fetchLocalizaConfig();
  }, []);

  // Busca clientes por nome
  useEffect(() => {
    if (step === 3 && customerSearch.length > 1) {
      axios.get(`/api/customers?search=${encodeURIComponent(customerSearch)}`)
        .then(res => setCustomerResults(res.data))
        .catch(() => setCustomerResults([]));
    }
  }, [customerSearch, step]);

  // Busca veículos do cliente selecionado
  useEffect(() => {
    if (step === 4 && selectedCustomer) {
      axios.get(`/api/customers/${selectedCustomer.id}/vehicles`)
        .then(res => setCustomerVehicles(res.data))
        .catch(() => setCustomerVehicles([]));
    }
  }, [selectedCustomer, step]);

  const handlePlateInput = async (e) => {
    const { value } = e.target;
    const upperValue = value.toUpperCase();
    const cleanedPlate = upperValue.replace(/[^A-Z0-9]/g, '');
    setFormData(prev => ({ ...prev, plate: upperValue }));
    if (cleanedPlate.length === 7) {
      try {
        const { data } = await fetchVehicleInfoByPlate(cleanedPlate);
        setFormData(prev => ({ ...prev, model: data.make ? `${data.make} ${data.model}` : data.model }));
      } catch (err) {}
    }
  };

  const handleServiceSelect = (id) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
    setFormData(prev => ({ ...prev, serviceIds: prev.serviceIds.includes(id) ? prev.serviceIds.filter(s => s !== id) : [...prev.serviceIds, id] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlateRecognized = async (plate) => {
    const cleanedPlate = plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    setFormData(prev => ({ ...prev, plate: cleanedPlate }));
    if (cleanedPlate.length === 7) {
      try {
        const { data } = await fetchVehicleInfoByPlate(cleanedPlate);
        setFormData(prev => ({ ...prev, model: data.make ? `${data.make} ${data.model}` : data.model }));
      } catch (err) {}
    }
  };

  const handleEmployeeChange = (e) => {
    setSelectedEmployeeId(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação dos campos obrigatórios
    if (vehicleType === 'outros') {
      // Validação para serviços customizados
      if (!formData.customerName || !formData.customService || !formData.customPrice || !selectedEmployeeId) {
        alert('Por favor, preencha todos os campos obrigatórios: Nome do Cliente, Descrição do Serviço, Valor e Funcionário Responsável.');
        return;
      }
    } else if (vehicleType === 'localiza') {
      // Validação para serviços da Localiza
      if (!formData.plate || !formData.model || !formData.color || !selectedLocalizaServices.length || !selectedEmployeeId) {
        alert('Por favor, preencha todos os campos obrigatórios: Placa, Modelo, Cor, Serviço e Funcionário Responsável.');
        return;
      }
    } else {
      // Validação para serviços normais
      if (!formData.model || !formData.serviceIds.length || !formData.customerName || !selectedEmployeeId) {
        alert('Por favor, preencha todos os campos obrigatórios: Modelo, Serviço, Nome do Cliente e Funcionário Responsável.');
        return;
      }
    }
    
    setShowSummary(true);
    setLoading(true);
    try {
      if (vehicleType === 'outros') {
        // Serviço customizado - criar veículo fictício
        await createOrder({
          customer: { name: formData.customerName, phone: formData.customerPhone },
          vehicle: { 
            plate: 'CUSTOM', 
            make: 'Serviço Customizado', 
            model: formData.customService, 
            color: 'N/A' 
          },
          serviceIds: [], // Não há serviços padrão
          employeeId: selectedEmployeeId,
          customService: formData.customService,
          customPrice: parseFloat(formData.customPrice)
        });
      } else if (vehicleType === 'localiza') {
        // Serviço da Localiza
        let make = 'Desconhecido';
        let model = formData.model;
        if (model.includes(' ')) {
          const parts = model.split(' ');
          make = parts[0];
          model = parts.slice(1).join(' ');
        }
        await createOrder({
          customer: { name: 'Localiza', phone: 'LOCALIZA' },
          vehicle: { plate: formData.plate, make, model, color: formData.color },
          serviceIds: [],
          localizaServiceIds: selectedLocalizaServices,
          employeeId: selectedEmployeeId,
          isLocaliza: true
        });
      } else {
        // Serviço normal
        let make = 'Desconhecido';
        let model = formData.model;
        if (model.includes(' ')) {
          const parts = model.split(' ');
          make = parts[0];
          model = parts.slice(1).join(' ');
        }
        await createOrder({
          customer: { name: formData.customerName, phone: formData.customerPhone },
          vehicle: { plate: formData.plate, make, model, color: formData.color },
          serviceIds: formData.serviceIds,
          employeeId: selectedEmployeeId,
        });
      }
      toast.success('Ordem de serviço criada com sucesso!');
      setShowSummary(false);
      setFormData({ plate: '', model: '', color: '', customerName: '', customerPhone: '', serviceIds: [], customService: '', customPrice: '' });
      setSelectedServices([]);
      setSelectedLocalizaServices([]);
      setStep(0);
    } catch (err) {
      toast.error('Erro ao criar ordem.');
    } finally {
      setLoading(false);
    }
  };

  // Substituir a renderização do formulário por um fluxo de etapas
  if (step === 0) {
    return (
      <div className="new-order-container">
        <h2 className="new-order-title">Nova Ordem de Serviço</h2>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', margin: '32px 0' }}>
          <button className="submit-btn" style={{ width: 180 }} onClick={() => setStep(1)}>Novo Cliente</button>
          <button className="submit-btn" style={{ width: 180, background: '#007bff' }} onClick={() => setStep(3)}>Cliente Existente</button>
        </div>
      </div>
    );
  }
  if (step === 1) {
    return (
      <div className="new-order-container">
        <h2 className="new-order-title">Tipo de Serviço</h2>
        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', margin: '32px 0', flexWrap: 'wrap' }}>
          <button className="submit-btn" style={{ width: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#1976d2' }} onClick={() => { setVehicleType('carro'); setStep(2); }}>
            <span style={{ fontSize: 40 }}>🚗</span>
            Carro
          </button>
          <button className="submit-btn" style={{ width: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#007bff' }} onClick={() => { setVehicleType('moto'); setStep(2); }}>
            <span style={{ fontSize: 40 }}>🏍️</span>
            Moto
          </button>
          {localizaConfig && (
            <button 
              className="submit-btn" 
              style={{ 
                width: 180, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                background: '#00a651',
                border: '2px solid #008f45'
              }} 
              onClick={() => { setVehicleType('localiza'); setStep(6); }}
            >
              <div style={{ 
                width: 40, 
                height: 40, 
                background: 'white', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: 8
              }}>
                <img 
                  src="https://logospng.org/download/localiza/localiza-256.png" 
                  alt="Localiza" 
                  style={{ 
                    width: 32, 
                    height: 32, 
                    objectFit: 'contain' 
                  }} 
                />
              </div>
              Localiza
              <span style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                {localizaConfig.percentage}% ganho
              </span>
            </button>
          )}
          <button className="submit-btn" style={{ width: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#ff9800' }} onClick={() => { setVehicleType('outros'); setStep(5); }}>
            <span style={{ fontSize: 40 }}>🧽</span>
            Outros
          </button>
        </div>
        <button className="back-btn" onClick={() => setStep(0)}>
          <FaArrowLeft /> Voltar
        </button>
      </div>
    );
  }
  if (step === 3) {
    return (
      <div className="new-order-container">
        <h2 className="new-order-title">Buscar Cliente</h2>
        <input
          className="input-field"
          type="text"
          placeholder="Digite o nome do cliente"
          value={customerSearch}
          onChange={e => setCustomerSearch(e.target.value)}
          style={{ width: '100%', marginBottom: 16 }}
        />
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {customerResults.map(c => (
            <li key={c.id} style={{ padding: 8, borderBottom: '1px solid #eee', cursor: 'pointer' }} onClick={() => { setSelectedCustomer(c); setStep(4); }}>
              {c.name} <span style={{ color: '#888', fontSize: '0.95em' }}>{c.phone}</span>
            </li>
          ))}
        </ul>
        <button className="submit-btn" style={{ marginTop: 24 }} onClick={() => setStep(0)}>Voltar</button>
      </div>
    );
  }
  if (step === 4 && selectedCustomer) {
    return (
      <div className="new-order-container">
        <h2 className="new-order-title">Selecione o Veículo</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {customerVehicles.map(v => (
            <li key={v.id} style={{ padding: 10, borderBottom: '1px solid #eee', cursor: 'pointer' }} onClick={() => { setSelectedVehicle(v); setVehicleType(v.model && v.model.toLowerCase().includes('moto') ? 'moto' : 'carro'); setFormData(prev => ({ ...prev, plate: v.plate, model: v.model, color: v.color, customerName: selectedCustomer.name, customerPhone: selectedCustomer.phone })); setStep(2); }}>
              <b>{v.model}</b> <span style={{ color: '#888', fontSize: '0.95em' }}>Placa: {v.plate}</span>
            </li>
          ))}
          <li 
            style={{ 
              padding: 10, 
              borderBottom: '1px solid #eee', 
              cursor: 'pointer',
              background: '#fff3e0',
              borderLeft: '4px solid #ff9800'
            }} 
            onClick={() => { 
              setFormData(prev => ({ 
                ...prev, 
                customerName: selectedCustomer.name, 
                customerPhone: selectedCustomer.phone 
              })); 
              setStep(5); 
            }}
          >
            <b>🧽 Serviço Customizado</b> <span style={{ color: '#888', fontSize: '0.95em' }}>Tapete, barco, etc.</span>
          </li>
        </ul>
        <button className="submit-btn" style={{ marginTop: 24 }} onClick={() => setStep(3)}>Voltar</button>
      </div>
    );
  }

  // Formulário customizado para serviços "Outros"
  if (step === 5) {
    return (
      <div className="new-order-container custom-service-container">
        <div className="custom-service-header">
          <div className="custom-service-icon">
            <span role="img" aria-label="custom service">🧽</span>
          </div>
          <h2 className="custom-service-title">Serviço Personalizado</h2>
          <p className="custom-service-subtitle">
            Crie um serviço sob medida para o seu cliente
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="custom-service-form">
          <div className="form-section">
            <div className="section-header">
              <span className="section-icon">👤</span>
              <h3>Informações do Cliente</h3>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">👤</span>
                  Nome do Cliente
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="custom-input"
                  placeholder="Digite o nome completo"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">📱</span>
                  Telefone
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  className="custom-input"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <span className="section-icon">🔧</span>
              <h3>Detalhes do Serviço</h3>
            </div>
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📝</span>
                Descrição do Serviço
              </label>
              <textarea
                name="customService"
                placeholder="Ex: Lavagem de tapete, Limpeza de barco, Higienização de sofá, Limpeza de estofado, etc."
                value={formData.customService || ''}
                onChange={handleChange}
                className="custom-textarea"
                rows="3"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">💰</span>
                Valor do Serviço
              </label>
              <div className="price-input-container">
                <span className="currency-symbol">R$</span>
                <input
                  type="number"
                  name="customPrice"
                  step="0.01"
                  min="0"
                  value={formData.customPrice || ''}
                  onChange={handleChange}
                  className="custom-input price-input"
                  placeholder="0,00"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <span className="section-icon">👷</span>
              <h3>Responsável</h3>
            </div>
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">👷</span>
                Funcionário Responsável
              </label>
              <select 
                value={selectedEmployeeId} 
                onChange={handleEmployeeChange} 
                className="custom-select"
                required
              >
                <option value="">Selecione um funcionário</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.percentage}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="back-button" 
              onClick={() => setStep(1)}
            >
              <FaArrowLeft /> Voltar
            </button>
            <button 
              type="submit" 
              className="create-button" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Criando...
                </>
              ) : (
                <>
                  <span className="button-icon">✨</span>
                  Criar Serviço Personalizado
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Formulário específico para serviços da Localiza
  if (step === 6) {
    return (
      <div className="new-order-container localiza-service-container">
        <div className="localiza-service-header">
          <div className="localiza-service-icon">
            <div className="localiza-logo">
              <img 
                src="https://logospng.org/download/localiza/localiza-256.png" 
                alt="Localiza" 
                style={{ 
                  width: 60, 
                  height: 60, 
                  objectFit: 'contain' 
                }} 
              />
            </div>
          </div>
          <h2 className="localiza-service-title">Localiza</h2>
          <p className="localiza-service-subtitle">
            Serviço de lavagem com {localizaConfig?.percentage || 30}% de ganho para o funcionário
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="localiza-service-form">
          <div className="form-section">
            <div className="section-header">
              <span className="section-icon">🚗</span>
              <h3>Dados do Veículo</h3>
            </div>
            <div className="vehicle-fields">
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">📷</span>
                  Placa do Veículo
                </label>
                <div className="plate-input-container">
                  <PlateReader onPlateRecognized={handlePlateRecognized} />
                  <input 
                    name="plate" 
                    value={formData.plate} 
                    onChange={handlePlateInput} 
                    placeholder="ABC-1234" 
                    maxLength={8} 
                    className="custom-input plate-input" 
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🏷️</span>
                  Modelo
                </label>
                <input
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="Ex: Honda Civic, Toyota Corolla"
                  required
                  className="custom-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🎨</span>
                  Cor
                </label>
                <div className="color-select-container">
                  <select
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="custom-select"
                    required
                  >
                    <option value="">Selecione a cor</option>
                    {colorOptions.map(color => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                  {formData.color && (
                    <span className="color-preview" style={{
                      background: colorMap[formData.color] || '#eee'
                    }} />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <span className="section-icon">🔧</span>
              <h3>Serviços Localiza</h3>
            </div>
            <div className="service-options-container">
              <label className="service-options-label">Selecione o serviço:</label>
              <div className="service-options-grid">
                {localizaServices.map(service => (
                  <label key={service.id} className="service-option-card localiza-service-card">
                    <input
                      type="radio"
                      name="localizaService"
                      value={service.id}
                      checked={selectedLocalizaServices[0] === service.id}
                      onChange={() => {
                        setSelectedLocalizaServices([service.id]);
                      }}
                      className="service-radio"
                      required
                    />
                    <div className="service-option-content">
                      <span className="service-name">
                        {service.name}
                      </span>
                      <span className="service-price">
                        R$ {service.price.toFixed(2)}
                      </span>
                      <span className="localiza-gain">
                        Ganho: {localizaConfig?.percentage || 30}%
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <span className="section-icon">👷</span>
              <h3>Responsável</h3>
            </div>
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">👷</span>
                Funcionário Responsável
              </label>
              <select
                name="employeeId"
                value={selectedEmployeeId}
                onChange={handleEmployeeChange}
                className="custom-select"
                required
              >
                <option value="">Selecione o funcionário</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.percentage}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="back-button" 
              onClick={() => setStep(1)}
            >
              <FaArrowLeft /> Voltar
            </button>
            <button 
              type="submit" 
              className="create-button localiza-create-button" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Criando...
                </>
              ) : (
                <>
                  <span className="button-icon">✨</span>
                  Criar Ordem Localiza
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="new-order-container vehicle-service-container">
      <div className="vehicle-service-header">
        <div className="vehicle-service-icon">
          <span role="img" aria-label="vehicle service">
            {vehicleType === 'carro' ? '🚗' : '🏍️'}
          </span>
        </div>
        <h2 className="vehicle-service-title">
          {vehicleType === 'carro' ? 'Lavagem de Carro' : 'Lavagem de Moto'}
        </h2>
        <p className="vehicle-service-subtitle">
          {vehicleType === 'carro' 
            ? 'Complete os dados do veículo e cliente' 
            : 'Complete os dados da moto e cliente'
          }
        </p>
      </div>
      
      <form className="vehicle-service-form" onSubmit={handleSubmit} autoComplete="off">
        <div className="form-section">
          <div className="section-header">
            <span className="section-icon">🚗</span>
            <h3>Dados do Veículo</h3>
          </div>
          <div className="vehicle-fields">
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📷</span>
                Placa do Veículo
              </label>
              <div className="plate-input-container">
                <PlateReader onPlateRecognized={handlePlateRecognized} />
                <input 
                  name="plate" 
                  value={formData.plate} 
                  onChange={handlePlateInput} 
                  placeholder="ABC-1234" 
                  maxLength={8} 
                  className="custom-input plate-input" 
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🏷️</span>
                Modelo
              </label>
              <input
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="Ex: Honda Civic, Toyota Corolla"
                required
                list="model-list"
                className="custom-input"
              />
              <datalist id="model-list">
                {(vehicleType === 'carro' ? carModels : motoModels).map(model => (
                  <option key={model} value={model} />
                ))}
              </datalist>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🎨</span>
                Cor
              </label>
              <div className="color-select-container">
                <select
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="custom-select"
                >
                  <option value="">Selecione a cor</option>
                  {colorOptions.map(color => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
                {formData.color && (
                  <span className="color-preview" style={{
                    background: colorMap[formData.color] || '#eee'
                  }} />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <span className="section-icon">🔧</span>
            <h3>Serviço</h3>
          </div>
          <div className="service-options-container">
            <label className="service-options-label">Selecione o serviço:</label>
            <div className="service-options-grid">
              {services.filter(service => service.type === vehicleType).map(service => (
                <label key={service.id} className="service-option-card">
                  <input
                    type="radio"
                    name="service"
                    value={service.id}
                    checked={selectedServices[0] === service.id}
                    onChange={() => {
                      setSelectedServices([service.id]);
                      setFormData(prev => ({ ...prev, serviceIds: [service.id] }));
                    }}
                    className="service-radio"
                    required
                  />
                  <div className="service-option-content">
                    <span className="service-name">
                      {service.name.replace(/_(carro|moto)$/, '')}
                    </span>
                    <span className="service-price">
                      R$ {service.price.toFixed(2)}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <span className="section-icon">👤</span>
            <h3>Dados do Cliente</h3>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">👤</span>
                Nome do Cliente
              </label>
              <input 
                name="customerName" 
                value={formData.customerName} 
                onChange={handleChange} 
                placeholder="Nome completo" 
                required 
                className="custom-input" 
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📱</span>
                Telefone
              </label>
              <input 
                name="customerPhone" 
                value={formData.customerPhone} 
                onChange={handleChange} 
                placeholder="(11) 99999-9999" 
                className="custom-input" 
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <span className="section-icon">👷</span>
            <h3>Responsável</h3>
          </div>
          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">👷</span>
              Funcionário Responsável
            </label>
            <select
              name="employeeId"
              value={selectedEmployeeId}
              onChange={handleEmployeeChange}
              className="custom-select"
              required
            >
              <option value="">Selecione o funcionário</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.percentage}%)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="back-button" 
            onClick={() => setStep(1)}
          >
            <FaArrowLeft /> Voltar
          </button>
          <button 
            type="submit" 
            className="create-button" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Criando...
              </>
            ) : (
              <>
                <span className="button-icon">✨</span>
                Criar Ordem de Serviço
              </>
            )}
          </button>
        </div>
      </form>
      
      {showSummary && (
        <div className="order-summary">
          <h3>Resumo da Ordem</h3>
          <p><b>Serviços:</b> {selectedServices.map(id => services.find(s => s.id === id)?.name).join(', ')}</p>
          <p><b>Placa:</b> {formData.plate}</p>
          <p><b>Modelo:</b> {formData.model}</p>
          <p><b>Cor:</b> {formData.color}</p>
          <p><b>Cliente:</b> {formData.customerName} ({formData.customerPhone})</p>
        </div>
      )}
    </div>
  );
};

export default NewOrderPage; 
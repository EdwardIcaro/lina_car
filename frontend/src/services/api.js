import axios from 'axios';

const base = (process.env.REACT_APP_API_URL || 'http://localhost:4000').replace(/\/$/, '');
const API_BASE = base + '/api';

// ORDERS
export const createOrder = (data) => axios.post(`${API_BASE}/orders`, data);
export const getDashboardOrders = () => axios.get(`${API_BASE}/orders/dashboard`);
export const getAllOrders = () => axios.get(`${API_BASE}/orders/all`);
export const listOrders = (params) => axios.get(`${API_BASE}/orders`, { params });
export const updateOrderStatus = (id, status, payments = null) => {
    const data = { status };
    if (payments) {
        data.payments = payments;
    }
    return axios.patch(`${API_BASE}/orders/${id}/status`, data);
};
export const fetchVehicleInfoByPlate = (plate) => axios.get(`${API_BASE}/vehicles/${plate}`);
export const deleteOrder = (id) => axios.delete(`${API_BASE}/orders/${id}`);

// LOCALIZA
export const getLocalizaConfig = () => axios.get(`${API_BASE}/orders/localiza/config`);
export const updateLocalizaConfig = (data) => axios.put(`${API_BASE}/orders/localiza/config`, data);
export const getLocalizaServices = () => axios.get(`${API_BASE}/orders/localiza/services`);
export const createLocalizaService = (data) => axios.post(`${API_BASE}/orders/localiza/services`, data);
export const updateLocalizaService = (id, data) => axios.put(`${API_BASE}/orders/localiza/services/${id}`, data);
export const deleteLocalizaService = (id) => axios.delete(`${API_BASE}/orders/localiza/services/${id}`);

// CASH (CAIXA)
export const openCash = (amount) => axios.post(`${API_BASE}/cash/open`, { amount });
export const withdrawCash = (data) => axios.post(`${API_BASE}/cash/withdraw`, data);
export const getCashHistory = () => axios.get(`${API_BASE}/cash/history`);
export const getCashBalance = () => axios.get(`${API_BASE}/cash/balance`);
export const getCashReports = () => axios.get(`${API_BASE}/cash/reports`);
export const closeCash = (observation) => axios.post(`${API_BASE}/cash/close`, { observation });

// PAYMENTS
export const getAllPayments = (params) => axios.get(`${API_BASE}/payments`, { params });
export const getPaymentStats = () => axios.get(`${API_BASE}/payments/stats`);

// EMPLOYEES
export const getEmployees = () => axios.get(`${API_BASE}/employees`);
export const createEmployee = (data) => axios.post(`${API_BASE}/employees`, data);
export const updateEmployee = (id, data) => axios.put(`${API_BASE}/employees/${id}`, data);
export const deleteEmployee = (id) => axios.delete(`${API_BASE}/employees/${id}`);

// SERVICES
export const getServices = () => axios.get(`${API_BASE}/services`);
export const createService = (data) => axios.post(`${API_BASE}/services`, data);
export const updateService = (id, data) => axios.put(`${API_BASE}/services/${id}`, data);
export const deleteService = (id) => axios.delete(`${API_BASE}/services/${id}`);

// CUSTOMERS
export const searchCustomers = (search) => axios.get(`${API_BASE}/customers`, { params: { search } });
export const getCustomerVehicles = (customerId) => axios.get(`${API_BASE}/customers/${customerId}/vehicles`); 
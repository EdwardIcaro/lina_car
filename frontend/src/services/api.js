import axios from 'axios';

const API_BASE = '/api';

export const createOrder = (data) => axios.post(`${API_BASE}/orders`, data);
export const getDashboardOrders = () => axios.get(`${API_BASE}/orders/dashboard`);
export const updateOrderStatus = (id, status, payments = null) => {
    const data = { status };
    if (payments) {
        data.payments = payments;
    }
    return axios.patch(`${API_BASE}/orders/${id}/status`, data);
};
export const fetchVehicleInfoByPlate = (plate) => axios.get(`${API_BASE}/vehicles/${plate}`);
export const deleteOrder = (id) => axios.delete(`${API_BASE}/orders/${id}`); 
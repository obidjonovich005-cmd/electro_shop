import axios from 'axios';

// Base URL: In production, points to Render backend URL; in local dev, Vite proxies /api
const API_BASE = import.meta.env.VITE_API_URL || '/api';

const API = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Format money in Uzbek Som (e.g. 15 400 000 so'm)
export const formatPrice = (price) => {
  if (price === null || price === undefined) return '0 so\'m';
  const num = Math.round(Number(price));
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' so\'m';
};

// API endpoints
export const fetchStoreMeta = async () => {
  const res = await API.get('/meta/');
  return res.data;
};

export const fetchCategories = async () => {
  const res = await API.get('/categories/');
  return res.data;
};

export const fetchProducts = async (params = {}) => {
  const res = await API.get('/products/', { params });
  return res.data;
};

export const fetchProductDetail = async (slug) => {
  const res = await API.get(`/products/${slug}/`);
  return res.data;
};

export const submitCheckout = async (orderPayload) => {
  const res = await API.post('/checkout/', orderPayload);
  return res.data;
};

export const fetchOrderDetail = async (orderId) => {
  const res = await API.get(`/orders/${orderId}/`);
  return res.data;
};

export const submitOrderPayment = async (orderId, payData) => {
  const res = await API.post(`/orders/${orderId}/pay/`, payData);
  return res.data;
};

export const fetchUserOrders = async () => {
  const res = await API.get('/orders/my/');
  return res.data;
};

export const fetchCurrentUser = async () => {
  const res = await API.get('/auth/me/');
  return res.data;
};

export const loginUser = async (credentials) => {
  const res = await API.post('/auth/login/', credentials);
  return res.data;
};

export const registerUser = async (userData) => {
  const res = await API.post('/auth/register/', userData);
  return res.data;
};

export const logoutUser = async () => {
  const res = await API.post('/auth/logout/');
  return res.data;
};

export const updateUserProfile = async (profileData) => {
  const res = await API.put('/auth/me/', profileData);
  return res.data;
};

export const sendOTP = async (phone) => {
  const res = await API.post('/otp/send/', { phone });
  return res.data;
};

export const verifyOTP = async (phone, code) => {
  const res = await API.post('/otp/verify/', { phone, code });
  return res.data;
};

export default API;

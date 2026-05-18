import axios from "axios";
import { io } from "socket.io-client";

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function getKioskStatus() {
  const { data } = await axios.get(`${API_BASE}/api/kiosk/status`);
  return data;
}

export async function getCategories() {
  const { data } = await axios.get(`${API_BASE}/api/categories`);
  return data;
}

export async function getItems(categoryId) {
  const { data } = await axios.get(`${API_BASE}/api/items`, { params: { categoryId } });
  return data;
}

export async function placeOrder(items) {
  const { data } = await axios.post(`${API_BASE}/api/orders`, { items });
  return data;
}

export function connectSocket(onUpdate, onFlash) {
  const socket = io(API_BASE);
  socket.on("kiosk:update", onUpdate);
  if (onFlash) socket.on("kiosk:flash", onFlash);
  return socket;
}

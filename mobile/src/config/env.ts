/**
 * URLs de los dos backends de UrbanRush.
 *
 * En desarrollo (Expo Go local) → IP LAN de tu PC.
 * En producción (APK compilado con EAS) → URLs públicas de Railway/Render.
 *
 * `__DEV__` es una variable global de React Native: es `true` con `expo start`
 * y `false` cuando el código viene de un build de producción de EAS.
 */

const LAN_IP = "192.168.100.7"; // IP de tu PC en Wi-Fi (ipconfig) para dev

// Producción
const PROD_NEST_API = "https://appurbanrush-production.up.railway.app";
const PROD_FAST_API = "https://urbanrush-fastapi.onrender.com";

// Desarrollo
const DEV_NEST_API = `http://${LAN_IP}:3000`;
const DEV_FAST_API = `http://${LAN_IP}:8000`;

export const NEST_API = __DEV__ ? DEV_NEST_API : PROD_NEST_API;
export const FAST_API = __DEV__ ? DEV_FAST_API : PROD_FAST_API;

export const LAN_HINT = LAN_IP;

import { Platform } from "react-native";

/**
 * URLs de los dos backends de UrbanRush.
 *
 * - NEST_API  → backend 1 (NestJS, lógica de negocio) en :3000
 * - FAST_API  → backend 2 (FastAPI, analítica / inteligencia) en :8000
 *
 * En emulador Android `localhost` apunta al emulador, no al PC. Por eso
 * en Android usamos `10.0.2.2`. En iOS sim sí funciona `localhost`. En
 * un CELULAR físico con Expo Go hay que poner la IP de tu PC en la red
 * local (ej. `192.168.1.42`). Cambiá `LAN_IP` abajo si vas a probar en
 * un celular real.
 */

const LAN_IP = "192.168.100.7"; // IP de tu PC en Wi-Fi (ipconfig)

// Si probás en celular físico con Expo Go, usamos la IP LAN para que
// alcance los backends en tu PC. En emulador iOS usaría "localhost" y
// en emulador Android "10.0.2.2", pero la LAN_IP funciona para los 3.
const host = LAN_IP;

// Alternativa solo para emuladores:
// const host = Platform.select({ android: "10.0.2.2", ios: "localhost", default: "localhost" });

export const NEST_API = `http://${host}:3000`;
export const FAST_API = `http://${host}:8000`;

export const LAN_HINT = LAN_IP;

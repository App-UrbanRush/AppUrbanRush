import type { IAuthRepository } from "../../domain/interfaces/IAuthRepository";
import type { AuthResponse, LoginRequest, RegisterRequest, RegisterDeliveryRequest } from "../../domain/types/auth.types";
import type { RegisterVendorRequest, VendorRegisterResponse } from "../../domain/types/vendor.types";
import { loginApi, registerApi, registerDeliveryApi, registerVendorApi } from "../api/authApi";
import { authLocalStorage } from "../persistence/authLocalStorage";

export class AuthRepositoryImpl implements IAuthRepository {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await loginApi(credentials.email, credentials.password);

      // Guardar en localStorage
      authLocalStorage.saveAuthResponse(response);

      return response;
    } catch (error) {
      throw new Error("Error en login: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  }

  async registerDelivery(data: RegisterDeliveryRequest): Promise<AuthResponse> {
    const response = await registerDeliveryApi(data as any);
    // Backend returns { message, user_id }
    return {
      access_token: "", // No token provided for delivery register since it goes to review
      user: {
        id: response.user_id?.toString() || "",
        email: data.user_email,
        name: data.firstName,
        role: "delivery",
      }
    };
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const apiResponse = await registerApi(data);
      // Backend returns { message, token }

      const response: AuthResponse = {
        access_token: apiResponse.token || apiResponse.access_token || "",
        user: {
          id: "",
          email: data.user_email,
          name: data.firstName,
          role: "user"
        }
      };

      // Guardar en localStorage
      if (response.access_token) {
        authLocalStorage.saveAuthResponse(response);
      }

      return response;
    } catch (error) {
      throw new Error("Error en registro: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  }

  async registerVendor(data: RegisterVendorRequest): Promise<VendorRegisterResponse> {
    return registerVendorApi(data);
  }

  async logout(): Promise<void> {
    authLocalStorage.clear();
  }
}

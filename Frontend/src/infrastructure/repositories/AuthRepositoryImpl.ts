import type { IAuthRepository, UserProfile } from "../../domain/interfaces/IAuthRepository";
import { ROLE_MAP } from "../../domain/types/auth.types";
import type { AuthResponse, LoginRequest, RegisterRequest, RegisterDeliveryRequest } from "../../domain/types/auth.types";
import type { RegisterVendorRequest, VendorRegisterResponse } from "../../domain/types/vendor.types";
import { loginApi, registerApi, registerDeliveryApi, registerVendorApi, getMyProfileApi } from "../api/authApi";
import { authLocalStorage } from "../persistence/authLocalStorage";
import { decodeJwt } from "../utils/jwtDecoder";

export class AuthRepositoryImpl implements IAuthRepository {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const raw = await loginApi(credentials.email, credentials.password);

      const roleId = raw.user?.roles?.[0] ?? 2;
      const roleName = ROLE_MAP[roleId] ?? "Usuario";

      let userId = "";
      let userEmail = credentials.email;

      if (raw.access_token) {
        const payload = decodeJwt(raw.access_token);
        if (payload) {
          userId = payload.user_id.toString();
          userEmail = payload.user_email;
        }
      }

      const authResponse: AuthResponse = {
        access_token: raw.access_token,
        user: {
          id: userId,
          email: userEmail,
          name: userEmail,
          role: roleName,
        },
      };

      authLocalStorage.saveAuthResponse(authResponse);

      return authResponse;
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

  async getMyProfile(): Promise<UserProfile> {
    const profile = await getMyProfileApi();
    return {
      id: profile.id,
      firstName: profile.firstName,
      firstLastName: profile.firstLastName,
      address: profile.address,
    };
  }

  async logout(): Promise<void> {
    authLocalStorage.clear();
  }
}

import type { IAuthRepository, UserProfile, UpdateProfileData } from "../../domain/interfaces/IAuthRepository";
import { ROLE_MAP } from "../../domain/types/auth.types";
import type { AuthResponse, LoginRequest, RegisterRequest, RegisterDeliveryRequest, ForgotPasswordRequest, ForgotPasswordResponse, ResetPasswordRequest, ResetPasswordResponse } from "../../domain/types/auth.types";
import type { RegisterVendorRequest, VendorRegisterResponse } from "../../domain/types/vendor.types";
import { loginApi, registerApi, registerDeliveryApi, registerVendorApi, getMyProfileApi, forgotPasswordApi, resetPasswordApi, verifyCodeApi } from "../api/authApi";
import { peopleApi } from "../api/peopleApi";
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
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 400) {
        throw new Error("Correo o contraseña incorrectos");
      }
      if (!(error as { response?: unknown })?.response) {
        throw new Error("No se pudo conectar con el servidor. Intenta de nuevo");
      }
      throw new Error("No se pudo iniciar sesión. Intenta más tarde");
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
      const token = apiResponse.token || apiResponse.access_token || "";

      // Decodificar el JWT para obtener user_id y rol reales
      let userId = "";
      let role = "Usuario";
      if (token) {
        const payload = decodeJwt(token);
        if (payload) {
          userId = payload.user_id.toString();
          role = ROLE_MAP[payload.rolIds?.[0] ?? 2] ?? "Usuario";
        }
      }

      const response: AuthResponse = {
        access_token: token,
        user: {
          id: userId,
          email: data.user_email,
          name: data.firstName,
          role,
        }
      };

      // Guardar en localStorage
      if (response.access_token) {
        authLocalStorage.saveAuthResponse(response);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async registerVendor(data: RegisterVendorRequest): Promise<VendorRegisterResponse> {
    return registerVendorApi(data);
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const response = await forgotPasswordApi(data.user_email);
    return response;
  }

  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const response = await resetPasswordApi(data);
    return response;
  }

  async verifyCode(email: string, code: string): Promise<{ valid: boolean }> {
    const response = await verifyCodeApi(email, code);
    return response;
  }

  async loginWithToken(token: string): Promise<AuthResponse> {
    const payload = decodeJwt(token);
    if (!payload) throw new Error("Token de Google inválido");

    const roleId = payload.rolIds?.[0] ?? 2;
    const roleName = ROLE_MAP[roleId] ?? "Usuario";

    const authResponse: AuthResponse = {
      access_token: token,
      user: {
        id: payload.user_id.toString(),
        email: payload.user_email,
        name: payload.user_email,
        role: roleName,
      },
    };

    authLocalStorage.saveAuthResponse(authResponse);
    return authResponse;
  }

  async getMyProfile(): Promise<UserProfile> {
    const profile = await getMyProfileApi();
    return {
      id: profile.id,
      firstName: profile.firstName,
      firstLastName: profile.firstLastName,
      address: profile.address,
      cellphone: profile.cellphone,
      gender: profile.gender,
      userId: profile.userId,
      avatarUrl: profile.avatarUrl ?? null,
      latitude: profile.latitude ?? null,
      longitude: profile.longitude ?? null,
    };
  }

  async updateMyProfile(userId: number, data: UpdateProfileData): Promise<void> {
    await peopleApi.updateMyProfile(userId, data);
  }

  async uploadAvatar(file: File): Promise<{ avatar_url: string }> {
    const result = await peopleApi.uploadAvatar(file);
    return { avatar_url: result.avatar_url };
  }

  async logout(): Promise<void> {
    authLocalStorage.clear();
  }
}

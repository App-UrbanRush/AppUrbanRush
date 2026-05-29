import { useState, useCallback, useMemo, useEffect,
   type ReactNode } from "react";
import { AuthContext, type AuthContextType } from "./AuthContext";
import type { AuthState } from "../../domain/types/auth.types";
import type { UserProfile } from "../../domain/interfaces/IAuthRepository";
import { LoginUseCase } from "../../application/use-cases/LoginUseCase";
import { RegisterUseCase } from "../../application/use-cases/RegisterUseCase";
import { LogoutUseCase } from "../../application/use-cases/LogoutUseCase";
import { ForgotPasswordUseCase } from "../../application/use-cases/ForgotPasswordUseCase";
import { ResetPasswordUseCase } from "../../application/use-cases/ResetPasswordUseCase";
import { AuthRepositoryImpl } from "../../infrastructure/repositories/AuthRepositoryImpl";
import { authLocalStorage } from "../../infrastructure/persistence/authLocalStorage";
import { RegisterDeliveryUseCase } from "../../application/use-cases/RegisterDeliveryUseCase";
import { RegisterVendorUseCase } from "../../application/use-cases/RegisterVendorUseCase";
import { GetMyProfileUseCase } from "../../application/use-cases/GetMyProfileUseCase";
import { VerifyDocumentUseCase } from "../../application/use-cases/VerifyDocumentUseCase";
import { VerificationRepositoryImpl } from "../../infrastructure/repositories/VerificationRepositoryImpl";
import type { RegisterDeliveryRequest, RegisterRequest } from "../../domain/types/auth.types";
import type { RegisterVendorRequest, VendorRegisterResponse } from "../../domain/types/vendor.types";
import type { VerifyDocumentRequest } from "../../domain/types/verification.types";
import type { ForgotPasswordRequest, ForgotPasswordResponse } from "../../domain/types/auth.types";
import type { ResetPasswordRequest, ResetPasswordResponse } from "../../domain/types/auth.types";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // INYECCIÓN DE DEPENDENCIAS
const authRepository = useMemo(() => new AuthRepositoryImpl(), []);

const loginUseCase = useMemo(() => new LoginUseCase(authRepository), [authRepository]);
const registerUseCase = useMemo(() => new RegisterUseCase(authRepository), [authRepository]);
const logoutUseCase = useMemo(() => new LogoutUseCase(authRepository), [authRepository]);
const registerDeliveryUseCase = useMemo(
  () => new RegisterDeliveryUseCase(authRepository),
  [authRepository]
);

const registerVendorUseCase = useMemo(
  () => new RegisterVendorUseCase(authRepository),
  [authRepository]
);

const forgotPasswordUseCase = useMemo(
  () => new ForgotPasswordUseCase(authRepository),
  [authRepository]
);

const resetPasswordUseCase = useMemo(
  () => new ResetPasswordUseCase(authRepository),
  [authRepository]
);

const getMyProfileUseCase = useMemo(
  () => new GetMyProfileUseCase(authRepository),
  [authRepository]
);

const verificationRepository = useMemo(() => new VerificationRepositoryImpl(), []);
const verifyDocumentUseCase = useMemo(
  () => new VerifyDocumentUseCase(verificationRepository),
  [verificationRepository]
);

  // STATE
const [state, setState] = useState<AuthState>({
  user: authLocalStorage.getUser(),
  token: authLocalStorage.getToken(),
  isAuthenticated: !!authLocalStorage.getToken(),
  isLoading: false,
  error: null,
});


  // Escuchar evento de no autorizado (disparado por el interceptor 401 de axios)
  useEffect(() => {
    const handleUnauthorized = () => {
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // LOGIN
  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await loginUseCase.execute({ email, password });

      setState((prev) => ({
        ...prev,
        token: response.access_token,
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));

      // Fetch full profile after login to get firstName + firstLastName
      try {
        const profile = await getMyProfileUseCase.execute();
        setMyProfile(profile);
        // Update user name with real name from profile
        if (profile.firstName) {
          setState((prev) => ({
            ...prev,
            user: prev.user
              ? { ...prev.user, name: `${profile.firstName} ${profile.firstLastName}` }
              : null,
          }));
        }
      } catch {
        // Profile fetch is best-effort
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error en login";

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      throw error;
    }
  }, [loginUseCase, getMyProfileUseCase]);

  // REGISTER
  const register = useCallback(
    async (data: RegisterRequest) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await registerUseCase.execute(data);

        setState((prev) => ({
          ...prev,
          token: response.access_token,
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error en registro";

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        throw error;
      }
    },
    [registerUseCase]
  );

  // ✅ REGISTER DELIVERY (ARREGLADO)
  const registerDelivery = useCallback(
    async (data: RegisterDeliveryRequest) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await registerDeliveryUseCase.execute(data);

        setState((prev) => ({
          ...prev,
          token: response.access_token,
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Error al registrar delivery";

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        throw error;
      }
    },
    [registerDeliveryUseCase]
  );

  // REGISTER VENDOR
  const registerVendor = useCallback(
    async (data: RegisterVendorRequest): Promise<VendorRegisterResponse> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await registerVendorUseCase.execute(data);

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: null,
        }));

        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Error al registrar negocio";

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        throw error;
      }
    },
    [registerVendorUseCase]
  );

  // LOGOUT
  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      await logoutUseCase.execute();

      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error en logout";

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [logoutUseCase]);

  // FORGOT PASSWORD
  const forgotPassword = useCallback(
    async (email: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await forgotPasswordUseCase.execute({ user_email: email });

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: null,
        }));

        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error al enviar código de recuperación";

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        throw error;
      }
    },
    [forgotPasswordUseCase]
  );

  // RESET PASSWORD
  const resetPassword = useCallback(
    async (data: { user_email: string; code: string; new_password: string }) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await resetPasswordUseCase.execute(data);

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: null,
        }));

        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error al restablecer contraseña";

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        throw error;
      }
    },
    [resetPasswordUseCase]
  );

  // MY PROFILE
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);

  const fetchMyProfile = useCallback(async () => {
    try {
      const profile = await getMyProfileUseCase.execute();
      setMyProfile(profile);
      // Update user name from profile
      if (profile.firstName) {
        setState((prev) => ({
          ...prev,
          user: prev.user
            ? { ...prev.user, name: `${profile.firstName} ${profile.firstLastName}` }
            : null,
        }));
      }
    } catch {
      setMyProfile(null);
    }
  }, [getMyProfileUseCase]);

  // VERIFY DOCUMENT
  const verifyDocument = useCallback(
    async (images: File[], data: VerifyDocumentRequest) => {
      return verifyDocumentUseCase.execute(images, data);
    },
    [verifyDocumentUseCase]
  );

const value: AuthContextType = {
  ...state,
  login,
  register,
  logout,
  registerDelivery,
  registerVendor,
  forgotPassword,
  resetPassword,
  verifyDocument,
  myProfile,
  fetchMyProfile,
};

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
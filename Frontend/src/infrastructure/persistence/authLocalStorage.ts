export const authLocalStorage = {
  getToken: (): string | null => {
    return localStorage.getItem("token");
  },

  saveToken: (token: string): void => {
    localStorage.setItem("token", token);
  },

  removeToken: (): void => {
    localStorage.removeItem("token");
  },
};

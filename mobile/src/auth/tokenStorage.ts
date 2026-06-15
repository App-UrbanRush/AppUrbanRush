import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "ur_token";
const USER_KEY = "ur_user";

export interface StoredUser {
  id: number;
  email: string;
  role: string;
}

export const tokenStorage = {
  async save(token: string, user: StoredUser): Promise<void> {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, token],
      [USER_KEY, JSON.stringify(user)],
    ]);
  },

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  },

  async getUser(): Promise<StoredUser | null> {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  async clear(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  },
};

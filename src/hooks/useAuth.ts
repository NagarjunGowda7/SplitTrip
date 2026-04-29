import { useAuthStore } from "@/store/authStore";

export const useAuth = () => {
  const { user, loading, login, register, logout } = useAuthStore();

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: Boolean(user),
  };
};

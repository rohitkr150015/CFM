import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

/* =======================
   TYPES
======================= */

export type UserRole = "ADMIN" | "TEACHER" | "HOD" | "SUBJECT_HEAD";

export interface User {
  id: number;
  username: string;
  email?: string;
  role: UserRole;
  teacherId?: number;
  token: string; // TEMP_TOKEN
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;

  /** UI role (HOD can switch to Teacher) */
  activeRole: UserRole | null;

  login: (userData: User) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;

  getRoleBasedRedirect: (role: UserRole) => string;
}

/* =======================
   CONTEXT
======================= */

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const STORAGE_KEY = "courseflow_auth";

/* =======================
   PROVIDER
======================= */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  /* =======================
     LOAD FROM STORAGE
  ======================= */

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        const userData: User = JSON.parse(stored);
        setUser(userData);

        // 🔥 Default active role
        if (userData.role === "HOD") {
          setActiveRole("HOD");
        } else {
          setActiveRole(userData.role);
        }
      } catch (err) {
        console.error("Auth parse failed", err);
        localStorage.removeItem(STORAGE_KEY);
        resetAuth();
      }
    }

    setLoading(false);
  }, []);

  /* =======================
     HELPERS
  ======================= */

  const resetAuth = () => {
    setUser(null);
    setActiveRole(null);
  };

  /* =======================
     ACTIONS
  ======================= */

  const login = (userData: User) => {
    setUser(userData);

    if (userData.role === "HOD") {
      setActiveRole("HOD");
    } else {
      setActiveRole(userData.role);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  };

  const logout = () => {
    resetAuth();
    localStorage.removeItem(STORAGE_KEY);
  };

  /**
   * UI role switch (ONLY HOD allowed)
   */
  const switchRole = (role: UserRole) => {
    if (role === "HOD" && user?.role !== "HOD") return;
    setActiveRole(role);
  };

  /* =======================
     REDIRECT UTILS
  ======================= */

  const getRoleBasedRedirect = (role: UserRole): string => {
    switch (role) {
      case "ADMIN":
        return "/admin";
      case "HOD":
        return "/hod/dashboard";
      case "SUBJECT_HEAD":
        return "/subject-head/dashboard";
      case "TEACHER":
        return "/teacher/dashboard";
      default:
        return "/login";
    }
  };

  /* =======================
     CONTEXT VALUE
  ======================= */

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: Boolean(user), // 🔥 TEMP MODE FIX

    activeRole,
    switchRole,

    login,
    logout,
    getRoleBasedRedirect,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* =======================
   HOOK
======================= */

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

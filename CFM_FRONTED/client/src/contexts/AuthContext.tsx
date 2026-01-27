import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { authFetch } from "@/utils/authFetch";

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

  /** UI role (HOD can switch to Teacher, Teacher with Subject Head can switch) */
  activeRole: UserRole | null;

  /** Whether current teacher is also a subject head */
  isSubjectHead: boolean;

  login: (userData: User) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;

  getRoleBasedRedirect: (role: UserRole) => string;
  checkSubjectHeadStatus: () => Promise<void>;
}

/* =======================
   CONTEXT
======================= */

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const STORAGE_KEY = "courseflow_auth";
const ACTIVE_ROLE_KEY = "courseflow_active_role";

/* =======================
   PROVIDER
======================= */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubjectHead, setIsSubjectHead] = useState(false);

  /* =======================
     LOAD FROM STORAGE
  ======================= */

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedActiveRole = localStorage.getItem(ACTIVE_ROLE_KEY);

    if (stored) {
      try {
        const userData: User = JSON.parse(stored);
        setUser(userData);

        // Check for stored active role first
        if (storedActiveRole && ["TEACHER", "HOD", "SUBJECT_HEAD", "ADMIN"].includes(storedActiveRole)) {
          setActiveRole(storedActiveRole as UserRole);
        } else if (userData.role === "HOD") {
          setActiveRole("HOD");
        } else {
          setActiveRole(userData.role);
        }

        // Check subject head status for teachers
        if (userData.role === "TEACHER") {
          checkSubjectHeadStatusInternal(userData);
        }
      } catch (err) {
        console.error("Auth parse failed", err);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(ACTIVE_ROLE_KEY);
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
    setIsSubjectHead(false);
  };

  const checkSubjectHeadStatusInternal = async (userData: User) => {
    try {
      const res = await authFetch("/api/teacher/is-subject-head");
      if (res.ok) {
        const data = await res.json();
        setIsSubjectHead(data.isSubjectHead === true);

        // If user is subject head and no active role is set, default to subject head dashboard
        const storedActiveRole = localStorage.getItem(ACTIVE_ROLE_KEY);
        if (data.isSubjectHead && !storedActiveRole) {
          setActiveRole("SUBJECT_HEAD");
          localStorage.setItem(ACTIVE_ROLE_KEY, "SUBJECT_HEAD");
        }
      }
    } catch (error) {
      console.error("Failed to check subject head status:", error);
    }
  };

  const checkSubjectHeadStatus = async () => {
    if (user?.role === "TEACHER") {
      await checkSubjectHeadStatusInternal(user);
    }
  };

  /* =======================
     ACTIONS
  ======================= */

  const login = async (userData: User) => {
    setUser(userData);

    if (userData.role === "HOD") {
      setActiveRole("HOD");
    } else {
      setActiveRole(userData.role);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));

    // Check if teacher is also a subject head
    if (userData.role === "TEACHER") {
      try {
        const res = await authFetch("/api/teacher/is-subject-head");
        if (res.ok) {
          const data = await res.json();
          setIsSubjectHead(data.isSubjectHead === true);

          // If user is subject head, default to subject head dashboard
          if (data.isSubjectHead) {
            setActiveRole("SUBJECT_HEAD");
            localStorage.setItem(ACTIVE_ROLE_KEY, "SUBJECT_HEAD");
          }
        }
      } catch (error) {
        console.error("Failed to check subject head status:", error);
      }
    }
  };

  const logout = () => {
    resetAuth();
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVE_ROLE_KEY);
  };

  /**
   * UI role switch (HOD can switch to Teacher, Teacher with Subject Head role can switch)
   */
  const switchRole = (role: UserRole) => {
    // HOD can switch between HOD and TEACHER
    if (user?.role === "HOD" && (role === "HOD" || role === "TEACHER")) {
      setActiveRole(role);
      localStorage.setItem(ACTIVE_ROLE_KEY, role);
      return;
    }

    // Teacher who is also Subject Head can switch between TEACHER and SUBJECT_HEAD
    if (user?.role === "TEACHER" && isSubjectHead && (role === "TEACHER" || role === "SUBJECT_HEAD")) {
      setActiveRole(role);
      localStorage.setItem(ACTIVE_ROLE_KEY, role);
      return;
    }
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
    isSubjectHead,
    switchRole,

    login,
    logout,
    getRoleBasedRedirect,
    checkSubjectHeadStatus,
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

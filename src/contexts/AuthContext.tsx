import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// User type definition
export interface User {
  id: string;
  email: string;
  username: string;
  preferredPerspective?: 'right' | 'left';
  createdAt: Date;
}

// Auth context type
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  updatePreference: (perspective: 'right' | 'left') => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          ...parsedUser,
          createdAt: new Date(parsedUser.createdAt)
        });
      } catch (e) {
        console.error('Failed to parse stored user', e);
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Simple password hashing (in production, use proper bcrypt/argon2)
  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Register new user
  const register = async (email: string, username: string, password: string) => {
    // Input validation
    if (!email || !username || !password) {
      throw new Error('All fields are required');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    if (!email.includes('@')) {
      throw new Error('Invalid email format');
    }

    // Check if user already exists
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    if (existingUsers.find((u: User) => u.email === email)) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      username,
      createdAt: new Date()
    };

    // Store user credentials (in production, this would be server-side)
    const users = [...existingUsers, { ...newUser, password: hashedPassword }];
    localStorage.setItem('users', JSON.stringify(users));

    // Set current user
    setUser(newUser);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
  };

  // Login existing user
  const login = async (email: string, password: string) => {
    // Input validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Hash password for comparison
    const hashedPassword = await hashPassword(password);

    // Find user
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find(
      (u: User & { password: string }) =>
        u.email === email && u.password === hashedPassword
    );

    if (!foundUser) {
      throw new Error('Invalid email or password');
    }

    // Set current user (exclude password)
    const { password: _, ...userWithoutPassword } = foundUser;
    setUser({
      ...userWithoutPassword,
      createdAt: new Date(userWithoutPassword.createdAt)
    });
    localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword));
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  // Update user preference
  const updatePreference = (perspective: 'right' | 'left') => {
    if (user) {
      const updatedUser = { ...user, preferredPerspective: perspective };
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));

      // Update in users array too
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map((u: User) =>
        u.id === user.id ? { ...u, preferredPerspective: perspective } : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updatePreference,
    isAuthenticated: !!user
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

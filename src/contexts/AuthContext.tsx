import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  matricule: string;
  name: string;
  partner_id?: number;
  device_unique_id?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('userData');
      }
    }
    setLoading(false);
  }, []);

  const normalizeUserData = (raw: any): User | null => {
    if (!raw || typeof raw !== 'object') return null;
    const fullName = raw.name || '';
    const [first = '', ...rest] = fullName.split(' ');
    const last = rest.join(' ').trim();
    const emailFromLogin = raw.login || raw.email || '';
    
    return {
      id: raw.id || raw.uid || raw.partner_id,
      firstname: raw.firstname || first,
      lastname: raw.lastname || last,
      name: raw.name || `${raw.firstname || first} ${raw.lastname || last}`.trim(),
      email: emailFromLogin,
      phone: raw.phone || raw.mobile || '',
      matricule: raw.matricule || raw.source_id || raw.user_id || raw.uid || '',
      partner_id: raw.partner_id,
      device_unique_id: raw.device_unique_id,
    };
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!password.trim()) {
      throw new Error('Veuillez entrer votre mot de passe');
    }

    setLoading(true);
    
    const requestBody = {
      db: "metua_erp_db",
      login: email,
      password: password
    };

    try {
      const response = await fetch('https://dev.metuaa.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': 'EKJ0BDHKQ2MGNV3S26GVFMV3ZXSN1DMK',
          'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6ImFkbWluQG1ldHVhYS5vcmciLCJ1aWQiOjJ9.IVq2qul-eEnyvdhaFndrLK5WDZ0A0-uOKTJ7QV8mhWw',
        },
        body: JSON.stringify(requestBody),
      });
    
      const data = await response.json();
      console.log(data);

      if (data && data.data) {
        const normalizedUser = normalizeUserData(data.data);
        if (normalizedUser) {
          setUser(normalizedUser);
          localStorage.setItem('userData', JSON.stringify(normalizedUser));
          return true;
        }
      }
      
      throw new Error('Identifiants incorrects. Veuillez réessayer.');
    } catch (error) {
      console.error("Erreur d'authentification:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userData');
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
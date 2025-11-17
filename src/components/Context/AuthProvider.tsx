import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AuthContextType {
  tokenPromise: any;
  setTokenPromise: (token: any) => void;
  resendOTP:boolean
  setResendOTP: (token: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tokenPromise, setTokenPromise] = useState<any>(null);
  const [resendOTP, setResendOTP] = useState<any>(false);

  return (
    <AuthContext.Provider value={{ tokenPromise, setTokenPromise, resendOTP , setResendOTP }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
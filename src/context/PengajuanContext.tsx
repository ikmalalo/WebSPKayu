import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Pengajuan } from '@/types';

interface PengajuanContextType {
  pengajuan: Pengajuan | null;
  setPengajuan: (p: Pengajuan | null) => void;
}

const PengajuanContext = createContext<PengajuanContextType | undefined>(undefined);

const STORAGE_KEY = 'spk_pengajuan';

export const PengajuanProvider = ({ children }: { children: ReactNode }) => {
  const [pengajuan, setPengajuanState] = useState<Pengajuan | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const setPengajuan = (p: Pengajuan | null) => {
    setPengajuanState(p);
    if (p) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <PengajuanContext.Provider value={{ pengajuan, setPengajuan }}>
      {children}
    </PengajuanContext.Provider>
  );
};

export const usePengajuan = () => {
  const context = useContext(PengajuanContext);
  if (!context) throw new Error('usePengajuan must be used within PengajuanProvider');
  return context;
};

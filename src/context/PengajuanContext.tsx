import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Pengajuan } from '@/types';

interface PengajuanContextType {
  pengajuan: Pengajuan | null;
  setPengajuan: (p: Pengajuan | null) => void;
}

const PengajuanContext = createContext<PengajuanContextType | undefined>(undefined);

export const PengajuanProvider = ({ children }: { children: ReactNode }) => {
  const [pengajuan, setPengajuan] = useState<Pengajuan | null>(null);
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

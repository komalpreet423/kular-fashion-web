'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Currency = 'USD' | 'EUR' | 'GBP';

interface CurrencyContextProps {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convert: (amount: number, base: Currency, target: Currency) => number;
}

const CurrencyContext = createContext<CurrencyContextProps | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>('USD');

  const exchangeRates = {
    USD: 1,
    EUR: 0.87613,
    GBP: 0.7369,
  };

  useEffect(() => {
    const stored = localStorage.getItem('selectedCurrency');
    if (stored && ['USD', 'EUR', 'GBP'].includes(stored)) {
      setCurrency(stored as Currency);
    }
  }, []);

  const updateCurrency = (curr: Currency) => {
    setCurrency(curr);
    localStorage.setItem('selectedCurrency', curr);
  };

  const convert = (amount: number, base: Currency, target: Currency): number => {
    const usdAmount = amount / exchangeRates[base];
    return usdAmount * exchangeRates[target];
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: updateCurrency, convert }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};

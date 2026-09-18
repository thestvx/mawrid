import { createContext, useCallback, useContext, useState } from 'react';
import { CURRENCIES, DEFAULT_CURRENCY, getCurrency, formatUsd, formatValue, convertUsd, productPrices as libProductPrices } from '../lib/currency';

const CurrencyContext = createContext(null);

const STORAGE_KEY = 'mawrid_currency';

function getInitialCurrency() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && CURRENCIES.some((c) => c.code === stored)) return stored;
  } catch {}
  return DEFAULT_CURRENCY;
}

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(getInitialCurrency);

  const setCurrency = useCallback((code) => {
    setCurrencyState(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch {}
  }, []);

  const fmt = useCallback((usdAmount) => formatUsd(usdAmount, currency), [currency]);
  const fmtValue = useCallback((value) => formatValue(value, currency), [currency]);
  const convert = useCallback((usdAmount) => convertUsd(usdAmount, currency), [currency]);
  const productPrices = useCallback((product) => libProductPrices(product, currency), [currency]);

  const value = {
    currency,
    setCurrency,
    meta: getCurrency(currency),
    fmt,
    fmtValue,
    convert,
    productPrices,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
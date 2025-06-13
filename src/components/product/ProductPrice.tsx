'use client';

import { useCurrency } from '@/context/CurrencyContext';

const ProductPrice = ({ basePrice }: { basePrice: number }) => {
  const { currency, convert } = useCurrency();

  const converted = convert(basePrice, 'USD', currency);

  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
  };

  const symbol = symbols[currency] || currency;

  return (
    <span>
      {symbol}{converted.toFixed(2)}
    </span>
  );
};

export default ProductPrice;

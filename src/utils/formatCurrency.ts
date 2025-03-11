/**
 * Formats a numeric amount into a currency string.
 *
 * @param amount - The numeric amount to format.
 * @param currencyCode - The currency code (e.g., 'GBP', 'USD').
 * @returns The formatted currency string (e.g., '£100.00').
 */
export const formatCurrency = (amount: number, currencyCode: string = 'GBP'): string => {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};
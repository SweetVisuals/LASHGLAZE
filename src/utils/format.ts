/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const formatPrice = (amount: number, currency: string = '£') => {
  const rates: Record<string, number> = {
    '£': 1.0,
    '€': 1.17,
    '$': 1.27
  };
  const rate = rates[currency] || 1.0;
  return `${currency}${(amount * rate).toFixed(2)}`;
};

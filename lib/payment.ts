export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function luhnOk(value: string): boolean {
  const number = digitsOnly(value);
  if (!/^\d{13,19}$/.test(number)) return false;
  let sum = 0;
  let alternate = false;
  for (let index = number.length - 1; index >= 0; index -= 1) {
    let digit = number.charCodeAt(index) - 48;
    if (alternate) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

export function cardBrand(value: string): string {
  const number = digitsOnly(value);
  if (/^3[47]/.test(number)) return "American Express";
  if (/^4/.test(number)) return "Visa";
  if (/^5[1-5]/.test(number) || /^2(2|3|4|5|6|7)/.test(number)) return "Mastercard";
  return "Card";
}

export function validExpiry(value: string, today = new Date()): boolean {
  const match = value.trim().match(/^(\d{2})\s*\/\s*(\d{2})$/);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const expiry = new Date(year, month, 1);
  const current = new Date(today.getFullYear(), today.getMonth(), 1);
  return expiry > current;
}

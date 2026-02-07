import { randomInt } from "node:crypto";

export function randomNDigitInt(digits: number): bigint {
  const safeDigits = Math.max(1, digits);
  const firstDigit = randomInt(1, 10).toString();
  let rest = "";
  for (let i = 0; i < safeDigits - 1; i += 1) {
    rest += randomInt(0, 10).toString();
  }
  return BigInt(`${firstDigit}${rest}`);
}

export function randomBigIntBits(bits: number): bigint {
  const safeBits = Math.max(2, bits);
  const bytes = Math.ceil(safeBits / 8);
  const hex = Array.from({ length: bytes }, () => randomInt(0, 256).toString(16).padStart(2, "0")).join("");
  let value = BigInt(`0x${hex}`);
  const mask = (1n << BigInt(safeBits)) - 1n;
  value &= mask;
  value |= 1n << BigInt(safeBits - 1);
  return value;
}

export function modExp(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = 1n;
  let b = ((base % mod) + mod) % mod;
  let e = exp;

  while (e > 0n) {
    if (e % 2n === 1n) {
      result = (result * b) % mod;
    }
    e /= 2n;
    b = (b * b) % mod;
  }

  return result;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

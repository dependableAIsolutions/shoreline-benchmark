import { modExp } from "../utils/math";

export function multiplicationGroundTruth(a: string, b: string): string {
  return (BigInt(a) * BigInt(b)).toString();
}

export function modularExpGroundTruth(base: string, exp: string, mod: string): string {
  return modExp(BigInt(base), BigInt(exp), BigInt(mod)).toString();
}

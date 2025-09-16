import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 숫자를 통화 형식으로 포맷합니다.
 * @param value 포맷할 숫자
 * @param currency 통화 코드 (기본값: 'KRW')
 * @returns 포맷된 통화 문자열
 */
export function formatCurrency(value: number, currency: string = 'KRW'): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * 숫자를 퍼센트 형식으로 포맷합니다.
 * @param value 포맷할 숫자 (0-1 범위)
 * @param decimals 소수점 자릿수 (기본값: 1)
 * @returns 포맷된 퍼센트 문자열
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

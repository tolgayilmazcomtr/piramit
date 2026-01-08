import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Developer: Tolga Yılmaz
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const playAudio = async (audioPath: string): Promise<void> => {
  try {
    const audio = new Audio(audioPath)
    await audio.play()
  } catch (error) {
    console.error('Error playing audio:', error)
  }
}
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Define label types and their styling
export const PLAYER_LABELS = {
  NONE: { value: "", label: "No Label", color: "text-gray-400" },
  AVOID: { value: "Avoid", label: "Avoid", color: "text-red-600" },
  TARGET: { value: "Target", label: "Target", color: "text-green-600" },
  UPSIDE: { value: "Upside", label: "Upside", color: "text-blue-600" },
  FLOOR: { value: "Floor", label: "Floor", color: "text-orange-600" },
  STEAL: { value: "Steal", label: "Steal", color: "text-purple-600" },
} as const

export type PlayerLabelValue = typeof PLAYER_LABELS[keyof typeof PLAYER_LABELS]['value']

// Helper function to get label config by value
export const getLabelConfig = (labelValue: string | null | undefined) => {
  return Object.values(PLAYER_LABELS).find(label => label.value === labelValue) || PLAYER_LABELS.NONE
}

// Helper function to get label color class
export const getLabelColor = (labelValue: string | null | undefined) => {
  return getLabelConfig(labelValue).color
}
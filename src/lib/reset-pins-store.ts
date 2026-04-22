// Simple in-memory store for password reset PINs
// In production, this should use Redis or a database table

interface ResetPinEntry {
  pin: string
  expires: number
}

// Use global to persist across route handler invocations
const globalForPins = globalThis as unknown as {
  resetPins: Map<string, ResetPinEntry> | undefined
}

export const resetPins = globalForPins.resetPins ?? new Map<string, ResetPinEntry>()

if (process.env.NODE_ENV !== 'production') {
  globalForPins.resetPins = resetPins
}

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { randomInt } from 'crypto'
import { resetPins } from '@/lib/reset-pins-store'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // Don't reveal whether the email exists
      return NextResponse.json({ success: true, message: 'If an account with that email exists, a PIN has been sent.' })
    }

    // Generate 6-digit PIN
    const pin = String(randomInt(100000, 999999))
    const expires = Date.now() + 10 * 60 * 1000 // 10 minutes

    // Store PIN (in production, send via email)
    resetPins.set(email, { pin, expires })

    // For this implementation, we'll log the PIN and also return it in development
    console.log(`[FORGOT PASSWORD] PIN for ${email}: ${pin}`)

    return NextResponse.json({ 
      success: true, 
      message: 'If an account with that email exists, a PIN has been sent.',
      // In development, include the PIN so it can be used for testing
      ...(process.env.NODE_ENV === 'development' && { devPin: pin }),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { resetPins } from '@/lib/reset-pins-store'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { email, pin, newPassword } = await req.json()
    if (!email || !pin || !newPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Verify PIN
    const stored = resetPins.get(email)
    if (!stored || stored.pin !== pin) {
      return NextResponse.json({ error: 'Invalid or expired PIN' }, { status: 400 })
    }

    if (Date.now() > stored.expires) {
      resetPins.delete(email)
      return NextResponse.json({ error: 'PIN has expired. Please request a new one.' }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update user password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    })

    // Clean up used PIN
    resetPins.delete(email)

    return NextResponse.json({ success: true, message: 'Password reset successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

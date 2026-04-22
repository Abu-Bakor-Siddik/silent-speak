import { NextRequest, NextResponse } from 'next/server'
import { resetPins } from '@/lib/reset-pins-store'

export async function POST(req: NextRequest) {
  try {
    const { email, pin } = await req.json()
    if (!email || !pin) {
      return NextResponse.json({ error: 'Email and PIN are required' }, { status: 400 })
    }

    const stored = resetPins.get(email)
    if (!stored) {
      return NextResponse.json({ error: 'No PIN was requested for this email. Please start over.' }, { status: 400 })
    }

    if (Date.now() > stored.expires) {
      resetPins.delete(email)
      return NextResponse.json({ error: 'PIN has expired. Please request a new one.' }, { status: 400 })
    }

    if (stored.pin !== pin) {
      return NextResponse.json({ error: 'Invalid PIN. Please try again.' }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'PIN verified successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'

/** Turn Next.js draft mode off — clears the preview cookie. */
export async function GET() {
  ;(await draftMode()).disable()
  return NextResponse.json({ draftMode: 'disabled' })
}

import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Exclude API, Next internals, Studio, metadata routes, and any file with an extension.
  matcher: [
    '/((?!api|_next|_vercel|studio|icon|favicon|sitemap|robots|manifest|.*\\..*).*)',
  ],
}

import { CONTACT } from './constants'

/* ============================================================
 * WhatsApp message builder for MediCare Plus
 *
 * Every WhatsApp trigger on the site routes through `getWhatsAppUrl`
 * so the receiving end gets a context-rich, professional message.
 * ============================================================ */

export type Locale = 'ar' | 'en'

export type WhatsAppPage =
  | 'home'
  | 'cosmetic'
  | 'surgery'
  | 'audiology'
  | 'about'
  | 'offers'
  | 'contact'

export type TimePreference = 'morning' | 'evening' | 'any'

export type WhatsAppMessageType =
  | 'booking'
  | 'inquiry'
  | 'support'
  | 'offer'
  | 'doctor-inquiry'
  | 'general'

export type WhatsAppContextRich = {
  type: WhatsAppMessageType
  locale: Locale
  department?: { slug?: string; name?: string } | null
  service?: { slug?: string; name?: string; price?: number | null } | null
  doctor?: { name: string; specialty?: string } | null
  offer?: {
    title: string
    offerPrice?: number | null
    originalPrice?: number | null
    currency?: string | null
  } | null
  timePreference?: TimePreference | null
  customerName?: string | null
  customerPhone?: string | null
  notes?: string | null
  supportType?: string | null
}

/** Legacy short-form context kept for older call sites. */
export type WhatsAppContextLegacy = {
  locale: Locale
  page?: WhatsAppPage
  /** Optional addition appended after an em-dash. */
  service?: string
}

export type WhatsAppContext = WhatsAppContextRich | WhatsAppContextLegacy

/* --------------------------------------------------------- Templates */

const LABELS: Record<Locale, Record<string, string>> = {
  ar: {
    greeting: 'السلام عليكم ورحمة الله وبركاته،',
    bookingIntro: 'أرغب في حجز موعد في مركز ميديكير بلس الطبي:',
    inquiryIntro: 'لدي استفسار حول:',
    supportIntro: 'أحتاج المساعدة في:',
    offerIntro: 'أرغب في الاستفادة من العرض:',
    doctorIntro: 'أرغب في حجز موعد مع:',
    generalIntro: 'أرغب في التواصل مع مركز ميديكير بلس الطبي.',
    department: '📋 القسم',
    service: '💉 الخدمة',
    doctor: '👨‍⚕️ الطبيب',
    specialty: '🎯 التخصص',
    offer: '🎁 العرض',
    price: '💰 السعر',
    offerPrice: '💰 سعر العرض',
    originalPrice: 'بدلاً من',
    timePreference: '⏰ الوقت المفضّل',
    name: '👤 الاسم',
    phone: '📱 الجوال',
    notesHeader: '📝 ملاحظات إضافية:',
    questionHeader: 'سؤالي:',
    supportType: 'نوع الدعم',
    thanks: 'شكراً لكم.',
    closingOffer: 'أنتظر التواصل.',
    currency: 'ر.س',
    timeMorning: 'صباحاً',
    timeEvening: 'مساءً',
    timeAny: 'أي وقت',
  },
  en: {
    greeting: 'Peace be upon you,',
    bookingIntro:
      'I would like to book an appointment at MediCare Plus:',
    inquiryIntro: 'I have a question about:',
    supportIntro: 'I need help with:',
    offerIntro: 'I would like to take advantage of the offer:',
    doctorIntro: 'I would like to book an appointment with:',
    generalIntro:
      'I would like to get in touch with MediCare Plus.',
    department: '📋 Department',
    service: '💉 Service',
    doctor: '👨‍⚕️ Doctor',
    specialty: '🎯 Specialty',
    offer: '🎁 Offer',
    price: '💰 Price',
    offerPrice: '💰 Offer price',
    originalPrice: 'instead of',
    timePreference: '⏰ Preferred time',
    name: '👤 Name',
    phone: '📱 Phone',
    notesHeader: '📝 Additional notes:',
    questionHeader: 'My question:',
    supportType: 'Support type',
    thanks: 'Thank you.',
    closingOffer: 'Looking forward to your reply.',
    currency: 'SAR',
    timeMorning: 'Morning',
    timeEvening: 'Evening',
    timeAny: 'Any time',
  },
}

function timeLabel(locale: Locale, pref: TimePreference): string {
  const L = LABELS[locale]
  if (pref === 'morning') return L.timeMorning
  if (pref === 'evening') return L.timeEvening
  return L.timeAny
}

function isRichContext(c: WhatsAppContext): c is WhatsAppContextRich {
  return (c as WhatsAppContextRich).type !== undefined
}

/* --------------------------------------------------------- Builders */

function buildBookingMessage(ctx: WhatsAppContextRich): string {
  const L = LABELS[ctx.locale]
  const lines: string[] = [L.greeting, L.bookingIntro]

  if (ctx.department?.name) {
    lines.push(`${L.department}: ${ctx.department.name}`)
  }
  if (ctx.service?.name) {
    lines.push(`${L.service}: ${ctx.service.name}`)
  }
  if (typeof ctx.service?.price === 'number') {
    lines.push(`${L.price}: ${ctx.service.price} ${L.currency}`)
  }
  if (ctx.timePreference) {
    lines.push(`${L.timePreference}: ${timeLabel(ctx.locale, ctx.timePreference)}`)
  }
  if (ctx.customerName?.trim()) {
    lines.push(`${L.name}: ${ctx.customerName.trim()}`)
  }
  if (ctx.customerPhone?.trim()) {
    lines.push(`${L.phone}: ${ctx.customerPhone.trim()}`)
  }
  if (ctx.notes?.trim()) {
    lines.push(L.notesHeader)
    lines.push(ctx.notes.trim())
  }

  lines.push('')
  lines.push(L.thanks)
  return lines.join('\n')
}

function buildInquiryMessage(ctx: WhatsAppContextRich): string {
  const L = LABELS[ctx.locale]
  const lines: string[] = [L.greeting, L.inquiryIntro]

  if (ctx.department?.name) {
    lines.push(`${L.department}: ${ctx.department.name}`)
  }
  if (ctx.service?.name) {
    lines.push(`${L.service}: ${ctx.service.name}`)
  }
  if (ctx.customerName?.trim()) {
    lines.push(`${L.name}: ${ctx.customerName.trim()}`)
  }
  if (ctx.customerPhone?.trim()) {
    lines.push(`${L.phone}: ${ctx.customerPhone.trim()}`)
  }
  if (ctx.notes?.trim()) {
    lines.push(L.questionHeader)
    lines.push(ctx.notes.trim())
  }

  lines.push('')
  lines.push(L.thanks)
  return lines.join('\n')
}

function buildSupportMessage(ctx: WhatsAppContextRich): string {
  const L = LABELS[ctx.locale]
  const lines: string[] = [L.greeting, L.supportIntro]

  if (ctx.supportType?.trim()) {
    lines.push(`${L.supportType}: ${ctx.supportType.trim()}`)
  }
  if (ctx.notes?.trim()) {
    lines.push(ctx.notes.trim())
  }

  lines.push('')
  lines.push(L.thanks)
  return lines.join('\n')
}

function buildOfferMessage(ctx: WhatsAppContextRich): string {
  const L = LABELS[ctx.locale]
  const lines: string[] = [L.greeting, L.offerIntro]
  const currency = ctx.offer?.currency || L.currency

  if (ctx.offer?.title) {
    lines.push(`${L.offer}: ${ctx.offer.title}`)
  }
  if (typeof ctx.offer?.offerPrice === 'number') {
    const base = `${L.offerPrice}: ${ctx.offer.offerPrice} ${currency}`
    if (
      typeof ctx.offer?.originalPrice === 'number' &&
      ctx.offer.originalPrice > ctx.offer.offerPrice
    ) {
      lines.push(`${base} (${L.originalPrice} ${ctx.offer.originalPrice})`)
    } else {
      lines.push(base)
    }
  }
  if (ctx.customerName?.trim()) {
    lines.push(`${L.name}: ${ctx.customerName.trim()}`)
  }
  if (ctx.customerPhone?.trim()) {
    lines.push(`${L.phone}: ${ctx.customerPhone.trim()}`)
  }

  lines.push('')
  lines.push(L.closingOffer)
  return lines.join('\n')
}

function buildDoctorMessage(ctx: WhatsAppContextRich): string {
  const L = LABELS[ctx.locale]
  const lines: string[] = [L.greeting, L.doctorIntro]

  if (ctx.doctor?.name) {
    lines.push(`${L.doctor}: ${ctx.doctor.name}`)
  }
  if (ctx.doctor?.specialty) {
    lines.push(`${L.specialty}: ${ctx.doctor.specialty}`)
  }
  if (ctx.timePreference) {
    lines.push(`${L.timePreference}: ${timeLabel(ctx.locale, ctx.timePreference)}`)
  }
  if (ctx.customerName?.trim()) {
    lines.push(`${L.name}: ${ctx.customerName.trim()}`)
  }
  if (ctx.customerPhone?.trim()) {
    lines.push(`${L.phone}: ${ctx.customerPhone.trim()}`)
  }
  if (ctx.notes?.trim()) {
    lines.push(L.notesHeader)
    lines.push(ctx.notes.trim())
  }

  lines.push('')
  lines.push(L.thanks)
  return lines.join('\n')
}

function buildGeneralMessage(ctx: WhatsAppContextRich): string {
  const L = LABELS[ctx.locale]
  const lines: string[] = [L.greeting, L.generalIntro]

  if (ctx.department?.name) {
    lines.push(`${L.department}: ${ctx.department.name}`)
  }
  if (ctx.notes?.trim()) {
    lines.push(ctx.notes.trim())
  }

  lines.push('')
  lines.push(L.thanks)
  return lines.join('\n')
}

/** Map a legacy `{page}` context to the rich form, then build a message. */
function buildLegacyMessage(ctx: WhatsAppContextLegacy): string {
  const page: WhatsAppPage = ctx.page ?? 'home'
  const FEATURED: Record<string, { ar: string; en: string }> = {
    cosmetic: { ar: 'قسم التجميل', en: 'Cosmetic Department' },
    surgery: { ar: 'قسم الجراحة', en: 'Surgery Department' },
    audiology: { ar: 'قسم السمعيات', en: 'Audiology Department' },
  }
  const deptInfo = FEATURED[page]
  const department = deptInfo
    ? { slug: page, name: deptInfo[ctx.locale] }
    : null
  const service = ctx.service ? { name: ctx.service } : null

  const type: WhatsAppMessageType =
    page === 'offers'
      ? 'inquiry'
      : page === 'contact' || page === 'about'
        ? 'inquiry'
        : page === 'home'
          ? 'booking'
          : 'booking'

  return buildMessage({
    type,
    locale: ctx.locale,
    department,
    service,
  })
}

/** Internal dispatch on `type`. */
function buildMessage(ctx: WhatsAppContextRich): string {
  switch (ctx.type) {
    case 'booking':
      return buildBookingMessage(ctx)
    case 'inquiry':
      return buildInquiryMessage(ctx)
    case 'support':
      return buildSupportMessage(ctx)
    case 'offer':
      return buildOfferMessage(ctx)
    case 'doctor-inquiry':
      return buildDoctorMessage(ctx)
    case 'general':
    default:
      return buildGeneralMessage(ctx)
  }
}

/* --------------------------------------------------------- Public API */

export function getWhatsAppMessage(context: WhatsAppContext): string {
  return isRichContext(context)
    ? buildMessage(context)
    : buildLegacyMessage(context)
}

export function getWhatsAppUrl(context: WhatsAppContext): string {
  const text = encodeURIComponent(getWhatsAppMessage(context))
  return `https://wa.me/${CONTACT.whatsapp}?text=${text}`
}

/**
 * Map a locale-prefixed pathname to a known WhatsApp page key.
 * Falls back to 'home' for unmapped paths.
 */
export function detectWhatsAppPage(pathname: string): WhatsAppPage {
  const stripped = pathname.replace(/^\/(ar|en)/, '')
  const path = stripped === '' ? '/' : stripped

  if (path === '/') return 'home'
  if (path.startsWith('/departments/cosmetic')) return 'cosmetic'
  if (path.startsWith('/departments/surgery')) return 'surgery'
  if (path.startsWith('/departments/audiology')) return 'audiology'
  if (path.startsWith('/offers')) return 'offers'
  if (path.startsWith('/about')) return 'about'
  if (path.startsWith('/contact')) return 'contact'
  return 'home'
}

/**
 * Build a `/book` URL with optional pre-fill query parameters.
 * Used by ServiceCard, OfferCard, DoctorCard, etc.
 *
 * The returned path is locale-agnostic — pass it to next-intl's `<Link>`
 * (which adds the active locale prefix). For raw `<a>` consumers, prepend
 * `/${locale}` manually.
 */
export function getBookingFlowUrl(opts: {
  departmentSlug?: string | null
  serviceSlug?: string | null
  doctorSlug?: string | null
  offerSlug?: string | null
  support?: boolean
}): string {
  const params = new URLSearchParams()
  if (opts.departmentSlug) params.set('department', opts.departmentSlug)
  if (opts.serviceSlug) params.set('service', opts.serviceSlug)
  if (opts.doctorSlug) params.set('doctor', opts.doctorSlug)
  if (opts.offerSlug) params.set('offer', opts.offerSlug)
  if (opts.support) params.set('support', 'true')
  const qs = params.toString()
  return `/book${qs ? `?${qs}` : ''}`
}

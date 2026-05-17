'use client'

import { useTranslations } from 'next-intl'
import { WhatsappLogoIcon } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils'

type Props = {
  name: string
  phone: string
  email: string
  onNameChange: (v: string) => void
  onPhoneChange: (v: string) => void
  onEmailChange: (v: string) => void
  onSubmit: (e: React.FormEvent) => void
  sending: boolean
  headingRef: React.RefObject<HTMLHeadingElement | null>
  showErrors: boolean
  nameValid: boolean
  phoneValid: boolean
  emailValid: boolean
}

export function Step3PatientInfo({
  name,
  phone,
  email,
  onNameChange,
  onPhoneChange,
  onEmailChange,
  onSubmit,
  sending,
  headingRef,
  showErrors,
  nameValid,
  phoneValid,
  emailValid,
}: Props) {
  const t = useTranslations('bookingWizard.step3')

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="text-center">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-semibold text-teal-deep text-[clamp(1.4rem,2.6vw,1.9rem)] focus:outline-none"
        >
          {t('title')}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {t('description')}
        </p>
      </div>

      <div className="mx-auto grid max-w-xl gap-4">
        <Field
          label={t('nameLabel')}
          htmlFor="bw-name"
          error={showErrors && !nameValid ? t('errorName') : null}
          required
        >
          <input
            id="bw-name"
            type="text"
            value={name}
            autoComplete="name"
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={t('namePlaceholder')}
            aria-invalid={showErrors && !nameValid}
            className={cn(
              'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink focus:outline-none',
              showErrors && !nameValid
                ? 'border-red-400 focus:border-red-500'
                : 'border-line focus:border-teal-deep',
            )}
          />
        </Field>

        <Field
          label={t('phoneLabel')}
          htmlFor="bw-phone"
          hint={t('phoneHint')}
          error={showErrors && !phoneValid ? t('errorPhone') : null}
          required
        >
          <input
            id="bw-phone"
            type="tel"
            value={phone}
            autoComplete="tel"
            dir="ltr"
            inputMode="tel"
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder={t('phonePlaceholder')}
            aria-invalid={showErrors && !phoneValid}
            className={cn(
              'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink focus:outline-none',
              showErrors && !phoneValid
                ? 'border-red-400 focus:border-red-500'
                : 'border-line focus:border-teal-deep',
            )}
          />
        </Field>

        <Field
          label={t('emailLabel')}
          htmlFor="bw-email"
          hint={t('emailHint')}
          error={showErrors && !emailValid ? t('errorEmail') : null}
        >
          <input
            id="bw-email"
            type="email"
            value={email}
            autoComplete="email"
            dir="ltr"
            inputMode="email"
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder={t('emailPlaceholder')}
            aria-invalid={showErrors && !emailValid}
            className={cn(
              'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink focus:outline-none',
              showErrors && !emailValid
                ? 'border-red-400 focus:border-red-500'
                : 'border-line focus:border-teal-deep',
            )}
          />
        </Field>
      </div>

      <div className="flex justify-center pt-2">
        <button
          type="submit"
          disabled={sending}
          className={cn(
            'inline-flex h-12 min-w-[260px] items-center justify-center gap-2 rounded-lg bg-[#25D366] px-6 text-sm font-semibold text-white shadow-medium transition-transform',
            'hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 disabled:cursor-wait disabled:opacity-80',
          )}
        >
          <WhatsappLogoIcon size={20} weight="fill" aria-hidden="true" />
          {sending ? t('sending') : t('submit')}
        </button>
      </div>

      <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
        {t('disclaimer')}
      </p>
    </form>
  )
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  error?: string | null
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-teal-deep">
        {label}
        {required && <span className="text-gold">*</span>}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-medium text-red-600">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  )
}

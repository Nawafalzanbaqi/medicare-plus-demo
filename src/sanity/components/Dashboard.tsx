'use client'

import { useEffect, useMemo, useState } from 'react'
import { useClient } from 'sanity'

type Counts = {
  doctors: number
  articlesThisMonth: number
  pendingTestimonials: number
  activeOffers: number
}

const STAT_QUERY = /* groq */ `{
  "doctors": count(*[_type == "doctor" && isAvailable != false]),
  "articlesThisMonth": count(*[_type == "article" && isPublished == true
    && publishedAt > dateTime(now()) - 60*60*24*30]),
  "pendingTestimonials": count(*[_type == "testimonial" && isApproved != true]),
  "activeOffers": count(*[_type == "offer" && isActive == true && dateTime(validUntil) > dateTime(now())])
}`

const PENDING_TESTIMONIALS_QUERY = /* groq */ `
  *[_type == "testimonial" && isApproved != true]
    | order(_createdAt desc)[0...5]{ _id, patientName, _createdAt }
`

const EXPIRING_OFFERS_QUERY = /* groq */ `
  *[_type == "offer" && isActive == true
    && dateTime(validUntil) > dateTime(now())
    && dateTime(validUntil) < dateTime(now()) + 60*60*24*7]
    | order(validUntil asc)[0...5]{ _id, title, validUntil }
`

const DOCTORS_NO_PHOTO_QUERY = /* groq */ `
  *[_type == "doctor" && !defined(photo.asset)][0...5]{ _id, name }
`

const SITE_URL =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SITE_URL) ||
  'http://localhost:3000'

export function Dashboard() {
  const client = useClient({ apiVersion: '2024-12-01' })
  const [counts, setCounts] = useState<Counts | null>(null)
  const [pending, setPending] = useState<Array<{ _id: string; patientName?: { ar?: string }; _createdAt: string }>>([])
  const [expiring, setExpiring] = useState<Array<{ _id: string; title?: { ar?: string }; validUntil: string }>>([])
  const [noPhoto, setNoPhoto] = useState<Array<{ _id: string; name?: { ar?: string } }>>([])

  useEffect(() => {
    let cancelled = false
    Promise.all([
      client.fetch<Counts>(STAT_QUERY),
      client.fetch(PENDING_TESTIMONIALS_QUERY),
      client.fetch(EXPIRING_OFFERS_QUERY),
      client.fetch(DOCTORS_NO_PHOTO_QUERY),
    ])
      .then(([c, p, e, n]) => {
        if (cancelled) return
        setCounts(c)
        setPending(p as typeof pending)
        setExpiring(e as typeof expiring)
        setNoPhoto(n as typeof noPhoto)
      })
      .catch(() => {
        // Dataset not yet seeded — leave defaults.
        if (cancelled) return
        setCounts({ doctors: 0, articlesThisMonth: 0, pendingTestimonials: 0, activeOffers: 0 })
      })
    return () => {
      cancelled = true
    }
  }, [client])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'صباح الخير'
    if (hour < 17) return 'مساء النور'
    return 'مساء الخير'
  }, [])

  const today = useMemo(
    () =>
      new Intl.DateTimeFormat('ar', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date()),
    [],
  )

  return (
    <div style={styles.page} dir="rtl">
      <div style={styles.welcome}>
        <span style={styles.welcomeEyebrow}>{today}</span>
        <h1 style={styles.welcomeTitle}>{greeting} 👋</h1>
        <p style={styles.welcomeSub}>
          أهلاً بك في لوحة تحكم <strong>مركز ميديكير بلس الطبي</strong>. من هنا تدير
          كل محتوى الموقع.
        </p>
      </div>

      {/* Stat cards */}
      <div style={styles.grid4}>
        <StatCard
          title="الأطبّاء النشطون"
          value={counts?.doctors ?? '—'}
          tone="teal"
        />
        <StatCard
          title="مقالات هذا الشهر"
          value={counts?.articlesThisMonth ?? '—'}
          tone="teal"
        />
        <StatCard
          title="تعليقات بانتظار الموافقة"
          value={counts?.pendingTestimonials ?? '—'}
          tone={counts && counts.pendingTestimonials > 0 ? 'gold' : 'teal'}
          badge={counts && counts.pendingTestimonials > 0 ? 'يتطلّب إجراء' : undefined}
        />
        <StatCard
          title="العروض النشطة"
          value={counts?.activeOffers ?? '—'}
          tone="teal"
        />
      </div>

      {/* Quick actions */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>إجراءات سريعة</h2>
        <div style={styles.actions}>
          <QuickAction href="/structure/doctor;new" label="+ إضافة طبيب" />
          <QuickAction href="/structure/article;new" label="+ كتابة مقال" />
          <QuickAction href="/structure/offer;new" label="+ إنشاء عرض" />
          <QuickAction
            href={`${SITE_URL}/ar`}
            label="👁️ معاينة الموقع"
            external
          />
        </div>
      </div>

      {/* Tasks */}
      <div style={styles.grid2}>
        <TaskList
          title="تعليقات بانتظار الموافقة"
          empty="لا توجد تعليقات معلّقة."
          items={pending.map((p) => ({
            id: p._id,
            label: p.patientName?.ar || '—',
            meta: new Date(p._createdAt).toLocaleDateString('ar'),
            href: `/structure/testimonial;${p._id}`,
          }))}
        />
        <TaskList
          title="عروض تنتهي خلال 7 أيام"
          empty="لا توجد عروض قريبة الانتهاء."
          items={expiring.map((o) => ({
            id: o._id,
            label: o.title?.ar || '—',
            meta: new Date(o.validUntil).toLocaleDateString('ar'),
            href: `/structure/offer;${o._id}`,
          }))}
        />
      </div>

      {noPhoto.length > 0 && (
        <div style={styles.section}>
          <TaskList
            title="أطبّاء بلا صورة"
            empty=""
            items={noPhoto.map((d) => ({
              id: d._id,
              label: d.name?.ar || '—',
              meta: 'مفقودة الصورة',
              href: `/structure/doctor;${d._id}`,
            }))}
          />
        </div>
      )}
    </div>
  )
}

/* ---------------------------------------------------------- Sub-components */

function StatCard({
  title,
  value,
  tone,
  badge,
}: {
  title: string
  value: number | string
  tone: 'teal' | 'gold'
  badge?: string
}) {
  return (
    <div
      style={{
        ...styles.card,
        borderColor: tone === 'gold' ? '#c9a961' : '#e0d7c5',
      }}
    >
      <span style={styles.cardTitle}>{title}</span>
      <span style={styles.cardValue}>{value}</span>
      {badge && (
        <span
          style={{
            ...styles.cardBadge,
            background: tone === 'gold' ? '#c9a961' : '#0d3e3e',
          }}
        >
          {badge}
        </span>
      )}
    </div>
  )
}

function QuickAction({ href, label, external }: { href: string; label: string; external?: boolean }) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      style={styles.actionBtn}
    >
      {label}
    </a>
  )
}

function TaskList({
  title,
  items,
  empty,
}: {
  title: string
  items: Array<{ id: string; label: string; meta?: string; href: string }>
  empty: string
}) {
  return (
    <div style={styles.taskBox}>
      <h3 style={styles.taskTitle}>{title}</h3>
      {items.length === 0 ? (
        <p style={styles.taskEmpty}>{empty}</p>
      ) : (
        <ul style={styles.taskList}>
          {items.map((it) => (
            <li key={it.id} style={styles.taskItem}>
              <a href={it.href} style={styles.taskLink}>
                <span>{it.label}</span>
                {it.meta && <span style={styles.taskMeta}>{it.meta}</span>}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ----------------------------------------------------------------- Styles */

const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    padding: '2.5rem 2rem',
    maxWidth: 1200,
    margin: '0 auto',
    color: '#1a2424',
  },
  welcome: { marginBottom: '2rem' },
  welcomeEyebrow: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    color: '#c9a961',
    fontWeight: 600,
  },
  welcomeTitle: {
    margin: '0.5rem 0 0',
    fontSize: 28,
    color: '#0d3e3e',
    fontWeight: 600,
  },
  welcomeSub: { margin: '0.5rem 0 0', color: '#6b7575' },

  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 16,
    marginBottom: '2rem',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 16,
  },

  card: {
    background: '#fbf8f0',
    border: '1px solid #e0d7c5',
    borderRadius: 12,
    padding: '1.25rem 1.4rem',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    position: 'relative',
  },
  cardTitle: { fontSize: 12, color: '#6b7575' },
  cardValue: {
    fontSize: 32,
    color: '#0d3e3e',
    fontWeight: 700,
    lineHeight: 1.1,
  },
  cardBadge: {
    position: 'absolute',
    top: 12,
    insetInlineStart: 12,
    fontSize: 10,
    color: '#fff',
    background: '#0d3e3e',
    padding: '2px 8px',
    borderRadius: 999,
    fontWeight: 600,
  },

  section: { marginTop: '2rem' },
  sectionTitle: {
    fontSize: 16,
    margin: '0 0 0.75rem',
    color: '#0d3e3e',
    fontWeight: 600,
  },
  actions: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.55rem 1rem',
    background: '#0d3e3e',
    color: '#fff',
    borderRadius: 8,
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: 500,
  },

  taskBox: {
    background: '#ffffff',
    border: '1px solid #e0d7c5',
    borderRadius: 12,
    padding: '1.25rem',
  },
  taskTitle: { margin: '0 0 0.75rem', fontSize: 15, color: '#0d3e3e' },
  taskEmpty: { color: '#6b7575', fontSize: 13, margin: 0 },
  taskList: { margin: 0, padding: 0, listStyle: 'none' },
  taskItem: { borderTop: '1px solid #f0e8d8', padding: '0.5rem 0' },
  taskLink: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#0d3e3e',
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: 500,
  },
  taskMeta: { color: '#6b7575', fontSize: 12, fontWeight: 400 },
}

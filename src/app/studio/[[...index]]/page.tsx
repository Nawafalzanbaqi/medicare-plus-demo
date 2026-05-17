'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '../../../../sanity.config'
import { isSanityConfigured } from '@/sanity/env'

export const dynamic = 'force-dynamic'

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          maxWidth: 640,
          margin: '8rem auto',
          padding: '0 1.5rem',
          color: '#0d3e3e',
          lineHeight: 1.6,
        }}
      >
        <h1 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>
          Studio is not yet linked to a Sanity project.
        </h1>
        <ol style={{ paddingInlineStart: '1.25rem' }}>
          <li>
            Run{' '}
            <code style={{ background: '#f7f2e8', padding: '0.1rem 0.4rem', borderRadius: 4 }}>
              npx sanity@latest init --bare
            </code>{' '}
            in the project root.
          </li>
          <li>
            Copy the printed project ID into{' '}
            <code style={{ background: '#f7f2e8', padding: '0.1rem 0.4rem', borderRadius: 4 }}>
              NEXT_PUBLIC_SANITY_PROJECT_ID
            </code>{' '}
            in <code>.env.local</code>.
          </li>
          <li>Restart the dev server and reload this page.</li>
        </ol>
      </main>
    )
  }

  return <NextStudio config={config} />
}

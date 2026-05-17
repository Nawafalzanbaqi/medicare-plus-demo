import { type DocumentActionComponent, useDocumentOperation } from 'sanity'
import { CheckmarkCircleIcon } from '@sanity/icons'
import { useState } from 'react'

/**
 * "نشر فوري" — one-click publish for articles.
 * Sets `isPublished` to true and stamps `publishedAt` with the current time,
 * then publishes the document.
 */
export const publishNowAction: DocumentActionComponent = (props) => {
  const { patch, publish } = useDocumentOperation(props.id, props.type)
  const [isPublishing, setPublishing] = useState(false)

  const disabled = Boolean(publish.disabled) && publish.disabled !== 'NO_CHANGES'

  return {
    label: isPublishing ? 'جارٍ النشر…' : 'نشر فوري',
    icon: CheckmarkCircleIcon,
    disabled,
    tone: 'positive',
    onHandle: () => {
      setPublishing(true)
      patch.execute([
        { set: { isPublished: true, publishedAt: new Date().toISOString() } },
      ])
      publish.execute()
      props.onComplete()
    },
  }
}

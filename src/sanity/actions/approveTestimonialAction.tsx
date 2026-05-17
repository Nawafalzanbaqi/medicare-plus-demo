// Sanity DocumentActionComponent is a hook-like API: Sanity Studio invokes it
// during a document render pass and it may call hooks. The function name
// follows Sanity's documented contract, not React's hook naming convention.
/* eslint-disable react-hooks/rules-of-hooks */
import { type DocumentActionComponent, useDocumentOperation } from 'sanity'
import { CheckmarkCircleIcon } from '@sanity/icons'

/**
 * "الموافقة على التعليق" — approves a pending testimonial.
 * Sets `isApproved` to true and publishes the document.
 */
export const approveTestimonialAction: DocumentActionComponent = (props) => {
  const { patch, publish } = useDocumentOperation(props.id, props.type)
  const draft = props.draft as { isApproved?: boolean } | null
  const published = props.published as { isApproved?: boolean } | null
  const alreadyApproved = draft?.isApproved === true || published?.isApproved === true

  return {
    label: alreadyApproved ? 'تمت الموافقة' : 'الموافقة على التعليق',
    icon: CheckmarkCircleIcon,
    disabled: alreadyApproved,
    tone: 'positive',
    onHandle: () => {
      patch.execute([{ set: { isApproved: true } }])
      publish.execute()
      props.onComplete()
    },
  }
}

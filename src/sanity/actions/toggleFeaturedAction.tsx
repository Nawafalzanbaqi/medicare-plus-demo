// Sanity DocumentActionComponent is a hook-like API: Sanity Studio invokes it
// during a document render pass and it may call hooks. The function name
// follows Sanity's documented contract, not React's hook naming convention.
/* eslint-disable react-hooks/rules-of-hooks */
import { type DocumentActionComponent, useDocumentOperation } from 'sanity'
import { StarIcon, StarFilledIcon } from '@sanity/icons'

/**
 * "تفعيل/إلغاء الإبراز" — toggles the `isFeatured` boolean on any
 * document that has it. Adds itself to article, testimonial, offer,
 * doctor, department.
 */
export const toggleFeaturedAction: DocumentActionComponent = (props) => {
  const { patch, publish } = useDocumentOperation(props.id, props.type)
  const draft = props.draft as { isFeatured?: boolean } | null
  const published = props.published as { isFeatured?: boolean } | null
  const current = draft?.isFeatured ?? published?.isFeatured ?? false

  return {
    label: current ? 'إلغاء الإبراز' : 'تفعيل الإبراز',
    icon: current ? StarFilledIcon : StarIcon,
    tone: current ? 'caution' : 'positive',
    onHandle: () => {
      patch.execute([{ set: { isFeatured: !current } }])
      publish.execute()
      props.onComplete()
    },
  }
}

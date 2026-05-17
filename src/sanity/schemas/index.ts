import type { SchemaTypeDefinition } from 'sanity'

// Objects
import { localizedString } from './objects/localizedString'
import { localizedText } from './objects/localizedText'
import { localizedRichText } from './objects/localizedRichText'
import { button } from './objects/button'
import { card } from './objects/card'
import { statItem } from './objects/statItem'
import { faq } from './objects/faq'
import { seoFields } from './objects/seoFields'
import { beforeAfterPair } from './objects/beforeAfterPair'
import { equipmentItem } from './objects/equipmentItem'

// Singletons
import { siteSettings } from './singletons/siteSettings'
import { homePage } from './singletons/homePage'
import { topBar } from './singletons/topBar'
import { trustBar } from './singletons/trustBar'
import { footer } from './singletons/footer'

// Documents
import { department } from './documents/department'
import { doctor } from './documents/doctor'
import { service } from './documents/service'
import { article } from './documents/article'
import { testimonial } from './documents/testimonial'
import { offer } from './documents/offer'
import { insurance } from './documents/insurance'

const schemas: SchemaTypeDefinition[] = [
  // Objects
  localizedString,
  localizedText,
  localizedRichText,
  button,
  card,
  statItem,
  faq,
  seoFields,
  beforeAfterPair,
  equipmentItem,

  // Singletons
  siteSettings,
  homePage,
  topBar,
  trustBar,
  footer,

  // Documents
  department,
  doctor,
  service,
  article,
  testimonial,
  offer,
  insurance,
]

export default schemas

/** Singleton document ids — used by structure customization and queries. */
export const SINGLETON_IDS = ['siteSettings', 'homePage', 'topBar', 'trustBar', 'footer'] as const
export type SingletonId = (typeof SINGLETON_IDS)[number]

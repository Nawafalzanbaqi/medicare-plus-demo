import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { presentationTool } from 'sanity/presentation'
import { HomeIcon } from '@sanity/icons'

import schemas, { SINGLETON_IDS } from './src/sanity/schemas'
import { structure } from './src/sanity/structure'
import { alNahdaStudioTheme } from './src/sanity/theme'
import { StudioLogo } from './src/sanity/components/StudioLogo'
import { Dashboard } from './src/sanity/components/Dashboard'
import { presentationResolve } from './src/sanity/lib/presentation'
import { publishNowAction } from './src/sanity/actions/publishNowAction'
import { approveTestimonialAction } from './src/sanity/actions/approveTestimonialAction'
import { toggleFeaturedAction } from './src/sanity/actions/toggleFeaturedAction'
import { previewAction } from './src/sanity/actions/previewAction'
import {
  apiVersion,
  dataset,
  projectId,
  studioBasePath,
} from './src/sanity/env'

const previewOrigin =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

const SINGLETON_SET = new Set<string>(SINGLETON_IDS)

/** Document types that can be featured (have an `isFeatured` boolean). */
const FEATURABLE_TYPES = new Set<string>([
  'article',
  'testimonial',
  'offer',
  'doctor',
  'department',
])

/** Document types that have a public preview URL. */
const PREVIEWABLE_TYPES = new Set<string>([
  'homePage',
  'siteSettings',
  'topBar',
  'footer',
  'department',
  'article',
  'offer',
  'doctor',
  'insurance',
  'testimonial',
])

export default defineConfig({
  basePath: studioBasePath,
  projectId,
  dataset,
  title: 'لوحة تحكم مركز ميديكير بلس الطبي',
  theme: alNahdaStudioTheme,

  studio: {
    components: {
      logo: StudioLogo,
    },
  },

  schema: {
    types: schemas,
    // Prevent users from creating duplicate singletons.
    templates: (prev) => prev.filter((t) => !SINGLETON_SET.has(t.id)),
  },

  document: {
    actions: (input, context) => {
      // Singletons: hide create/duplicate/delete.
      let actions = SINGLETON_SET.has(context.schemaType)
        ? input.filter(
            ({ action }) =>
              action && !['unpublish', 'delete', 'duplicate'].includes(action),
          )
        : input

      // Add custom actions by document type.
      if (context.schemaType === 'article') {
        actions = [publishNowAction, ...actions]
      }
      if (context.schemaType === 'testimonial') {
        actions = [approveTestimonialAction, ...actions]
      }
      if (FEATURABLE_TYPES.has(context.schemaType)) {
        actions = [...actions, toggleFeaturedAction]
      }
      if (PREVIEWABLE_TYPES.has(context.schemaType)) {
        actions = [...actions, previewAction]
      }

      return actions
    },
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === 'global'
        ? prev.filter((t) => !SINGLETON_SET.has(t.templateId))
        : prev,
  },

  // Custom tools: Dashboard registered first so it becomes the default route.
  tools: (prev) => [
    {
      name: 'dashboard',
      title: 'الرئيسية',
      icon: HomeIcon,
      component: Dashboard,
    },
    ...prev,
  ],

  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
    presentationTool({
      resolve: presentationResolve,
      previewUrl: {
        origin: previewOrigin,
        previewMode: {
          enable: '/api/draft-mode/enable',
          disable: '/api/draft-mode/disable',
        },
      },
    }),
  ],
})

import { buildLegacyTheme } from 'sanity'

const TEAL_DEEP = '#0d3e3e'
const TEAL = '#1a5757'
const TEAL_LIGHT = '#2a7373'
const GOLD = '#c9a961'
const GOLD_SOFT = '#e0c890'
const CREAM = '#f7f2e8'
const CREAM_LIGHT = '#fbf8f0'
const INK = '#1a2424'

/**
 * MediCare brand theme for the Sanity Studio chrome.
 * `buildLegacyTheme` outputs CSS variables that Studio v3 honors for
 * navigation, focus rings, links, and accents.
 */
export const alNahdaStudioTheme = buildLegacyTheme({
  '--black': INK,
  '--white': '#ffffff',

  '--gray': '#6b7575',
  '--gray-base': '#0f1f1f',

  '--component-bg': CREAM_LIGHT,
  '--component-text-color': INK,

  // Brand primary (teal-deep)
  '--brand-primary': TEAL_DEEP,

  // Default action colour (used on header buttons)
  '--default-button-color': TEAL_DEEP,
  '--default-button-primary-color': TEAL_DEEP,
  '--default-button-success-color': '#2a7a57',
  '--default-button-warning-color': '#b8893b',
  '--default-button-danger-color': '#c5453a',

  // States
  '--state-info-color': TEAL,
  '--state-success-color': '#2a7a57',
  '--state-warning-color': '#b8893b',
  '--state-danger-color': '#c5453a',

  // Links + focus
  '--main-navigation-color': TEAL_DEEP,
  '--main-navigation-color--inverted': '#ffffff',

  '--focus-color': GOLD,
})

export const BRAND_COLORS = {
  TEAL_DEEP,
  TEAL,
  TEAL_LIGHT,
  GOLD,
  GOLD_SOFT,
  CREAM,
  CREAM_LIGHT,
  INK,
}

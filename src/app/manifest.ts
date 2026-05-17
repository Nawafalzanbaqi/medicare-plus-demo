import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'مركز ميديكير بلس الطبي — MediCare Plus',
    short_name: 'MediCare',
    description:
      'Integrated medical complex in Riyadh — 15 years of healthcare excellence.',
    start_url: '/ar',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#fbf8f0',
    theme_color: '#0d3e3e',
    lang: 'ar',
    dir: 'rtl',
  }
}

import type { StructureResolver } from 'sanity/structure'
import {
  CogIcon,
  HomeIcon,
  ControlsIcon,
  StackIcon,
  CaseIcon,
  UserIcon,
  PackageIcon,
  DocumentTextIcon,
  CommentIcon,
  TagIcon,
  CreditCardIcon,
} from '@sanity/icons'
import { SINGLETON_IDS } from './schemas'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('محتوى الموقع')
    .items([
      // ----------------------------------------------------- ⚙️ الإعدادات العامة
      S.listItem()
        .title('⚙️ الإعدادات العامة')
        .icon(CogIcon)
        .child(
          S.list()
            .title('الإعدادات العامة')
            .items([
              S.listItem()
                .title('إعدادات الموقع')
                .id('siteSettings')
                .icon(ControlsIcon)
                .child(
                  S.document().schemaType('siteSettings').documentId('siteSettings'),
                ),
              S.listItem()
                .title('الصفحة الرئيسية')
                .id('homePage')
                .icon(HomeIcon)
                .child(
                  S.document().schemaType('homePage').documentId('homePage'),
                ),
              S.listItem()
                .title('الشريط العلوي')
                .id('topBar')
                .icon(StackIcon)
                .child(
                  S.document().schemaType('topBar').documentId('topBar'),
                ),
              S.listItem()
                .title('شريط الثقة')
                .id('trustBar')
                .icon(StackIcon)
                .child(
                  S.document().schemaType('trustBar').documentId('trustBar'),
                ),
              S.listItem()
                .title('التذييل')
                .id('footer')
                .icon(StackIcon)
                .child(
                  S.document().schemaType('footer').documentId('footer'),
                ),
            ]),
        ),

      S.divider(),

      // ----------------------------------------------- 🏥 الأقسام والأطباء والخدمات
      S.listItem()
        .title('🏥 الأقسام والأطباء')
        .icon(CaseIcon)
        .child(
          S.list()
            .title('الأقسام والأطباء')
            .items([
              S.documentTypeListItem('department')
                .title('الأقسام')
                .icon(CaseIcon),
              S.documentTypeListItem('doctor')
                .title('الأطبّاء')
                .icon(UserIcon),
              S.documentTypeListItem('service')
                .title('الخدمات')
                .icon(PackageIcon),
            ]),
        ),

      S.divider(),

      // ----------------------------------------------------------- 📰 المحتوى
      S.listItem()
        .title('📰 المحتوى')
        .icon(DocumentTextIcon)
        .child(
          S.list()
            .title('المحتوى')
            .items([
              S.documentTypeListItem('article')
                .title('المقالات')
                .icon(DocumentTextIcon),
              S.documentTypeListItem('testimonial')
                .title('آراء المراجعين')
                .icon(CommentIcon),
              S.documentTypeListItem('offer')
                .title('العروض')
                .icon(TagIcon),
            ]),
        ),

      S.divider(),

      // -------------------------------------------------------- 💳 الإدارة
      S.listItem()
        .title('💳 الإدارة')
        .icon(CreditCardIcon)
        .child(
          S.list()
            .title('الإدارة')
            .items([
              S.documentTypeListItem('insurance')
                .title('شركات التأمين')
                .icon(CreditCardIcon),
            ]),
        ),
    ])

export const singletonTypes = new Set<string>(SINGLETON_IDS)

import { PortableText, type PortableTextComponents } from '@portabletext/react'
import Image from 'next/image'
import { urlForImage } from '@/sanity/lib/image'
import type { PortableTextBlock } from '@/sanity/types'

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="mt-10 mb-3 font-semibold leading-[1.25] text-teal-deep text-[clamp(1.35rem,2.4vw,1.7rem)]">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-7 mb-2 text-lg font-semibold text-teal-deep">{children}</h3>
    ),
    normal: ({ children }) => (
      <p className="my-4 text-base leading-[1.85] text-ink/85">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 rounded-r-xl border-s-4 border-gold bg-cream/60 px-5 py-4 text-sm italic leading-relaxed text-teal-deep">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="my-4 list-disc space-y-1.5 ps-6 text-ink/85">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="my-4 list-decimal space-y-1.5 ps-6 text-ink/85">{children}</ol>
    ),
  },
  listItem: ({ children }) => <li className="leading-[1.75]">{children}</li>,
  marks: {
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="text-gold">{children}</em>,
    link: ({ value, children }) => (
      <a
        href={value?.href ?? '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gold underline underline-offset-4 hover:text-teal-deep"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => {
      const src = urlForImage(value)?.width(1200).url()
      if (!src) return null
      return (
        <span className="my-6 block">
          <span className="relative block aspect-[16/9] overflow-hidden rounded-2xl">
            <Image
              src={src}
              alt={(value as { alt?: string })?.alt ?? ''}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </span>
        </span>
      )
    },
  },
}

export function PortableArticleBody({
  blocks,
}: {
  blocks: PortableTextBlock[] | null | undefined
}) {
  if (!blocks || blocks.length === 0) return null
  return (
    <PortableText
      // The @portabletext/react types accept TypedObject[]; our typed PortableTextBlock is compatible.
      value={blocks as unknown as Parameters<typeof PortableText>[0]['value']}
      components={components}
    />
  )
}

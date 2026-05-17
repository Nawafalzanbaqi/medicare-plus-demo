import type { ComponentProps } from 'react'
import type { MDXComponents } from 'mdx/types'
import { cn } from '@/lib/utils'

export const articleMdxComponents: MDXComponents = {
  h1: (props: ComponentProps<'h1'>) => (
    <h1
      {...props}
      className={cn(
        'mt-10 mb-4 font-semibold leading-[1.2] text-teal-deep text-[clamp(1.7rem,3vw,2.2rem)]',
        props.className,
      )}
    />
  ),
  h2: (props: ComponentProps<'h2'>) => (
    <h2
      {...props}
      className={cn(
        'mt-10 mb-3 font-semibold leading-[1.25] text-teal-deep text-[clamp(1.35rem,2.4vw,1.7rem)]',
        props.className,
      )}
    />
  ),
  h3: (props: ComponentProps<'h3'>) => (
    <h3
      {...props}
      className={cn('mt-7 mb-2 text-lg font-semibold text-teal-deep', props.className)}
    />
  ),
  p: (props: ComponentProps<'p'>) => (
    <p
      {...props}
      className={cn('my-4 text-base leading-[1.85] text-ink/85', props.className)}
    />
  ),
  ul: (props: ComponentProps<'ul'>) => (
    <ul {...props} className={cn('my-4 list-disc space-y-1.5 ps-6 text-ink/85', props.className)} />
  ),
  ol: (props: ComponentProps<'ol'>) => (
    <ol {...props} className={cn('my-4 list-decimal space-y-1.5 ps-6 text-ink/85', props.className)} />
  ),
  li: (props: ComponentProps<'li'>) => (
    <li {...props} className={cn('leading-[1.75]', props.className)} />
  ),
  a: (props: ComponentProps<'a'>) => (
    <a
      {...props}
      className={cn('text-gold underline underline-offset-4 hover:text-teal-deep', props.className)}
    />
  ),
  blockquote: (props: ComponentProps<'blockquote'>) => (
    <blockquote
      {...props}
      className={cn(
        'my-6 rounded-r-xl border-s-4 border-gold bg-cream/60 px-5 py-4 text-sm italic leading-relaxed text-teal-deep',
        props.className,
      )}
    />
  ),
  code: (props: ComponentProps<'code'>) => (
    <code
      {...props}
      className={cn('rounded bg-cream px-1.5 py-0.5 text-sm text-teal-deep', props.className)}
    />
  ),
  table: (props: ComponentProps<'table'>) => (
    <div className="my-6 overflow-x-auto">
      <table {...props} className={cn('w-full border-collapse text-sm', props.className)} />
    </div>
  ),
  thead: (props: ComponentProps<'thead'>) => (
    <thead {...props} className={cn('bg-cream text-teal-deep', props.className)} />
  ),
  th: (props: ComponentProps<'th'>) => (
    <th {...props} className={cn('border border-line px-3 py-2 text-start font-semibold', props.className)} />
  ),
  td: (props: ComponentProps<'td'>) => (
    <td {...props} className={cn('border border-line px-3 py-2 text-ink/85', props.className)} />
  ),
  hr: (props: ComponentProps<'hr'>) => (
    <hr {...props} className={cn('my-8 border-line', props.className)} />
  ),
}

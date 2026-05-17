'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

type Item = { question: string; answer: string }

type Props = {
  items: Item[]
}

export function FAQAccordion({ items }: Props) {
  return (
    <Accordion className="mx-auto max-w-3xl divide-y divide-line rounded-2xl border border-line bg-white px-2">
      {items.map((item, i) => (
        <AccordionItem key={i} value={`item-${i}`} className="px-3 sm:px-4">
          <AccordionTrigger className="py-5 text-base font-semibold text-teal-deep hover:no-underline data-[panel-open]:text-gold">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

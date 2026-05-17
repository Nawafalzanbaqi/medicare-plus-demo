import { SafeImage } from '@/components/shared/SafeImage'

type Item = {
  name: string
  description: string
  image: string | null
}

type Props = {
  items: Item[]
}

export function EquipmentShowcase({ items }: Props) {
  return (
    <div className="grid gap-6 sm:gap-7 md:grid-cols-2 lg:grid-cols-2">
      {items.map((item, i) => (
        <article
          key={i}
          className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-gold/60"
        >
          <SafeImage
            src={item.image}
            alt={item.name}
            sizes="(max-width: 768px) 100vw, 50vw"
            aspect="16/10"
            wrapperClassName="overflow-hidden"
            rounded={false}
            className="transition-transform duration-500 group-hover:scale-105"
          />
          <div className="flex flex-col gap-2 p-6">
            <h3 className="text-lg font-semibold text-teal-deep">{item.name}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          </div>
        </article>
      ))}
    </div>
  )
}

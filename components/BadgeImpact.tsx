export function BadgeImpact() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-brand-turquoise/50 bg-brand-turquoise/10 px-4 py-2 text-sm font-medium text-brand-jade">
      <span
        className="h-2.5 w-2.5 rounded-full bg-brand-turquoise"
        aria-hidden="true"
      />
      <span>
        Árboles financiados:{' '}
        <span className="ml-1 font-semibold tabular-nums text-brand-turquoise">
          0000
        </span>
      </span>
    </div>
  )
}

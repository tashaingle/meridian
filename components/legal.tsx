export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">Draft wording</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">{title}</h1>
      <p className="mt-3 text-sm text-muted">
        Placeholder for the selling business to replace with approved copy. This is not legal advice. Sketched 16 October 2026.
      </p>
      <div className="mt-8 space-y-4 text-[15px] leading-7">{children}</div>
    </article>
  );
}

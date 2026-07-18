/** Some sheet rows cram multiple URLs into one cell, separated by line breaks. */
function splitLinks(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function LinkCell({ value }: { value: string }) {
  if (!value?.trim()) return <span className="text-[var(--text-muted)]">—</span>;

  return (
    <div className="flex flex-col gap-0.5">
      {splitLinks(value).map((v, i) => {
        const isUrl = /^https?:\/\//i.test(v);
        return (
          <span key={i} className="block max-w-[260px] truncate" title={v}>
            {isUrl ? (
              <a href={v} target="_blank" rel="noreferrer" className="text-[var(--series-1)] hover:underline">
                {v}
              </a>
            ) : (
              v
            )}
          </span>
        );
      })}
    </div>
  );
}

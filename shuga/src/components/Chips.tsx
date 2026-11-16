type Opt = { id: string; label: string };

export function RadioChips({ name, options, defaultValue }: { name: string; options: readonly Opt[]; defaultValue?: string }) {
  return (
    <div className="chips" role="radiogroup">
      {options.map((o) => (
        <label className="chip" key={o.id}>
          <input type="radio" name={name} value={o.id} defaultChecked={o.id === defaultValue} />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );
}

export function TagChips({ name, options }: { name: string; options: readonly string[] }) {
  return (
    <div className="chips">
      {options.map((t) => (
        <label className="chip tag" key={t}>
          <input type="checkbox" name={name} value={t} />
          <span>{t}</span>
        </label>
      ))}
    </div>
  );
}

export function Scale({ name, labels, defaultValue }: { name: string; labels: readonly string[]; defaultValue?: number }) {
  return (
    <div className="scale" role="radiogroup">
      {labels.map((l, i) => (
        <label className="chip" key={l}>
          <input type="radio" name={name} value={i + 1} defaultChecked={defaultValue === i + 1} />
          <span>
            <i className="dot" />
            {l}
          </span>
        </label>
      ))}
    </div>
  );
}

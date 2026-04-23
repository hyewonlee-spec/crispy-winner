import type { PropsWithChildren, ReactNode } from 'react';

export function Field({ label, children, hint }: PropsWithChildren<{ label: string; hint?: ReactNode }>) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
      {hint ? <span className="field__hint">{hint}</span> : null}
    </label>
  );
}

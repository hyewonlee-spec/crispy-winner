import type { PropsWithChildren, ReactNode } from 'react';

type CardProps = PropsWithChildren<{
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  tone?: 'default' | 'soft' | 'plum';
}>;

export function Card({ title, subtitle, action, children, tone = 'default' }: CardProps) {
  return (
    <section className={`card card--${tone}`}>
      {(title || subtitle || action) && (
        <div className="card__header">
          <div>
            {title ? <h2 className="card__title">{title}</h2> : null}
            {subtitle ? <p className="card__subtitle">{subtitle}</p> : null}
          </div>
          {action ? <div>{action}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}

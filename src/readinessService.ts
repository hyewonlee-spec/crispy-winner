import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type Props = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: Variant;
  block?: boolean;
};

export function Button({ variant = 'primary', block = false, children, className = '', ...props }: Props) {
  return (
    <button
      className={`button button--${variant} ${block ? 'button--block' : ''} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

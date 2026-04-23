type Option<T extends string | number> = {
  label: string;
  value: T;
};

type Props<T extends string | number> = {
  options: Option<T>[];
  value?: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string | number>({ options, value, onChange }: Props<T>) {
  return (
    <div className="segmented">
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          className={`segmented__item ${value === option.value ? 'is-active' : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

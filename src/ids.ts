type Props = {
  value?: number;
  onChange: (value: number) => void;
};

export function RatingPills({ value, onChange }: Props) {
  return (
    <div className="pills">
      {[1, 2, 3, 4, 5].map((num) => (
        <button
          key={num}
          type="button"
          className={`pill ${value === num ? 'is-active' : ''}`}
          onClick={() => onChange(num)}
        >
          {num}
        </button>
      ))}
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Button } from '../common/Buttons';

type Props = {
  title: string;
  subtitle?: string;
  backTo?: string;
  utilityLabel?: string;
  onUtilityClick?: () => void;
};

export function PageHeader({ title, subtitle, backTo, utilityLabel, onUtilityClick }: Props) {
  return (
    <header className="page-header page-header--brand">
      <div className="page-header__brand-row">
        <div>
          <div className="page-header__brand">Muscle Royalty</div>
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {onUtilityClick && utilityLabel ? (
          <Button className="page-header__utility" onClick={onUtilityClick}>
            {utilityLabel}
          </Button>
        ) : null}
      </div>
      {backTo ? (
        <div className="page-header__top">
          <Link to={backTo} className="back-link">
            ← Back
          </Link>
        </div>
      ) : null}
    </header>
  );
}

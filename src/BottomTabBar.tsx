import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { PageHeader } from '../../components/shell/PageHeader';

const rows = [
  { to: '/more/profile', title: 'Profile', body: 'Units, week start, and menstruation tracking.' },
  { to: '/more/settings', title: 'App settings', body: 'Theme, finish confirmation, and cycle insight display.' },
  { to: '/more/exercises', title: 'Exercise library', body: 'Manage reusable exercise definitions.' },
  { to: '/more/data', title: 'Data management', body: 'Export, import, and reset local data.' },
  { to: '/more/about', title: 'About', body: 'Version info and build philosophy.' },
];

export function MorePage() {
  return (
    <div className="page">
      <PageHeader title="More" subtitle="Settings, controls, and long-term maintenance." />
      <div className="stack-md">
        {rows.map((row) => (
          <Link key={row.to} to={row.to} className="row-link">
            <Card title={row.title} subtitle={row.body} />
          </Link>
        ))}
      </div>
    </div>
  );
}

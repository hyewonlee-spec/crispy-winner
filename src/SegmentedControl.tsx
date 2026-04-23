import { Card } from '../../components/common/Card';
import { PageHeader } from '../../components/shell/PageHeader';
import { appMeta } from '../../lib/db/db';

export function AboutPage() {
  return (
    <div className="page">
      <PageHeader title="About" subtitle="A local-first rebuild scaffold for Muscle Royalty." backTo="/more" />
      <Card title="Build philosophy">
        <div className="stack-sm">
          <p>Simple. Fast. Stable. iPhone-friendly. Minimal maintenance.</p>
          <p>No backend dependency for the core function. IndexedDB is the source of truth.</p>
        </div>
      </Card>
      <Card title="Version info">
        <div className="stack-sm">
          <p>App version: {appMeta.appVersion}</p>
          <p>Schema version: {appMeta.schemaVersion}</p>
        </div>
      </Card>
    </div>
  );
}

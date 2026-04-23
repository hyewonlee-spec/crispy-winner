import { useEffect, useRef, useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Buttons';
import { PageHeader } from '../../components/shell/PageHeader';
import { backupRepo } from '../../lib/repos/backupRepo';
import { db, appMeta, initialiseApp } from '../../lib/db/db';
import type { AppExport, BackupRecord } from '../../lib/types';

export function DataManagementPage() {
  const [records, setRecords] = useState<BackupRecord[]>([]);
  const [message, setMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function reload() {
    setRecords(await backupRepo.listBackupRecords());
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleExport() {
    const payload = await backupRepo.buildFullExport();
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const fileName = `muscle-royalty-export-${payload.exportedAt.slice(0, 10)}.json`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);

    await backupRepo.createBackupRecord('export', backupRepo.countTables(payload.data), fileName);
    setMessage('Export complete.');
    await reload();
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as AppExport;

      if (parsed.app !== 'Muscle Royalty') {
        throw new Error('This file is not a Muscle Royalty export.');
      }

      await backupRepo.importReplace(parsed);
      await backupRepo.createBackupRecord('import', backupRepo.countTables(parsed.data), file.name);
      setMessage('Import complete. Local data replaced successfully.');
      await reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Import failed.');
    } finally {
      event.target.value = '';
    }
  }

  async function handleReset() {
    const confirmed = window.confirm('Reset all local data? This cannot be undone.');
    if (!confirmed) return;
    await db.delete();
    setMessage('Data reset. Reloading scaffold.');
    await initialiseApp();
    window.location.reload();
  }

  return (
    <div className="page">
      <PageHeader title="Data management" subtitle="Back up and restore your local-first data." backTo="/more" />

      <Card title="Export">
        <div className="stack-sm">
          <p>Download a full JSON backup of your local database.</p>
          <Button block onClick={handleExport}>
            Export JSON
          </Button>
        </div>
      </Card>

      <Card title="Import">
        <div className="stack-sm">
          <p>This replaces local data with the selected export file.</p>
          <input
            ref={fileInputRef}
            className="input"
            type="file"
            accept="application/json"
            onChange={handleImport}
          />
        </div>
      </Card>

      <Card title="Backup history">
        <div className="stack-sm">
          {records.length === 0 ? (
            <p className="muted">No export or import history yet.</p>
          ) : (
            records.map((record) => (
              <div key={record.id} className="library-row">
                <div>
                  <strong>{record.kind === 'export' ? 'Export' : 'Import'}</strong>
                  <p className="muted">{new Date(record.createdAt).toLocaleString('en-AU')}</p>
                </div>
                <span className="pill pill--static">{record.format.toUpperCase()}</span>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card title="Database info">
        <div className="stack-sm">
          <p>App version: {appMeta.appVersion}</p>
          <p>Schema version: {appMeta.schemaVersion}</p>
          {message ? <p className="notice">{message}</p> : null}
        </div>
      </Card>

      <Card title="Reset app" subtitle="Destructive action">
        <Button variant="danger" block onClick={handleReset}>
          Reset local data
        </Button>
      </Card>
    </div>
  );
}

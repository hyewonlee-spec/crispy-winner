import { useEffect, useState } from 'react';
import { Card } from '../../components/common/Card';
import { Field } from '../../components/common/Field';
import { SegmentedControl } from '../../components/common/SegmentedControl';
import { PageHeader } from '../../components/shell/PageHeader';
import { settingsRepo } from '../../lib/repos/settingsRepo';
import type { AppSettings } from '../../lib/types';

export function AppSettingsPage() {
  const [settings, setSettings] = useState<AppSettings | undefined>();

  async function reload() {
    setSettings(await settingsRepo.getSettings());
  }

  useEffect(() => {
    reload();
  }, []);

  async function patch(p: Partial<AppSettings>) {
    await settingsRepo.updateSettings(p);
    await reload();
  }

  if (!settings) return null;

  return (
    <div className="page">
      <PageHeader title="App settings" subtitle="Behaviour and display preferences." backTo="/more" />
      <Card title="Visibility and flow">
        <div className="stack-md">
          <Field label="Show cycle insights on Today">
            <SegmentedControl
              value={settings.showCycleInsights ? 'on' : 'off'}
              options={[
                { label: 'On', value: 'on' },
                { label: 'Off', value: 'off' },
              ]}
              onChange={(value) => patch({ showCycleInsights: value === 'on' })}
            />
          </Field>
          <Field label="Show readiness score">
            <SegmentedControl
              value={settings.showReadinessScore ? 'on' : 'off'}
              options={[
                { label: 'On', value: 'on' },
                { label: 'Off', value: 'off' },
              ]}
              onChange={(value) => patch({ showReadinessScore: value === 'on' })}
            />
          </Field>
          <Field label="Confirm before finish workout">
            <SegmentedControl
              value={settings.confirmBeforeFinishWorkout ? 'on' : 'off'}
              options={[
                { label: 'On', value: 'on' },
                { label: 'Off', value: 'off' },
              ]}
              onChange={(value) => patch({ confirmBeforeFinishWorkout: value === 'on' })}
            />
          </Field>
          <Field label="Default rest seconds">
            <input
              className="input"
              inputMode="numeric"
              value={settings.defaultRestSeconds}
              onChange={(event) => patch({ defaultRestSeconds: Number(event.target.value) || 0 })}
            />
          </Field>
        </div>
      </Card>
    </div>
  );
}

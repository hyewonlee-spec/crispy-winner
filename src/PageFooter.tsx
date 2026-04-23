import { useEffect, useState } from 'react';
import { Card } from '../../components/common/Card';
import { Field } from '../../components/common/Field';
import { SegmentedControl } from '../../components/common/SegmentedControl';
import { PageHeader } from '../../components/shell/PageHeader';
import { profileRepo } from '../../lib/repos/profileRepo';
import type { Profile } from '../../lib/types';

export function ProfileSettingsPage() {
  const [profile, setProfile] = useState<Profile | undefined>();

  async function reload() {
    setProfile(await profileRepo.getProfile());
  }

  useEffect(() => {
    reload();
  }, []);

  async function patch(p: Partial<Profile>) {
    await profileRepo.updateProfile(p);
    await reload();
  }

  if (!profile) return null;

  return (
    <div className="page">
      <PageHeader title="Profile" subtitle="Personal setup that affects app behaviour." backTo="/more" />
      <Card title="Personal profile">
        <div className="stack-md">
          <Field label="Display name">
            <input
              className="input"
              value={profile.displayName}
              onChange={(event) => patch({ displayName: event.target.value })}
            />
          </Field>
          <Field label="Units">
            <SegmentedControl
              value={profile.units}
              options={[
                { label: 'kg', value: 'kg' },
                { label: 'lb', value: 'lb' },
              ]}
              onChange={(value) => patch({ units: value as Profile['units'] })}
            />
          </Field>
          <Field label="Track menstruation">
            <SegmentedControl
              value={profile.cycleTrackingEnabled ? 'on' : 'off'}
              options={[
                { label: 'On', value: 'on' },
                { label: 'Off', value: 'off' },
              ]}
              onChange={(value) => patch({ cycleTrackingEnabled: value === 'on' })}
            />
          </Field>
        </div>
      </Card>
    </div>
  );
}

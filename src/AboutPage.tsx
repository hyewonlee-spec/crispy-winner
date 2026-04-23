import { useEffect, useState } from 'react';
import { Card } from '../../components/common/Card';
import { Field } from '../../components/common/Field';
import { RatingPills } from '../../components/common/RatingPills';
import { SegmentedControl } from '../../components/common/SegmentedControl';
import { PageHeader } from '../../components/shell/PageHeader';
import { cycleRepo } from '../../lib/repos/cycleRepo';
import { profileRepo } from '../../lib/repos/profileRepo';
import type { CycleEntry, Profile } from '../../lib/types';
import { formatShortDate, getTodayDate } from '../../lib/utils/date';
import { EmptyState } from '../../components/common/EmptyState';
import { Link } from 'react-router-dom';

const phaseOptions = [
  { label: 'Unknown', value: 'unknown' },
  { label: 'Menstrual', value: 'menstrual' },
  { label: 'Follicular', value: 'follicular' },
  { label: 'Ovulatory', value: 'ovulatory' },
  { label: 'Luteal', value: 'luteal' },
] as const;

export function CyclePage() {
  const [profile, setProfile] = useState<Profile | undefined>();
  const [todayEntry, setTodayEntry] = useState<CycleEntry | undefined>();
  const [recentEntries, setRecentEntries] = useState<CycleEntry[]>([]);

  async function reload() {
    const today = getTodayDate();
    const [nextProfile, nextEntry, recent] = await Promise.all([
      profileRepo.getProfile(),
      cycleRepo.getCycleEntryByDate(today),
      cycleRepo.listRecentCycleEntries(),
    ]);
    setProfile(nextProfile);
    setTodayEntry(nextEntry);
    setRecentEntries(recent);
  }

  useEffect(() => {
    reload();
  }, []);

  async function updateEntry(patch: Partial<CycleEntry>) {
    const next = await cycleRepo.upsertCycleEntryByDate(getTodayDate(), patch);
    setTodayEntry(next);
    setRecentEntries(await cycleRepo.listRecentCycleEntries());
  }

  if (profile && !profile.cycleTrackingEnabled) {
    return (
      <div className="page">
        <PageHeader title="Cycle" subtitle="Tracking is currently turned off." />
        <Card title="Tracking is off">
          <EmptyState
            title="Menstruation tracking is disabled"
            body="Turn it back on in Profile whenever you want cycle-aware check-ins again."
            action={<Link className="inline-link" to="/more/profile">Open Profile</Link>}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader title="Cycle" subtitle="Track context without letting it dominate the app." />

      <Card title="Today’s cycle entry" subtitle="One entry per day. Saved locally.">
        <div className="stack-md">
          <Field label="Phase">
            <SegmentedControl
              options={phaseOptions.map((option) => ({ label: option.label, value: option.value }))}
              value={todayEntry?.phase ?? 'unknown'}
              onChange={(value) => updateEntry({ phase: value as CycleEntry['phase'] })}
            />
          </Field>
          <Field label="Cycle day">
            <input
              className="input"
              inputMode="numeric"
              placeholder="Optional"
              value={todayEntry?.cycleDay ?? ''}
              onChange={(event) =>
                updateEntry({
                  cycleDay: event.target.value ? Number(event.target.value) : undefined,
                })
              }
            />
          </Field>
          <Field label="Cramps">
            <RatingPills value={todayEntry?.cramps} onChange={(value) => updateEntry({ cramps: value })} />
          </Field>
          <Field label="Mood">
            <RatingPills value={todayEntry?.mood} onChange={(value) => updateEntry({ mood: value })} />
          </Field>
          <Field label="Notes">
            <textarea
              className="input textarea"
              placeholder="Anything worth noting today?"
              value={todayEntry?.notes ?? ''}
              onChange={(event) => updateEntry({ notes: event.target.value })}
            />
          </Field>
        </div>
      </Card>

      <Card title="Recent timeline">
        <div className="timeline">
          {recentEntries.length === 0 ? (
            <p className="muted">No cycle entries yet.</p>
          ) : (
            recentEntries.map((entry) => (
              <div key={entry.id} className="timeline__row">
                <span>{formatShortDate(entry.date)}</span>
                <strong>{entry.phase ?? 'unknown'}</strong>
                <span className="muted">
                  {entry.cycleDay ? `Day ${entry.cycleDay}` : 'No cycle day'}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

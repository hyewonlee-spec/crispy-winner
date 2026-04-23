import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Buttons';
import { SegmentedControl } from '../../components/common/SegmentedControl';
import { Field } from '../../components/common/Field';
import { SliderScale } from '../../components/common/SliderScale';
import { PageHeader } from '../../components/shell/PageHeader';
import { useTodayData } from '../../hooks/useTodayData';
import { formatLongDate } from '../../lib/utils/date';
import { workoutRepo } from '../../lib/repos/workoutRepo';
import { getTodayDate } from '../../lib/utils/date';

export function TodayPage() {
  const navigate = useNavigate();
  const { checkin, cycleEntry, activeSession, profile, settings, readiness, updateCheckin } = useTodayData();

  async function startWorkout() {
    const session = activeSession ?? (await workoutRepo.startQuickSession());
    navigate('/workout/active', { state: { sessionId: session.id } });
  }

  const cycleBadge = cycleEntry?.phase === 'luteal'
    ? 'Normal training'
    : cycleEntry?.phase === 'menstrual'
      ? 'Lighter training'
      : cycleEntry?.phase === 'ovulatory'
        ? 'Good power day'
        : cycleEntry?.phase === 'follicular'
          ? 'Build intensity'
          : 'Track today';

  return (
    <div className="page">
      <PageHeader title="Today" subtitle={formatLongDate(getTodayDate())} />

      {activeSession ? (
        <Card title="Workout in progress" subtitle={activeSession.title ?? 'Active session'} tone="soft">
          <div className="stack-sm">
            <p className="muted">You already have a live session running.</p>
            <Button block onClick={() => navigate('/workout/active')}>
              Resume workout
            </Button>
          </div>
        </Card>
      ) : null}

      <Card title="Condition checkpoint" subtitle={formatLongDate(getTodayDate())}>
        <div className="stack-md">
          <Field label="Sleep quality">
            <SliderScale
              value={checkin?.sleepQuality ?? 3}
              onChange={(value) => updateCheckin({ sleepQuality: value })}
              leftLabel="poor"
              midLabel="okay"
              rightLabel="great"
            />
          </Field>
          <Field label="Energy level">
            <SliderScale
              value={checkin?.energy ?? 3}
              onChange={(value) => updateCheckin({ energy: value })}
              leftLabel="poor"
              midLabel="okay"
              rightLabel="great"
            />
          </Field>
          <Field label="Stress level">
            <SliderScale
              value={checkin?.stress ?? 3}
              onChange={(value) => updateCheckin({ stress: value })}
              leftLabel="low"
              midLabel="okay"
              rightLabel="high"
            />
          </Field>
          <Field label="Soreness">
            <SliderScale
              value={checkin?.soreness ?? 3}
              onChange={(value) => updateCheckin({ soreness: value })}
              leftLabel="light"
              midLabel="okay"
              rightLabel="heavy"
            />
          </Field>
          <Field label="Motivation">
            <SliderScale
              value={checkin?.motivation ?? 3}
              onChange={(value) => updateCheckin({ motivation: value })}
              leftLabel="low"
              midLabel="okay"
              rightLabel="high"
            />
          </Field>
          <Field label="Pain present">
            <SegmentedControl
              value={checkin?.painPresent ? 'yes' : 'no'}
              options={[
                { label: 'No', value: 'no' },
                { label: 'Yes', value: 'yes' },
              ]}
              onChange={(value) => updateCheckin({ painPresent: value === 'yes' })}
            />
          </Field>
          {checkin?.painPresent ? (
            <Field label="Pain notes">
              <textarea
                className="input textarea"
                placeholder="Where is it showing up today?"
                value={checkin?.painNotes ?? ''}
                onChange={(event) => updateCheckin({ painNotes: event.target.value })}
              />
            </Field>
          ) : null}
        </div>
      </Card>

      <Card title="Readiness" subtitle={`${readiness.score}/100 • ${readiness.label}`}>
        <div className="stack-sm">
          <div className="readiness-row">
            <span className={`status-pill status-pill--${readiness.label}`}>{readiness.label}</span>
          </div>
          <p>{readiness.message}</p>
        </div>
      </Card>

      {profile?.cycleTrackingEnabled && settings?.showCycleInsights ? (
        <Card title="Cycle summary" subtitle={cycleEntry?.phase ? cycleEntry.phase.charAt(0).toUpperCase() + cycleEntry.phase.slice(1) : 'No entry logged today'} tone="plum">
          <div className="stack-sm">
            <div className="cycle-summary">
              <span className="status-pill status-pill--purple">{cycleBadge}</span>
            </div>
            <p>
              {cycleEntry
                ? 'Use cycle context as support, not a rule.'
                : 'Track today if you want cycle-aware context and training guidance on this screen.'}
            </p>
          </div>
        </Card>
      ) : null}

      <Button block className="today-cta" onClick={startWorkout}>
        {activeSession ? 'Resume and finish workout' : 'Record and start workout'}
      </Button>
    </div>
  );
}

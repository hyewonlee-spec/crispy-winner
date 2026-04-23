import { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/common/Card';
import { PageHeader } from '../../components/shell/PageHeader';
import { workoutRepo } from '../../lib/repos/workoutRepo';
import type { WorkoutSession } from '../../lib/types';
import { EmptyState } from '../../components/common/EmptyState';
import { formatShortDate } from '../../lib/utils/date';

export function ProgressPage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);

  useEffect(() => {
    workoutRepo.listRecentSessions(20).then((items) => {
      setSessions(items.filter((item) => item.status === 'completed'));
    });
  }, []);

  const stats = useMemo(() => {
    const workouts = sessions.length;
    const totalMinutes = sessions.reduce((sum, item) => sum + Math.round((item.durationSeconds ?? 0) / 60), 0);
    const avgMinutes = workouts ? Math.round(totalMinutes / workouts) : 0;
    return { workouts, totalMinutes, avgMinutes };
  }, [sessions]);

  return (
    <div className="page">
      <PageHeader title="Progress" subtitle="Simple local insights first. Heavier analytics come later." />

      <div className="stats-grid">
        <Card title="Completed workouts">
          <div className="stat">{stats.workouts}</div>
        </Card>
        <Card title="Total minutes">
          <div className="stat">{stats.totalMinutes}</div>
        </Card>
        <Card title="Average session">
          <div className="stat">{stats.avgMinutes}m</div>
        </Card>
      </div>

      <Card title="Recent workout history">
        {sessions.length === 0 ? (
          <EmptyState
            title="No completed workouts yet"
            body="Complete a few sessions and this page will start to feel useful."
          />
        ) : (
          <div className="timeline">
            {sessions.map((session) => (
              <div key={session.id} className="timeline__row">
                <span>{formatShortDate(session.date)}</span>
                <strong>{session.title ?? 'Workout'}</strong>
                <span className="muted">{workoutRepo.describeSession(session)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

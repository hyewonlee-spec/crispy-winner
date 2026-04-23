import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Buttons';
import { PageHeader } from '../../components/shell/PageHeader';
import { workoutRepo } from '../../lib/repos/workoutRepo';
import type { WorkoutSession } from '../../lib/types';
import { formatTime } from '../../lib/utils/date';

export function WorkoutPage() {
  const navigate = useNavigate();
  const [activeSession, setActiveSession] = useState<WorkoutSession | undefined>();

  useEffect(() => {
    workoutRepo.getActiveSession().then((session) => {
      setActiveSession(session);
      if (session) navigate('/workout/active', { replace: true });
    });
  }, [navigate]);

  async function handleQuickStart() {
    const session = await workoutRepo.startQuickSession();
    navigate('/workout/active', { state: { sessionId: session.id } });
  }

  return (
    <div className="page">
      <PageHeader title="Workout" subtitle="Quick start a session or jump back into a live one." />

      <Card title="Quick start">
        <div className="stack-sm">
          <p className="muted">Start logging immediately. Every change stays on your device.</p>
          <Button block onClick={handleQuickStart}>
            Quick start workout
          </Button>
        </div>
      </Card>

      <Card title="Resume workout" subtitle={activeSession ? `Started at ${formatTime(activeSession.startTime)}` : 'No live workout right now.'} tone="soft">
        <div className="stack-sm">
          <p className="muted">Workout becomes the live view only when a session is active.</p>
          <Button block variant="secondary" onClick={() => activeSession ? navigate('/workout/active') : handleQuickStart()}>
            {activeSession ? 'Open active workout' : 'Start a session'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

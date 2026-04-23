import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Buttons';
import { PageHeader } from '../../components/shell/PageHeader';
import { useActiveWorkout } from '../../hooks/useActiveWorkout';
import type { WorkoutSessionItem } from '../../lib/types';

function SessionItemCard({
  item,
  setCount,
  children,
}: {
  item: WorkoutSessionItem;
  setCount: number;
  children: ReactNode;
}) {
  return (
    <Card title={item.exerciseNameSnapshot} subtitle={`${setCount} set${setCount === 1 ? '' : 's'}`}>
      {children}
    </Card>
  );
}

export function ActiveWorkoutPage() {
  const navigate = useNavigate();
  const { session, items, setLogs, availableExercises, elapsedLabel, startQuickSession, addExercise, addSet, updateSet, finishSession, abandonSession } =
    useActiveWorkout();

  async function handleFinish() {
    await finishSession();
    navigate('/today', { replace: true });
  }

  async function handleAbandon() {
    await abandonSession();
    navigate('/today', { replace: true });
  }

  if (!session) {
    return (
      <div className="page">
        <PageHeader title="Workout" subtitle="No active session yet." />
        <Card title="Start a session" tone="soft">
          <div className="stack-sm">
            <p>Create a workout and jump straight into logging.</p>
            <Button block onClick={startQuickSession}>
              Start quick session
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="page page--workout-live">
      <PageHeader title={session.title ?? 'Today’s workout'} subtitle={`Live workout • ${elapsedLabel || '0m'}`} />

      <Card title="In progress" subtitle="Workout mode is active." tone="soft">
        <div className="button-row">
          <Button onClick={handleFinish}>Finish workout</Button>
          <Button variant="danger" onClick={handleAbandon}>
            Abandon
          </Button>
        </div>
      </Card>

      {items.length === 0 ? (
        <Card title="Add your first exercise" subtitle="Pick from your exercise list below.">
          <div className="chip-list">
            {availableExercises.map((exercise) => (
              <button
                key={exercise.id}
                type="button"
                className="chip chip--purple"
                onClick={() => addExercise(exercise)}
              >
                {exercise.name}
              </button>
            ))}
          </div>
        </Card>
      ) : null}

      <div className="stack-lg">
        {items.map((item) => {
          const itemSets = setLogs.filter((set) => set.sessionItemId === item.id);
          return (
            <SessionItemCard key={item.id} item={item} setCount={itemSets.length}>
              <div className="stack-md">
                {itemSets.map((set) => (
                  <div key={set.id} className="set-row set-row--live">
                    <div className="set-row__meta">Set {set.setNumber}</div>
                    <input
                      className="input input--live"
                      inputMode="decimal"
                      placeholder="kg"
                      value={set.weight ?? ''}
                      onChange={(event) =>
                        updateSet(set.id, {
                          weight: event.target.value ? Number(event.target.value) : undefined,
                        })
                      }
                    />
                    <input
                      className="input input--live"
                      inputMode="numeric"
                      placeholder="reps"
                      value={set.reps ?? ''}
                      onChange={(event) =>
                        updateSet(set.id, {
                          reps: event.target.value ? Number(event.target.value) : undefined,
                        })
                      }
                    />
                    <button
                      type="button"
                      className={`set-check ${set.completed ? 'is-complete' : ''}`}
                      onClick={() => updateSet(set.id, { completed: !set.completed })}
                    >
                      {set.completed ? 'Done' : 'Mark'}
                    </button>
                  </div>
                ))}
                <Button variant="secondary" block onClick={() => addSet(item)}>
                  Add set
                </Button>
              </div>
            </SessionItemCard>
          );
        })}
      </div>

      <Card title="Add another exercise">
        <div className="chip-list">
          {availableExercises.map((exercise) => (
            <button
              key={exercise.id}
              type="button"
              className="chip chip--purple"
              onClick={() => addExercise(exercise)}
            >
              {exercise.name}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

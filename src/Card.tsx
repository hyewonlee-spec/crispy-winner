import { useEffect, useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Buttons';
import { Field } from '../../components/common/Field';
import { PageHeader } from '../../components/shell/PageHeader';
import { exerciseRepo } from '../../lib/repos/exerciseRepo';
import type { Exercise } from '../../lib/types';

export function ExerciseLibraryPage() {
  const [items, setItems] = useState<Exercise[]>([]);
  const [name, setName] = useState('');

  async function reload() {
    setItems(await exerciseRepo.listExercises());
  }

  useEffect(() => {
    reload();
  }, []);

  async function createExercise() {
    if (!name.trim()) return;
    await exerciseRepo.createExercise({
      name: name.trim(),
      category: 'strength',
      movementPattern: 'other',
      equipment: 'other',
    });
    setName('');
    await reload();
  }

  async function archive(id: string) {
    await exerciseRepo.archiveExercise(id);
    await reload();
  }

  return (
    <div className="page">
      <PageHeader title="Exercise library" subtitle="Reusable movement definitions." backTo="/more" />
      <Card title="Add exercise">
        <div className="stack-sm">
          <Field label="Exercise name">
            <input
              className="input"
              placeholder="e.g. Hip thrust"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <Button block onClick={createExercise}>
            Add exercise
          </Button>
        </div>
      </Card>

      <Card title="All exercises">
        <div className="stack-sm">
          {items.map((item) => (
            <div key={item.id} className="library-row">
              <div>
                <strong>{item.name}</strong>
                <p className="muted">{item.isArchived ? 'Archived' : item.category}</p>
              </div>
              {!item.isArchived ? (
                <Button variant="ghost" onClick={() => archive(item.id)}>
                  Archive
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

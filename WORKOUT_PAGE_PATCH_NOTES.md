# Muscle Royalty — Workout Page Patch

Workout page only.

## Changes

- Removed Save draft.
- Removed Save as Notion template.
- Removed Clear current draft.
- Added + Add exercise.
- Workout title now only displays the workout name.
- Reduced exercise name font size.
- Confirmed End Today's workout returns to Today page.

## Recommended workout source

Recommended workouts are hardcoded in `src/App.jsx` inside:

`const recommendedPlans = ...`

Current snippet:

```js
const recommendedPlans = {
  1: { title: "Lower A", type: "Lower A", focus: "Glutes and hamstrings", exercises: ["Hip Thrust", "Dumbbell Romanian Deadlift", "Seated Hamstring Curl", "Leg Press", "Hip Abductor Machine", "Hip Adductor Machine", "Pallof Press", "Seated Heel Raise Partial Range"] },
  2: { title: "Upper A", type: "Upper A", focus: "Upper body strength", exercises: ["Chest-Supported Dumbbell Row", "Seated Cable Row — Neutral Grip", "Wide-Neutral Lat Pulldown", "Machine Chest Press", "Face Pull", "Rear Delt Fly", "Hammer Curl"] },
  3: { title: "Mobility + Cardio", type: "Mobility + Cardio", focus: "Mobility, core and conditioning", exercises: ["Bike", "Dead Bug", "Bird Dog", "Pallof Press", "Suitcase Carry", "Farmer Carry"] },
  4: { title: "Lower B", type: "Lower B", focus: "Machines and controlled strength", exercises: ["Leg Press", "Glute Bridge Machine", "Leg Extension", "Seated Hamstring Curl", "Cable Pull-Through", "Hip Abductor Machine", "Dead Bug"] },
  5: { title: "Upper B", type: "Upper B", focus: "Push/pull, arms, conditioning", exercises: ["Landmine Press", "One-Arm Cable Row", "Machine Chest Press", "Wide-Neutral Lat Pulldown", "Cable Lateral Raise", "Rope Triceps Pressdown", "Hammer Curl", "Farmer Carry"] },
};

const categoryOptions = ["Lower Body","Upper Pull","Upper Push","Arms","Core","Conditioning","Custom"];
const statusOptions = ["Recommended","Caution","Avoid for now","Later phase","Custom"];
const movementOptions = ["Hip Extension","Knee Dominant","Knee Flexion","Hip Abduction","Hip Adduction","Hip Hinge","Knee Extension","Single Leg","Squat","Horizontal Pull","Vertical Pull","Scapular Control","Horizontal Push","Angled Press","Elbow Extension","Elbow Flexion","Anti-Extension","Lateral Core","Anti-Rotation","Carry","Balance","Cardio","
```

These plans are not coming from Notion yet. They are built into the app code.

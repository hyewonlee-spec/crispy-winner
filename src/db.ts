import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '../components/shell/AppShell';
import { TodayPage } from '../pages/today/TodayPage';
import { WorkoutPage } from '../pages/workout/WorkoutPage';
import { ActiveWorkoutPage } from '../pages/workout/ActiveWorkoutPage';
import { CyclePage } from '../pages/cycle/CyclePage';
import { ProgressPage } from '../pages/progress/ProgressPage';
import { MorePage } from '../pages/more/MorePage';
import { ProfileSettingsPage } from '../pages/more/ProfileSettingsPage';
import { AppSettingsPage } from '../pages/more/AppSettingsPage';
import { ExerciseLibraryPage } from '../pages/more/ExerciseLibraryPage';
import { DataManagementPage } from '../pages/more/DataManagementPage';
import { AboutPage } from '../pages/more/AboutPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/today" replace /> },
      { path: 'today', element: <TodayPage /> },
      { path: 'workout', element: <WorkoutPage /> },
      { path: 'workout/active', element: <ActiveWorkoutPage /> },
      { path: 'cycle', element: <CyclePage /> },
      { path: 'progress', element: <ProgressPage /> },
      { path: 'more', element: <MorePage /> },
      { path: 'more/profile', element: <ProfileSettingsPage /> },
      { path: 'more/settings', element: <AppSettingsPage /> },
      { path: 'more/exercises', element: <ExerciseLibraryPage /> },
      { path: 'more/data', element: <DataManagementPage /> },
      { path: 'more/about', element: <AboutPage /> },
    ],
  },
]);

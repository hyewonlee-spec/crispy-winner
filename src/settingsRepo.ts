import { Outlet } from 'react-router-dom';
import { BottomTabBar } from './BottomTabBar';
import { PageFooter } from './PageFooter';

export function AppShell() {
  return (
    <div className="app-shell">
      <main className="app-shell__main">
        <div className="page-frame">
          <Outlet />
          <PageFooter />
        </div>
      </main>
      <BottomTabBar />
    </div>
  );
}

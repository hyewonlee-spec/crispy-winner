import { NavLink, useLocation } from 'react-router-dom';
import { tabRoutes } from '../../lib/constants/routes';

export function BottomTabBar() {
  const location = useLocation();
  const activeIsWorkout = location.pathname.startsWith('/workout');

  return (
    <nav className={`tab-bar ${activeIsWorkout ? 'tab-bar--workout' : ''}`} aria-label="Primary">
      <div className="tab-bar__inner">
        {tabRoutes.map((tab) => {
          const isWorkoutTab = tab.path === '/workout';
          const forceActive = isWorkoutTab && activeIsWorkout;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) => `tab-bar__item ${isActive || forceActive ? 'is-active' : ''}`}
            >
              <span className="tab-bar__label">{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <Link to="/">
          Home
      </Link>{' '}
      <Link to="/captains-players">
          Captain games players
      </Link>{' '}
      <Link to="/captains-captains">
          Captain games captains
      </Link>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})
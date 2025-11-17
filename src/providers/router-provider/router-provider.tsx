import { createBrowserRouter, RouterProvider as Provider } from 'react-router-dom';

import { RouteMap } from './route-map';

const router = createBrowserRouter(RouteMap, {
  basename: __BASE__ || '/'
});

export const RouterProvider = () => {
  return <Provider router={router} />;
};

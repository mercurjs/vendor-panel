import { PropsWithChildren, useCallback, useMemo, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { RouteModalProviderContext } from './route-modal-context';

type RouteModalProviderProps = PropsWithChildren<{
  prev: string;
}>;

export const RouteModalProvider = ({ prev, children }: RouteModalProviderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [closeOnEscape, setCloseOnEscape] = useState(true);

  const handleSuccess = useCallback(
    (path?: string) => {
      const to = path || prev;
      navigate(`${to}${location.search}`, { replace: true, state: { isSubmitSuccessful: true } });
    },
    [navigate, prev, location.search]
  );

  const value = useMemo(
    () => ({
      handleSuccess,
      setCloseOnEscape,
      __internal: { closeOnEscape }
    }),
    [handleSuccess, setCloseOnEscape, closeOnEscape]
  );

  return (
    <RouteModalProviderContext.Provider value={value}>
      {children}
    </RouteModalProviderContext.Provider>
  );
};

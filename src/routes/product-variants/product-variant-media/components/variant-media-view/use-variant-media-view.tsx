import { useContext } from 'react';

import { VariantMediaViewContext } from './variant-media-view-context';

export const useVariantMediaView = () => {
  const ctx = useContext(VariantMediaViewContext);

  if (!ctx) {
    throw new Error('useVariantMediaView must be used within a VariantMediaViewContext.Provider');
  }

  return ctx;
};

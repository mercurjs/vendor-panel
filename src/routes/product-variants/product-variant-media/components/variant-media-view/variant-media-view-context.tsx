import { createContext } from 'react';

type VariantMediaViewContextValue = {
  goToGallery: () => void;
  goToEdit: () => void;
};

export const VariantMediaViewContext = createContext<VariantMediaViewContextValue | null>(null);

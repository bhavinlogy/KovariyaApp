import React, { createContext, useContext, useMemo, useState } from 'react';
import { Child } from '../types';
import { HOUSEHOLD_CHILDREN } from '../data/children';

type ChildrenContextValue = {
  children: Child[];
  selectedChildId: string;
  setSelectedChildId: (childId: string) => void;
  childPickerVisible: boolean;
  openChildPicker: () => void;
  closeChildPicker: () => void;
};

const ChildrenContext = createContext<ChildrenContextValue | undefined>(undefined);

export function ChildrenProvider({ children }: { children: React.ReactNode }) {
  const [selectedChildId, setSelectedChildId] = useState<string>(HOUSEHOLD_CHILDREN[0]?.id ?? '');
  const [childPickerVisible, setChildPickerVisible] = useState(false);

  const openChildPicker = () => setChildPickerVisible(true);
  const closeChildPicker = () => setChildPickerVisible(false);

  const value = useMemo(
    () => ({
      children: HOUSEHOLD_CHILDREN,
      selectedChildId,
      setSelectedChildId,
      childPickerVisible,
      openChildPicker,
      closeChildPicker,
    }),
    [selectedChildId, childPickerVisible]
  );

  return <ChildrenContext.Provider value={value}>{children}</ChildrenContext.Provider>;
}

export function useChildren(): ChildrenContextValue {
  const ctx = useContext(ChildrenContext);
  if (!ctx) {
    throw new Error('useChildren must be used within ChildrenProvider');
  }
  return ctx;
}


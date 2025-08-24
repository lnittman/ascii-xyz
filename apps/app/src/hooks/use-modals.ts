"use client";

import { useState } from 'react';

// Simple modal management hook
export function useModals() {
  const [openModals, setOpenModals] = useState<string[]>([]);

  const openModal = (modalName: string) => {
    setOpenModals(prev => [...prev, modalName]);
  };

  const closeModal = (modalName: string) => {
    setOpenModals(prev => prev.filter(name => name !== modalName));
  };

  const isModalOpen = (modalName: string) => {
    return openModals.includes(modalName);
  };

  return {
    openModal,
    closeModal,
    isModalOpen,
  };
}
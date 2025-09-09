"use client";

import { useState } from 'react';

interface ProviderModalsState {
  open: boolean;
  providerId: string | null;
  providerName: string | null;
}

// Extended modal management hook with provider models support
export function useModals() {
  const [openModals, setOpenModals] = useState<string[]>([]);
  const [providerModalsState, setProviderModalsState] = useState<ProviderModalsState>({
    open: false,
    providerId: null,
    providerName: null,
  });

  const openModal = (modalName: string) => {
    setOpenModals(prev => [...prev, modalName]);
  };

  const closeModal = (modalName: string) => {
    setOpenModals(prev => prev.filter(name => name !== modalName));
  };

  const isModalOpen = (modalName: string) => {
    return openModals.includes(modalName);
  };

  // Provider models modal specific functions
  const openProviderModelsModal = (providerId: string, providerName: string) => {
    setProviderModalsState({
      open: true,
      providerId,
      providerName,
    });
  };

  const closeProviderModelsModal = () => {
    setProviderModalsState({
      open: false,
      providerId: null,
      providerName: null,
    });
  };

  return {
    openModal,
    closeModal,
    isModalOpen,
    openProviderModelsModal,
    closeProviderModelsModal,
    providerModalsState,
  };
}
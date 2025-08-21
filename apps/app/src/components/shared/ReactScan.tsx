'use client';

import { type JSX, useEffect } from 'react';
// react-scan must be imported before react
import { scan } from 'react-scan';

export function ReactScan(): JSX.Element {
  useEffect(() => {
    // Only run react-scan in development mode
    if (process.env.NODE_ENV === 'development') {
      scan({
        enabled: true,
        // You can add more configuration options here
        // showToolbar: true,
        // alwaysShowLabels: false,
      });
    }
  }, []);

  return <></>;
}

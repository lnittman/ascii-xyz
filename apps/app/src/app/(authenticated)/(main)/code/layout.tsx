import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'logs · code',
  description: 'where syntax meets semantics',
});

export default function CodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

'use client';
import { isMobileMenuOpenAtom } from '@/atoms/mobile-menus';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';

export function MobileBlurOverlay() {
  const [isOpen, setIsOpen] = useAtom(isMobileMenuOpenAtom);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[250] bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)} // This will trigger onClose in MobileSheet
        />
      )}
    </AnimatePresence>
  );
}

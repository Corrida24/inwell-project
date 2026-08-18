import React, { createContext, useContext, useState, useCallback } from 'react';

interface ContactsModalValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const ContactsModalContext = createContext<ContactsModalValue | null>(null);

export const ContactsModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return <ContactsModalContext.Provider value={{ isOpen, open, close }}>{children}</ContactsModalContext.Provider>;
};

export function useContactsModal(): ContactsModalValue {
  const ctx = useContext(ContactsModalContext);
  if (!ctx) throw new Error('useContactsModal must be used within ContactsModalProvider');
  return ctx;
}

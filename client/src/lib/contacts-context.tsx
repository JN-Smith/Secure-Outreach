import { createContext, useContext, useState, ReactNode } from "react";
import { Contact, MOCK_CONTACTS } from "./mock-data";

interface ContactsContextType {
  contacts: Contact[];
  addContact: (contact: Omit<Contact, "id" | "createdAt" | "status">) => void;
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

export function ContactsProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);

  const addContact = (newContact: Omit<Contact, "id" | "createdAt" | "status">) => {
    const contact: Contact = {
      ...newContact,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString().split('T')[0],
      status: "New",
      tags: [], // Default empty tags for now
    };
    setContacts(prev => [contact, ...prev]);
  };

  return (
    <ContactsContext.Provider value={{ contacts, addContact }}>
      {children}
    </ContactsContext.Provider>
  );
}

export function useContacts() {
  const context = useContext(ContactsContext);
  if (!context) {
    throw new Error("useContacts must be used within a ContactsProvider");
  }
  return context;
}

/**
 * Contacts context shim — wraps the real API hooks with the same interface
 * that existing pages (contacts-page, contact-form-page) expect (camelCase).
 * This avoids having to touch those pages while wiring in the real backend.
 */
import { createContext, useContext, ReactNode } from "react";
import { useContacts as useContactsApi, useCreateContact, Contact as ApiContact } from "./api/contacts";
import { useAuth } from "./auth";

// Legacy camelCase Contact shape (used by contacts-page and contact-form-page)
export interface Contact {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  gender?: string;
  ageRange?: string;
  bornAgain: string;
  discipleshipStatus: string;
  baptized: string;
  location: string;
  isStudent: boolean;
  institution?: string;
  course?: string;
  followUpMethod: string;
  prayerRequests?: string;
  notes?: string;
  church?: string;
  yearOfStudy?: string;
  bestTime?: string;
  status: string;
  tags: string[];
  evangelistId: string;
  evangelistName?: string;
  teamId?: string;
  createdAt: string;
}

function toContact(c: ApiContact): Contact {
  return {
    id: c.id,
    fullName: c.full_name,
    phone: c.phone,
    email: c.email,
    gender: c.gender,
    ageRange: c.age_range,
    bornAgain: c.born_again,
    discipleshipStatus: c.discipleship_status,
    baptized: c.baptized,
    location: c.location,
    isStudent: c.is_student,
    institution: c.institution,
    course: c.course,
    followUpMethod: c.follow_up_method,
    prayerRequests: c.prayer_requests,
    notes: c.notes,
    status: c.status,
    tags: c.tags,
    evangelistId: c.evangelist_id,
    evangelistName: c.evangelist_name,
    teamId: c.team_id,
    createdAt: c.created_at,
  };
}

interface ContactsContextType {
  contacts: Contact[];
  isLoading: boolean;
  addContact: (contact: Partial<Contact> & Record<string, unknown>, onSuccess?: () => void, onError?: () => void) => void;
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

function normalizeYesNo(val: unknown, fallback = "Not Sure"): string {
  if (val === "Unsure") return "Not Sure";
  return (val as string) ?? fallback;
}

export function ContactsProvider({ children }: { children: ReactNode }) {
  const { data: apiContacts = [], isLoading } = useContactsApi();
  const { user } = useAuth();
  const createContact = useCreateContact();

  const contacts: Contact[] = apiContacts.map(toContact);

  const addContact = (formData: Partial<Contact> & Record<string, unknown>, onSuccess?: () => void, onError?: () => void) => {
    createContact.mutate({
      full_name: (formData.fullName ?? formData.full_name ?? "") as string,
      phone: (formData.phone ?? "") as string,
      email: formData.email as string | undefined,
      gender: formData.gender as string | undefined,
      age_range: (formData.ageRange ?? formData.age_range) as string | undefined,
      born_again: normalizeYesNo(formData.bornAgain ?? formData.born_again),
      discipleship_status: (formData.discipleshipStatus ?? formData.discipleship_status ?? "Not Started") as string,
      baptized: normalizeYesNo(formData.baptized),
      location: (formData.location ?? "") as string,
      is_student: (formData.isStudent ?? formData.is_student ?? false) as boolean,
      institution: formData.institution as string | undefined,
      course: formData.course as string | undefined,
      follow_up_method: (formData.followUpMethod ?? formData.follow_up_method ?? "Call") as string,
      prayer_requests: (formData.prayerRequests ?? formData.prayer_requests) as string | undefined,
      notes: formData.notes as string | undefined,
      status: (formData.followUpStatus ?? formData.status ?? "New") as string,
      tags: (formData.tags ?? []) as string[],
    } as any, { onSuccess, onError });
  };

  return (
    <ContactsContext.Provider value={{ contacts, isLoading, addContact }}>
      {children}
    </ContactsContext.Provider>
  );
}

export function useContacts() {
  const context = useContext(ContactsContext);
  if (!context) throw new Error("useContacts must be used within a ContactsProvider");
  return context;
}

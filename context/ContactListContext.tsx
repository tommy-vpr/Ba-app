"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { HubSpotContact } from "@/types/hubspot";
import { fetchHubSpotContactsPaginated } from "@/app/actions/actions";
import { fetchAllContactsByEmail } from "@/app/actions/fetchAllContactsByEmail";
import { useBrand } from "./BrandContext";

// Extend the context type to include allZips
type ContactListContextType = {
  contacts: HubSpotContact[];
  setContacts: React.Dispatch<React.SetStateAction<HubSpotContact[]>>;
  refetchContacts: () => Promise<void>;
  allZips: string[];
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const ContactListContext = createContext<ContactListContextType | undefined>(
  undefined
);

export const useContactList = () => {
  const context = useContext(ContactListContext);
  if (!context)
    throw new Error("useContactList must be used within ContactListProvider");
  return context;
};

export function ContactListProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<HubSpotContact[]>([]);
  const [allZips, setAllZips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false); // ✅ loading state
  const { data: session, status } = useSession();
  const { brand } = useBrand();

  const refetchContacts = async () => {
    if (!session?.user?.email || loading) return;
    setLoading(true);
    try {
      const [paginatedRes, allRes] = await Promise.all([
        fetchHubSpotContactsPaginated(12, "", session.user.email, brand),
        fetchAllContactsByEmail(session.user.email, brand),
      ]);

      if (paginatedRes.results) setContacts(paginatedRes.results);

      const zipSet = new Set(
        allRes
          .map((c) => c.properties?.zip)
          .filter((zip): zip is string => typeof zip === "string")
      );
      setAllZips(Array.from(zipSet));
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      setContacts([]); // optional: clear UI before reload
      setAllZips([]);
      refetchContacts();
    }
  }, [status, brand]);

  return (
    <ContactListContext.Provider
      value={{
        contacts,
        setContacts,
        refetchContacts,
        allZips,
        loading,
        setLoading,
      }}
    >
      {children}
    </ContactListContext.Provider>
  );
}

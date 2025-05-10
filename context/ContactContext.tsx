"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { HubSpotContact } from "@/types/hubspot";
import {
  fetchHubSpotContactsPaginated,
  fetchAllContactsByEmail,
  searchContactsByCompany,
  searchContactsByStatus,
} from "@/lib/hubspot/fetch";
import { useBrand } from "./BrandContext";
import { usePathname } from "next/navigation";
import { searchContactsByPostalCode } from "@/app/actions/actions";

import { useSearchParams } from "next/navigation";

type ContactContextType = {
  contacts: HubSpotContact[];
  setContacts: React.Dispatch<React.SetStateAction<HubSpotContact[]>>;
  allZips: string[];
  loadingContacts: boolean;
  loadingZips: boolean;
  refetchContacts: () => Promise<void>;
  fetchPage: (
    page: number,
    status?: string,
    query?: string,
    updater?: (prev: HubSpotContact[]) => HubSpotContact[],
    zip?: string | null
  ) => Promise<void>;
  page: number;
  setPage: (p: number) => void;
  selectedContact: HubSpotContact | null;
  setSelectedContact: (c: HubSpotContact | null) => void;
  editOpen: boolean;
  setEditOpen: (open: boolean) => void;
  logOpen: boolean;
  setLogOpen: (open: boolean) => void;
  contactId: string | null;
  setContactId: (id: string | null) => void;
  setLogContactData: (c: HubSpotContact | null) => void;
  logContactData: HubSpotContact | null;
  hasNext: boolean;
  setHasNext: (v: boolean) => void;
  query: string;
  setQuery: (q: string) => void;
  selectedStatus: string;
  setSelectedStatus: (s: string) => void;
  selectedZip: string | null;
  setSelectedZip: (zip: string | null) => void;
  zipContacts: HubSpotContact[];
  setZipContacts: React.Dispatch<React.SetStateAction<HubSpotContact[]>>;
  setCursors: React.Dispatch<
    React.SetStateAction<Record<string, string | null>>
  >;
  setAllContacts: React.Dispatch<React.SetStateAction<HubSpotContact[]>>;
  setAllZips: React.Dispatch<React.SetStateAction<string[]>>;
};

const ContactContext = createContext<ContactContextType | undefined>(undefined);
export const useContactContext = () => {
  const context = useContext(ContactContext);
  if (!context)
    throw new Error("useContactContext must be used within a ContactProvider");
  return context;
};

export function ContactProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const { brand } = useBrand();
  const [contacts, setContacts] = useState<HubSpotContact[]>([]);
  const [allZips, setAllZips] = useState<string[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingZips, setLoadingZips] = useState(false);
  const [page, setPage] = useState(1);
  const [cursors, setCursors] = useState<Record<string, string | null>>({});
  const [hasNext, setHasNext] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedZip, setSelectedZip] = useState<string | null>(null);
  const [zipContacts, setZipContacts] = useState<HubSpotContact[]>([]);
  const pathname = usePathname();
  const [selectedContact, setSelectedContact] = useState<HubSpotContact | null>(
    null
  );
  const [editOpen, setEditOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [contactId, setContactId] = useState<string | null>(null);
  const [logContactData, setLogContactData] = useState<HubSpotContact | null>(
    null
  );

  const [allContacts, setAllContacts] = useState<HubSpotContact[]>([]);

  const getCursorKey = (
    page: number,
    status: string,
    query: string,
    zip?: string | null
  ) =>
    `${page}-${status.trim().toLowerCase()}-${
      query.trim().toLowerCase() || "none"
    }-${zip || "nozip"}`;

  const fetchPage = async (
    pageNum: number,
    status: string = "all",
    query: string = "",
    updater?: (prev: HubSpotContact[]) => HubSpotContact[],
    zip?: string | null
  ) => {
    setLoadingContacts(true);

    try {
      if (updater) {
        setContacts((prev) => updater(prev));
        setPage(pageNum);
        return;
      }

      let filtered = [...allContacts];

      if (zip) {
        filtered = filtered.filter(
          (c) => c.properties?.zip?.trim() === zip.trim()
        );
      }

      if (status !== "all") {
        filtered = filtered.filter(
          (c) =>
            c.properties?.l2_lead_status?.toLowerCase() === status.toLowerCase()
        );
      }

      if (query.length >= 2) {
        filtered = filtered.filter((c) =>
          c.properties?.company?.toLowerCase().includes(query.toLowerCase())
        );
      }

      const pageSize = 12;
      const start = (pageNum - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);

      setContacts(paginated);
      setHasNext(start + pageSize < filtered.length);
      setPage(pageNum);
    } catch (err) {
      console.error("Error paginating contacts:", err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const refetchContacts = async (targetPage: number = 1) => {
    console.log("TARGET PAGE: ", targetPage);
    if (!session?.user?.email) return;

    setLoadingContacts(true);
    setLoadingZips(true);

    try {
      const allRes = await fetchAllContactsByEmail(session.user.email, brand);

      // setAllContacts(allRes.results); // <- store full set
      // setContacts(allRes.results.slice(0, 12)); // show first page
      // setHasNext(allRes.results.length > 12);
      setAllContacts(allRes.results);
      setContacts(allRes.results.slice((targetPage - 1) * 12, targetPage * 12));
      setHasNext(allRes.results.length > targetPage * 12);
      setPage(targetPage);

      const zipSet = new Set(
        allRes.results
          .map((c) => c.properties?.zip)
          .filter((zip): zip is string => typeof zip === "string")
      );
      setAllZips(Array.from(zipSet));
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
    } finally {
      setLoadingContacts(false);
      setLoadingZips(false);
    }
  };

  const searchParams = useSearchParams();

  const pageParam = Number(searchParams.get("page") || "1");
  const queryParam = searchParams.get("query") || "";
  const statusParam = searchParams.get("status") || "all";
  const zipParam = searchParams.get("zip") || null;

  // 1. Initial fetch: load all contacts once (if not already loaded)
  useEffect(() => {
    if (status !== "authenticated" || allContacts.length > 0) return;

    refetchContacts(pageParam);
  }, [status, brand, allContacts.length]);

  // 2. Filtering: run on every search param change
  useEffect(() => {
    if (!allContacts.length) return; // wait until contacts are available

    setQuery(queryParam);
    setSelectedStatus(statusParam);
    setSelectedZip(zipParam);
    fetchPage(pageParam, statusParam, queryParam, undefined, zipParam);
  }, [pageParam, queryParam, statusParam, zipParam, allContacts.length]);

  return (
    <ContactContext.Provider
      value={{
        contacts,
        setContacts,
        allZips,
        setAllZips,
        loadingContacts,
        loadingZips,
        refetchContacts,
        fetchPage,
        page,
        setPage,
        selectedContact,
        setSelectedContact,
        editOpen,
        setEditOpen,
        logOpen,
        setLogOpen,
        contactId,
        setContactId,
        logContactData,
        setLogContactData,
        hasNext,
        setHasNext,
        query,
        setQuery,
        selectedStatus,
        setSelectedStatus,
        selectedZip,
        setSelectedZip,
        zipContacts,
        setZipContacts,
        setCursors,
        setAllContacts,
      }}
    >
      {children}
    </ContactContext.Provider>
  );
}

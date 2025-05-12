"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { IconArrowLeft, IconMapPin } from "@tabler/icons-react";
import { ContactCard } from "@/components/ContactCard";
import { useContactContext } from "@/context/ContactContext";

import SearchAndFilter from "@/components/SearchAndFilter";
import { SpinningGears } from "@/components/SpinningGears";

export default function ContactsByZipPage() {
  const { zipcode } = useParams(); // <-- useParams for dynamic route param
  const searchParams = useSearchParams();

  const decodedZip = decodeURIComponent(zipcode as string);
  const company = searchParams.get("company") || "";
  const status = searchParams.get("status") || "all";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);

  const {
    contacts,
    fetchPage,
    loadingContacts,
    setQuery,
    setSelectedStatus,
    setSelectedZip,
  } = useContactContext();

  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    setQuery(company);
    setSelectedStatus(status);
    setSelectedZip(decodedZip);
    fetchPage(pageParam, status, company, undefined, decodedZip).then(() =>
      setHasLoadedOnce(true)
    );
  }, [decodedZip, company, status, pageParam]);

  // if (!contacts.length && hasLoadedOnce && !loadingContacts) {
  //   return (
  //     <div className="p-6">No contacts found for zip code: {decodedZip}</div>
  //   );
  // }
  if (!contacts.length && hasLoadedOnce && !loadingContacts) {
    return (
      <div className="p-6 flex flex-col items-center justify-center gap-4 w-full h-full text-center">
        <div className="flex justify-center items-center opacity-30">
          <SpinningGears />
        </div>
        <p>
          No contacts found for zip code: <strong>{decodedZip}</strong>
        </p>
        <button
          onClick={() => {
            // Clear filters, but keep the current zip
            setQuery("");
            setSelectedStatus("all");
            fetchPage(1, "all", "", undefined, decodedZip);
          }}
          className="cursor-pointer inline-flex items-center text-green-300 hover:text-green-400 font-medium transition"
        >
          <IconArrowLeft size={18} className="mr-1" />
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className="md:p-6 min-h-screen p-4 w-full max-w-[1200px] mx-auto">
      {/* search and filter */}
      <SearchAndFilter showZipFilter={false} zipScoped={true} />

      <h1 className="font-bold my-8 flex items-center text-xl md:text-xl">
        <IconMapPin className="text-zinc-400 dark:text-zinc-500 mr-2" />
        <span className="text-zinc-400 dark:text-zinc-500">Zip Code:</span>
        <span className="ml-1 text-gray-100">{decodedZip}</span>
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {contacts.map((contact) => (
          <ContactCard
            key={`${contact.id}-${contact.properties?.l2_lead_status}`}
            contact={contact}
            href={contact.id}
          />
        ))}
      </div>
    </div>
  );
}

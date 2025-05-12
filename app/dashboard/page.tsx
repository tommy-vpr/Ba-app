"use client";
// UPdated redo
import { useEffect, useState } from "react";
import { useContactContext } from "@/context/ContactContext";
import { ContactCardGrid } from "@/components/ContactCardList";
import SearchAndFilter from "@/components/SearchAndFilter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CreateContactModal } from "@/components/CreateContactModal";
import { Icon123 } from "@tabler/icons-react";
import { useSearchParams, useRouter } from "next/navigation";

export default function DashboardPageContent() {
  const {
    contacts,
    fetchPage,
    loadingContacts,
    page,
    hasNext,
    query,
    setQuery,
    selectedStatus,
    setSelectedStatus,
    setSelectedZip,
    selectedZip,
    setCursors,
    setPage,
  } = useContactContext();

  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [openContactModal, setOpenContactModal] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  console.log(contacts);

  // useEffect(() => {
  //   const pageParam = Number(searchParams.get("page") || "1");
  //   const statusParam = searchParams.get("status") || "all";
  //   const queryParam = searchParams.get("query") || "";
  //   const zipParam = searchParams.get("zip");

  //   const safePage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  //   setPage(safePage);
  //   setQuery(queryParam);
  //   setSelectedStatus(statusParam);
  //   setSelectedZip(zipParam || null);

  //   fetchPage(
  //     safePage,
  //     statusParam,
  //     queryParam,
  //     undefined,
  //     zipParam || null
  //   ).then(() => setHasLoadedOnce(true));
  // }, [searchParams]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search); // ← read directly
    const pageParam = Number(params.get("page") || "1");
    const statusParam = params.get("status") || "all";
    const queryParam = params.get("query") || "";
    const zipParam = params.get("zip");

    const safePage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

    setPage(safePage);
    setQuery(queryParam);
    setSelectedStatus(statusParam);
    setSelectedZip(zipParam || null);

    fetchPage(
      safePage,
      statusParam,
      queryParam,
      undefined,
      zipParam || null
    ).then(() => setHasLoadedOnce(true));
  }, [typeof window !== "undefined" && window.location.search]); // ✅ trigger on URL change

  useEffect(() => {
    if (!hasLoadedOnce) return;
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (selectedStatus !== "all") params.set("status", selectedStatus);
    if (selectedZip) params.set("zip", selectedZip);
    params.set("page", String(page));

    // router.replace(`?${params.toString()}`);
    const newUrl = `?${params.toString()}`;
    if (window.location.search !== newUrl) {
      router.replace(newUrl);
    }
  }, [query, selectedStatus, selectedZip, page, hasLoadedOnce]);

  // useEffect(() => {
  //   if (!hasLoadedOnce) return;

  //   setCursors({});
  //   fetchPage(1, selectedStatus, query, undefined, selectedZip);
  // }, [query, selectedStatus, selectedZip]);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 w-full max-w-[1200px] mx-auto">
      {/* <SearchAndFilter /> */}
      <SearchAndFilter showZipFilter zipScoped={false} />

      {loadingContacts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="rounded-lg border p-6 space-y-2 animate-pulse bg-white dark:bg-[#333] shadow-sm"
            >
              <div className="h-8 w-1/2 bg-muted rounded" />
              <div className="h-6 w-3/4 bg-muted/60 rounded" />
              <div className="h-6 w-2/3 bg-muted/60 rounded" />
              <div className="h-6 w-full bg-muted/60 rounded" />
            </div>
          ))}
        </div>
      ) : contacts.length === 0 && hasLoadedOnce ? (
        <div className="text-center py-10 flex flex-col justify-center items-center gap-2">
          No contacts found.
          <>
            <button
              onClick={() => setOpenContactModal(true)}
              className="cursor-pointer px-3 py-1 border border-green-400 text-green-400 
              hover:bg-green-400 hover:text-black transition duration-200 rounded-sm"
            >
              + New Contact
            </button>
            <CreateContactModal
              open={openContactModal}
              setOpen={setOpenContactModal}
            />
          </>
        </div>
      ) : (
        <>
          <ContactCardGrid />

          <div className="ml-auto flex items-center gap-4 text-sm mt-auto">
            <Button
              onClick={() => {
                const params = new URLSearchParams(window.location.search);
                params.set("page", String(page - 1));
                router.push(`?${params.toString()}`);
              }}
              disabled={page <= 1 || loadingContacts}
            >
              <ArrowLeft />
            </Button>

            <span className="text-gray-400">Page {page}</span>
            <Button
              onClick={() => {
                const params = new URLSearchParams(window.location.search);
                params.set("page", String(page + 1));
                router.push(`?${params.toString()}`);
              }}
              disabled={!hasNext || loadingContacts}
            >
              <ArrowRight />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

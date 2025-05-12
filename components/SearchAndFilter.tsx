"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconX } from "@tabler/icons-react";
import { useEffect, useRef } from "react";
import { useBrand } from "@/context/BrandContext";
import { useContactContext } from "@/context/ContactContext";
import { ZipcodeFilter } from "./ZipcodeFilter";

type Props = {
  showZipFilter?: boolean;
  zipScoped?: boolean;
};

export default function SearchAndFilter({
  showZipFilter = true,
  zipScoped = false,
}: Props) {
  const {
    query,
    setQuery,
    selectedStatus,
    setSelectedStatus,
    fetchPage,
    selectedZip,
    setSelectedZip,
  } = useContactContext();
  const { brand } = useBrand();
  const lastBrand = useRef(brand);

  const statuses = [
    "all",
    "pending visit",
    "visit requested by rep",
    "dropped off",
  ];

  const statusStyles: Record<string, string> = {
    all: `bg-transparent text-gray-700 dark:text-gray-300`,
    "pending visit": "bg-transparent text-orange-400",
    "visit requested by rep": "bg-transparent text-red-400",
    "dropped off": "bg-transparent text-green-400",
  };

  const ringColors: Record<string, string> = {
    all: "ring-gray-400",
    "pending visit": "ring-orange-400",
    "visit requested by rep": "ring-red-400",
    "dropped off": "ring-green-400",
  };

  const handleSearch = () => fetchPage(1, selectedStatus, query);

  // const handleClear = () => {
  //   setQuery("");
  //   setSelectedStatus("all");
  //   setSelectedZip(null);
  //   fetchPage(1, "all", "");
  // };
  const handleClear = () => {
    setQuery("");
    setSelectedStatus("all");

    // ✅ Only clear the zip if not scoped
    if (!zipScoped) setSelectedZip(null);

    fetchPage(1, "all", "", undefined, zipScoped ? selectedZip : null);
  };

  useEffect(() => {
    if (lastBrand.current !== brand) {
      handleClear();
      lastBrand.current = brand;
    }
  }, [brand]);

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col xl:flex-row xl:items-center gap-4 xl:gap-2 w-full md:justify-between">
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => {
            const isActive = selectedStatus === status;

            return (
              <button
                key={status}
                onClick={() => {
                  setSelectedStatus(status);
                  // fetchPage(1, status, query);
                  fetchPage(1, status, query, undefined, selectedZip);
                }}
                className={`px-3 py-1 rounded-full text-sm transition cursor-pointer ${
                  statusStyles[status]
                } ${
                  isActive
                    ? `ring-1 ${ringColors[status]} ring-offset-white dark:ring-offset-[#1a1a1a]`
                    : "opacity-80 hover:opacity-100"
                }`}
              >
                {status === "all"
                  ? "All Status"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            );
          })}

          {selectedStatus !== "all" && (
            <button
              onClick={handleClear}
              className="text-muted-foreground cursor-pointer group"
            >
              <IconX className="text-red-400 group-hover:text-white transition duration-200 group-hover:bg-red-400 rounded-sm" />
            </button>
          )}
        </div>

        <div className="relative w-full md:max-w-[400px]">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search store"
            className="w-full pr-20 bg-white"
          />

          {query && (
            <button
              onClick={handleClear}
              className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition"
              aria-label="Clear search"
            >
              <IconX size={16} />
            </button>
          )}

          {/* <button
            onClick={handleSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black dark:hover:text-white"
            aria-label="Search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M16 10a6 6 0 11-12 0 6 6 0 0112 0z"
              />
            </svg>
          </button> */}
        </div>
      </div>
      {/* {showZipFilter && <ZipcodeFilter />} */}
    </div>
  );
}

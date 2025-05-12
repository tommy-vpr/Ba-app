"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { IconArrowLeft, IconMapPin } from "@tabler/icons-react";
import { useContactContext } from "@/context/ContactContext";

import { SpinningGears } from "@/components/SpinningGears";
import Link from "next/link";

const NotFoundUI = () => {
  const { setQuery, setSelectedZip, setSelectedStatus } = useContactContext();

  const handleReset = () => {
    setQuery("");
    setSelectedZip(null);
    setSelectedStatus("all");
  };

  return (
    <div
      className="p-6 flex flex-col items-center justify-center gap-4 w-full h-full min-h-screen text-center
        dark:text-gray-100 dark:bg-[#1c1c1c] bg-gray-100"
    >
      <div className="flex justify-center items-center opacity-30">
        <SpinningGears />
      </div>
      <p className="text-2xl font-semibold leading-1 mt-6">
        Well, this is awkward.
      </p>
      <p>The page you're looking for doesn’t exist.</p>
      <Link
        href="/dashboard"
        className="cursor-pointer inline-flex items-center text-green-400 hover:text-gray-300 dark:text-green-300 dark:hover:text-green-400 font-medium transition"
      >
        <IconArrowLeft size={18} className="mr-1" />
        Let’s head back
      </Link>
    </div>
  );
};
export default NotFoundUI;

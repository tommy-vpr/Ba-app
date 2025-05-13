"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { IconArrowLeft, IconMapPin } from "@tabler/icons-react";
import { useContactContext } from "@/context/ContactContext";

import { SpinningGears } from "@/components/SpinningGears";
import { useRouter } from "next/navigation";
import Image from "next/image";

const NotFoundUI = () => {
  const { setQuery, setSelectedZip, setSelectedStatus, fetchPage } =
    useContactContext();
  const router = useRouter();

  const handleReset = () => {
    setQuery("");
    setSelectedZip(null);
    setSelectedStatus("all");
    // Explicitly refetch contacts
    fetchPage(1, "all", "", undefined, null);

    // Navigate to dashboard
    router.push("/dashboard");
  };

  return (
    <div
      className="p-6 flex flex-col items-center justify-center gap-4 w-full h-full min-h-screen text-center
        dark:text-gray-100 dark:bg-[#1c1c1c] bg-gray-100"
    >
      <div className="flex flex-col md:flex-row items-center gap-2 w-full max-w-[1000px]">
        <div className="flex-1">
          <h3 className="text-3xl md:text-[54px] font-semibold mb-1">
            Whooops!
          </h3>
          <p className="mb-4">The page you're looking for doesn't exist.</p>
          <button
            onClick={handleReset}
            className="cursor-pointer inline-flex items-center text-green-400 hover:text-green-300 dark:text-green-300 dark:hover:text-green-400 font-medium transition"
          >
            <IconArrowLeft size={18} className="mr-1" />
            Let’s head back
          </button>
        </div>
        <div className="w-2/3 md:w-1/2">
          <Image
            src="/images/404-main.webp"
            alt="Page not found"
            width={600}
            height={400}
            className="w-full h-auto"
          />
        </div>
      </div>

      {/* <div className="flex justify-center items-center opacity-30">
        <SpinningGears />
      </div>
      <p className="text-2xl font-semibold leading-1 mt-6">
        Well, this is awkward.
      </p>
      <p>The page you're looking for doesn’t exist.</p>
      <button
        onClick={handleReset}
        className="cursor-pointer inline-flex items-center text-green-400 hover:text-green-300 dark:text-green-300 dark:hover:text-green-400 font-medium transition"
      >
        <IconArrowLeft size={18} className="mr-1" />
        Let’s head back
      </button> */}
    </div>
  );
};
export default NotFoundUI;

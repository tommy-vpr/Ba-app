"use client";

import { HubSpotContact } from "@/types/hubspot";
import { useContactContext } from "@/context/ContactContext";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { IconPencil, IconTextPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function ContactCard({
  contact,
  href,
}: {
  contact: HubSpotContact;
  href: string;
}) {
  const router = useRouter();
  const {
    setSelectedContact,
    setEditOpen,
    setLogOpen,
    setContactId,
    setLogContactData,
  } = useContactContext();

  const {
    email,
    phone,
    company,
    city,
    address,
    state,
    zip,
    hs_lead_status,
    l2_lead_status,
  } = contact.properties;

  const validL2Statuses = [
    "pending visit",
    "visit requested by rep",
    "dropped off",
  ];
  const showBadge =
    hs_lead_status === "Samples" &&
    validL2Statuses.includes(l2_lead_status ?? "");

    const safeId = encodeURIComponent(contact.id ?? "");


  return (
    <Card 
    onClick={() => router.push(`/dashboard/contacts/${safeId}`)}
    className="hover:shadow-lg transition-shadow h-full flex flex-col gap-0">
      <div
        // onClick={() => router.push(`/dashboard/contacts/${href}`)}
        className="cursor-pointer flex-grow"
      >
        <CardContent className="p-4 flex flex-col gap-2">
          <div className="font-bold uppercase text-lg bg-gray-100 dark:bg-[#333] text-zinc-700 dark:text-white p-2 rounded">
            {company ?? "-"}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            {email ?? "-"}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" />
            {phone ?? "-"}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            {address ?? "-"} {city ?? "-"}, {state ?? "-"} {zip ?? "-"}
          </div>

          {showBadge && <StatusBadge status={l2_lead_status || "unknown"} />}
        </CardContent>
      </div>

      <div className="flex gap-2 px-4 pb-4">
        <button
          className="cursor-pointer flex items-center gap-1 p-2 text-green-400 hover:underline underline-offset-4"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedContact(contact);
            setEditOpen(true);
          }}
        >
          <IconPencil size={18} />
          Edit
        </button>

        <button
          className="cursor-pointer flex items-center gap-1 p-2 text-gray-500 dark:text-gray-200 hover:underline underline-offset-4"
          onClick={(e) => {
            e.stopPropagation();
            setContactId(contact.id);
            setLogContactData(contact);
            setLogOpen(true);
          }}
        >
          <IconTextPlus size={18} />
          Log Meeting
        </button>
      </div>
    </Card>
  );
}

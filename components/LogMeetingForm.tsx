"use client";

import { useState, useTransition } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogMeetingModal } from "@/context/LogMeetingModalContext";
import { useContactDetail } from "@/hooks/useContactDetail";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { logMeeting } from "@/app/actions/logMeeting";
import Spinner from "@/components/Spinner";
import { useBrand } from "@/context/BrandContext";
import { OwnerSelect } from "./OwnerSelector";
import { useContactList } from "@/context/ContactListContext";
import { useContactContext } from "@/context/ContactContext";

const formSchema = z.object({
  newFirstName: z.string().min(1, "First name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  body: z.string().min(1, "Meeting notes are required"),
  l2Status: z.enum(["pending visit", "visit requested by rep", "dropped off"]),
});

type FormValues = z.infer<typeof formSchema>;

export function LogMeetingForm({
  contactId,
  contactFirstName,
  contactJobTitle,
  contactCompany,
  contactStatus, // ✅ Add this
  onSuccess,
  useGlobalList = false,
}: {
  contactId: string;
  contactFirstName?: string;
  contactJobTitle?: string;
  contactCompany?: string;
  contactStatus?: string; // ✅ Add this
  onSuccess?: (newMeeting: any) => void;
  useGlobalList?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const { brand } = useBrand();
  const [selectedOwnerId, setSelectedOwnerId] = useState("");

  // ✅ Pull contactData and setOpen from context
  const { contactData, setOpen } = useLogMeetingModal();
  const { mutateContact, refetchContactDetail } = useContactDetail(contactId);
  // const { setContacts } = useContactList();
  const {
    setContacts: setGlobalContacts,
    fetchPage,
    selectedStatus,
    query,
    refetchContacts,
    setAllContacts
  } = useContactContext(); // from global ContactContext
  const { setContacts: setListContacts } = useContactList(); // from ContactListContext

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newFirstName: contactFirstName || "",
      jobTitle: contactJobTitle || "",
      // l2Status: ([
      //   "pending visit",
      //   "visit requested by rep",
      //   "dropped off",
      // ].includes(contactStatus ?? "")
      //   ? contactStatus
      //   : "pending visit") as
      //   | "pending visit"
      //   | "visit requested by rep"
      //   | "dropped off",
      body: `
      Topic discussed
      -
      -

      Store traffic:
      Next step:
      `,
    },
  });

  const onSubmit = (values: FormValues) => {
    const generatedTitle = `Met with ${values.newFirstName} at ${
      contactCompany ?? "Unknown Store"
    }`;

    // ✅ Optimistic update before saving
    if (contactData?.id && contactData?.properties) {
      mutateContact?.(
        {
          id: contactData.id,
          properties: {
            ...contactData.properties,
            firstname: values.newFirstName,
            jobtitle: values.jobTitle,
            l2_lead_status: values.l2Status,
          },
        },
        false
      );

      // 🔥 conditionally update the list
      const updateList = useGlobalList ? setGlobalContacts : setListContacts;

      // ✅ Optimistically update the global contact list
      updateList((prev) =>
        prev.map((c) =>
          c.id === contactData.id
            ? {
                ...c,
                properties: {
                  ...c.properties,
                  firstname: values.newFirstName,
                  jobtitle: values.jobTitle,
                  l2_lead_status: values.l2Status,
                },
              }
            : c
        )
      );

      setAllContacts((prev) =>
        prev.map((c) =>
          c.id === contactData.id
            ? {
                ...c,
                properties: {
                  ...c.properties,
                  firstname: values.newFirstName,
                  jobtitle: values.jobTitle,
                  l2_lead_status: values.l2Status,
                },
              }
            : c
        )
      );
    }

  

    // ✅ Submit to server
    startTransition(() => {
      logMeeting({
        brand,
        contactId,
        title: generatedTitle,
        body: values.body,
        newFirstName: values.newFirstName,
        jobTitle: values.jobTitle,
        l2Status: values.l2Status,
        ownerId: selectedOwnerId,
      })
        .then(async (newMeeting) => {
          toast.success("Meeting logged!");
          form.reset();

          const updatedL2Status = newMeeting.properties.l2Status;

          // ✅ Finalize update from server response
          const updateList = useGlobalList ? setGlobalContacts : setListContacts;

          updateList((prev) =>
            prev.map((c) =>
              c.id === contactId
                ? {
                    ...c,
                    properties: {
                      ...c.properties,
                      firstname: values.newFirstName,
                      jobtitle: values.jobTitle,
                      l2_lead_status: updatedL2Status,
                    },
                  }
                : c
            )
          );

          setAllContacts((prev) =>
            prev.map((c) =>
              c.id === contactId
                ? {
                    ...c,
                    properties: {
                      ...c.properties,
                      firstname: values.newFirstName,
                      jobtitle: values.jobTitle,
                      l2_lead_status: updatedL2Status,
                    },
                  }
                : c
            )
          );

          // Optionally, re-run fetchPage if needed to re-filter current view
          // fetchPage(page, selectedStatus, query, undefined, selectedZip);

          mutateContact?.(); // revalidate detail view
          refetchContactDetail?.(); // just in case
          onSuccess?.(newMeeting);
          setOpen(false);
        })

        .catch((err) => {
          console.error(err);
          toast.error("Failed to log meeting");
        });
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="newFirstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact's First Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="jobTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meeting Notes</FormLabel>
              <FormControl>
                <Textarea rows={6} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="l2Status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <div className="space-y-2">
                {["pending visit", "visit requested by rep", "dropped off"].map(
                  (status) => (
                    <label
                      key={status}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="l2Status"
                        value={status}
                        checked={field.value === status}
                        onChange={() => field.onChange(status)}
                        className="hidden peer"
                      />
                      <div className="w-4 h-4 rounded-full border-2 border-gray-200 flex items-center justify-center peer-checked:border-green-400 peer-checked:bg-green-400">
                        <div className="w-2.5 h-2.5 rounded-full opacity-0 peer-checked:opacity-100 bg-white"></div>
                      </div>
                      <span className="capitalize">{status}</span>
                    </label>
                  )
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <OwnerSelect brand={brand} onSelect={setSelectedOwnerId} /> */}
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <div className="flex items-center gap-1">
              <Spinner size="4" />
              Submitting
            </div>
          ) : (
            "Log Meeting"
          )}
        </Button>
      </form>
    </Form>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useContactEdit } from "@/context/ContactEditContext";
import { fetchContactById } from "@/app/actions/fetchContactById";
import { updateContactIfMatch } from "@/app/actions/updateContactByEmailandId";
import { toast } from "react-hot-toast";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { HubSpotContact } from "@/types/hubspot";
import { useBrand } from "@/context/BrandContext";
import { useContactDetail } from "@/hooks/useContactDetail";

interface Props {
  showDetails: boolean;
  refetchContact?: () => Promise<void | HubSpotContact | undefined>;
  mutateContact?: (data?: HubSpotContact, shouldRevalidate?: boolean) => void;
}

export function EditContactModal({ showDetails, refetchContact }: Props) {
  const {
    contact,
    open,
    setOpen,
    setContact,
    fetchPage: contextFetchPage,
    page: contextPage,
  } = useContactEdit();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { brand } = useBrand();
  const contactId = contact?.id;
  const { refetchContactDetail, mutateContact } = useContactDetail(
    contactId || ""
  );

  const [form, setForm] = useState({
    StoreName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  useEffect(() => {
    if (!open || !contact?.id) return;

    // Clear the form to avoid flashing stale data
    setForm({
      StoreName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip: "",
    });

    fetchContactById(contact.id, brand).then((updated) => {
      if (updated) {
        setContact(updated);
        setForm({
          StoreName: updated.properties.company || "",
          email: updated.properties.email || "",
          phone: updated.properties.phone || "",
          address: updated.properties.address || "",
          city: updated.properties.city || "",
          state: updated.properties.state || "",
          zip: updated.properties.zip || "",
        });
      }
    });
  }, [open, contact?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!contactId) return;
    setIsSubmitting(true);

    const updatedFields = {
      company: form.StoreName,
      email: form.email,
      phone: form.phone,
      address: form.address,
      city: form.city,
      state: form.state,
      zip: form.zip,
    };

    // Optimistic UI update for individual contact
    mutateContact?.(
      {
        ...contact!,
        properties: {
          ...contact!.properties,
          ...updatedFields,
        },
      },
      false // don't revalidate yet
    );

    const result = await updateContactIfMatch(contactId, updatedFields, brand);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Contact updated!");

      // ✅ Revalidate individual contact
      await mutateContact?.();

      // ✅ Fully re-fetch the current contact page (not optimistic updater)
      await contextFetchPage?.(contextPage ?? 1);

      // Optional: also refresh zips etc.
      // await refetchContact?.();

      setOpen(false);
    } else {
      toast.error(result.message || "Update failed.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        autoFocus={false}
        className="sm:max-w-lg w-full max-h-[85vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          {Object.entries(form).map(([key, value]) => (
            <div key={key} className="grid gap-1">
              <label
                htmlFor={key}
                className="text-sm font-medium capitalize text-muted-foreground"
              >
                {key}
              </label>
              <Input
                id={key}
                name={key}
                value={value}
                onChange={handleChange}
              />
            </div>
          ))}

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full mt-2"
          >
            {isSubmitting ? "Saving..." : "Save Contact"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

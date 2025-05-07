"use client";

import { useState } from "react";
import { updateL2LeadStatus } from "@/app/actions/updateL2LeadStatus";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { HubSpotContact } from "@/types/hubspot";
import { useBrand } from "@/context/BrandContext";

type Props = {
  open: boolean;
  setOpen: (val: boolean) => void;
  currentStatus: string;
  contactId: string;
  contact: HubSpotContact;
  refetchContact?: () => Promise<HubSpotContact | null>;
  mutateContact?: (data?: HubSpotContact, shouldRevalidate?: boolean) => void;
  setLocalContact?: (c: HubSpotContact) => void; // ✅ to update local UI
};

const statuses = [
  "pending visit",
  "visit requested by rep",
  "dropped off",
] as const;

export function UpdateStatusModal({
  open,
  setOpen,
  currentStatus,
  contactId,
  contact,
  refetchContact,
  mutateContact,
  setLocalContact,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(currentStatus);
  const { brand } = useBrand();

  const handleUpdate = async () => {
    if (!contactId || !contact) return;
    setLoading(true);

    // ⚡ Optimistic UI update
    const updatedContact: HubSpotContact = {
      ...contact,
      properties: {
        ...contact.properties,
        l2_lead_status: selected,
      },
    };

    mutateContact?.(updatedContact, false);
    setLocalContact?.(updatedContact); // ✅ sync status badge in ContactPageClient

    // 🚀 Server-side update
    const res = await updateL2LeadStatus(contactId, selected, brand);

    if (res.success) {
      toast.success("Status updated");
      const refreshed = await refetchContact?.();
      if (refreshed) {
        mutateContact?.(refreshed, false);
        setLocalContact?.(refreshed); // sync again with fresh data
      }
      setOpen(false);
    } else {
      toast.error(res.message || "Update failed");
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {statuses.map((status) => (
            <label
              key={status}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="status"
                value={status}
                checked={selected === status}
                onChange={() => setSelected(status)}
                className="hidden peer"
              />
              <div className="w-4 h-4 rounded-full border-2 border-gray-200 flex items-center justify-center peer-checked:border-green-400 peer-checked:bg-green-400">
                <div className="w-2.5 h-2.5 rounded-full opacity-0 peer-checked:opacity-100 bg-white" />
              </div>
              <span className="capitalize">{status}</span>
            </label>
          ))}
        </div>

        <Button onClick={handleUpdate} disabled={loading} className="w-full">
          {loading ? "Saving..." : "Save"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// "use client";

// import { useState } from "react";
// import { updateL2LeadStatus } from "@/app/actions/updateL2LeadStatus";
// import { toast } from "react-hot-toast";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
// import { Button } from "./ui/button";
// import { HubSpotContact } from "@/types/hubspot";
// import { useBrand } from "@/context/BrandContext";

// type Props = {
//   open: boolean;
//   setOpen: (val: boolean) => void;
//   currentStatus: string;
//   contactId: string;
//   refetchContact?: () => Promise<any>; // <-- change this from Promise<void> to Promise<any>
//   mutateContact?: (data?: HubSpotContact, shouldRevalidate?: boolean) => void;
//   contact?: HubSpotContact;
// };

// const statuses = [
//   "pending visit",
//   "visit requested by rep",
//   "dropped off",
// ] as const;

// export function UpdateStatusModal({
//   open,
//   setOpen,
//   currentStatus,
//   contactId,
//   refetchContact,
//   mutateContact,
//   contact, // 🧠 missing in your destructure!
// }: Props) {
//   const [loading, setLoading] = useState(false);
//   const [selected, setSelected] = useState(currentStatus);
//   const { brand } = useBrand();

//   const handleUpdate = async () => {
//     if (!contactId || !contact) return;
//     setLoading(true);

//     // ⚡ Optimistic UI update
//     mutateContact?.(
//       {
//         ...contact,
//         properties: {
//           ...contact.properties,
//           l2_lead_status: selected,
//         },
//       },
//       false // do not revalidate yet
//     );

//     // 🚀 Call server action with revalidation of contact detail route
//     const res = await updateL2LeadStatus(
//       contactId,
//       selected,
//       brand
//       // optional: `/dashboard/contacts/${contactId}` if you modify the action to accept a path
//     );

//     if (res.success) {
//       toast.success("Status updated");

//       // 🔄 Ensure latest data pulled after server revalidation
//       await refetchContact?.();

//       // ✅ Close modal
//       setOpen(false);
//     } else {
//       toast.error(res.message || "Update failed");
//     }

//     setLoading(false);
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Update Status</DialogTitle>
//         </DialogHeader>

//         <div className="space-y-4 py-2">
//           {statuses.map((status) => (
//             <label
//               key={status}
//               className="flex items-center gap-2 cursor-pointer"
//             >
//               <input
//                 type="radio"
//                 name="status"
//                 value={status}
//                 checked={selected === status}
//                 onChange={() => setSelected(status)}
//                 className="hidden peer" // ✅ hide native, add peer for styling
//               />
//               <div
//                 className="w-4 h-4 rounded-full border-2 border-gray-200
//       flex items-center justify-center peer-checked:border-green-400 peer-checked:bg-green-400" // ✅ outline changes when checked
//               >
//                 <div className="w-2.5 h-2.5 rounded-full opacity-0 peer-checked:opacity-100"></div>{" "}
//                 {/* ✅ center filled circle when selected */}
//               </div>
//               <span className="capitalize">{status}</span>
//             </label>
//           ))}
//         </div>

//         <Button onClick={handleUpdate} disabled={loading} className="w-full">
//           {loading ? "Saving..." : "Save"}
//         </Button>
//       </DialogContent>
//     </Dialog>
//   );
// }

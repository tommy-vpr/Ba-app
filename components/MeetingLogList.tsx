"use client";

import { forwardRef, useImperativeHandle, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash, ChevronDown, ChevronUp } from "lucide-react";
import { EditMeetingModal } from "./EditMeetingModal";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteMeetingModal } from "@/components/DeleteMeetingModal";
import moment from "moment";
import { IconCalendar, IconCalendarWeekFilled } from "@tabler/icons-react";

export const MeetingLogList = forwardRef(function MeetingLogList(
  { contactId }: { contactId: string },
  ref
) {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMeeting, setEditingMeeting] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [expectedCount, setExpectedCount] = useState<number | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  // ✅ Deletion modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(
    null
  );

  const toggleCollapse = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/meetings/${contactId}`);
      const data = await res.json();
      setMeetings(data);
      setExpectedCount(data.length);
    } catch (err) {
      console.error("❌ Failed to fetch meetings", err);
      setExpectedCount(2);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setDeleteModalOpen(true);
  };

  const handleEdit = (meeting: any) => {
    setEditingMeeting(meeting);
    setModalOpen(true);
  };

  // useImperativeHandle(ref, () => ({
  //   refetch: fetchMeetings,
  // }));
  // ✅ Add this to support optimistic update
  const addOptimisticMeeting = (newMeeting: any) => {
    const meetingWithId = {
      ...newMeeting,
      id: newMeeting.id || `temp-${Date.now()}`, // Fallback temp ID
    };

    setMeetings((prev) => [meetingWithId, ...prev]);
  };

  useImperativeHandle(ref, () => ({
    refetch: fetchMeetings,
    addOptimisticMeeting,
  }));

  useEffect(() => {
    fetchMeetings();
  }, [contactId]);

  const renderMeetingCard = (meeting: any) => {
    const isOpen = openId === meeting.id;
    const title = meeting.properties.hs_meeting_title || "Untitled Meeting";

    return (
      <div
        key={meeting.id}
        className="border border-muted bg-white dark:bg-black/30 p-4 rounded shadow-sm flex flex-col mb-4"
      >
        <div
          onClick={() => toggleCollapse(meeting.id)}
          className="flex justify-between items-start cursor-pointer hover:opacity-80 transition duration-150"
        >
          {/* <h4 className="text-md font-semibold">{title}</h4> */}
          <h4 className="text-xs text-gray-600 dark:text-white capitalize flex items-center gap-1">
            <IconCalendarWeekFilled size={16} />
            {/* {moment(meeting.properties.hs_timestamp).fromNow()}  */}
            {moment(meeting.properties.hs_timestamp).format("M/D/YYYY")}

            <span className="mx-1 text-gray-400">·</span>

            <span className="font-normal capitalize text-green-400 dark:text-green-400 text-[10px] px-2 py-0.5 rounded-full bg-green-100
             dark:bg-green-800/20 border border-green-400">
              
              {meeting.properties.hs_meeting_outcome?.toLowerCase() ||
                "unknown"}
              
            </span>
          </h4>

          <button className="text-gray-500 hover:text-black dark:hover:text-white transition cursor-pointer">
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden min-h-0 mt-2"
            >
              <p className="text-sm text-gray-700 dark:text-white whitespace-pre-wrap">
                {meeting.properties.hs_meeting_body}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(meeting.properties.hs_timestamp).toLocaleString()} ·{" "}
                <span className="capitalize">
                  {meeting.properties.hs_meeting_outcome?.toLowerCase() ||
                    "unknown"}
                </span>
              </p>
              <div className="mt-4 flex gap-2 justify-end">
                <button
                  onClick={() => handleEdit(meeting)}
                  className="text-sm text-green-400 flex items-center px-4 py-1 border border-green-400
            hover:bg-green-400 hover:text-black cursor-pointer transition rounded-xs"
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(meeting.id)}
                  className="text-sm text-red-400 flex items-center px-4 py-1 border border-red-400
            hover:bg-red-400 hover:text-black cursor-pointer transition rounded-xs"
                >
                  <Trash className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // =============== Skeleton ===============
  if (loading) {
    const skeletons = expectedCount ?? 2;

    return (
      <div className="flex flex-col md:flex-row gap-0 md:gap-4 mt-4">
        <div className="flex-1">
          {Array.from({ length: Math.ceil(skeletons / 2) }).map((_, i) => (
            <div
              key={`skeleton-left-${i}`}
              className="bg-gray-200 dark:bg-black/30 p-4 rounded shadow-sm mb-4 space-y-3"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-3/5 rounded" /> {/* Date + title */}
                <Skeleton className="h-4 w-4 rounded" /> {/* Chevron */}
              </div>
              <Skeleton className="h-3 w-1/3" /> {/* Outcome */}
              {/* <div className="flex gap-2 mt-4 justify-end">
                <Skeleton className="h-7 w-20 rounded" />
                <Skeleton className="h-7 w-20 rounded" />
              </div> */}
            </div>
          ))}
        </div>
        <div className="flex-1">
          {Array.from({ length: Math.floor(skeletons / 2) }).map((_, i) => (
            <div
              key={`skeleton-right-${i}`}
              className="bg-gray-200 dark:bg-black/30 p-4 rounded shadow-sm mb-4 space-y-3"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-3/5 rounded" />
                <Skeleton className="h-4 w-4 rounded" />
              </div>
              <Skeleton className="h-3 w-1/3" />
              {/* <div className="flex gap-2 mt-4 justify-end">
                <Skeleton className="h-7 w-20 rounded" />
                <Skeleton className="h-7 w-20 rounded" />
              </div> */}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!meetings.length) {
    return (
      <p className="text-sm text-gray-400 mt-4">
        Start by adding a meeting log.
      </p>
    );
  }

  // Split meetings into two columns
  const leftColumn = meetings.filter((_, i) => i % 2 === 0);
  const rightColumn = meetings.filter((_, i) => i % 2 === 1);

  return (
    <>
      <div className="flex flex-col md:flex-row gap-0 md:gap-4 mt-4">
        <div className="flex-1">{leftColumn.map(renderMeetingCard)}</div>
        <div className="flex-1">{rightColumn.map(renderMeetingCard)}</div>
      </div>

      <EditMeetingModal
        open={modalOpen}
        setOpen={setModalOpen}
        meeting={editingMeeting}
        onSave={fetchMeetings}
      />

      {/* Delete Modal */}
      {selectedMeetingId && (
        <DeleteMeetingModal
          open={deleteModalOpen}
          setOpen={setDeleteModalOpen}
          meetingId={selectedMeetingId}
          onDeleted={fetchMeetings}
        />
      )}
    </>
  );
});

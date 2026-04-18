import { useEffect, useMemo, useState } from "react";
import CalenderRange from "../CalenderRange";
import type { DateRange, PropertyDatail } from "../../types";

interface BlockDatesDialogProps {
  isOpen: boolean;
  property: PropertyDatail | null;
  onClose: () => void;
  onSave: (propertyId: number, request: { startDate: string; endDate: string }) => Promise<void>;
}

function BlockDatesDialog({ isOpen, property, onClose, onSave }: BlockDatesDialogProps) {
  const [selectedDates, setSelectedDates] = useState<DateRange | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const disabledRanges = useMemo(() => {
    if (!property) return [];

    return [...property.reservations, ...property.blockedDates];
  }, [property]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedDates(null);
      setIsSaving(false);
    }
  }, [isOpen]);

  const formatDate = (date: Date | string) => {
    const parsedDate = new Date(date);
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const formattedDates = selectedDates
    ? {
        start: new Date(selectedDates.startDate).toLocaleDateString("es-DO"),
        end: new Date(selectedDates.endDate).toLocaleDateString("es-DO"),
      }
    : {
        start: "--/--/----",
        end: "--/--/----",
      };

  const nights = selectedDates
    ? Math.max(
        1,
        Math.ceil(
          (new Date(selectedDates.endDate).getTime() - new Date(selectedDates.startDate).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : 0;

  const handleSave = async () => {
    if (!property || !selectedDates) {
      return;
    }

    try {
      setIsSaving(true);
      await onSave(property.id, {
        startDate: formatDate(selectedDates.startDate),
        endDate: formatDate(selectedDates.endDate),
      });
      onClose();
    } catch {
      // The parent already surfaces the error message.
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-3xl bg-base-100 border border-base-300 shadow-2xl p-5 md:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-3xl font-semibold">Block dates</h3>
            <p className="text-base-content/70 text-lg">
              {property ? `Select unavailable dates for ${property.title}` : "Select unavailable dates"}
            </p>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-base-300 p-4">
          <p className="text-xs font-bold">SELECTED RANGE</p>
          <p className="text-2xl font-semibold">
            {nights > 0 ? `${nights} ${nights === 1 ? "night" : "nights"}` : "No dates selected"}
          </p>
          <p className="text-base-content/70 text-lg">
            {selectedDates ? `${formattedDates.start} - ${formattedDates.end}` : "Choose a start and end date"}
          </p>
        </div>

        <CalenderRange value={selectedDates} onChange={setSelectedDates} months={2} disabledRanges={disabledRanges} />

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setSelectedDates(null)}
            disabled={isSaving}
          >
            Clear dates
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={!property || !selectedDates || isSaving}
          >
            {isSaving ? "Blocking..." : "Block dates"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BlockDatesDialog;

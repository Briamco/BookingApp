import CalenderRange from "../CalenderRange";
import type { DateRange } from "../../types";
import { useToast } from "../../context/ToastContext";

interface ReservationCalendarDialogProps {
  isOpen: boolean;
  onClose: () => void;
  nights: number;
  formattedDates: {
    start: string;
    end: string;
  };
  selectedDates: DateRange | null;
  onDateChange: (value: DateRange | null) => void;
  disabledRanges: Array<{
    startDate: Date | string;
    endDate: Date | string;
  }>;
  onSave?: () => void;
}

function ReservationCalendarDialog({
  isOpen,
  onClose,
  nights,
  formattedDates,
  selectedDates,
  onDateChange,
  disabledRanges,
  onSave
}: ReservationCalendarDialogProps) {
  const { addToast } = useToast();

  const handleAttemptClose = () => {
    if (!selectedDates) {
      addToast("error", "Debe seleccionar un rango de fechas");
      return;
    }

    onClose();
  };

  const handlePrimaryAction = () => {
    if (!selectedDates) {
      addToast("error", "Debe seleccionar un rango de fechas");
      return;
    }

    if (onSave) {
      onSave();
      onClose();
      return;
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4"
      onClick={handleAttemptClose}
    >
      <div
        className="w-full max-w-3xl rounded-3xl bg-base-100 border border-base-300 shadow-2xl p-5 md:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-3xl font-semibold">{nights > 0 ? `${nights} ${nights === 1 ? "night" : "nights"}` : "Select dates"}</h3>
            <p className="text-base-content/70 text-xl">
              {selectedDates
                ? `${formattedDates.start} - ${formattedDates.end}`
                : "Selected dates will appear here"}
            </p>
          </div>
        </div>

        <CalenderRange
          value={selectedDates}
          onChange={onDateChange}
          months={2}
          disabledRanges={disabledRanges}
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onDateChange(null)}
          >
            Clear dates
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handlePrimaryAction}
          >
            {onSave ? "Save" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReservationCalendarDialog;

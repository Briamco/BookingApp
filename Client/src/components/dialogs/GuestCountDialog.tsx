import { Minus, Plus } from "lucide-react";

interface GuestCountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  guests: number;
  minGuests?: number;
  maxGuests: number;
  onGuestsChange: (value: number) => void;
  onSave: () => void;
}

function GuestCountDialog({
  isOpen,
  onClose,
  guests,
  minGuests = 1,
  maxGuests,
  onGuestsChange,
  onSave,
}: GuestCountDialogProps) {
  if (!isOpen) return null;

  const decrementGuests = () => onGuestsChange(Math.max(minGuests, guests - 1));
  const incrementGuests = () => onGuestsChange(Math.min(maxGuests, guests + 1));

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-base-100 border border-base-300 shadow-2xl p-5 md:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-3xl font-semibold">Guests</h3>
            <p className="text-base-content/70 text-lg">Select how many guests will stay</p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-base-300 p-4">
          <div>
            <p className="text-xs font-bold">TOTAL GUESTS</p>
            <p className="text-2xl font-semibold">
              {guests} {guests === 1 ? "guest" : "guests"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-circle btn-sm btn-ghost"
              onClick={decrementGuests}
              aria-label="Decrease guests"
              disabled={guests <= minGuests}
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="btn btn-circle btn-sm btn-ghost"
              onClick={incrementGuests}
              aria-label="Increase guests"
              disabled={guests >= maxGuests}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <p className="mt-3 text-sm text-base-content/70">
          Maximum capacity for this property is {maxGuests} {maxGuests === 1 ? "guest" : "guests"}.
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={onSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default GuestCountDialog;

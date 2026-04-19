import { ChevronDown, Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import type { DateRange, PropertyDatail } from "../types"
import { useNavigate } from "react-router";
import ReservationCalendarDialog from "./dialogs/ReservationCalendarDialog";

interface ReservationCardProps {
  property: PropertyDatail
  selectedDates: DateRange | null
  onDateChange: (value: DateRange | null) => void
  startGuests: number | null
}

function ReservationCard({ property, selectedDates, onDateChange, startGuests }: ReservationCardProps) {
  const navigate = useNavigate();

  const [guests, setGuests] = useState(startGuests || 1);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const activeReservationRanges = useMemo(
    () => property.reservations.filter(
      (reservation) => reservation.status !== "Canceled" && reservation.status !== "Cancelled",
    ),
    [property.reservations],
  );

  const closeCalendarModal = () => setIsCalendarOpen(false);

  const formattedDates = useMemo(() => {
    if (!selectedDates) {
      return {
        start: "--/--/----",
        end: "--/--/----",
      };
    }

    return {
      start: new Date(selectedDates.startDate).toLocaleDateString("es-DO"),
      end: new Date(selectedDates.endDate).toLocaleDateString("es-DO"),
    };
  }, [selectedDates]);

  const nights = selectedDates
    ? Math.max(
      1,
      Math.ceil(
        (new Date(selectedDates.endDate).getTime() - new Date(selectedDates.startDate).getTime())
        / (1000 * 60 * 60 * 24),
      ),
    )
    : 0;

  const handleReserve = () => {
    if (!selectedDates) return;

    navigate(`/checkout?propertyId=${property.id}&startDate=${new Date(selectedDates.startDate).toISOString()}&endDate=${new Date(selectedDates.endDate).toISOString()}&guests=${guests}`);
  }

  return (
    <div className="card card-lg w-96 bg-base-100 border border-base-300 shadow-lg rounded-2xl">
      <div className="card-body p-6 gap-4">
        <h2 className="text-3xl font-semibold">
          <span className="underline">${nights > 0 ? property.nightPrice * nights : property.nightPrice} USD</span>
          <span className="text-2xl font-normal"> for {nights > 0 ? `${nights} ${nights === 1 ? "night" : "nights"}` : "night"}</span>
        </h2>

        <div className="rounded-2xl border border-base-300 overflow-hidden">
          <button
            type="button"
            className="w-full grid grid-cols-2 divide-x divide-base-300 border-b border-base-300 text-left"
            onClick={() => setIsCalendarOpen(true)}
          >
            <div className="p-3">
              <p className="text-xs font-bold">CHECK-IN</p>
              <p className="text-xl">{formattedDates.start}</p>
            </div>
            <div className="p-3">
              <p className="text-xs font-bold">CHECK-OUT</p>
              <p className="text-xl">{formattedDates.end}</p>
            </div>
          </button>

          <div className="p-3 flex items-center justify-between gap-3 border-b border-base-300">
            <div>
              <p className="text-xs font-bold">GUESTS</p>
              <p className="text-xl">{guests} {guests === 1 ? "guest" : "guests"}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-circle btn-sm btn-ghost"
                onClick={() => setGuests((prev) => Math.max(1, prev - 1))}
                aria-label="Decrement guests"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="btn btn-circle btn-sm btn-ghost"
                onClick={() => setGuests((prev) => Math.min(property.capacity, prev + 1))}
                aria-label="Increment guests"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="btn btn-circle  btn-sm btn-ghost"
                onClick={() => setIsCalendarOpen(true)}
                aria-label="Abrir calendario"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <ReservationCalendarDialog
          isOpen={isCalendarOpen}
          onClose={closeCalendarModal}
          nights={nights}
          formattedDates={formattedDates}
          selectedDates={selectedDates}
          onDateChange={onDateChange}
          disabledRanges={[...activeReservationRanges, ...property.blockedDates]}
        />

        <div>
          <button
            className="btn btn-primary btn-block btn-xl rounded-full"
            disabled={!selectedDates}
            onClick={handleReserve}
          >
            Reserve
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReservationCard
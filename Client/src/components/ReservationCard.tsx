import { ChevronDown, Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import type { DateRange, PropertyDatail } from "../types"
import { useNavigate } from "react-router";
import ReservationCalendarDialog from "./dialogs/ReservationCalendarDialog";
import { useAuth } from "../context/AuthContext";

interface ReservationCardProps {
  property: PropertyDatail
  selectedDates: DateRange | null
  onDateChange: (value: DateRange | null) => void
  startGuests: number | null
}

function ReservationCard({ property, selectedDates, onDateChange, startGuests }: ReservationCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [guests, setGuests] = useState(startGuests || 1);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const activeReservationRanges = useMemo(
    () => property.reservations.filter(
      (reservation) => reservation.status !== "Canceled" && reservation.status !== "Cancelled",
    ),
    [property.reservations],
  );
  const isHostProperty = Boolean(user && user.id.toLowerCase() === property.hostId.toLowerCase());

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
    if (!selectedDates || isHostProperty) return;

    navigate(`/checkout?propertyId=${property.id}&startDate=${new Date(selectedDates.startDate).toISOString()}&endDate=${new Date(selectedDates.endDate).toISOString()}&guests=${guests}`);
  }

  return (
    <>

      <div className="w-full max-w-sm overflow-hidden rounded-4xl border border-base-300/70 bg-base-100/90 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="bg-linear-to-br from-primary/10 via-base-100 to-accent/10 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-base-content/50">Reservation</p>
              <h2 className="mt-2 text-3xl font-semibold leading-none">
                <span className="text-primary">${nights > 0 ? property.nightPrice * nights : property.nightPrice}</span>
                <span className="text-base-content/60"> USD</span>
              </h2>
              <p className="mt-2 text-sm text-base-content/70">{nights > 0 ? `${nights} ${nights === 1 ? "night" : "nights"}` : "Per night"}</p>
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-100/80 px-3 py-2 text-right shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-base-content/50">Capacity</p>
              <p className="text-lg font-semibold text-base-content">{property.capacity} guests</p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-base-300 bg-base-100/80 p-3 shadow-sm backdrop-blur">
            <button
              type="button"
              className="grid w-full grid-cols-2 divide-x divide-base-300 text-left"
              onClick={() => setIsCalendarOpen(true)}
            >
              <div className="rounded-2xl px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-base-content/50">Check-in</p>
                <p className="mt-1 text-lg font-medium">{formattedDates.start}</p>
              </div>
              <div className="rounded-2xl px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-base-content/50">Check-out</p>
                <p className="mt-1 text-lg font-medium">{formattedDates.end}</p>
              </div>
            </button>

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-base-300 px-3 pt-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-base-content/50">Guests</p>
                <p className="text-lg font-medium">{guests} {guests === 1 ? "guest" : "guests"}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn btn-circle btn-sm btn-ghost border border-base-300"
                  onClick={() => setGuests((prev) => Math.max(1, prev - 1))}
                  aria-label="Decrement guests"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="btn btn-circle btn-sm btn-ghost border border-base-300"
                  onClick={() => setGuests((prev) => Math.min(property.capacity, prev + 1))}
                  aria-label="Increment guests"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="btn btn-circle btn-sm btn-ghost border border-base-300"
                  onClick={() => setIsCalendarOpen(true)}
                  aria-label="Abrir calendario"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-base-content/60">Secure your stay with a refined, guided booking flow. Dates and guest count update the quote instantly.</p>


          <div className="mt-5">
            <button
              className="btn btn-primary btn-block btn-xl rounded-full shadow-lg shadow-primary/20"
              disabled={!selectedDates || isHostProperty}
              onClick={handleReserve}
            >
              {isHostProperty ? "Host cannot reserve this property" : "Reserve"}
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
    </>
  )
}

export default ReservationCard
import { useNavigate, useSearchParams } from "react-router";
import { useProperty } from "../hooks/useProperty";
import type { DateRange, PropertyDatail } from "../types";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "../context/ToastContext";
import { Star } from "lucide-react";
import ReservationCalendarDialog from "../components/dialogs/ReservationCalendarDialog";
import GuestCountDialog from "../components/dialogs/GuestCountDialog";

function CheckoutPage() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get("propertyId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const guestsParam = searchParams.get("guests");

  const { getPropertyById } = useProperty();
  const { addToast } = useToast();

  const [property, setProperty] = useState<PropertyDatail | null>(null);
  const [selectedDates, setSelectedDates] = useState<DateRange | null>(null);
  const [guests, setGuests] = useState<number>(0);
  const [guestDraft, setGuestDraft] = useState<number>(0);
  const [nights, setNights] = useState<number>(0);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isGuestDialogOpen, setIsGuestDialogOpen] = useState(false);

  const closeCalendarModal = () => setIsCalendarOpen(false);
  const closeGuestModal = () => setIsGuestDialogOpen(false);


  useEffect(() => {
    setSelectedDates(startDate && endDate ? { startDate: new Date(startDate), endDate: new Date(endDate) } : null);
    const initialGuests = guestsParam ? Number(guestsParam) : 1;
    setGuests(initialGuests);
    setGuestDraft(initialGuests);

    const fetchProperty = async () => {
      if (propertyId) {
        const data = await getPropertyById(Number(propertyId));
        setProperty(data);
      }
    }

    fetchProperty();
  }, [propertyId])

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

  useEffect(() => {
    setNights(selectedDates
      ? Math.max(
        1,
        Math.ceil(
          (new Date(selectedDates.endDate).getTime() - new Date(selectedDates.startDate).getTime())
          / (1000 * 60 * 60 * 24),
        ),
      )
      : 0)
  }, [selectedDates])

  const handleConfirmReserve = () => {
    addToast("success", `Your reservation at ${property?.title} from ${selectedDates?.startDate.toLocaleDateString("es-DO")} to ${selectedDates?.endDate.toLocaleDateString("es-DO")} for ${guests} guests has been confirmed.`);

    //Logic to create reservation in the backend would go here

  }

  if (!property) {
    return <div>Loading...</div>;
  }

  const handleChangeDetails = () => {
    navigate(`/checkout?propertyId=${property.id}&startDate=${selectedDates?.startDate.toISOString()}&endDate=${selectedDates?.endDate.toISOString()}&guests=${guests}`)
  }

  const openGuestModal = () => {
    setGuestDraft(guests);
    setIsGuestDialogOpen(true);
  };

  const handleSaveGuests = () => {
    setGuests(guestDraft);
    setIsGuestDialogOpen(false);
  };

  return (
    <div className="grid h-screen place-items-center bg-base-200">
      <div className="card card-xl w-110 bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-4 border-b border-base-300 pb-5">
            <img
              src={property.images[0].url}
              alt={`${property.title}-${property.images[0].order}`}
              className="w-35 aspect-square object-cover rounded-lg"
            />
            <div>
              <h1 className="card-title">{property?.title}</h1>
              <span className="flex gap-2 text-sm font-semibold"><Star className="text-warning w-5 h-5" /> {property?.averageRating.toFixed(1)} ({property.averageRating})</span>
            </div>
          </div>
          <div className="border-b border-base-300 pb-5">
            <h2 className="font-semibold">Dates</h2>
            <div className="flex justify-between">
              <span>{selectedDates?.startDate.toDateString()} - {selectedDates?.endDate.toDateString()}</span>
              <button
                className="btn btn-xs"
                onClick={() => setIsCalendarOpen(true)}
              >
                Change
              </button>
            </div>
          </div>
          <div className="border-b border-base-300 pb-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">Guests</h2>
                <span>{guests} {guests === 1 ? "guest" : "guests"}</span>
              </div>
              <button
                className="btn btn-xs"
                onClick={openGuestModal}
              >
                Change
              </button>
            </div>
          </div>
          <div className="pb-5">
            <h2 className="font-semibold">Price details</h2>
            <div className="flex justify-between">
              <span>{nights} {nights === 1 ? "night" : "nights"} x ${property?.nightPrice} USD</span>
              <span className="font-semibold">${property.nightPrice * nights} USD</span>
            </div>
          </div>
          <div>
            <button
              className="btn btn-xl btn-primary btn-block mt-6"
              onClick={handleConfirmReserve}
            >
              Confirm Reservation
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
        onDateChange={setSelectedDates}
        onSave={handleChangeDetails}
        disabledRanges={[...property.reservations, ...property.blockedDates]}
      />

      <GuestCountDialog
        isOpen={isGuestDialogOpen}
        onClose={closeGuestModal}
        guests={guestDraft}
        maxGuests={property.capacity}
        onGuestsChange={setGuestDraft}
        onSave={handleSaveGuests}
      />
    </div>
  );
}

export default CheckoutPage;
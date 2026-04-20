import { useNavigate, useSearchParams } from "react-router";
import { useProperty } from "../hooks/useProperty";
import type { DateRange, PropertyDatail } from "../types";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Star } from "lucide-react";
import ReservationCalendarDialog from "../components/dialogs/ReservationCalendarDialog";
import GuestCountDialog from "../components/dialogs/GuestCountDialog";

function CheckoutPage() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get("propertyId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const guestsParam = searchParams.get("guests");

  const { getPropertyById, reservateProperty } = useProperty();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [property, setProperty] = useState<PropertyDatail | null>(null);
  const [selectedDates, setSelectedDates] = useState<DateRange | null>(null);
  const [guests, setGuests] = useState<number>(0);
  const [guestDraft, setGuestDraft] = useState<number>(0);
  const [nights, setNights] = useState<number>(0);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isGuestDialogOpen, setIsGuestDialogOpen] = useState(false);

  const closeCalendarModal = () => setIsCalendarOpen(false);
  const closeGuestModal = () => setIsGuestDialogOpen(false);
  const isHostProperty = Boolean(property && user && property.hostId.toLowerCase() === user.id.toLowerCase());


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

  const formatDate = (date: Date | string) => {
    const parsedDate = new Date(date);
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

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
    if (!property || !selectedDates) {
      addToast("error", "Failed to confirm reservation. Please try again.");
      return;
    }

    if (isHostProperty) {
      addToast("error", "Hosts cannot reserve their own property.");
      return;
    }

    reservateProperty(property.id, {
      startDate: formatDate(selectedDates.startDate),
      endDate: formatDate(selectedDates.endDate),
    }).then((message) => {
      addToast("success", message || "Reservation successful");
      addToast("info", `Your reservation at ${property?.title} from ${selectedDates?.startDate.toLocaleDateString("es-DO")} to ${selectedDates?.endDate.toLocaleDateString("es-DO")} for ${guests} guests has been confirmed.`);
      navigate("/");
    }).catch(() => {
      addToast("error", "Failed to confirm reservation. Please try again.");
    });
  }

  if (!property) {
    return <div>Loading...</div>;
  }

  const handleReturnToProperty = () => {
    navigate(`/property/${property.id}?startDate=${selectedDates?.startDate.toISOString()}&endDate=${selectedDates?.endDate.toISOString()}&guests=${guests}`);
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

  const totalPrice = nights > 0 ? property.nightPrice * nights : property.nightPrice;

  return (
    <div className="relative min-h-screen bg-base-200">
      <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-80 w-80 rounded-full bg-info/10 blur-3xl" />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-4 md:py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-4 md:mb-6 flex items-center justify-between gap-4">
          <button
            className="btn btn-circle btn-sm md:btn-md border border-base-300 bg-base-100/90 shadow-lg backdrop-blur"
            onClick={handleReturnToProperty}
            aria-label="Back to property"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </button>

          <div className="flex items-center gap-2 rounded-full border border-base-300 bg-base-100/80 px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em] text-base-content/60 shadow-sm backdrop-blur">
            Secure checkout
          </div>
        </div>

        <div className="grid gap-6 md:gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <section className="overflow-hidden rounded-3xl md:rounded-4xl border border-base-300/70 bg-linear-to-br from-base-100 via-base-100 to-base-200 shadow-xl md:shadow-2xl">
            <div className="p-5 md:p-8 lg:p-10">
              <div className="flex flex-wrap items-center gap-2 text-[10px] md:text-xs font-semibold uppercase tracking-[0.22em] text-base-content/50">
                <span className="badge badge-outline border-primary/30 text-primary">Checkout</span>
                <span className="badge badge-outline">Review</span>
                <span className="badge badge-outline hidden sm:inline-flex">Confirm</span>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] xl:items-end">
                <div className="space-y-4">
                  <h1 className="max-w-2xl text-2xl font-semibold tracking-tight sm:text-4xl">{property.title}</h1>
                  <p className="max-w-xl text-sm md:text-base text-base-content/70 sm:text-lg">
                    {property.city}, {property.state}, {property.country}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-base-content/70">
                    <span className="inline-flex items-center gap-1.5 md:gap-2 rounded-full border border-base-300 bg-base-100/80 px-3 py-1.5 md:px-4 md:py-2 shadow-sm backdrop-blur">
                      <Star className="h-3.5 w-3.5 md:h-4 md:w-4 text-warning" />
                      {property.averageRating.toFixed(1)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 md:gap-2 rounded-full border border-base-300 bg-base-100/80 px-3 py-1.5 md:px-4 md:py-2 shadow-sm backdrop-blur">
                      {nights} {nights === 1 ? "night" : "nights"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 md:gap-2 rounded-full border border-base-300 bg-base-100/80 px-3 py-1.5 md:px-4 md:py-2 shadow-sm backdrop-blur">
                      {guests} {guests === 1 ? "guest" : "guests"}
                    </span>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl md:rounded-3xl border-base-300 bg-base-300 shadow-lg space-y-1 md:space-y-2 border-4 md:border-10">
                  <img
                    src={property.images[0].url}
                    alt={`${property.title}-${property.images[0].order}`}
                    className="h-40 w-full object-cover sm:h-64"
                  />
                  <div className="grid grid-cols-3 gap-1 md:gap-2">
                    {property.images.slice(1, 4).map((image) => (
                      <img
                        key={image.id}
                        src={image.url}
                        alt={`${property.title}-${image.order}`}
                        className="h-16 w-full object-cover sm:h-28"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-3">
                <div className="rounded-2xl border border-base-300 bg-base-100/85 p-4 shadow-sm backdrop-blur">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-base-content/50">Property</p>
                  <p className="mt-1 text-base font-semibold">{property.city}</p>
                  <p className="text-xs text-base-content/60">{property.country}</p>
                </div>
                <div className="rounded-2xl border border-base-300 bg-base-100/85 p-4 shadow-sm backdrop-blur">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-base-content/50">Dates</p>
                  <p className="mt-1 text-base font-semibold">{formattedDates.start}</p>
                  <p className="text-xs text-base-content/60">to {formattedDates.end}</p>
                </div>
                <div className="rounded-2xl border border-base-300 bg-base-100/85 p-4 shadow-sm backdrop-blur">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-base-content/50">Guests</p>
                  <p className="mt-1 text-base font-semibold">{guests}</p>
                  <p className="text-xs text-base-content/60">travellers</p>
                </div>
              </div>

              <div className="mt-8 rounded-3xl md:rounded-4xl border border-base-300/70 bg-base-100/90 p-5 md:p-8 shadow-xl backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg md:text-xl font-semibold">Trip details</h2>
                    <p className="text-xs md:text-sm text-base-content/60">Edit the booking details before confirming.</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-base-300 bg-base-200/50 p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-base-content/50">Dates</p>
                      <button
                        className="btn btn-xs md:btn-sm rounded-full border border-base-300 bg-base-100 shadow-sm"
                        onClick={() => setIsCalendarOpen(true)}
                      >
                        Change
                      </button>
                    </div>
                    <p className="mt-2 text-sm md:text-lg font-medium">
                      {selectedDates?.startDate.toLocaleDateString()} - {selectedDates?.endDate.toLocaleDateString()}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-base-300 bg-base-200/50 p-4 sm:p-5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-base-content/50">Guests</p>
                        <button
                          className="btn btn-xs md:btn-sm rounded-full border border-base-300 bg-base-100 shadow-sm"
                          onClick={openGuestModal}
                        >
                          Change
                        </button>
                      </div>
                      <p className="mt-2 text-sm md:text-lg font-medium">{guests} {guests === 1 ? "guest" : "guests"}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-base-300 bg-base-200/50 p-4 sm:p-5">
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-base-content/50">Price details</h3>
                  <div className="mt-3 space-y-3 text-sm md:text-base">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-base-content/70">{nights} {nights === 1 ? "night" : "nights"} x ${property.nightPrice}</span>
                      <span className="font-semibold">${property.nightPrice * nights} USD</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-t border-base-300 pt-3 font-bold">
                      <span>Total</span>
                      <span className="text-primary">${totalPrice} USD</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="h-fit self-start lg:sticky lg:top-24">
            <div className="rounded-3xl md:rounded-4xl border border-base-300/70 bg-base-100/90 p-6 shadow-xl md:shadow-2xl backdrop-blur-xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-base-content/50">Booking summary</p>
              <div className="mt-4 flex items-end justify-between gap-4 border-b border-base-300 pb-4">
                <div>
                  <p className="text-xs text-base-content/60">Total</p>
                  <h2 className="mt-1 text-2xl md:text-3xl font-semibold text-primary">${totalPrice} USD</h2>
                  <p className="text-xs text-base-content/60">for {nights} {nights === 1 ? "night" : "nights"}</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-base-300 bg-linear-to-br from-primary/10 via-base-100 to-accent/10 p-4">
                <p className="text-xs font-semibold text-base-content/80">Confirm details</p>
                <ul className="mt-2 space-y-1 text-xs text-base-content/65">
                  <li>Dates: {formattedDates.start} to {formattedDates.end}</li>
                  <li>Guests: {guests}</li>
                </ul>
              </div>

              <button
                className="btn btn-primary btn-block btn-lg mt-6 rounded-full shadow-lg shadow-primary/20"
                disabled={isHostProperty || !selectedDates}
                onClick={handleConfirmReserve}
              >
                {isHostProperty ? "Host Error" : "Confirm Booking"}
              </button>
            </div>
          </aside>
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
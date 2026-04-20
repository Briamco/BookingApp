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

      <div className="relative mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            className="btn btn-circle border border-base-300 bg-base-100/90 shadow-lg backdrop-blur"
            onClick={handleReturnToProperty}
            aria-label="Back to property"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="hidden items-center gap-2 rounded-full border border-base-300 bg-base-100/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-base-content/60 shadow-sm backdrop-blur sm:flex">
            Secure checkout
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <section className="overflow-hidden rounded-4xl border border-base-300/70 bg-linear-to-br from-base-100 via-base-100 to-base-200 shadow-2xl">
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-base-content/50">
                <span className="badge badge-outline border-primary/30 text-primary">Checkout</span>
                <span className="badge badge-outline">Review details</span>
                <span className="badge badge-outline">Confirm booking</span>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] xl:items-end">
                <div className="space-y-4">
                  <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">{property.title}</h1>
                  <p className="max-w-xl text-base text-base-content/70 sm:text-lg">
                    {property.city}, {property.state}, {property.country}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-base-content/70">
                    <span className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100/80 px-4 py-2 shadow-sm backdrop-blur">
                      <Star className="h-4 w-4 text-warning" />
                      {property.averageRating.toFixed(1)} rating
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100/80 px-4 py-2 shadow-sm backdrop-blur">
                      {nights} {nights === 1 ? "night" : "nights"}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100/80 px-4 py-2 shadow-sm backdrop-blur">
                      {guests} {guests === 1 ? "guest" : "guests"}
                    </span>
                  </div>
                </div>

                <div className="overflow-hidden rounded-3xl border-base-300 bg-base-300 shadow-lg space-y-2 border-10">
                  <img
                    src={property.images[0].url}
                    alt={`${property.title}-${property.images[0].order}`}
                    className="h-56 w-full object-cover sm:h-64"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    {property.images.slice(1, 4).map((image) => (
                      <img
                        key={image.id}
                        src={image.url}
                        alt={`${property.title}-${image.order}`}
                        className="h-24 w-full object-cover sm:h-28"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-base-300 bg-base-100/85 p-4 shadow-sm backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-wider text-base-content/50">Property</p>
                  <p className="mt-2 text-lg font-semibold">{property.city}</p>
                  <p className="text-sm text-base-content/60">{property.country}</p>
                </div>
                <div className="rounded-3xl border border-base-300 bg-base-100/85 p-4 shadow-sm backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-wider text-base-content/50">Dates</p>
                  <p className="mt-2 text-lg font-semibold">{formattedDates.start}</p>
                  <p className="text-sm text-base-content/60">to {formattedDates.end}</p>
                </div>
                <div className="rounded-3xl border border-base-300 bg-base-100/85 p-4 shadow-sm backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-wider text-base-content/50">Guests</p>
                  <p className="mt-2 text-lg font-semibold">{guests}</p>
                  <p className="text-sm text-base-content/60">travellers</p>
                </div>
              </div>

              <div className="mt-8 rounded-4xl border border-base-300/70 bg-base-100/90 p-6 shadow-xl backdrop-blur-xl sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">Trip details</h2>
                    <p className="text-sm text-base-content/60">Edit the booking details before confirming.</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-3xl border border-base-300 bg-base-200/50 p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">Dates</p>
                      <button
                        className="btn btn-sm rounded-full border border-base-300 bg-base-100 shadow-sm"
                        onClick={() => setIsCalendarOpen(true)}
                      >
                        Change dates
                      </button>
                    </div>
                    <p className="mt-2 text-lg font-medium">
                      {selectedDates?.startDate.toDateString()} - {selectedDates?.endDate.toDateString()}
                    </p>
                    <p className="mt-1 text-sm text-base-content/60">
                      {formattedDates.start} - {formattedDates.end}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-base-300 bg-base-200/50 p-4 sm:p-5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">Guests</p>
                        <button
                          className="btn btn-sm rounded-full border border-base-300 bg-base-100 shadow-sm"
                          onClick={openGuestModal}
                        >
                          Change guests
                        </button>
                      </div>
                      <p className="mt-2 text-lg font-medium">{guests} {guests === 1 ? "guest" : "guests"}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-3xl border border-base-300 bg-base-200/50 p-4 sm:p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-base-content/50">Price details</h3>
                  <div className="mt-3 space-y-3 text-sm sm:text-base">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-base-content/70">{nights} {nights === 1 ? "night" : "nights"} x ${property.nightPrice} USD</span>
                      <span className="font-semibold">${property.nightPrice * nights} USD</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-t border-base-300 pt-3">
                      <span className="text-base-content/70">Service total</span>
                      <span className="font-semibold text-primary">Included</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="h-fit self-start lg:sticky lg:top-6">
            <div className="rounded-4xl border border-base-300/70 bg-base-100/90 p-6 shadow-2xl backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-base-content/50">Booking summary</p>
              <div className="mt-4 flex items-end justify-between gap-4 border-b border-base-300 pb-4">
                <div>
                  <p className="text-sm text-base-content/60">Total</p>
                  <h2 className="mt-1 text-3xl font-semibold text-primary">${totalPrice} USD</h2>
                  <p className="text-sm text-base-content/60">for {nights} {nights === 1 ? "night" : "nights"}</p>
                </div>
                <div className="rounded-3xl border border-base-300 bg-base-200/60 p-4 text-right shadow-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-base-content/50">Avg</p>
                  <p className="text-lg font-semibold">${property.nightPrice}</p>
                  <p className="text-sm text-base-content/60">per night</p>
                </div>
              </div>

              <div className="mt-4 rounded-3xl border border-base-300 bg-linear-to-br from-primary/10 via-base-100 to-accent/10 p-4">
                <p className="text-sm font-semibold text-base-content/80">Review before confirming</p>
                <ul className="mt-3 space-y-2 text-sm text-base-content/65">
                  <li>Dates: {formattedDates.start} to {formattedDates.end}</li>
                  <li>Guests: {guests}</li>
                  <li>Property: {property.title}</li>
                </ul>
              </div>

              <button
                className="btn btn-primary btn-block btn-xl mt-6 rounded-full shadow-lg shadow-primary/20"
                disabled={isHostProperty || !selectedDates}
                onClick={handleConfirmReserve}
              >
                {isHostProperty ? "Host cannot reserve this property" : "Confirm Reservation"}
              </button>

              <p className="mt-4 text-center text-xs leading-6 text-base-content/55">
                You can still edit dates and guests before confirming.
              </p>

              <div className="mt-6 space-y-3">
                <button className="btn btn-outline btn-block rounded-full" onClick={() => setIsCalendarOpen(true)}>
                  Edit dates
                </button>
                <button className="btn btn-outline btn-block rounded-full" onClick={openGuestModal}>
                  Edit guests
                </button>
              </div>
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
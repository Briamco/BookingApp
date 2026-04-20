import { useParams, useSearchParams } from "react-router";
import { useProperty } from "../hooks/useProperty";
import { useEffect, useState } from "react";
import type { DateRange, PropertyDatail, PublicUser } from "../types";
import { AirVent, BookMarked, Car, CookingPot, Home, PhoneCall, Star, Tv2, Wifi } from "lucide-react";
import CalenderRange from "../components/CalenderRange";
import PropertyMap from "../components/PropertyMap";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import ReservationCard from "../components/ReservationCard";
import { authService } from "../services/AuthService";

function PropertyPage() {
  const [searchParams] = useSearchParams();
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const guestsParam = searchParams.get("guests");

  const { id } = useParams();
  const { getPropertyById } = useProperty();

  const [property, setProperty] = useState<PropertyDatail | null>(null);
  const [selectedDates, setSelectedDates] = useState<DateRange | null>(null);
  const [hasInitializedSelection, setHasInitializedSelection] = useState(false);
  const [hostInfo, setHostInfo] = useState<PublicUser | null>(null);

  const activeReservationRanges = property?.reservations.filter(
    (reservation) => reservation.status !== "Canceled" && reservation.status !== "Cancelled",
  ) ?? [];

  const bookingBlockedRanges = [...activeReservationRanges, ...((property?.blockedDates) ?? [])];

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const isRangeAvailable = (startDate: Date, endDate: Date) => {
    const startKey = formatDate(startDate);
    const endKey = formatDate(endDate);

    return !bookingBlockedRanges.some(({ startDate: blockedStart, endDate: blockedEnd }) => {
      const blockedStartKey = formatDate(new Date(blockedStart));
      const blockedEndKey = formatDate(new Date(blockedEnd));

      return startKey <= blockedEndKey && endKey >= blockedStartKey;
    });
  };

  const getNearestAvailableRange = () => {
    const candidateStart = new Date();
    candidateStart.setHours(0, 0, 0, 0);
    candidateStart.setDate(candidateStart.getDate() + 2);

    for (let offset = 0; offset < 365; offset += 1) {
      const startDate = new Date(candidateStart);
      startDate.setDate(candidateStart.getDate() + offset);

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 2);

      if (isRangeAvailable(startDate, endDate)) {
        return { startDate, endDate };
      }
    }

    return null;
  };

  useEffect(() => {
    setSelectedDates(null);
    setHasInitializedSelection(false);
  }, [id])

  useEffect(() => {
    if (startDate && endDate) {
      setSelectedDates({ startDate: new Date(startDate), endDate: new Date(endDate) });
      setHasInitializedSelection(true);
      return;
    }

    if (property && !hasInitializedSelection) {
      setSelectedDates(getNearestAvailableRange());
      setHasInitializedSelection(true);
    }
  }, [startDate, endDate, guestsParam, property, hasInitializedSelection])

  useEffect(() => {
    const fetchProperty = async () => {
      if (id) {
        const data = await getPropertyById(parseInt(id));
        setProperty(data);
      }
    };

    fetchProperty();
  }, [id])

  useEffect(() => {
    const fetchHostInfo = async () => {
      if (!property?.hostId) {
        setHostInfo(null);
        return;
      }

      try {
        const response = await authService.getPublicById(property.hostId);
        setHostInfo(response);
      } catch {
        setHostInfo(null);
      }
    };

    fetchHostInfo();
  }, [property?.hostId])

  if (!property) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative mx-auto max-w-6xl space-y-8 pb-10">
      <div className="pointer-events-none absolute -left-20 top-16 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-44 h-72 w-72 rounded-full bg-info/10 blur-3xl" />

      <section className="relative overflow-hidden rounded-4xl border border-base-300/70 bg-linear-to-br from-base-100 via-base-100 to-base-200 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,82,118,0.10),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(52,152,219,0.10),transparent_38%)]" />
        <div className="relative space-y-6 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-base-content/55">
            <span className="badge badge-outline border-primary/30 text-primary">Featured stay</span>
            <span className="badge badge-outline">{property.capacity} guests</span>
            <span className="badge badge-outline">{property.images.length} photos</span>
          </div>

          <div className="grid gap-6 lg:items-end">
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">{property.title}</h1>
              <p className="text-base text-base-content/70 sm:text-lg">
                {property.city}, {property.state}, {property.country}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-base-content/70">
                <span className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100/80 px-4 py-2 shadow-sm backdrop-blur">
                  <Star className="h-4 w-4 text-warning" />
                  {property.averageRating.toFixed(1)} average rating
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100/80 px-4 py-2 shadow-sm backdrop-blur">
                  <BookMarked className="h-4 w-4 text-primary" />
                  {property.reviews.length} reviews
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100/80 px-4 py-2 shadow-sm backdrop-blur">
                  <PhoneCall className="h-4 w-4 text-accent" />
                  Hosted by {hostInfo ? `${hostInfo.firstName} ${hostInfo.lastName}` : "Unavailable"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-4xl border-10 border-base-300/70 bg-base-300/70 shadow-2xl">
        <div className="grid gap-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <img
            src={property.images[0].url}
            alt={`${property.title} - ${property.images[0].order}`}
            className="object-cover w-full h-102 lg:h-130"
          />
          <div className="grid grid-cols-2 gap-2">
            {property.images.slice(1, 5).map((image) => (
              <img
                key={image.id}
                src={image.url}
                alt={`${property.title} - ${image.order}`}
                className="object-cover w-full h-50 lg:h-64"
              />
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <main className="space-y-8">

          <section className="grid gap-8">
            <div className="rounded-4xl border border-base-300/70 bg-base-100/90 p-6 shadow-xl backdrop-blur-xl sm:p-8">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight">About this place</h2>
                    <p className="mt-1 text-sm text-base-content/60">
                      A refined stay designed for comfort, privacy, and easy planning.
                    </p>
                  </div>
                  <p className="text-base leading-8 text-base-content/80">{property.description}</p>
                </div>

                <div className="rounded-[1.75rem] border border-base-300 bg-base-200/70 p-5 shadow-sm">
                  <h3 className="text-lg font-semibold">Host details</h3>
                  <p className="mt-3 text-sm text-base-content/70">
                    Hosted by <span className="font-semibold text-base-content">{hostInfo ? `${hostInfo.firstName} ${hostInfo.lastName}` : "Unavailable"}</span>
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-base-content/70">
                    <PhoneCall className="h-4 w-4" /> {hostInfo?.phone || "Unavailable"}
                  </p>
                  <div className="mt-4 rounded-2xl bg-base-100 p-4 text-sm text-base-content/70">
                    Quick access to the host keeps communication simple before and during your stay.
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-4xl border border-base-300/70 bg-base-100/90 p-6 shadow-xl backdrop-blur-xl sm:p-8">
              <h3 className="text-xl font-semibold">What this place offers</h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <p className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-200/50 px-4 py-3"><Wifi className="h-5 w-5 text-primary" /> Wi-Fi</p>
                <p className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-200/50 px-4 py-3"><AirVent className="h-5 w-5 text-primary" /> Air Conditioning</p>
                <p className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-200/50 px-4 py-3"><Tv2 className="h-5 w-5 text-primary" /> TV</p>
                <p className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-200/50 px-4 py-3"><CookingPot className="h-5 w-5 text-primary" /> Kitchen</p>
                <p className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-200/50 px-4 py-3"><Car className="h-5 w-5 text-primary" /> Free Parking</p>
              </div>
            </div>

            <div className="rounded-4xl border border-base-300/70 bg-base-100/90 p-6 shadow-xl backdrop-blur-xl sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold">
                    {selectedDates
                      ? `${Math.ceil((new Date(selectedDates.endDate).getTime() - new Date(selectedDates.startDate).getTime()) / (1000 * 60 * 60 * 24))} nights in ${property.city}`
                      : "Select your dates"}
                  </h3>
                  <p className="mt-1 text-base-content/70">
                    {selectedDates
                      ? `${new Date(selectedDates.startDate).toDateString()} - ${new Date(selectedDates.endDate).toDateString()}`
                      : "Pick a stay window to see pricing and availability."}
                  </p>
                </div>
                <button
                  className="btn btn-ghost btn-sm rounded-full"
                  onClick={() => setSelectedDates(null)}
                >
                  Clear dates
                </button>
              </div>

              <div className="mt-6 rounded-3xl border border-base-300 bg-base-200/50 p-4 sm:p-5">
                <CalenderRange
                  value={selectedDates}
                  onChange={setSelectedDates}
                  disabledRanges={[...activeReservationRanges, ...property.blockedDates]}
                />
              </div>
            </div>
          </section>
        </main>

        <aside className="h-fit self-start lg:sticky lg:top-6">
          <ReservationCard
            property={property}
            selectedDates={selectedDates}
            onDateChange={setSelectedDates}
            startGuests={Number(guestsParam)}
          />
        </aside>
      </div>

      <section className="rounded-4xl border border-base-300/70 bg-base-100/90 p-6 shadow-xl backdrop-blur-xl sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold">Reviews</h3>
            <p className="text-base-content/70">{property.reviews.length} reviews from guests</p>
          </div>
        </div>
        {property.reviews.length === 0 ? (
          <p className="mt-6 text-base-content/70">This property does not have reviews yet.</p>
        ) : (
          <div className="mt-6 grid gap-4">
            {property.reviews.slice(0, 7).map((review) => (
              <article key={review.id} className="rounded-3xl border border-base-300 bg-base-200/40 p-5 shadow-sm transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 font-semibold">
                    <Star className="h-5 w-5 text-warning" />
                    <span>{review.rate}/5</span>
                  </div>
                  <span className="text-sm text-base-content/60">
                    {new Date(review.createdAt).toLocaleDateString("es-DO")}
                  </span>
                </div>
                <p className="mt-3 leading-7 text-base-content/80">{review.commentary}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-4xl border border-base-300/70 bg-base-100/90 p-6 shadow-xl backdrop-blur-xl sm:p-8">
        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-semibold">Where you'll be</h3>
            <p className="text-base-content/70">{property.city}, {property.state}, {property.country}</p>
          </div>
          <div className="h-125 overflow-hidden rounded-3xl border border-base-300 shadow-inner">
            <PropertyMap
              center={{ lat: property.latitude, lng: property.longitude }}
              zoom={13}
            >
              <AdvancedMarker
                position={{ lat: property.latitude, lng: property.longitude }}
              >
                <div className="rounded-full bg-primary p-4 shadow-lg">
                  <Home className="text-primary-content" />
                </div>
              </AdvancedMarker>
            </PropertyMap>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PropertyPage;
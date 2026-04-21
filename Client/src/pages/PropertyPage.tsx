import { useParams, useSearchParams } from "react-router";
import { useProperty } from "../hooks/useProperty";
import { useEffect, useMemo, useState } from "react";
import type { DateRange, PropertyDatail, PublicUser } from "../types";
import { AirVent, BookMarked, Car, CookingPot, Home, PhoneCall, Star, Tv2, UserIcon, Wifi } from "lucide-react";
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

  const orderedImages = useMemo(() => {
    if (!property?.images) {
      return [];
    }

    return [...property.images].sort((a, b) => a.order - b.order);
  }, [property?.images]);

  const mainImage = orderedImages[0];
  const galleryImages = orderedImages.slice(1, 5);

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
    <div className="relative mx-auto max-w-6xl space-y-6 pb-2 md:space-y-8 md:pb-10">
      <div className="pointer-events-none absolute -left-20 top-16 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-44 h-72 w-72 rounded-full bg-info/10 blur-3xl" />

      {/* Header Section */}
      <section className="relative overflow-hidden rounded-3xl md:rounded-4xl border border-base-300/70 bg-linear-to-br from-base-100 via-base-100 to-base-200 shadow-xl md:shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,82,118,0.10),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(52,152,219,0.10),transparent_38%)]" />
        <div className="relative space-y-4 md:space-y-6 p-5 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-2 text-[10px] md:text-xs font-semibold uppercase tracking-[0.22em] text-base-content/55">
            <span className="badge badge-outline border-primary/30 text-primary">Featured stay</span>
            <span className="badge badge-outline">{property.capacity} guests</span>
            <span className="badge badge-outline hidden sm:inline-flex">{property.images.length} photos</span>
          </div>

          <div className="grid gap-4 md:gap-6 lg:items-end">
            <div className="space-y-2 md:space-y-3">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">{property.title}</h1>
              <p className="text-sm md:text-base text-base-content/70 sm:text-lg">
                {property.city}, {property.state}, {property.country}
              </p>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-base-content/70">
                <span className="inline-flex items-center gap-1.5 md:gap-2 rounded-full border border-base-300 bg-base-100/80 px-3 py-1.5 md:px-4 md:py-2 shadow-sm backdrop-blur">
                  <Star className="h-3.5 w-3.5 md:h-4 md:w-4 text-warning" />
                  {property.averageRating.toFixed(1)}
                </span>
                <span className="inline-flex items-center gap-1.5 md:gap-2 rounded-full border border-base-300 bg-base-100/80 px-3 py-1.5 md:px-4 md:py-2 shadow-sm backdrop-blur">
                  <BookMarked className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                  {property.reviews.length} reviews
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Gallery Section - Grid on desktop, horizontal scroll on mobile */}
      <section className="overflow-hidden md:rounded-4xl md:border-10 border-base-300/70 bg-base-300/70 shadow-2xl">
        <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:gap-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {/* Main Image */}
          <div className="min-w-full snap-center md:min-w-0">
            {mainImage ? (
              <img
                src={mainImage.url}
                alt={`${property.title} - ${mainImage.order}`}
                className="object-cover w-full h-72 sm:h-96 md:h-102 lg:h-130"
              />
            ) : (
              <div className="flex h-72 w-full items-center justify-center bg-base-200 text-sm text-base-content/60 sm:h-96 md:h-102 lg:h-130">
                No images available
              </div>
            )}
          </div>
          {/* Secondary Images - Hidden on very small screens or shown in scroll */}
          <div className="hidden md:grid grid-cols-2 gap-2">
            {galleryImages.map((image) => (
              <img
                key={image.id}
                src={image.url}
                alt={`${property.title} - ${image.order}`}
                className="object-cover w-full h-50 lg:h-64"
              />
            ))}
          </div>
          {/* Mobile extra images in scroll */}
          {galleryImages.map((image) => (
            <div key={image.id} className="min-w-full snap-center md:hidden">
              <img
                src={image.url}
                alt={`${property.title} - ${image.order}`}
                className="object-cover w-full h-72 sm:h-96"
              />
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <main className="space-y-6 md:space-y-8">

          <section className="grid gap-6 md:gap-8">
            <div className="rounded-3xl md:rounded-4xl border border-base-300/70 bg-base-100/90 p-5 md:p-6 lg:p-8 shadow-xl backdrop-blur-xl">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold tracking-tight">About this place</h2>
                    <p className="mt-1 text-xs md:text-sm text-base-content/60">
                      A refined stay designed for comfort, privacy, and easy planning.
                    </p>
                  </div>
                  <p className="text-sm md:text-base md:leading-8 text-base-content/80">{property.description}</p>
                </div>

                <div className="rounded-[1.75rem] border border-base-300 bg-base-200/70 p-5 shadow-sm">
                  <h3 className="text-lg font-semibold">Host details</h3>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-base-300 text-neutral-content w-10 rounded-full flex items-center justify-center">
                        <UserIcon className="text-base-content" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-base-content">{hostInfo ? `${hostInfo.firstName} ${hostInfo.lastName}` : "Unavailable"}</p>
                      <p className="flex items-center gap-1.5 text-xs text-base-content/60">
                        <PhoneCall className="h-3 w-3" /> {hostInfo?.phone || "Unavailable"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl md:rounded-4xl border border-base-300/70 bg-base-100/90 p-5 md:p-6 lg:p-8 shadow-xl backdrop-blur-xl">
              <h3 className="text-xl font-semibold">What this place offers</h3>
              <div className="mt-5 grid gap-3 grid-cols-1 sm:grid-cols-2">
                <p className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-200/50 px-4 py-3 text-sm md:text-base"><Wifi className="h-5 w-5 text-primary" /> Wi-Fi</p>
                <p className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-200/50 px-4 py-3 text-sm md:text-base"><AirVent className="h-5 w-5 text-primary" /> Air Conditioning</p>
                <p className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-200/50 px-4 py-3 text-sm md:text-base"><Tv2 className="h-5 w-5 text-primary" /> TV</p>
                <p className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-200/50 px-4 py-3 text-sm md:text-base"><CookingPot className="h-5 w-5 text-primary" /> Kitchen</p>
                <p className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-200/50 px-4 py-3 text-sm md:text-base"><Car className="h-5 w-5 text-primary" /> Free Parking</p>
              </div>
            </div>

            {/* Calendar Section */}
            <div className="rounded-3xl md:rounded-4xl border border-base-300/70 bg-base-100/90 p-5 md:p-6 lg:p-8 shadow-xl backdrop-blur-xl">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold">
                    {selectedDates
                      ? `${Math.ceil((new Date(selectedDates.endDate).getTime() - new Date(selectedDates.startDate).getTime()) / (1000 * 60 * 60 * 24))} nights in ${property.city}`
                      : "Select your dates"}
                  </h3>
                  <p className="mt-1 text-xs md:text-base text-base-content/70">
                    {selectedDates
                      ? `${new Date(selectedDates.startDate).toDateString()} - ${new Date(selectedDates.endDate).toDateString()}`
                      : "Pick a stay window to see pricing and availability."}
                  </p>
                </div>
                <button
                  className="btn btn-ghost btn-sm rounded-full text-xs"
                  onClick={() => setSelectedDates(null)}
                >
                  Clear dates
                </button>
              </div>

              <div className="mt-6 overflow-x-auto rounded-3xl border border-base-300 bg-base-200/50 p-2 sm:p-5">
                <div className="min-w-75">
                  <CalenderRange
                    value={selectedDates}
                    onChange={setSelectedDates}
                    disabledRanges={[...activeReservationRanges, ...property.blockedDates]}
                  />
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Reservation Sidebar - Sticky footer on mobile, sidebar on desktop */}
        <aside className="fixed bottom-0 left-0 right-0 z-50 bg-base-100 border-t border-base-300 p-4 md:static md:z-auto md:bg-transparent md:border-0 md:p-0 md:h-fit md:self-start lg:sticky lg:top-24">
          <div className="md:hidden flex items-center justify-between mb-2">
            <div>
              <p className="text-4xl font-bold text-primary">${property.nightPrice} <span className="text-lg font-normal text-base-content/70">night</span></p>
              <p className="text-md font-medium text-base-content/70 underline">
                {selectedDates ? `${new Date(selectedDates.startDate).toDateString()} - ${new Date(selectedDates.endDate).toDateString()}` : "Select dates"}
              </p>
            </div>
            <label htmlFor="reservation-modal" className="btn btn-primary btn-xl px-6">Reserve</label>
          </div>

          <div className="hidden md:block">
            <ReservationCard
              property={property}
              selectedDates={selectedDates}
              onDateChange={setSelectedDates}
              startGuests={Number(guestsParam)}
            />
          </div>
        </aside>

        {/* Mobile Reservation Modal Trigger */}
        <input type="checkbox" id="reservation-modal" className="modal-toggle" />
        <div className="modal modal-bottom sm:modal-middle md:hidden">
          <div className="modal-box p-0 overflow-hidden rounded-t-3xl sm:rounded-3xl">
            <div className="p-4 border-b border-base-300 flex justify-between items-center bg-base-100 sticky top-0 z-10">
              <h3 className="font-bold text-lg">Reserve</h3>
              <label htmlFor="reservation-modal" className="btn btn-sm btn-circle btn-ghost">✕</label>
            </div>
            <div className="p-4">
              <ReservationCard
                property={property}
                selectedDates={selectedDates}
                onDateChange={setSelectedDates}
                startGuests={Number(guestsParam)}
              />
            </div>
          </div>
          <label className="modal-backdrop" htmlFor="reservation-modal">Close</label>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="rounded-3xl md:rounded-4xl border border-base-300/70 bg-base-100/90 p-5 md:p-6 lg:p-8 shadow-xl backdrop-blur-xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-semibold">Reviews</h3>
            <p className="text-sm md:text-base text-base-content/70">{property.reviews.length} reviews from guests</p>
          </div>
        </div>
        {property.reviews.length === 0 ? (
          <p className="mt-6 text-sm text-base-content/70">This property does not have reviews yet.</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {property.reviews.slice(0, 7).map((review) => (
              <article key={review.id} className="rounded-3xl border border-base-300 bg-base-200/40 p-4 md:p-5 shadow-sm transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 font-semibold text-sm md:text-base">
                    <Star className="h-4 w-4 md:h-5 md:w-5 text-warning" />
                    <span>{review.rate}/5</span>
                  </div>
                  <span className="text-xs text-base-content/60">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-3 text-sm md:text-base md:leading-7 text-base-content/80 line-clamp-4">{review.commentary}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Map Location Section */}
      <section className="rounded-3xl md:rounded-4xl border border-base-300/70 bg-base-100/90 p-5 md:p-6 lg:p-8 shadow-xl backdrop-blur-xl">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl md:text-2xl font-semibold">Where you'll be</h3>
            <p className="text-sm md:text-base text-base-content/70">{property.city}, {property.state}, {property.country}</p>
          </div>
          <div className="h-120 sm:h-96 md:h-125 overflow-hidden rounded-3xl border border-base-300 shadow-inner">
            <PropertyMap
              center={{ lat: property.latitude, lng: property.longitude }}
              zoom={13}
            >
              <AdvancedMarker
                position={{ lat: property.latitude, lng: property.longitude }}
              >
                <div className="rounded-full bg-primary p-3 md:p-4 shadow-lg">
                  <Home className="text-primary-content h-5 w-5 md:h-6 md:w-6" />
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
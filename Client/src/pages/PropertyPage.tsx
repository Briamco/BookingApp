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
    <div className="space-y-6 lg:max-w-6xl mx-auto">
      <h1 className="text-3xl font-semibold">{property.title}</h1>
      <section className="overflow-hidden rounded-2xl grid grid-cols-2 gap-2">
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
      </section>
      <section className="space-y-6 border-b border-primary/20 pb-14 flex gap-24 items-start">
        <div className="w-full space-y-6">
          <header>
            <h2 className="text-2xl font-semibold">{property.city}, {property.state}, {property.country}</h2>
            <p>{property.capacity} guests</p>
          </header>
          <div className="stats bg-base-100 shadow w-full mb-5">
            <div className="stat">
              <div className="stat-figure text-warning">
                <Star className="w-8 h-8" />
              </div>
              <div className="stat-title">Average Rating</div>
              <div className="stat-value">{property.averageRating.toFixed(1)}</div>
            </div>
            <div className="stat">
              <div className="stat-figure text-primary">
                <BookMarked className="w-8 h-8" />
              </div>
              <div className="stat-title">Reviews</div>
              <div className="stat-value">{property.reviews.length}</div>
            </div>
          </div>
          <div className="mb-10">
            <p className="text-base-content/90 text-xl font-semibold flex items-center gap-2">
              Hosted by {hostInfo ? `${hostInfo.firstName} ${hostInfo.lastName}` : "Unavailable"}
            </p>
            <p className="text-base-content/70 flex items-center gap-2">
              <PhoneCall className="w-5 h-5" /> {hostInfo?.phone || "Unavailable"}
            </p>
          </div>
          <div className="border-y border-primary/20 py-10">
            <p className="text-lg">{property.description}</p>
          </div>
          <div className="border-b border-primary/20 pb-14">
            <h3 className="text-xl font-semibold mb-4">What this place offers</h3>
            <div className="space-y-4 grid grid-cols-2">
              <p className="flex gap-2"><Wifi /> Wi-Fi</p>
              <p className="flex gap-2"><AirVent /> Air Conditioning</p>
              <p className="flex gap-2"><Tv2 /> Tv</p>
              <p className="flex gap-2"><CookingPot /> Kitchen</p>
              <p className="flex gap-2"><Car /> Free Parking</p>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-semibold">
              {selectedDates
                ? `${Math.ceil((new Date(selectedDates.endDate).getTime() - new Date(selectedDates.startDate).getTime()) / (1000 * 60 * 60 * 24))} nights in ${property.city}`
                : "Select a date"}
            </h3>
            <p>
              {selectedDates
                ? `${new Date(selectedDates.startDate).toDateString()} - ${new Date(selectedDates.endDate).toDateString()}`
                : "No dates selected"}
            </p>
            <div className="w-fit">
              <CalenderRange
                value={selectedDates}
                onChange={setSelectedDates}
                disabledRanges={[...activeReservationRanges, ...property.blockedDates]}
              />
              <div className="flex justify-end">
                <button
                  className="font-bold btn btn-xs btn-ghost"
                  onClick={() => setSelectedDates(null)}
                >
                  Delete Dates
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="sticky top-6 self-start">
          <ReservationCard
            property={property}
            selectedDates={selectedDates}
            onDateChange={setSelectedDates}
            startGuests={Number(guestsParam)}
          />
        </div>
      </section>
      <section className="space-y-4 border-b border-primary/20 pb-14">
        <div>
          <h3 className="text-2xl font-semibold">Reviews</h3>
          <p className="text-base-content/70">{property.reviews.length} reviews from guests</p>
        </div>
        {property.reviews.length === 0 ? (
          <p className="text-base-content/70">This property does not have reviews yet.</p>
        ) : (
          <div className="grid gap-4">
            {property.reviews.slice(0, 7).map((review) => (
              <article key={review.id} className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 font-semibold">
                    <Star className="h-5 w-5 text-warning" />
                    <span>{review.rate}/5</span>
                  </div>
                  <span className="text-sm text-base-content/60">
                    {new Date(review.createdAt).toLocaleDateString("es-DO")}
                  </span>
                </div>
                <p className="mt-3 text-base-content/80">{review.commentary}</p>
              </article>
            ))}
          </div>
        )}
      </section>
      <section>
        <div className="border-b border-primary/20 pb-14 space-y-4">
          <div>
            <h3 className="text-2xl font-semibold">Where you'll be</h3>
            <p>{property.city}, {property.state}, {property.country}</p>
          </div>
          <div className="h-125">
            <PropertyMap
              center={{ lat: property.latitude, lng: property.longitude }}
              zoom={13}
            >
              <AdvancedMarker
                position={{ lat: property.latitude, lng: property.longitude }}
              >
                <div className="rounded-full bg-primary p-4">
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
import { useParams, useSearchParams } from "react-router";
import { useProperty } from "../hooks/useProperty";
import { useEffect, useState } from "react";
import type { DateRange, PropertyDatail } from "../types";
import { AirVent, BookMarked, Car, CookingPot, Home, Star, Tv2, Wifi } from "lucide-react";
import CalenderRange from "../components/CalenderRange";
import PropertyMap from "../components/PropertyMap";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import ReservationCard from "../components/ReservationCard";

function PropertyPage() {
  const [searchParams] = useSearchParams();
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const guestsParam = searchParams.get("guests");

  const { id } = useParams();
  const { getPropertyById } = useProperty();

  const [property, setProperty] = useState<PropertyDatail | null>(null);
  const [selectedDates, setSelectedDates] = useState<DateRange | null>(null);

  useEffect(() => {
    setSelectedDates(startDate && endDate ? { startDate: new Date(startDate), endDate: new Date(endDate) } : null);
  }, [startDate, endDate, guestsParam])

  useEffect(() => {
    const fetchProperty = async () => {
      if (id) {
        const data = await getPropertyById(parseInt(id));
        setProperty(data);
      }
    };

    fetchProperty();
  }, [id])

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
          {property.images.slice(1).map((image) => (
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
          <div className="stats bg-base-100 shadow w-full mb-10">
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
              <div className="stat-value">{property.averageRating}</div>
            </div>
          </div>
          <div className="border-y border-primary/20 py-14">
            <p className="text-lg">{property.description}</p>
          </div>
          <div className="border-b border-primary/20 pb-14">
            <h3 className="text-xl font-semibold mb-4">Amenities</h3>
            <div className="space-y-4">
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
                disabledRanges={[...property.reservations, ...property.blockedDates]}
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
      <section>
        <div className="border-b border-primary/20 pb-14 space-y-4">
          <div>
            <h3 className="text-2xl font-semibold">Where do you go</h3>
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
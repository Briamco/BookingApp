import { useParams } from "react-router";
import { useProperty } from "../hooks/useProperty";
import { useEffect, useState } from "react";
import type { DateRange, PropertyDatail } from "../types";
import { AirVent, BookMarked, Car, CookingPot, Star, Tv2, Wifi } from "lucide-react";
import CalenderRange from "../components/CalenderRange";

function PropertyPage() {
  const { id } = useParams();
  const { getPropertyById } = useProperty();

  const [property, setProperty] = useState<PropertyDatail | null>(null);
  const [selectedDates, setSelectedDates] = useState<DateRange | null>(null);

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
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">{property.title}</h1>
      <section className="overflow-hidden rounded-2xl grid grid-cols-2 gap-2">
        <img
          src={property.images[0].url}
          alt={`${property.title} - ${property.images[0].order}`}
          className="object-cover w-full h-102"
        />
        <div className="grid grid-cols-2 gap-2">
          {property.images.slice(1).map((image) => (
            <img
              key={image.id}
              src={image.url}
              alt={`${property.title} - ${image.order}`}
              className="object-cover w-full h-50"
            />
          ))}
        </div>
      </section>
      <section className="space-y-6">
        <header>
          <h2 className="text-2xl font-semibold">{property.city}, {property.state}, {property.country}</h2>
          <p>{property.capacity} guests</p>
        </header>
        <div className="stats shadow w-full mb-10">
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
        <div className="border-b border-primary/20 pb-14">
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
            <CalenderRange value={selectedDates} onChange={setSelectedDates} />
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
      </section>
    </div>
  );
}

export default PropertyPage;
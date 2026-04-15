import { useEffect, useState } from "react";
import type { Property } from "../types";
import { ChevronLeft, ChevronRight, StarIcon } from "lucide-react";

interface PropertyCardProps {
  property: Property
  onClick?: (id: number) => void
  canBlockDates?: boolean
}

function PropertyCard({ property, onClick, canBlockDates }: PropertyCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [property.id]);

  const hasImages = property.images.length > 0;

  const goToPrevious = () => {
    if (!hasImages) return;
    setCurrentIndex((previousIndex) =>
      previousIndex === 0 ? property.images.length - 1 : previousIndex - 1,
    );
  };

  const goToNext = () => {
    if (!hasImages) return;
    setCurrentIndex((previousIndex) =>
      previousIndex === property.images.length - 1 ? 0 : previousIndex + 1,
    );
  };

  return (
    <div
      className="card bg-base-100 w-96 shadow-sm hover:scale-105 transition-transform"
      onClick={() => onClick && onClick(property.id)}
    >
      <div className="carousel w-full">
        {!hasImages ? (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">No Image Available</span>
          </div>
        ) : (
          <div className="carousel-item relative w-full">
            <figure className="w-full flex items-center justify-center overflow-hidden rounded-t-4xl">
              <img
                src={property.images[currentIndex].url}
                alt={`${property.title}-${currentIndex}`}
                className="w-full max-h-72 object-cover object-bottom"
              />
            </figure>
            <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
              <button type="button" onClick={goToPrevious} className="btn btn-circle">
                <ChevronLeft />
              </button>
              <button type="button" onClick={goToNext} className="btn btn-circle">
                <ChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="card-body flex-row items-start justify-between">
        <div className="space-y-2">
          <div>
            <h2 className="card-title">{property.title}</h2>
            <p>{property.description.length > 94 ? `${property.description.substring(0, 94)}...` : property.description}</p>
          </div>
          <div className="flex justify-between items-center">
            <p><span className="font-bold underline text-lg">${property.nightPrice} USD</span> for night.</p>
            {canBlockDates && <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={(event) => event.stopPropagation()}
            >
              Block dates
            </button>}
          </div>
        </div>
        <div>
          <p className="flex gap-2"><StarIcon className="w-5 h-5" /> {property.averageRating}</p>
        </div>
      </div>
    </div>
  );
}

export default PropertyCard;
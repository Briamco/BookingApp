import { useEffect, useState } from "react";
import type { Property } from "../types";
import { ChevronLeft, ChevronRight, StarIcon } from "lucide-react";

interface PropertyCardProps {
  property: Property
  onClick?: (id: number) => void
  canBlockDates?: boolean
  onBlockDates?: (id: number) => void
}

function PropertyCard({ property, onClick, canBlockDates, onBlockDates }: PropertyCardProps) {
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
      className="card h-full w-full bg-base-100 shadow-sm transition-transform hover:-translate-y-1"
      onClick={() => {
        if (onClick) onClick(property.id)
      }}
    >
      <div className="carousel w-full group">
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
                className="w-full max-h-72 object-cover"
              />
            </figure>
            <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  goToPrevious()
                }}
                className="btn btn-circle opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  goToNext()
                }}
                className="btn btn-circle opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="card-body gap-4">
        <div className="space-y-2">
          <h2 className="card-title text-lg">{property.title}</h2>
          <p className="text-sm text-base-content/70">
            {property.description.length > 110 ? `${property.description.substring(0, 110)}...` : property.description}
          </p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-base-content/60">Price per night</p>
            <p className="font-bold underline text-lg text-primary">${property.nightPrice} USD</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <p className="flex items-center gap-2 text-sm font-medium"><StarIcon className="h-5 w-5 text-warning" /> {property.averageRating.toFixed(1)}</p>
            {canBlockDates && (
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={(event) => {
                  event.stopPropagation()
                  onBlockDates?.(property.id)
                }}
                aria-label="Block dates"
              >
                Block dates
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyCard;
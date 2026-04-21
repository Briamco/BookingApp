import { useEffect, useMemo, useState } from "react";
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

  const orderedImages = useMemo(
    () => [...property.images].sort((a, b) => a.order - b.order),
    [property.images],
  );

  useEffect(() => {
    setCurrentIndex(0);
  }, [property.id]);

  useEffect(() => {
    if (currentIndex >= orderedImages.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, orderedImages.length]);

  const hasImages = orderedImages.length > 0;

  const goToPrevious = () => {
    if (!hasImages) return;
    setCurrentIndex((previousIndex) =>
      previousIndex === 0 ? orderedImages.length - 1 : previousIndex - 1,
    );
  };

  const goToNext = () => {
    if (!hasImages) return;
    setCurrentIndex((previousIndex) =>
      previousIndex === orderedImages.length - 1 ? 0 : previousIndex + 1,
    );
  };

  return (
    <div
      className={`card h-full w-full overflow-hidden border border-base-300 bg-base-100 shadow-sm transition-all duration-300 hover:shadow-xl ${onClick ? "cursor-pointer md:hover:-translate-y-1" : ""}`}
      onClick={() => {
        if (onClick) onClick(property.id)
      }}
    >
      <div className="carousel group relative w-full">
        {!hasImages ? (
          <div className="grid h-48 sm:h-56 w-full place-items-center bg-base-200">
            <span className="text-sm text-base-content/60">No image available</span>
          </div>
        ) : (
          <div className="carousel-item relative w-full">
            <figure className="flex h-48 sm:h-56 w-full items-center justify-center overflow-hidden">
              <img
                src={orderedImages[currentIndex].url}
                alt={`${property.title}-${currentIndex}`}
                className="h-full w-full object-cover transition-transform duration-500 md:group-hover:scale-105"
              />
            </figure>

            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-neutral/55 via-transparent to-transparent" />

            <div className="absolute right-3 top-3 rounded-full border border-base-100/40 bg-base-100/90 px-2.5 py-1 text-xs font-semibold text-base-content shadow-md backdrop-blur">
              <span className="inline-flex items-center gap-1.5">
                <StarIcon className="h-3.5 w-3.5 text-warning" />
                {property.averageRating.toFixed(1)}
              </span>
            </div>

            <div className="absolute left-4 right-4 top-1/2 flex -translate-y-1/2 justify-between">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  goToPrevious()
                }}
                className="btn btn-circle btn-sm border-0 bg-base-100/90 text-base-content opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                aria-label="Previous image"
              >
                <ChevronLeft />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  goToNext()
                }}
                className="btn btn-circle btn-sm border-0 bg-base-100/90 text-base-content opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                aria-label="Next image"
              >
                <ChevronRight />
              </button>
            </div>

            {orderedImages.length > 1 ? (
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-base-100/80 px-2 py-1 backdrop-blur">
                {orderedImages.map((image, index) => (
                  <span
                    key={image.id}
                    className={`h-1.5 rounded-full transition-all ${index === currentIndex ? "w-4 bg-primary" : "w-1.5 bg-base-content/40"}`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="card-body gap-3 md:gap-4 p-4 md:p-5">
        <div className="space-y-1">
          <h2 className="line-clamp-1 md:line-clamp-2 text-base md:text-lg font-semibold leading-snug">{property.title}</h2>
          <p className="line-clamp-2 text-xs md:text-sm leading-relaxed text-base-content/70">
            {property.description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-base-300 pt-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-base-content/60">Per night</p>
            <p className="text-base md:text-lg font-bold text-primary">${property.nightPrice} USD</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <p className="hidden md:block text-xs font-medium text-base-content/60">Tap card for details</p>
            {canBlockDates && (
              <button
                type="button"
                className="btn btn-xs md:btn-sm btn-outline"
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
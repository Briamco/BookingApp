import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useProperty } from "../hooks/useProperty";
import type { PropertyDatail, PublicUser, Review } from "../types";
import { authService } from "../services/AuthService";

function HostReservationsPage() {
  const { user } = useAuth();
  const { properties, getPropertyById } = useProperty();
  const [hostProperties, setHostProperties] = useState<PropertyDatail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [guestDirectory, setGuestDirectory] = useState<Record<string, PublicUser>>({});

  const userProperties = useMemo(() => {
    if (!user) return [];

    const currentUserId = user.id.toLowerCase();
    return properties.filter((property) => property.hostId.toLowerCase() === currentUserId);
  }, [properties, user]);

  useEffect(() => {
    let isActive = true;

    const fetchHostProperties = async () => {
      if (!user || userProperties.length === 0) {
        if (isActive) {
          setHostProperties([]);
          setIsLoading(false);
        }

        return;
      }

      setIsLoading(true);

      try {
        const detailedProperties = await Promise.all(
          userProperties.map((property) => getPropertyById(property.id)),
        );

        if (isActive) {
          setHostProperties(detailedProperties.filter(Boolean) as PropertyDatail[]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchHostProperties();

    return () => {
      isActive = false;
    };
  }, [getPropertyById, user, userProperties]);

  useEffect(() => {
    let isActive = true;

    const fetchGuestDirectory = async () => {
      const guestIds = [...new Set(hostProperties.flatMap((property) => property.reservations.map((reservation) => reservation.guestId)))];

      if (guestIds.length === 0) {
        if (isActive) {
          setGuestDirectory({});
        }
        return;
      }

      const responses = await Promise.all(
        guestIds.map(async (guestId) => {
          try {
            const guest = await authService.getPublicById(guestId);
            return [guestId, guest] as const;
          } catch {
            return [guestId, null] as const;
          }
        }),
      );

      if (!isActive) return;

      const nextDirectory: Record<string, PublicUser> = {};
      responses.forEach(([guestId, guest]) => {
        if (guest) {
          nextDirectory[guestId] = guest;
        }
      });

      setGuestDirectory(nextDirectory);
    };

    fetchGuestDirectory();

    return () => {
      isActive = false;
    };
  }, [hostProperties]);

  const totalReservations = hostProperties.reduce((total, property) => total + property.reservations.length, 0);

  return (
    <main className="premium-page-shell mx-auto max-w-6xl space-y-6 pb-8">

      <header className="rounded-3xl border border-base-300/80 bg-linear-to-br from-base-100 via-base-100 to-base-200/90 p-6 shadow-sm lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">Host Reservations</h1>
            <p className="max-w-2xl text-base-content/70">
              Review every reservation across your properties, including status and guest feedback.
            </p>
            <p className="text-sm uppercase tracking-wide text-base-content/50">
              {hostProperties.length} properties | {totalReservations} reservations
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-base-300 bg-base-100 px-4 py-3 text-right shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-base-content/60">Properties</p>
              <p className="text-2xl font-bold text-primary">{hostProperties.length}</p>
            </div>
            <div className="rounded-2xl border border-base-300 bg-base-100 px-4 py-3 text-right shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-base-content/60">Reservations</p>
              <p className="text-2xl font-bold">{totalReservations}</p>
            </div>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="grid min-h-[40vh] place-items-center rounded-3xl border border-base-300 bg-base-100/90 shadow-sm">
          <p className="text-base-content/70">Loading host reservations...</p>
        </div>
      ) : hostProperties.length === 0 ? (
        <div className="grid min-h-[40vh] place-items-center rounded-3xl border border-base-300 bg-base-100/90 shadow-sm">
          <p className="text-base-content/70">You do not have properties with reservations yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {hostProperties.map((property) => {
            const reviewByReservation = new Map<number, Review>(property.reviews.map((review) => [review.reservationId, review]));

            return (
              <section key={property.id} className="overflow-hidden rounded-3xl border border-base-300/80 bg-base-100/95 shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="flex flex-col gap-3 border-b border-base-300/80 bg-base-100/80 p-5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">{property.title}</h2>
                    <p className="text-base-content/70">
                      {property.city}, {property.state}, {property.country}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="rounded-full border border-base-300 bg-base-200/80 px-3 py-2">{property.reservations.length} reservations</span>
                    <span className="rounded-full border border-warning/30 bg-warning/10 px-3 py-2 text-warning">{property.reviews.length} reviews</span>
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-2 text-primary">{property.averageRating.toFixed(1)} rating</span>
                  </div>
                </div>

                {property.reservations.length === 0 ? (
                  <div className="p-5 text-base-content/70">No reservations yet for this property.</div>
                ) : (
                  <div className="divide-y divide-base-300/80">
                    {property.reservations.map((reservation) => {
                      const reservationReview = reservation.review ?? reviewByReservation.get(reservation.id) ?? null;
                      const guest = guestDirectory[reservation.guestId];

                      return (
                        <div key={reservation.id} className="grid gap-4 p-5 transition-colors hover:bg-base-200/30 lg:grid-cols-[1.2fr_0.8fr_1fr] lg:items-start">
                          <div className="space-y-2">
                            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-base-content/50">
                              <CalendarDays className="h-4 w-4" />
                              Reservation #{reservation.id}
                            </p>
                            <p className="text-base font-medium">
                              {new Date(reservation.startDate).toDateString()} - {new Date(reservation.endDate).toDateString()}
                            </p>
                            <p className="text-sm text-base-content/60">
                              Guest: {guest ? `${guest.firstName} ${guest.lastName}` : reservation.guestId}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm font-semibold uppercase tracking-wide text-base-content/50">Status</p>
                            <span className={`mt-2 inline-flex rounded-full border px-3 py-2 text-sm font-medium ${reservation.status === "Completed" ? "border-success/30 bg-success/10 text-success" : reservation.status === "Canceled" ? "border-error/30 bg-error/10 text-error" : "border-info/30 bg-info/10 text-info"}`}>
                              {reservation.status}
                            </span>
                          </div>

                          <div>
                            <p className="text-sm font-semibold uppercase tracking-wide text-base-content/50">Review</p>
                            {reservationReview ? (
                              <div className="mt-2 rounded-2xl border border-base-300/80 bg-base-200/80 p-4">
                                <div className="flex items-center gap-2 font-semibold text-warning">
                                  <Star className="h-4 w-4 fill-warning" />
                                  <span>{reservationReview.rate}/5</span>
                                </div>
                                <p className="mt-2 text-sm text-base-content/80">{reservationReview.commentary}</p>
                              </div>
                            ) : (
                              <p className="mt-2 text-sm text-base-content/60">No review yet.</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default HostReservationsPage;
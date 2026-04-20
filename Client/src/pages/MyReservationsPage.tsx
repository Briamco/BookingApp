import { useEffect, useMemo, useState } from "react";
import { Ban, CalendarDays, Star } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { ReservationService } from "../services/ReservationService";
import { ReviewService } from "../services/ReviewService";
import type { Reservation } from "../types";
import WriteReviewDialog from "../components/dialogs/WriteReviewDialog";

function MyReservationsPage() {
  const { addToast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [cancellingReservationId, setCancellingReservationId] = useState<number | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const data = await ReservationService.getMyReservations();
        setReservations(data);
      } catch {
        addToast("error", "Failed to load your reservations");
      }
    };

    fetchReservations();
  }, [addToast]);

  const reservationsWithoutReview = useMemo(
    () => reservations.filter((reservation) => reservation.status === "Completed" && !reservation.review),
    [reservations],
  );

  const openReviewDialog = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsReviewDialogOpen(true);
  };

  const handleSaveReview = async (payload: { rate: number; commentary: string }) => {
    if (!selectedReservation) return;

    try {
      const response = await ReviewService.createReservationReview(selectedReservation.id, payload);
      setReservations((previous) =>
        previous.map((reservation) =>
          reservation.id === selectedReservation.id
            ? { ...reservation, review: response.review }
            : reservation,
        ),
      );
      addToast("success", response.message || "Review created successfully");
    } catch {
      addToast("error", "Failed to create review");
      throw new Error("Failed to create review");
    }
  };

  const handleCancelReservation = async (reservation: Reservation) => {
    const confirmed = window.confirm(`Cancel reservation for ${reservation.propertyTitle}?`);

    if (!confirmed) return;

    setCancellingReservationId(reservation.id);

    try {
      const response = await ReservationService.cancelReservation(reservation.id);

      setReservations((previous) =>
        previous.map((item) =>
          item.id === reservation.id
            ? { ...item, status: "Canceled" }
            : item,
        ),
      );

      addToast("success", response.message || "Reservation canceled successfully");
    } catch {
      addToast("error", "Failed to cancel reservation");
    } finally {
      setCancellingReservationId(null);
    }
  };

  return (
    <main className="premium-page-shell mx-auto max-w-6xl space-y-6 pb-8">

      <header className="rounded-3xl border border-base-300/70 bg-linear-to-br from-base-100 via-base-100 to-base-200/80 p-6 shadow-sm lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">My Reservations</h1>
            <p className="max-w-2xl text-base-content/70">
              Complete reservations can be reviewed only once. {reservationsWithoutReview.length} completed {reservationsWithoutReview.length === 1 ? "reservation still needs" : "reservations still need"} a review.
            </p>
          </div>
          <div className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-base-content/60">Pending reviews</p>
            <p className="text-3xl font-bold text-warning">{reservationsWithoutReview.length}</p>
          </div>
        </div>
      </header>

      {reservations.length === 0 ? (
        <div className="grid h-[60vh] place-items-center rounded-3xl border border-base-300/80 bg-base-100/90 p-10 text-center shadow-sm backdrop-blur">
          <div className="space-y-3">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-base-200 text-base-content/60">
              <CalendarDays className="h-5 w-5" />
            </div>
            <p className="text-lg font-medium">You do not have reservations yet.</p>
            <p className="text-sm text-base-content/60">When you book your next stay, it will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {reservations.map((reservation) => {
            const hasReview = Boolean(reservation.review);
            const canCancel = reservation.status === "Confirmed";

            return (
              <article key={reservation.id} className={`group rounded-3xl border border-l-6 border-base-300/80 bg-base-100/95 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${reservation.status === "Completed" ? "border-l-success" : reservation.status === "Canceled" ? "border-l-error" : "border-l-info"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-semibold">{reservation.propertyTitle}</h2>
                    <p className="inline-flex items-center gap-2 rounded-full bg-base-200/80 px-3 py-1 text-sm text-base-content/70">
                      <CalendarDays className="h-4 w-4" />
                      {new Date(reservation.startDate).toDateString()} - {new Date(reservation.endDate).toDateString()}
                    </p>
                    <p className="mt-2 text-sm uppercase tracking-wide text-base-content/60">{reservation.status}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {reservation.review ? (
                      <div className="flex items-center gap-2 rounded-full bg-warning/10 px-3 py-2 text-warning">
                        <Star className="h-4 w-4 fill-warning" />
                        <span className="font-semibold">{reservation.review.rate}/5 reviewed</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm shadow-sm"
                        onClick={() => openReviewDialog(reservation)}
                        disabled={reservation.status !== "Completed"}
                      >
                        Write review
                      </button>
                    )}

                    {canCancel && (
                      <button
                        type="button"
                        className="btn btn-outline btn-error btn-sm"
                        onClick={() => handleCancelReservation(reservation)}
                        disabled={cancellingReservationId === reservation.id}
                      >
                        <Ban className="h-4 w-4" />
                        {cancellingReservationId === reservation.id ? "Canceling..." : "Cancel reservation"}
                      </button>
                    )}
                  </div>
                </div>

                {hasReview && reservation.review && (
                  <div className="mt-4 rounded-2xl border border-base-300/70 bg-base-200/80 p-4">
                    <p className="text-sm font-semibold uppercase tracking-wide text-base-content/60">Your review</p>
                    <p className="mt-2 text-base-content/80">{reservation.review.commentary}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <WriteReviewDialog
        isOpen={isReviewDialogOpen}
        reservationTitle={selectedReservation?.propertyTitle ?? ""}
        onClose={() => {
          setIsReviewDialogOpen(false);
          setSelectedReservation(null);
        }}
        onSave={handleSaveReview}
      />
    </main>
  );
}

export default MyReservationsPage;
import { useEffect, useMemo, useState } from "react";
import { Ban, Star } from "lucide-react";
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
    <main className="max-w-6xl mx-auto space-y-6">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold">My Reservations</h1>
        <p className="text-base-content/70">
          Complete reservations can be reviewed only once. {reservationsWithoutReview.length} completed {reservationsWithoutReview.length === 1 ? "reservation still needs" : "reservations still need"} a review.
        </p>
      </header>

      {reservations.length === 0 ? (
        <div className="grid h-[60vh] place-items-center rounded-3xl border border-base-300 bg-base-100">
          <p className="text-base-content/70">You do not have reservations yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reservations.map((reservation) => {
            const hasReview = Boolean(reservation.review);
            const canCancel = reservation.status === "Confirmed";

            return (
              <article key={reservation.id} className={`rounded-3xl border border-l-6 border-base-300 bg-base-100 p-5 shadow-sm ${reservation.status === "Completed" ? "border-l-success" : reservation.status === "Canceled" ? "border-l-error" : "border-l-info"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold">{reservation.propertyTitle}</h2>
                    <p className="text-base-content/70">
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
                        className="btn btn-primary btn-sm"
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
                  <div className="mt-4 rounded-2xl bg-base-200 p-4">
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
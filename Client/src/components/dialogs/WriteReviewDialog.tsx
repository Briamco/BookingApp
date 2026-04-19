import { useEffect, useState } from "react";

interface WriteReviewDialogProps {
  isOpen: boolean;
  reservationTitle: string;
  onClose: () => void;
  onSave: (payload: { rate: number; commentary: string }) => Promise<void>;
}

function WriteReviewDialog({ isOpen, reservationTitle, onClose, onSave }: WriteReviewDialogProps) {
  const [rate, setRate] = useState(5);
  const [commentary, setCommentary] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setRate(5);
      setCommentary("");
      setIsSaving(false);
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!commentary.trim()) {
      return;
    }

    try {
      setIsSaving(true);
      await onSave({ rate, commentary: commentary.trim() });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-3xl bg-base-100 border border-base-300 shadow-2xl p-5 md:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-3xl font-semibold">Write review</h3>
            <p className="text-base-content/70 text-lg">{reservationTitle}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <select
              className="select select-bordered w-full"
              value={rate}
              onChange={(event) => setRate(Number(event.target.value))}
              disabled={isSaving}
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} star{value === 1 ? "" : "s"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Commentary</label>
            <textarea
              className="textarea textarea-bordered w-full min-h-36"
              placeholder="Share your experience"
              value={commentary}
              onChange={(event) => setCommentary(event.target.value)}
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={isSaving}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={isSaving || !commentary.trim()}
          >
            {isSaving ? "Saving..." : "Save review"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WriteReviewDialog;

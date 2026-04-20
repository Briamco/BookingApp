import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { CreatePropertyRequest, Property } from "../../types";
import { useToast } from "../../context/ToastContext";
import ImageAggregator from "../ImageAggregator";
import type { AggregatedImage } from "../ImageAggregator";
import LocationPickerMap from "../LocationPickerMap";

interface EditPropertyDialogProps {
  property: Property;
  onEdit: (id: number, data: CreatePropertyRequest) => Promise<string>;
  onAddImages: (id: number, images: File[]) => Promise<void>;
  onReorderImages: (id: number, orderedImageIds: number[]) => Promise<string>;
  onDeleteImages: (id: number, imageIds: number[]) => Promise<void>;
  trigger?: ReactNode;
  triggerClassName?: string;
}

function EditPropertyDialog({
  property,
  onEdit,
  onAddImages,
  onReorderImages,
  onDeleteImages,
  trigger,
  triggerClassName,
}: EditPropertyDialogProps) {
  const { addToast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const sortedPropertyImages = useMemo(
    () => [...property.images].sort((a, b) => a.order - b.order),
    [property.images],
  );

  const initialForm = useMemo<CreatePropertyRequest>(
    () => ({
      title: property.title,
      description: property.description,
      latitude: property.latitude,
      longitude: property.longitude,
      nightPrice: property.nightPrice,
      capacity: property.capacity,
      city: property.city,
      state: property.state,
      country: property.country,
    }),
    [property],
  );

  const [form, setForm] = useState<CreatePropertyRequest>(initialForm);
  const [orderedExistingImages, setOrderedExistingImages] = useState(sortedPropertyImages);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [newImages, setNewImages] = useState<AggregatedImage[]>([]);

  const openDialog = () => {
    setForm(initialForm);
    setOrderedExistingImages(sortedPropertyImages);
    setRemovedImageIds([]);
    setNewImages([]);
    setShowDialog(true);
  };

  const isInteractiveElement = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return false;
    return Boolean(target.closest("button, a, input, textarea, select, label"));
  };

  const handleTriggerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isInteractiveElement(event.target)) return;
    openDialog();
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (isInteractiveElement(event.target)) return;
    event.preventDefault();
    openDialog();
  };

  const updateField = <K extends keyof CreatePropertyRequest>(key: K, value: CreatePropertyRequest[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const moveExistingImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= orderedExistingImages.length) return;
    const nextImages = [...orderedExistingImages];
    const [moved] = nextImages.splice(fromIndex, 1);
    nextImages.splice(toIndex, 0, moved);
    setOrderedExistingImages(nextImages);
  };

  const removeExistingImage = (index: number) => {
    const imageToRemove = orderedExistingImages[index];
    if (!imageToRemove) return;

    setRemovedImageIds((previous) => [...previous, imageToRemove.id]);
    setOrderedExistingImages((previous) => previous.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleEdit = async () => {
    if (!form.title.trim()) {
      addToast("error", "Please enter a property title");
      return;
    }
    if (!form.description.trim()) {
      addToast("error", "Please enter a property description");
      return;
    }
    if (form.nightPrice <= 0) {
      addToast("error", "Please enter a valid night price");
      return;
    }
    if (form.capacity <= 0) {
      addToast("error", "Please enter a valid capacity");
      return;
    }

    try {
      setIsSaving(true);
      const message = await onEdit(property.id, form);

      if (removedImageIds.length > 0) {
        await onDeleteImages(property.id, removedImageIds);
      }

      if (newImages.length > 0) {
        await onAddImages(
          property.id,
          newImages.map((image) => image.file),
        );
      }

      const originalOrder = sortedPropertyImages.map((image) => image.id).join(",");
      const nextOrder = orderedExistingImages.map((image) => image.id).join(",");
      const hasOrderChanges = originalOrder !== nextOrder;

      if (hasOrderChanges && orderedExistingImages.length > 0) {
        await onReorderImages(
          property.id,
          orderedExistingImages.map((image) => image.id),
        );
      }

      const withImageChanges = newImages.length > 0 || hasOrderChanges || removedImageIds.length > 0;
      addToast(
        "success",
        withImageChanges ? "Property and images updated successfully" : message || "Property updated successfully",
      );
      setShowDialog(false);
    } catch {
      addToast("error", "Failed to update property");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {trigger ? (
        <div
          role="button"
          tabIndex={0}
          onClick={handleTriggerClick}
          onKeyDown={handleTriggerKeyDown}
          className={triggerClassName ?? "cursor-pointer"}
        >
          {trigger}
        </div>
      ) : (
        <button className="btn btn-sm btn-outline shadow-md" onClick={openDialog}>
          Edit
        </button>
      )}

      <dialog className="modal" style={{ zIndex: 1200 }} open={showDialog} onClose={() => setShowDialog(false)}>
        <div className="modal-box relative max-w-5xl border border-base-300 bg-base-100 p-0 shadow-2xl" style={{ zIndex: 1201 }}>
          <div className="relative overflow-hidden rounded-t-2xl border-b border-base-300 bg-linear-to-r from-base-200 via-base-100 to-base-200 px-6 py-5">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
            <div className="absolute -left-12 -bottom-12 h-36 w-36 rounded-full bg-secondary/10 blur-2xl" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Host Studio</p>
              <h3 className="mt-1 text-2xl font-bold">Edit Property</h3>
              <p className="mt-1 text-sm text-base-content/70">Refine details, reorder media, and keep your listing sharp.</p>
            </div>
          </div>

          <div className="max-h-[75vh] space-y-5 overflow-y-auto px-6 py-5">
            <section className="space-y-4 rounded-xl border border-base-300 bg-base-100/80 p-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">Property Title</label>
                  <span className={`text-xs ${form.title.length > 230 ? "text-warning" : "text-base-content/60"}`}>
                    {form.title.length}/255
                  </span>
                </div>
                <input
                  className="input input-bordered w-full bg-base-100"
                  placeholder="Title (max 255 characters)"
                  value={form.title}
                  maxLength={255}
                  onChange={(e) => updateField("title", e.target.value)}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold">Description</label>
                <textarea
                  className="textarea textarea-bordered w-full bg-base-100"
                  placeholder="Describe what makes this place special"
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  disabled={isSaving}
                />
              </div>
            </section>

            <section className="space-y-4 rounded-xl border border-base-300 bg-base-100/80 p-4">
              <p className="text-sm font-semibold">Pricing & Capacity</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="create-property-night-price" className="text-sm font-medium">
                    Night price
                  </label>
                  <input
                    id="create-property-night-price"
                    type="number"
                    className="input input-bordered w-full bg-base-100"
                    placeholder="Night price"
                    value={form.nightPrice}
                    onChange={(e) => updateField("nightPrice", Number(e.target.value))}
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="create-property-capacity" className="text-sm font-medium">
                    Capacity
                  </label>
                  <input
                    id="create-property-capacity"
                    type="number"
                    className="input input-bordered w-full bg-base-100"
                    placeholder="Capacity"
                    value={form.capacity}
                    onChange={(e) => updateField("capacity", Number(e.target.value))}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4 rounded-xl border border-base-300 bg-base-100/80 p-4">
              <p className="text-sm font-semibold">Location</p>
              <LocationPickerMap
                latitude={Number(form.latitude)}
                longitude={Number(form.longitude)}
                onLocationChange={(latitude, longitude, details) => {
                  updateField("latitude", latitude);
                  updateField("longitude", longitude);
                  if (details) {
                    updateField("city", details.city);
                    updateField("state", details.state);
                    updateField("country", details.country);
                  }
                }}
                disabled={isSaving}
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  className="input input-bordered bg-base-100"
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  disabled={isSaving}
                />
                <input
                  className="input input-bordered bg-base-100"
                  placeholder="State"
                  value={form.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  disabled={isSaving}
                />
              </div>

              <input
                className="input input-bordered w-full bg-base-100"
                placeholder="Country"
                value={form.country}
                onChange={(e) => updateField("country", e.target.value)}
                disabled={isSaving}
              />
            </section>

            <section className="space-y-3 rounded-xl border border-base-300 bg-base-100/80 p-4">
              <p className="text-sm font-semibold">Current image order</p>
              {orderedExistingImages.length === 0 ? (
                <p className="text-sm text-base-content/60">This property has no images yet.</p>
              ) : (
                <div className="space-y-2">
                  {orderedExistingImages.map((image, index) => (
                    <div
                      key={image.id}
                      className="flex items-center gap-3 rounded-xl border border-base-300 bg-base-100 p-2.5 transition hover:border-primary/40"
                    >
                      <img src={image.url} alt={`property-image-${index}`} className="h-12 w-16 rounded object-cover" />
                      <span className="flex-1 text-sm font-medium">Image #{index + 1}</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          className="btn btn-xs"
                          disabled={index === 0 || isSaving}
                          onClick={() => moveExistingImage(index, index - 1)}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="btn btn-xs"
                          disabled={index === orderedExistingImages.length - 1 || isSaving}
                          onClick={() => moveExistingImage(index, index + 1)}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="btn btn-xs btn-error btn-outline"
                          disabled={isSaving}
                          onClick={() => removeExistingImage(index)}
                          title="Delete image"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-3 rounded-xl border border-base-300 bg-base-100/80 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Add new images</p>
                <span className="rounded-full bg-base-200 px-3 py-1 text-xs font-medium text-base-content/70">
                  {Math.max(0, 10 - orderedExistingImages.length)} slots available
                </span>
              </div>
              <ImageAggregator
                images={newImages}
                onImagesChange={setNewImages}
                maxImages={Math.max(0, 10 - orderedExistingImages.length)}
                disabled={isSaving}
              />
            </section>

            <div className="modal-action mt-0 border-t border-base-300 pt-4">
              <button className="btn btn-ghost" onClick={() => setShowDialog(false)} disabled={isSaving}>
                Cancel
              </button>
              <button
                className="btn btn-primary px-6 shadow-lg shadow-primary/25"
                onClick={handleEdit}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}

export default EditPropertyDialog;

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
      country: property.coutry,
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
        <button className="btn btn-sm btn-outline" onClick={openDialog}>
          Edit
        </button>
      )}

      <dialog className="modal" open={showDialog} onClose={() => setShowDialog(false)}>
        <div className="modal-box space-y-3">
          <h3 className="font-bold text-lg">Edit Property</h3>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Property Title</label>
              <span className={`text-xs ${form.title.length > 230 ? "text-warning" : "text-gray-500"}`}>
                {form.title.length}/255
              </span>
            </div>
            <input
              className="input input-bordered w-full"
              placeholder="Title (max 255 characters)"
              value={form.title}
              maxLength={255}
              onChange={(e) => updateField("title", e.target.value)}
              disabled={isSaving}
            />
          </div>

          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Description"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            disabled={isSaving}
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              className="input input-bordered"
              placeholder="Night price"
              value={Number(form.nightPrice)}
              onChange={(e) => updateField("nightPrice", Number(e.target.value))}
              disabled={isSaving}
            />
            <input
              type="number"
              className="input input-bordered"
              placeholder="Capacity"
              value={Number(form.capacity)}
              onChange={(e) => updateField("capacity", Number(e.target.value))}
              disabled={isSaving}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              className="input input-bordered"
              placeholder="City"
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
              disabled={isSaving}
            />
            <input
              className="input input-bordered"
              placeholder="State"
              value={form.state}
              onChange={(e) => updateField("state", e.target.value)}
              disabled={isSaving}
            />
          </div>

          <LocationPickerMap
            latitude={Number(form.latitude)}
            longitude={Number(form.longitude)}
            onLocationChange={(latitude, longitude) => {
              updateField("latitude", latitude);
              updateField("longitude", longitude);
            }}
            disabled={isSaving}
          />

          <input
            className="input input-bordered w-full"
            placeholder="Country"
            value={form.country}
            onChange={(e) => updateField("country", e.target.value)}
            disabled={isSaving}
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              className="input input-bordered"
              placeholder="Latitude"
              value={form.latitude}
              onChange={(e) => updateField("latitude", Number(e.target.value))}
              disabled={isSaving}
            />
            <input
              type="number"
              className="input input-bordered"
              placeholder="Longitude"
              value={form.longitude}
              onChange={(e) => updateField("longitude", Number(e.target.value))}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Current image order</p>
            {orderedExistingImages.length === 0 ? (
              <p className="text-sm text-gray-500">This property has no images yet.</p>
            ) : (
              <div className="space-y-2">
                {orderedExistingImages.map((image, index) => (
                  <div key={image.id} className="flex items-center gap-3 rounded-lg border border-base-300 p-2">
                    <img src={image.url} alt={`property-image-${index}`} className="h-12 w-16 rounded object-cover" />
                    <span className="text-sm flex-1">Image #{index + 1}</span>
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
          </div>

          <ImageAggregator
            images={newImages}
            onImagesChange={setNewImages}
            maxImages={Math.max(0, 10 - orderedExistingImages.length)}
            disabled={isSaving}
          />

          <div className="modal-action">
            <button className="btn" onClick={() => setShowDialog(false)} disabled={isSaving}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleEdit} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </button>
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

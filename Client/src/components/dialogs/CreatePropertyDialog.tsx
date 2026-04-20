import { useState } from "react";
import type { CreatePropertyRequest } from "../../types";
import { useToast } from "../../context/ToastContext";
import ImageAggregator from "../ImageAggregator";
import type { AggregatedImage } from "../ImageAggregator";
import LocationPickerMap from "../LocationPickerMap";

interface CreatePropertyDialogProps {
  onCreate: (data: CreatePropertyRequest) => Promise<void>;
}

const initialForm: CreatePropertyRequest = {
  title: "",
  description: "",
  latitude: 0,
  longitude: 0,
  nightPrice: 0,
  capacity: 1,
  city: "",
  state: "",
  country: "",
  images: []
};

function CreatePropertyDialog({ onCreate }: CreatePropertyDialogProps) {
  const { addToast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<CreatePropertyRequest>(initialForm);
  const [images, setImages] = useState<AggregatedImage[]>([]);

  const updateField = <K extends keyof CreatePropertyRequest>(key: K, value: CreatePropertyRequest[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreate = async () => {
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
      const formData = {
        ...form,
        images: images.map((img) => img.file),
      };
      await onCreate(formData);
      addToast("success", images.length > 0 ? "Property created and images uploaded successfully" : "Property created successfully");
      setForm(initialForm);
      setImages([]);
      setShowDialog(false);
    } catch {
      addToast("error", "Failed to create property");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button className="btn btn-primary shadow-lg shadow-primary/25" onClick={() => setShowDialog(true)}>
        New Property
      </button>

      <dialog className="modal" style={{ zIndex: 1200 }} open={showDialog} onClose={() => setShowDialog(false)}>
        <div className="modal-box relative max-w-4xl border border-base-300 bg-base-100 p-0 shadow-2xl" style={{ zIndex: 1201 }}>
          <div className="relative overflow-hidden rounded-t-2xl border-b border-base-300 bg-linear-to-r from-base-200 via-base-100 to-base-200 px-6 py-5">
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary/10 blur-2xl" />
            <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-secondary/10 blur-2xl" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Host Studio</p>
              <h3 className="mt-1 text-2xl font-bold">Create New Property</h3>
              <p className="mt-1 text-sm text-base-content/70">Craft a polished listing with location and curated images.</p>
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
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Gallery</p>
                <span className="rounded-full bg-base-200 px-3 py-1 text-xs font-medium text-base-content/70">Max 10 images</span>
              </div>
              <ImageAggregator images={images} onImagesChange={setImages} maxImages={10} disabled={isSaving} />
            </section>

            <div className="modal-action mt-0 border-t border-base-300 pt-4">
              <button className="btn btn-ghost" onClick={() => setShowDialog(false)} disabled={isSaving}>
                Cancel
              </button>
              <button className="btn btn-primary px-6 shadow-lg shadow-primary/25" onClick={handleCreate} disabled={isSaving}>
                {isSaving ? "Creating..." : "Create"}
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

export default CreatePropertyDialog;
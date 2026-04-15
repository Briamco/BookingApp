import { useState } from "react";
import type { CreatePropertyRequest } from "../../types";
import { useToast } from "../../context/ToastContext";
import ImageAggregator from "../ImageAggregator";
import type { AggregatedImage } from "../ImageAggregator";

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
      <button className="btn btn-primary" onClick={() => setShowDialog(true)}>
        New Property
      </button>

      <dialog className="modal" open={showDialog} onClose={() => setShowDialog(false)}>
        <div className="modal-box space-y-3">
          <h3 className="font-bold text-lg">Create New Property</h3>

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
              value={form.nightPrice}
              onChange={(e) => updateField("nightPrice", Number(e.target.value))}
              disabled={isSaving}
            />
            <input
              type="number"
              className="input input-bordered"
              placeholder="Capacity"
              value={form.capacity}
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

          <input
            className="input input-bordered w-full"
            placeholder="Country"
            value={form.country}
            onChange={(e) => updateField("country", e.target.value)}
            disabled={isSaving}
          />

          <ImageAggregator images={images} onImagesChange={setImages} maxImages={10} disabled={isSaving} />

          <div className="modal-action">
            <button className="btn" onClick={() => setShowDialog(false)} disabled={isSaving}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreate} disabled={isSaving}>
              {isSaving ? "Creating..." : "Create"}
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

export default CreatePropertyDialog;
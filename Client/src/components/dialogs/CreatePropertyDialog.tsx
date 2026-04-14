import { useState } from "react";
import type { CreatePropertyRequest } from "../../types";
import { useToast } from "../../context/ToastContext";

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
  coutry: ""
};

function CreatePropertyDialog({ onCreate }: CreatePropertyDialogProps) {
  const { addToast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<CreatePropertyRequest>(initialForm);

  const updateField = <K extends keyof CreatePropertyRequest>(key: K, value: CreatePropertyRequest[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreate = async () => {
    try {
      setIsSaving(true);
      await onCreate(form);
      addToast("success", "Property created successfully");
      setForm(initialForm);
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

          <input
            className="input input-bordered w-full"
            placeholder="Title"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
          />

          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Description"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              className="input input-bordered"
              placeholder="Night price"
              value={form.nightPrice}
              onChange={(e) => updateField("nightPrice", Number(e.target.value))}
            />
            <input
              type="number"
              className="input input-bordered"
              placeholder="Capacity"
              value={form.capacity}
              onChange={(e) => updateField("capacity", Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              className="input input-bordered"
              placeholder="City"
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
            />
            <input
              className="input input-bordered"
              placeholder="State"
              value={form.state}
              onChange={(e) => updateField("state", e.target.value)}
            />
          </div>

          <input
            className="input input-bordered w-full"
            placeholder="Country"
            value={form.coutry}
            onChange={(e) => updateField("coutry", e.target.value)}
          />

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
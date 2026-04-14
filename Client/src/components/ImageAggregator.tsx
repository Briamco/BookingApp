import { useState, useRef } from "react";

export interface AggregatedImage {
  id: string;
  file: File;
  preview: string;
  order: number;
}

interface ImageAggregatorProps {
  images: AggregatedImage[];
  onImagesChange: (images: AggregatedImage[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

function ImageAggregator({ images, onImagesChange, maxImages = 10, disabled = false }: ImageAggregatorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const imageCount = images.length;
    const availableSlots = Math.max(0, (maxImages || 10) - imageCount);
    const filesToProcess = Math.min(files.length, availableSlots);

    if (filesToProcess === 0) {
      return; // No space for more images
    }

    const filePromises: Promise<AggregatedImage | null>[] = [];

    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        const promise = new Promise<AggregatedImage | null>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const newImage: AggregatedImage = {
              id: `${Date.now()}-${Math.random()}-${i}`,
              file,
              preview: reader.result as string,
              order: imageCount + i,
            };
            resolve(newImage);
          };
          reader.onerror = () => {
            resolve(null);
          };
          reader.readAsDataURL(file);
        });
        filePromises.push(promise);
      }
    }

    Promise.all(filePromises).then((results) => {
      const validImages = results.filter((img): img is AggregatedImage => img !== null);
      if (validImages.length > 0) {
        const reordered = [...images, ...validImages].map((img, idx) => ({
          ...img,
          order: idx,
        }));
        onImagesChange(reordered);
      }
    });
  };

  const handleAddClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemoveImage = (id: string) => {
    const filtered = images.filter((img) => img.id !== id);
    const reordered = filtered.map((img, idx) => ({ ...img, order: idx }));
    onImagesChange(reordered);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    const reordered = newImages.map((img, idx) => ({ ...img, order: idx }));
    onImagesChange(reordered);
  };

  const handleMoveDown = (index: number) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    const reordered = newImages.map((img, idx) => ({ ...img, order: idx }));
    onImagesChange(reordered);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">Images ({images.length}/{maxImages})</label>
        <button
          type="button"
          className="btn btn-sm btn-outline"
          onClick={handleAddClick}
          disabled={images.length >= maxImages || disabled}
        >
          + Add Image
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {images.length === 0 ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${dragOver ? "border-primary bg-primary/10" : "border-gray-300"
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleAddClick}
        >
          <p className="text-gray-500">Drag and drop images here or click to select</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div
            className={`border-2 border-dashed rounded-lg p-4 transition ${dragOver ? "border-primary bg-primary/10" : "border-gray-300"
              }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <p className="text-sm text-gray-400 text-center">Drag to reorder or drop new images</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              {images.map((image, index) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.preview}
                    alt={`preview-${index}`}
                    className="w-full h-32 object-cover rounded-lg shadow-sm border border-gray-200"
                  />

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0 || disabled}
                      className="btn btn-xs btn-ghost text-white disabled:opacity-30"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === images.length - 1 || disabled}
                      className="btn btn-xs btn-ghost text-white disabled:opacity-30"
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(image.id)}
                      disabled={disabled}
                      className="btn btn-xs btn-ghost text-red-400"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageAggregator;

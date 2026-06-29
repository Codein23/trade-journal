import { useRef } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { fileToDataUrl } from "@/lib/utils";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  multiple?: boolean;
  label?: string;
}

export function ImageUploader({
  images,
  onChange,
  multiple = false,
  label = "Add an image",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const urls = await Promise.all(list.map(fileToDataUrl));
    onChange(multiple ? [...images, ...urls] : urls.slice(0, 1));
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeAt(i: number) {
    onChange(images.filter((_, idx) => idx !== i));
  }

  return (
    <div className="flex flex-col gap-2">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((src, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-lg border border-border"
            >
              <img src={src} alt={`upload ${i + 1}`} className="h-28 w-auto object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute right-1 top-1 rounded-md bg-black/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove image"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {(multiple || images.length === 0) && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-surface2 px-3 py-2 text-sm text-muted hover:border-brand-green/50 hover:text-white"
        >
          <ImagePlus size={16} />
          {label}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

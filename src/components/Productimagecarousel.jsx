// src/components/ProductImageCarousel.jsx
// (only the background colors changed — bg-stone-100 -> bg-white,
// on both the main container and the fallback div, so a white
// product photo blends into the box instead of showing a gray
// letterbox around it)

import { useState, useEffect } from "react";

export default function ProductImageCarousel({ images, name }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [images.length]);

  function handleImageError(e) {
    e.target.style.display = "none";
    e.target.nextElementSibling.style.display = "flex";
  }

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-3xl bg-stone-100 dark:bg-stone-800">
      <img
        src={images[index]}
        alt={`${name}, photo ${index + 1} of ${images.length}`}
        onError={handleImageError}
        className="h-full w-full object-cover"
      />
      <div
        style={{ display: "none" }}
        className="absolute inset-0 items-center justify-center bg-stone-100 text-xs text-stone-400 font-mono dark:bg-stone-800 dark:text-stone-400"
      >
        image unavailable
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(event) => {
                event.stopPropagation();
                setIndex(i);
              }}
              aria-label={`Show photo ${i + 1}`}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === index ? "bg-stone-800 dark:bg-stone-100" : "bg-stone-400/50 hover:bg-stone-500 dark:bg-stone-500/60 dark:hover:bg-stone-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

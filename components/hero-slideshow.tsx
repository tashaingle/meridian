"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  {
    src: "/photos/hero-coast.jpg",
    alt: "A rocky coast and pale mountains across the water at sunset.",
  },
  {
    src: "/photos/hero-village.jpg",
    alt: "A whitewashed lane opening onto a deep blue bay.",
  },
  {
    src: "/photos/hero-villas.jpg",
    alt: "A timber walkway leading to overwater villas.",
  },
  {
    src: "/photos/hero-beach.jpg",
    alt: "A pale beach curving into turquoise water, with a small boat near the shore.",
  },
];

export function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  const [stopped, setStopped] = useState(false);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (stopped || held || media.matches) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, [held, stopped]);

  return (
    <div
      className="absolute inset-0"
      role="region"
      aria-roledescription="carousel"
      aria-label="Places"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      {SLIDES.map((slide, slideIndex) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={slideIndex === 0}
          sizes="100vw"
          aria-hidden={slideIndex !== index}
          className={`object-cover motion-reduce:transition-none transition-opacity duration-1000 ${
            slideIndex === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        <button
          type="button"
          className="rounded-full bg-ink/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-ink/75"
          onClick={() => setStopped((current) => !current)}
        >
          {stopped ? "Play" : "Pause"}
        </button>
        <div className="flex gap-1.5 rounded-full bg-ink/55 p-1.5 backdrop-blur">
          {SLIDES.map((slide, slideIndex) => (
            <button
              key={slide.src}
              type="button"
              aria-label={`Show photograph ${slideIndex + 1} of ${SLIDES.length}`}
              aria-current={slideIndex === index}
              onClick={() => setIndex(slideIndex)}
              className={`h-2.5 w-2.5 rounded-full ${slideIndex === index ? "bg-white" : "bg-white/45"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

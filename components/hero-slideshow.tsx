"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  {
    src: "/photos/hero-wing.jpg",
    alt: "A desert coast and blue water, seen from an airplane window at sunrise.",
  },
  {
    src: "/photos/hero-concourse.jpg",
    alt: "Travellers with suitcases walking through a bright airport concourse.",
  },
  {
    src: "/photos/hero-apron.jpg",
    alt: "An unmarked white jet on a desert runway in low morning light.",
  },
  {
    src: "/photos/hero-corniche.jpg",
    alt: "A waterfront of lit apartment buildings beside calm water at dusk.",
  },
];

export function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (held || media.matches) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, [held]);

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
      <div className="absolute right-4 top-4 z-10 flex gap-1.5 rounded-full bg-ink/55 p-1.5 backdrop-blur">
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
  );
}

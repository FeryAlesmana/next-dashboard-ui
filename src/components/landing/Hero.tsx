import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Daftar gambar yang akan ditampilkan
  const images = ["/guru1.jpeg", "/guru1.jpeg", "/guru1.jpeg", "/guru1.jpeg"];

  useEffect(() => {
    // Auto slide setiap 5 detik
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  // Efek untuk animasi masuk
  useEffect(() => {
    if (sliderRef.current) {
      const activeSlide = sliderRef.current.querySelector(".active-slide");
      if (activeSlide) {
        activeSlide.classList.remove("animate-swipe");
        void activeSlide.clientWidth; // Trigger reflow
        activeSlide.classList.add("animate-swipe");
      }
    }
  }, [currentSlide]);

  return (
    <section id="home" className="relative py-16 md:py-24">
      <style jsx>{`
        @keyframes swipeIn {
          from {
            transform: translateX(100px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-swipe {
          animation: swipeIn 1.5s ease-out forwards;
        }
      `}</style>

      <div className="max-w-5xl mx-auto px-6 sm:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight drop-shadow-md">
          Selamat Datang di{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-orange-200">
            SMP Islamiyyah Serua
          </span>
        </h1>

        <p className="text-lg md:text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
          <span className="font-semibold text-orange-200">
            Sekolah unggulan
          </span>{" "}
          dengan kurikulum modern, fasilitas lengkap, dan tenaga pendidik
          profesional.
        </p>

        <div
          ref={sliderRef}
          className="relative overflow-hidden rounded-xl shadow-2xl mx-auto w-full max-w-4xl h-96"
        >
          {images.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide
                  ? "opacity-100 active-slide animate-swipe"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              <Image
                width={900}
                height={400}
                src={img}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
          ))}

          {/* Navigation Dots */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide ? "bg-white w-6" : "bg-white/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

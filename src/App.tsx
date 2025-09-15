import React from "react";
import Hero from "./components/landing/Hero";
import Features from "./components/landing/Features";
import Gallery from "./components/landing/Gallery";
import CTA from "./components/landing/CTA";
import Footer from "./components/landing/Footer";
import NavbarHome from "./components/NavbarHome";

const App: React.FC = async () => {
  const res = await fetch(`/api/homepage-data`, {
    cache: "no-store", // supaya selalu ambil fresh
  });
  const { heroSlides, gallery, eskul, penunjang } = await res.json();
  return (
    <div className="font-sans">
      <NavbarHome />
      <Hero slides={heroSlides} />
      <Features />
      <Gallery DBimages={gallery} />
      <CTA />
      <Footer />
    </div>
  );
};

export default App;

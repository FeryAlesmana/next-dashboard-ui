import React from "react";
import Hero from "./components/landing/Hero";
import Features from "./components/landing/Features";
import Gallery from "./components/landing/Gallery";
import CTA from "./components/landing/CTA";
import Footer from "./components/landing/Footer";
import NavbarHome from "./components/NavbarHome";


const App: React.FC = () => {
  return (
    <div className="font-sans">
      <NavbarHome />
      <Hero />
      <Features />
      <Gallery />
      <CTA />
      <Footer />
    </div>
  );
};

export default App;

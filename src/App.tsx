import React from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/landing/Hero";
import Features from "./components/landing/Features";
import Gallery from "./components/landing/Gallery";
import CTA from "./components/landing/CTA";
import Footer from "./components/landing/Footer";


const App: React.FC = () => {
  return (
    <div className="font-sans">
      <Navbar />
      <Hero />
      <Features />
      <Gallery />
      <CTA />
      <Footer />
    </div>
  );
};

export default App;

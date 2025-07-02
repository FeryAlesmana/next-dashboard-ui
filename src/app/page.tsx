'use client';
import React from 'react';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import Gallery from '../components/landing/Gallery';
import Kontak from '../components/landing/Kontak';
import Profil from '../components/landing/Profil';
import CTA from '../components/landing/CTA';
import Pendaftaran from '../components/landing/Pendaftaran';
import VisiMisi from '../components/landing/VisiMisi';
import Ekstrakurikuler from '../components/landing/Ekstrakurikuler';
import Fasilitas from '../components/landing/Fasilitas';
import Footer from '../components/landing/Footer';
import NavbarHome from '@/components/NavbarHome';

export default function Home() {
 
  return (
    <div className="relative font-sans min-h-screen">
      {/* Background Gradien + Pola Geometris (Full Width) */}
      <div className="fixed inset-0 -z-10">
        {/* Gradien Utama */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-orange-400 opacity-90"></div>
        
        {/* Pola Geometris */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPgo8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ0cmFuc3BhcmVudCIgLz4KPHBhdHRlcm4gaWQ9InBhdHRlcm4iIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj4KPHBhdGggZD0iTTAgMEwxMDAgMTAwTTEwMCAwTDAgMTAwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEiIC8+CjwvcGF0dGVybj4KPHJlY3QgZmlsbD0idXJsKCNwYXR0ZXJuKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgLz4KPC9zdmc+')]"></div>
        </div>
      </div>

      {/* Konten Utama */}
      <div className="relative">
        {/* Navbar Full Width */}
        <NavbarHome />
        
        {/* Container untuk Konten Lainnya */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Hero />
          <Features />
          <Profil />
          <VisiMisi />
          <Ekstrakurikuler />
          <Fasilitas />
          <Gallery />
          <Kontak />
          <Pendaftaran />
          <CTA />
        </div>
        
        {/* Footer Full Width */}
        <Footer />
      </div>
    </div>
  );
}
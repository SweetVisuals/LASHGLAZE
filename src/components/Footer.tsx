/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Music2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { storeSettings } = useApp();
  
  return (
    <footer className="bg-paper pt-32 pb-20 px-8 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-32">
        <div className="lg:col-span-1">
          <div className="flex flex-col mb-10">
            <span className="font-serif text-3xl italic font-bold uppercase tracking-widest leading-none">Lash Glaze</span>
            <span className="text-[10px] tracking-[0.4em] font-bold opacity-40 uppercase leading-none mt-2">Strip Lashes</span>
            <p className="text-[10px] text-muted mt-6 uppercase tracking-[0.2em] font-bold leading-relaxed max-w-[200px]">
              Authentic, high quality, handcrafted strip lashes
            </p>
          </div>
          <div className="flex gap-8 mt-12">
            {storeSettings.instagramUrl && (
              <a href={storeSettings.instagramUrl} target="_blank" rel="noopener noreferrer">
                <Instagram size={18} className="text-muted hover:text-ink cursor-pointer transition-colors" />
              </a>
            )}
            {storeSettings.tiktokUrl && (
              <a href={storeSettings.tiktokUrl} target="_blank" rel="noopener noreferrer">
                <Music2 size={18} className="text-muted hover:text-ink cursor-pointer transition-colors" />
              </a>
            )}
          </div>
        </div>
        
        <div className="lg:pl-10">
          <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-10">Archive</h4>
          <ul className="flex flex-col gap-6 text-[10px] font-bold uppercase tracking-widest text-muted">
            <li>
              <Link to="/" className="hover:text-ink cursor-pointer transition-colors">Shop All</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-10">Assistance</h4>
          <ul className="flex flex-col gap-6 text-[10px] font-bold uppercase tracking-widest text-muted">
            <li>
              <Link to="/shipping" className="hover:text-ink cursor-pointer transition-colors">Shipping Logistics</Link>
            </li>
            <li>
              <Link to="/returns" className="hover:text-ink cursor-pointer transition-colors">Returns & Claims</Link>
            </li>
            <li>
              <a href="mailto:expert@lashglaze.com" className="hover:text-ink cursor-pointer transition-colors">Contact Expert</a>
            </li>
            <li>
              <Link to="/faq" className="hover:text-ink cursor-pointer transition-colors">Common Queries</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-10">The Journal</h4>
          <p className="text-[10px] text-muted mb-10 uppercase tracking-widest font-bold leading-relaxed">
            Join our mailing list for weekly drop alerts and editorial lookbooks.
          </p>
          <div className="flex flex-col gap-4">
            <input 
              type="email" 
              placeholder="YOUR EMAIL"
              className="bg-accent/10 px-6 py-4 w-full text-[10px] font-bold tracking-widest focus:outline-none transition-all uppercase rounded-none shadow-inner focus:bg-white"
            />
            <button className="luxury-button-filled w-full py-4 text-[10px]">
              Subscribe
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 pt-16 text-[9px] uppercase tracking-[0.3em] font-bold text-muted opacity-50">
        <p className="opacity-50">© 2026 LASH GLAZE STRIP LASHES. ALL RIGHTS RESERVED.</p>
        <div className="flex gap-12">
           <Link to="/privacy" className="hover:text-ink cursor-pointer transition-colors">Privacy</Link>
           <Link to="/terms" className="hover:text-ink cursor-pointer transition-colors">Terms</Link>
           <Link to="/terms" className="hover:text-ink cursor-pointer transition-colors">Sustainability</Link>
        </div>
      </div>
    </footer>
  );
};


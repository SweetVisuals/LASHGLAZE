/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { User, Package, MapPin, Shield, Zap, LogOut, ChevronRight, Loader2, Save, ShoppingBag, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuthModal } from '../components/AuthModal';
import { supabase } from '../supabase';
import { formatPrice as formatPriceUtil } from '../utils/format';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface UserOrder {
  id: string;
  created_at: string;
  total: number;
  status: string;
  order_number?: number;
}

export const Profile: React.FC<{ onOrderClick?: (id: string) => void }> = ({ onOrderClick }) => {
  const { isCustomerLoggedIn, logoutCustomer, user, storeSettings, formatOrderNumber } = useApp();
  const formatPrice = (amount: number) => formatPriceUtil(amount, storeSettings.currency);
  const theme = storeSettings.colors;
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    if (user) {
      loadProfileData();
    } else {
      setLoading(false);
    }
    
    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isMounted && loading) {
        setLoading(false);
      }
    }, 5000);
    
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [user]);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      // Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      
      setProfile(profileData);
      setFullName(profileData.full_name || '');

      // Fetch Orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (error) throw error;
      
      // Also update auth metadata so topbar handles it immediately
      await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      
      setProfile(prev => prev ? { ...prev, full_name: fullName } : null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!isCustomerLoggedIn) {
     return (
       <div className="min-h-screen bg-paper flex items-center justify-center p-8 text-ink">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-accent/10 p-12 rounded-none shadow-[0_50px_100px_rgba(0,0,0,0.1)] text-center max-w-md w-full"
          >
             <User size={48} className="mx-auto text-gold mb-6 opacity-40" strokeWidth={1} />
             <h2 className="font-serif text-3xl italic mb-4">Identify Yourself</h2>
             <p className="text-[10px] uppercase tracking-widest font-bold text-muted mb-10">Access your editorial profile and order history</p>
             <button 
               onClick={() => setIsAuthModalOpen(true)}
               className="luxury-button-filled w-full py-5 text-[10px]"
             >
               Sign In
             </button>
          </motion.div>
          <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
       </div>
     );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <Loader2 className="animate-spin text-gold" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper py-32 px-4 lg:px-8 text-ink">
      <div className="max-w-6xl mx-auto">
        <motion.header 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24"
        >
          <div className="space-y-4">
             <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-accent/20 flex items-center justify-center text-gold shadow-2xl relative">
                   <User size={40} strokeWidth={1} />
                   {profile?.role === 'admin' && (
                     <div className="absolute -top-2 -right-2 w-6 h-6 bg-gold text-paper flex items-center justify-center rounded-full shadow-lg">
                        <Shield size={12} />
                     </div>
                   )}
                </div>
                <div>
                  <h1 className="font-serif text-5xl md:text-6xl italic tracking-tighter">The Atelier</h1>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-muted font-bold mt-2">
                    {profile?.role === 'admin' ? 'Master Architect' : 'Aura Member'} / {user?.email}
                  </p>
                </div>
             </div>
          </div>
          <button 
            onClick={logoutCustomer}
            className="flex items-center gap-2 group text-[10px] uppercase tracking-widest font-extrabold text-red-500/60 hover:text-red-500 transition-colors"
          >
            <LogOut size={16} className="transition-transform group-hover:-translate-x-1" />
            Log Out
          </button>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           {/* Left Column: Management */}
           <div className="lg:col-span-5 space-y-8">
              <section className="bg-accent/10 p-10 rounded-none shadow-2xl space-y-10">
                 <div>
                    <h4 className="text-[9px] uppercase tracking-[0.3em] font-bold text-muted mb-8">Identity Management</h4>
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[9px] uppercase tracking-widest font-bold text-muted ml-1">Full Identity</label>
                          <input 
                            type="text" 
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="YOUR NAME"
                            className="w-full bg-accent/20 p-5 text-[11px] font-bold tracking-widest outline-none transition-all placeholder:opacity-20 shadow-inner text-ink"
                          />
                       </div>
                       <div className="space-y-2 opacity-50">
                          <label className="text-[9px] uppercase tracking-widest font-bold text-muted ml-1">Email Cipher (Fixed)</label>
                          <input 
                            type="text" 
                            value={user?.email || ''} 
                            disabled 
                            className="w-full bg-accent/5 p-5 text-[11px] font-bold tracking-widest outline-none cursor-not-allowed text-ink"
                          />
                       </div>
                       <button 
                         type="submit" 
                         disabled={saving || fullName === profile?.full_name}
                         className="flex items-center justify-center gap-3 w-full py-5 bg-gold text-paper text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white hover:text-ink transition-all disabled:opacity-30 shadow-xl group border-none"
                       >
                          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} className="group-hover:scale-110 transition-transform" />}
                          {saveSuccess ? 'PROFILE SECURED' : 'UPDATE IDENTITY'}
                       </button>
                    </form>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-6 pt-10 border-t border-accent/10">
                    <div className="text-center md:text-left">
                       <p className="text-3xl font-serif italic">{orders.length}</p>
                       <p className="text-[8px] uppercase font-bold tracking-widest text-muted">Total Orders</p>
                    </div>
                    <div className="text-center md:text-left">
                       <p className="text-3xl font-serif italic">0</p>
                       <p className="text-[8px] uppercase font-bold tracking-widest text-muted">Disputed Claims</p>
                    </div>
                 </div>
              </section>

              <div className="bg-ink p-10 rounded-none shadow-2xl space-y-6">
                 <h4 className="text-[9px] uppercase tracking-[0.3em] font-bold text-paper/40">Member Exclusive</h4>
                 <p className="text-[10px] font-bold tracking-widest leading-relaxed uppercase text-paper/60">
                    You have achieved elite status. Luxury styling consultations are now complimentary for your atelier.
                 </p>
                 <button className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold flex items-center gap-2 group">
                    Summon Specialist <ChevronRight size={12} className="transition-transform group-hover:translate-x-1" />
                 </button>
              </div>
           </div>

           {/* Right Column: Order History */}
           <div className="lg:col-span-7 space-y-8">
              <section className="bg-accent/10 p-10 rounded-none shadow-2xl min-h-[600px] flex flex-col">
                 <div className="flex justify-between items-center mb-12">
                    <div className="flex items-center gap-4">
                       <ShoppingBag size={20} className="text-gold" />
                       <h2 className="text-[11px] uppercase tracking-[0.3em] font-bold">Recent Orders</h2>
                    </div>
                    <div className="flex items-center gap-3 text-[9px] uppercase tracking-widest font-bold text-muted">
                       <Clock size={12} />
                       Historical Archive
                    </div>
                 </div>
                 
                 <div className="space-y-6 flex-grow">
                    {orders.length > 0 ? (
                      orders.map(order => (
                        <div 
                          key={order.id} 
                          onClick={() => onOrderClick?.(order.id)}
                          className="flex items-center justify-between p-6 bg-accent/5 hover:bg-accent/10 transition-all cursor-pointer group shadow-sm"
                        >
                           <div className="flex items-center gap-6">
                              <div className="w-14 h-14 bg-accent/20 flex items-center justify-center text-gold shadow-sm">
                                 <Package size={24} strokeWidth={1} />
                              </div>
                              <div>
                                 <div className="flex items-center gap-3 mb-1">
                                    <p className="text-xs font-bold uppercase tracking-widest">{formatOrderNumber(order.order_number)}</p>
                                    <span className="text-[8px] bg-gold/10 text-gold px-2 py-0.5 font-bold uppercase tracking-widest">
                                       {order.status}
                                    </span>
                                 </div>
                                 <p className="text-[9px] text-muted uppercase font-bold tracking-widest">
                                    {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} — {formatPrice(order.total)}
                                 </p>
                              </div>
                           </div>
                           <ChevronRight size={18} className="text-muted group-hover:text-gold transition-all" />
                        </div>
                      ))
                    ) : (
                      <div className="flex-grow flex flex-col items-center justify-center text-center p-12 opacity-30">
                         <ShoppingBag size={40} className="mb-6" strokeWidth={1} />
                         <p className="text-[10px] uppercase tracking-[0.2em] font-bold">No orders found in the archive</p>
                      </div>
                    )}
                 </div>

                 {orders.length > 0 && (
                   <button className="w-full mt-12 py-5 bg-accent/5 text-[10px] font-bold uppercase tracking-[0.4em] text-muted hover:text-ink hover:bg-accent/10 transition-all border-none">
                      Export Archive
                   </button>
                 )}
              </section>

              {/* Security & Access */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-accent/10 p-10 rounded-none shadow-2xl space-y-6">
                    <div className="flex items-center gap-4">
                       <Shield size={20} className="text-gold" />
                       <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold">Security Token</h3>
                    </div>
                    <p className="text-[10px] font-bold tracking-widest opacity-40 leading-relaxed uppercase">
                       Two-factor authentication is active. Access is secured via biometric signature.
                    </p>
                 </div>

                 <div className="bg-accent/10 p-10 rounded-none shadow-2xl space-y-6">
                    <div className="flex items-center gap-4">
                       <MapPin size={20} className="text-gold" />
                       <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold">Logistic Hub</h3>
                    </div>
                    <p className="text-[10px] font-bold tracking-widest opacity-40 leading-relaxed uppercase">
                       Orders are dispatched from our Berlin atelier to your primary residence.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

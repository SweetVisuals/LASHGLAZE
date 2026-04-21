/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { Package, Truck, CheckCircle2, Clock, MapPin, Search, Box, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';
import { formatPrice as formatPriceUtil } from '../utils/format';

export const OrderTracking: React.FC<{ initialOrderId?: string, onMyOrdersClick?: () => void }> = ({ initialOrderId, onMyOrdersClick }) => {
  const { orders, storeSettings, formatOrderNumber } = useApp();
  const [orderId, setOrderId] = useState(initialOrderId || '');
  const [trackedOrder, setTrackedOrder] = useState<any>(null);
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const formatPrice = (amount: number) => formatPriceUtil(amount, storeSettings.currency);

  const findOrder = async (query: string) => {
    setIsSearching(true);
    setError('');
    
    // 1. Try local state first
    const local = orders.find(o => 
      o.id.toLowerCase() === query.toLowerCase() || 
      (o.orderNumber && `LG-${o.orderNumber}` === query) ||
      (o.orderNumber && `#LG-${o.orderNumber}` === query)
    );

    if (local) {
      setTrackedOrder(local);
      setIsSearching(false);
      return;
    }

    // 2. Query Supabase
    try {
      const orderRef = query.replace('#', '').replace('LG-', '');
      const isUuid = query.length > 30; // rough check for UUID

      let dbQuery = supabase
        .from('orders')
        .select(`
          *,
          order_items ( product_id, quantity, price )
        `);

      if (isUuid) {
        dbQuery = dbQuery.eq('id', query);
      } else if (!isNaN(parseInt(orderRef))) {
        dbQuery = dbQuery.eq('order_number', parseInt(orderRef));
      } else {
        throw new Error('Invalid Reference Format');
      }

      const { data: dbOrder, error: dbError } = await dbQuery.single();

      if (dbError || !dbOrder) {
        throw new Error('Order not found');
      }

      setTrackedOrder({
        id: dbOrder.id,
        orderNumber: dbOrder.order_number,
        customerId: dbOrder.profile_id,
        customerName: dbOrder.customer_name,
        total: parseFloat(dbOrder.total.toString()),
        status: dbOrder.status as any,
        createdAt: dbOrder.created_at,
        items: (dbOrder as any).order_items?.map((i: any) => ({
          productId: i.product_id,
          quantity: i.quantity,
          price: i.price
        })) || []
      });
    } catch (err: any) {
      setTrackedOrder(null);
      setError('Order not found in our archive. Please verify your reference.');
    } finally {
      setIsSearching(false);
    }
  };

  React.useEffect(() => {
    if (initialOrderId) {
      findOrder(initialOrderId.toUpperCase().trim());
    }
  }, [initialOrderId]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    findOrder(orderId.toUpperCase().trim());
  };

  const stages = [
    { id: 'pending', label: 'Order Placed', icon: Clock, desc: 'We have received your order.' },
    { id: 'processed', label: 'Processing', icon: Box, desc: 'Your lashes are being hand-picked.' },
    { id: 'shipped', label: 'Shipped', icon: Truck, desc: 'Your order is on its way.' },
    { id: 'out-for-delivery', label: 'Out for Delivery', icon: MapPin, desc: 'Arriving at your doorstep soon.' },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle2, desc: 'Package received. Enjoy!' },
  ];

  const currentStageIndex = trackedOrder 
    ? stages.findIndex(s => s.id === trackedOrder.status)
    : -1;

  return (
    <div className="bg-paper min-h-screen py-24 px-8">
      <div className="max-w-3xl mx-auto">
        <header className="text-center space-y-4 mb-20">
          <h1 className="font-serif text-5xl italic tracking-tight">Track Your Journey</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted font-bold">Lash Glaze Series Delivery Tracking</p>
          
          <div className="pt-8">
            <button 
              onClick={onMyOrdersClick}
              className="text-[9px] uppercase tracking-[0.3em] font-bold text-muted hover:text-ink transition-colors flex items-center gap-2 mx-auto group"
            >
               <Package size={12} className="transition-transform group-hover:scale-110" />
               View My Orders
            </button>
          </div>
        </header>

        <form onSubmit={handleTrack} className="flex gap-4 mb-16">
          <div className="relative flex-grow">
            <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              type="text" 
              placeholder="ENTER ORDER REF (E.G. LG-1001)"
              className="w-full bg-accent/10 px-16 py-6 text-xs uppercase tracking-widest font-bold outline-none transition-all placeholder:text-muted/30 rounded-none shadow-inner focus:shadow-xl focus:bg-white text-ink"
            />
          </div>
          <button type="submit" disabled={isSearching} className="bg-ink text-paper px-12 py-6 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-gold hover:text-ink transition-all shadow-xl rounded-none disabled:opacity-50 flex items-center gap-3">
            {isSearching ? <Loader2 size={14} className="animate-spin" /> : 'TRACK'}
          </button>
        </form>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-8 bg-red-500/5 text-red-500 text-[10px] uppercase font-bold tracking-widest rounded-none shadow-lg shadow-red-500/5">
            {error}
          </motion.div>
        )}

        {trackedOrder && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="flex justify-between items-end pb-8 font-bold uppercase tracking-widest">
              <div>
                <p className="text-[10px] text-muted mb-2">Tracking Status</p>
                <h3 className="text-2xl tracking-tighter text-ink">{formatOrderNumber(trackedOrder.orderNumber)}</h3>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted mb-2">Estimated Delivery</p>
                <p className="text-sm">Wednesday, April 22</p>
              </div>
            </div>

            {/* Stepper */}
            <div className="relative">
              <div className="absolute left-[23px] top-4 bottom-4 w-px bg-accent/20" />
              <div 
                className="absolute left-[23px] top-4 w-px bg-gold transition-all duration-1000" 
                style={{ height: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
              />

              <div className="space-y-12">
                {stages.map((stage, idx) => {
                  const Icon = stage.icon;
                  const isCompleted = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <div key={stage.id} className="flex gap-10 relative z-10">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-700 ${
                        isCompleted ? 'bg-gold text-black shadow-[0_0_20px_rgba(212,175,55,0.3)]' : 'bg-paper shadow-inner text-muted'
                      }`}>
                        <Icon size={20} className={isCurrent ? 'animate-pulse' : ''} />
                      </div>
                      <div className="pt-1 space-y-1">
                        <h4 className={`text-[11px] uppercase font-bold tracking-widest transition-colors ${isCompleted ? 'text-ink' : 'text-muted/40'}`}>
                          {stage.label}
                        </h4>
                        <p className={`text-[10px] tracking-widest leading-relaxed transition-colors ${isCompleted ? 'text-muted' : 'text-muted/20'}`}>
                          {stage.desc}
                        </p>
                      </div>
                      {isCurrent && (
                        <div className="ml-auto flex items-center">
                          <span className="text-[8px] bg-ink text-paper px-3 py-1 rounded-full font-bold uppercase tracking-widest">LATEST STATUS</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-accent/5 p-10 grid grid-cols-1 md:grid-cols-2 gap-10 shadow-2xl">
               <div className="space-y-6">
                  <h5 className="text-[10px] uppercase font-bold tracking-[0.3em] text-muted">Order Payload</h5>
                  <div className="space-y-3">
                    {trackedOrder.items?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-ink">
                        <span>Lashes x {item.quantity}</span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="pt-4 shadow-[0_-1px_0_rgba(0,0,0,0.05)] flex justify-between items-center font-bold text-ink">
                      <span className="text-[10px] uppercase tracking-[0.2em]">Grand Total</span>
                      <span className="text-sm">{formatPrice(trackedOrder.total)}</span>
                    </div>
                  </div>
               </div>
               <div className="space-y-6">
                  <h5 className="text-[10px] uppercase font-bold tracking-[0.3em] text-muted">Atelier Logistics</h5>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-accent/10 rounded-none flex items-center justify-center font-bold italic text-ink shadow-sm text-xs">DHL</div>
                       <p className="text-[10px] uppercase font-bold tracking-widest text-muted">Global Express Priority</p>
                    </div>
                    <p className="text-[10px] font-bold tracking-widest leading-loose uppercase text-ink">
                      Secured Transit to Destination Atelier<br />
                      Dispatch Center: London Central
                    </p>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

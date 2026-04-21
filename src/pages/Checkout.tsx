/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, ChevronLeft, CreditCard, Ship, Lock, CheckCircle2, AlertCircle, ShieldCheck, Beaker, Clock, Copy, Package, Check } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { formatPrice as formatPriceUtil } from '../utils/format';
import { supabase } from '../supabase';
import { AuthModal } from '../components/AuthModal';

// Initialize Stripe outside component to avoid recreating it
const stripePromise = loadStripe((import.meta as any).env.VITE_STRIPE_PUBLIC_KEY || '');

const StripeCheckoutForm = ({ total, email, currency, onComplete, color, formatPrice, agreeTerms, agreeData, onShowError, clientSecret }: { total: number, email: string, currency: string, onComplete: (paymentIntentId: string) => void, color: string, formatPrice: (n: number) => string, agreeTerms: boolean, agreeData: boolean, onShowError: (show: boolean) => void, clientSecret: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    if (!agreeTerms || !agreeData) {
      onShowError(true);
      const element = document.getElementById('requirement-agreements');
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    onShowError(false);

    setProcessing(true);
    setError(null);
    
    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout-complete`,
        },
        redirect: 'if_required'
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        setProcessing(false);
        onComplete(paymentIntent.id);
      } else {
        throw new Error("Payment authorization incomplete");
      }
    } catch (err: any) {
      console.error("Stripe Error:", err);
      setError(err.message || "A secure connection error occurred.");
      setProcessing(false);
    }
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit} 
      className="space-y-8 mt-6 relative px-3 py-8 md:p-10 bg-paper shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
    >
      <div className="absolute top-0 right-0 p-5 flex gap-2">
         <ShieldCheck size={14} className="text-emerald-700" strokeWidth={2} />
         <span className="text-[8px] uppercase font-bold tracking-[0.2em] text-emerald-700">Protected by Stripe</span>
      </div>
      
      <div className="space-y-4">
        <label className="block text-[9px] uppercase tracking-[0.3em] font-bold text-ink/40">Secure Payment Portal</label>
        <div className="group transition-all duration-500">
          <div className="p-3 md:p-5 bg-paper shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] focus-within:bg-paper focus-within:shadow-[inset_0_2px_20px_rgba(0,0,0,0.08)] transition-all duration-300">
             <PaymentElement options={{ 
                layout: {
                  type: 'tabs',
                  defaultCollapsed: false,
                },
                wallets: {
                  applePay: 'auto',
                  googlePay: 'auto',
                },
                terms: {
                  card: 'never',
                },
                business: {
                  name: 'Lash Glaze',
                }
             } as any} />
          </div>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="text-red-700 text-[10px] font-bold uppercase tracking-widest bg-red-50 p-4 shadow-[4px_0_0_0_inset_#b91c1c] mt-4"
        >
          {error}
        </motion.div>
      )}
      
      <button 
        type="submit" 
        disabled={!stripe || processing}
        className="w-full bg-ink text-paper hover:bg-ink/90 disabled:opacity-50 h-16 text-[10px] font-bold uppercase tracking-[0.4em] transition-all duration-500 shadow-2xl relative overflow-hidden group"
      >
        <span className="relative z-10">
          {processing ? 'Processing Securely...' : `Confirm Payment • ${formatPrice(total)}`}
        </span>
        <div className="absolute inset-0 bg-paper/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
      </button>
      
      <div className="flex justify-center gap-4 opacity-30 grayscale hover:grayscale-0 transition-all duration-500 items-center">
        <div className="text-[8px] font-bold tracking-widest uppercase">Digital Wallets</div>
        <div className="w-1 h-1 bg-ink/20 rounded-full" />
        <div className="text-[8px] font-bold tracking-widest uppercase">Cards</div>
        <div className="w-1 h-1 bg-ink/20 rounded-full" />
        <div className="text-[8px] font-bold tracking-widest uppercase">Global Pay</div>
      </div>
    </motion.form>
  );
};


interface CheckoutProps {
  onBack: () => void;
  onSuccessRedirect?: (orderId?: string) => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ onBack, onSuccessRedirect }) => {
  const { 
    cart, removeFromCart, updateCartQuantity, paymentMethods, clearCart, createOrder, 
    storeSettings, isCustomerLoggedIn, formatOrderNumber, user,
    shippingRegions, taxRules, coupons, saveCoupon
  } = useApp();
  const formatPrice = (amount: number) => formatPriceUtil(amount, storeSettings.currency);
  
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'United Kingdom'
  });
  
  const [step, setStep] = useState(1);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeData, setAgreeData] = useState(false);
  const [showError, setShowError] = useState(false);
  const [show3DSecure, setShow3DSecure] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubscription, setIsSubscription] = useState(false);
  const [subscriptionInterval, setSubscriptionInterval] = useState<'fortnightly' | 'monthly'>('fortnightly');
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  
  const [promoCode, setPromoCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [existingActiveSubscription, setExistingActiveSubscription] = useState<any>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [isFetchingSecret, setIsFetchingSecret] = useState(false);

  const enabledPayments = [...paymentMethods.filter(p => p.enabled)].sort((a, b) => {
    if (a.type === 'card') return -1;
    if (b.type === 'card') return 1;
    return 0;
  });
  
  useEffect(() => {
    // If no payment selected OR the selected one was disabled, auto-select first available
    const currentIsDisabled = selectedPaymentId && !enabledPayments.find(p => p.id === selectedPaymentId);
    if ((!selectedPaymentId || currentIsDisabled) && enabledPayments.length > 0) {
      setSelectedPaymentId(enabledPayments[0].id);
    }
  }, [paymentMethods, selectedPaymentId, enabledPayments]);

  useEffect(() => {
    // Reset Stripe secret when selection changes to avoid stale initialization
    setStripeClientSecret(null);
  }, [selectedPaymentId]);

  useEffect(() => {
    // Only auto-redirect if logged in, otherwise stay on success page to let guest save order number
    if (isSuccess && onSuccessRedirect && isCustomerLoggedIn) {
      const timer = setTimeout(() => {
        onSuccessRedirect(createdOrder?.id);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onSuccessRedirect, isCustomerLoggedIn]);

  useEffect(() => {
    const checkActiveSubscription = async () => {
      if (!user) return;
      setCheckingSubscription(true);
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('profile_id', user.id)
          .eq('status', 'active')
          .maybeSingle();
        
        if (data) {
          setExistingActiveSubscription(data);
          // If they already have a subscription, uncheck the toggle
          setIsSubscription(false);
        }
      } catch (err) {
        console.error('Error checking subscription:', err);
      } finally {
        setCheckingSubscription(false);
      }
    };

    if (isCustomerLoggedIn && user) {
      checkActiveSubscription();
    } else {
      setExistingActiveSubscription(null);
    }
  }, [isCustomerLoggedIn, user]);

  // Shipping Calculation
  const getSelectedRegion = () => {
    const region = shippingRegions.find(r => r.countries.some(c => c.toLowerCase() === customerInfo.country.toLowerCase())) 
                || shippingRegions.find(r => r.isDefault);
    return region;
  };

  const selectedRegion = getSelectedRegion();
  const shippingPrice = selectedRegion ? selectedRegion.shippingPrice : 0;

  // Tax Calculation
  const getTaxRate = () => {
    if (!selectedRegion) return 0;
    const rule = taxRules.find(r => r.regionId === selectedRegion.id) || taxRules.find(r => r.isGlobal);
    return rule ? rule.rate : 0;
  };

  const taxRate = getTaxRate();
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  // Discount Calculation
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
       discountAmount = subtotal * (appliedCoupon.discountValue / 100);
    } else if (appliedCoupon.discountType === 'fixed') {
       discountAmount = appliedCoupon.discountValue;
    } else if (appliedCoupon.discountType === 'bogo') {
       // 50% off benefitProductId if requiredProductId is also in cart
       const hasRequired = cart.some(item => item.id === appliedCoupon.requiredProductId);
       const benefitItem = cart.find(item => item.id === appliedCoupon.benefitProductId);
       if (hasRequired && benefitItem) {
          discountAmount = (benefitItem.price * 0.5); // 50% discount on 1 unit of benefit product
       }
    }
  }

  const subscriptionDiscount = isSubscription ? (subscriptionInterval === 'fortnightly' ? subtotal * 0.15 : subtotal * 0.10) : 0;
  const finalSubtotal = Math.max(0, subtotal - discountAmount - subscriptionDiscount);
  const taxAmount = finalSubtotal * (taxRate / 100);
  const total = finalSubtotal + shippingPrice + taxAmount;

  useEffect(() => {
    const fetchStripeSecret = async () => {
      const selectedMethod = paymentMethods.find(p => p.id === selectedPaymentId);
      if (selectedMethod?.type === 'card' && total > 0 && customerInfo.email) {
        setIsFetchingSecret(true);
        try {
          const currencyCode = storeSettings.currency === '£' ? 'gbp' : (storeSettings.currency === '$' ? 'usd' : 'eur');
          const { data, error } = await supabase.functions.invoke('stripe-payment', {
            body: { 
              amount: total, 
              currency: currencyCode, 
              email: customerInfo.email,
              isSubscription: false 
            }
          });
          if (data?.clientSecret) {
            setStripeClientSecret(data.clientSecret);
          }
        } catch (err) {
          console.error('Error fetching Stripe secret:', err);
        } finally {
          setIsFetchingSecret(false);
        }
      }
    };

    if (selectedPaymentId && paymentMethods.find(p => p.id === selectedPaymentId)?.type === 'card') {
      fetchStripeSecret();
    }
  }, [selectedPaymentId, total, customerInfo.email, storeSettings.currency]);

  // Shipping Calculation


  const handleApplyPromo = () => {
    setCouponError('');
    const coupon = coupons.find(c => c.code.toLowerCase() === promoCode.toLowerCase() && c.active);
    if (!coupon) {
      setCouponError('Invalid or expired codex.');
      return;
    }
    if (subtotal < coupon.minPurchase) {
      setCouponError(`Min threshold of ${formatPrice(coupon.minPurchase)} required.`);
      return;
    }
    setAppliedCoupon(coupon);
  };

  const handleFinalize = () => {
    if (isSubscription && !isCustomerLoggedIn) {
      // Trigger login first
      setIsAuthModalOpen(true);
      return;
    }

    if (!agreeTerms || !agreeData) {
      setShowError(true);
      return;
    }
    setShowError(false);
    
    // For Subscriptions, we use Stripe Checkout Session for production readiness
    if (isSubscription && selectedPaymentId && paymentMethods.find(p => p.id === selectedPaymentId)?.type === 'card') {
       handleSubscriptionRedirect();
       return;
    }

    setIsProcessing(true);
    // Simulate init for generic flows
    setTimeout(() => {
      setIsProcessing(false);
      setShow3DSecure(true);
    }, 1500);
  };

  const handleSubscriptionRedirect = async () => {
    setIsProcessing(true);
    try {
      const currencyCode = storeSettings.currency === '£' ? 'gbp' : (storeSettings.currency === '$' ? 'usd' : 'eur');
      
      const { data, error } = await supabase.functions.invoke('stripe-payment', {
        body: { 
          email: customerInfo.email,
          isSubscription: true,
          interval: subscriptionInterval,
          items: cart.map(item => ({ id: item.id, quantity: item.quantity })),
          currency: currencyCode,
          successUrl: `${window.location.origin}/checkout/success`,
          cancelUrl: window.location.origin
        }
      });

      if (error || !data?.url) throw new Error(data?.error || 'Failed to create subscription session');
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err: any) {
      console.error('Subscription error:', err);
      setIsError(true);
      setErrorMessage(err.message || 'Failed to initialize subscription replenishment.');
      setIsProcessing(false);
    }
  };

  const handleApproveAuth = async (paymentDetails?: { stripe_payment_intent_id?: string, paypal_order_id?: string, payment_method_id?: string }) => {
    setIsProcessing(true);
    
    try {
      const isTestPayment = paymentDetails?.payment_method_id && paymentMethods.find(p => p.id === paymentDetails.payment_method_id)?.type === 'test';
      const finalOrderTotal = (isTestPayment && isSubscription) ? 0 : total;

      const orderResult = await createOrder({
        customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        customer_email: customerInfo.email,
        total: finalOrderTotal,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        shipping_address: customerInfo.address,
        shipping_city: customerInfo.city,
        shipping_postal_code: customerInfo.postalCode,
        shipping_country: customerInfo.country,
        ...paymentDetails
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (orderResult) {
        setCreatedOrder(orderResult);
        
        // 2. If subscription, record it
        if (isSubscription) {
          try {
            // Get fresh user to ensure we link to the right profile
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            const profileIdToUse = (currentUser?.email?.toLowerCase() === customerInfo.email.toLowerCase()) ? currentUser?.id : 
                                 (user?.email?.toLowerCase() === customerInfo.email.toLowerCase()) ? user?.id : null;
            
            if (profileIdToUse) {
              const nextDate = new Date();
              nextDate.setDate(nextDate.getDate() + (subscriptionInterval === 'fortnightly' ? 14 : 30));
              
              const isTestPaymentMethod = paymentDetails?.payment_method_id && paymentMethods.find(p => p.id === paymentDetails.payment_method_id)?.type === 'test';
              const subscriptionTotal = isTestPaymentMethod ? 0 : total;

              console.log('Attempting subscription creation for:', profileIdToUse);
              const { data: subData, error: subError } = await supabase
                .from('subscriptions')
                .insert({
                  profile_id: profileIdToUse,
                  interval: subscriptionInterval,
                  total: subscriptionTotal,
                  status: 'active',
                  next_delivery_date: nextDate.toISOString()
                })
                .select();

              if (subError) {
                console.error('Subscription DB Error:', subError);
              } else {
                console.log('Subscription recorded successfully:', subData);
              }
            } else {
              console.warn('Subscription recording skipped: No profile ID resolved');
            }
          } catch (err) {
            console.error('Subscription logic exception:', err);
          }
        }

        setIsProcessing(false);
        setIsSuccess(true);
        clearCart();
      } else {
        setIsProcessing(false);
        setIsError(true);
        setErrorMessage('We encountered an issue while archiving your order data in our atelier. Your payment session has been suspended.');
      }
    } catch (err) {
      console.error('Finalize error:', err);
      setIsProcessing(false);
      setIsError(true);
      setErrorMessage('A cryptographic synchronization error occurred. Please verify your credentials or contact concierge support.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isError) {
    return (
      <div className="bg-paper min-h-[80vh] flex flex-col items-center justify-center px-4 py-24 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl bg-paper p-12 lg:p-20 shadow-[0_50px_100px_rgba(0,0,0,0.2)] relative overflow-hidden rounded-none"
        >
          <div className="absolute top-0 left-0 right-0 h-2 bg-red-800" />
          <AlertCircle size={48} className="mx-auto text-red-800 mb-8" strokeWidth={1} />
          <h2 className="font-serif text-4xl lg:text-5xl italic text-ink mb-4">Order Unsuccessful</h2>
          <p className="text-[10px] uppercase tracking-widest font-bold text-red-800 mb-8">Transaction Authorization Failed</p>
          
          <div className="bg-red-50/50 p-8 text-left space-y-4 mb-12 rounded-none shadow-[4px_0_0_0_inset_#991b1b]">
            <h3 className="text-[9px] uppercase tracking-widest font-bold text-red-900 pb-2">Status Report</h3>
            <p className="text-xs text-red-900/70 leading-relaxed font-bold">
              {errorMessage || 'Your card issuer or payment provider declined the transaction. This can occasionally happen due to high-security filters or mismatching address logistics.'}
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
             <button 
               onClick={() => { setIsError(false); setStep(1); }} 
               className="luxury-button-filled w-full"
             >
               Review Logistics & Retry
             </button>
             <button onClick={onBack} className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted hover:text-ink transition-colors">Return to Atelier</button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isSuccess && !show3DSecure) {
    const orderNum = createdOrder?.order_number ? formatOrderNumber(createdOrder.order_number) : (createdOrder?.orderNumber ? formatOrderNumber(createdOrder.orderNumber) : '#LG-PENDING');
    
    const handleCopy = () => {
      navigator.clipboard.writeText(orderNum);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="bg-topbarBg min-h-[80vh] flex flex-col items-center justify-center px-4 py-24 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl bg-topbarBg p-12 lg:p-20 shadow-[0_50px_100px_rgba(0,0,0,0.3)] relative overflow-hidden rounded-none"
        >
          <div className="absolute top-0 left-0 right-0 h-2 bg-green-600" />
          <CheckCircle2 size={48} className="mx-auto text-green-600 mb-8" strokeWidth={1} />
          <h2 className="font-serif text-4xl lg:text-5xl italic text-topbarText mb-4">Order Confirmed</h2>
          <p className="text-[10px] uppercase tracking-widest font-bold text-topbarText opacity-40 mb-2">Reference ID: {orderNum}</p>
          
          <div className="flex items-center justify-center gap-2 mb-12">
            <div className="h-[2px] w-4 bg-green-600 animate-pulse" />
            <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-green-600/80">
              {isCustomerLoggedIn ? 'Securing your atelier profile... tracking order in 1s' : 'Order finalized successfully'}
            </p>
            <div className="h-[2px] w-4 bg-green-600 animate-pulse" />
          </div>

          {!isCustomerLoggedIn && (
            <div className="bg-accent/10 p-10 mb-12 text-left relative overflow-hidden shadow-inner">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Package size={80} strokeWidth={1} />
               </div>
               <h3 className="text-[10px] uppercase tracking-widest font-bold text-topbarText mb-4">Guest Reference Required</h3>
               <p className="text-xs text-topbarText/70 leading-relaxed max-w-sm mb-8">
                 As you have checked out as a guest, please secure this reference number to track your journey in our logistics portal. This will not be accessible once you leave this session.
               </p>
               <div className="flex gap-4">
                  <div className="bg-topbarBg shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] px-6 py-4 flex-grow font-mono text-sm font-bold flex items-center justify-between">
                     {orderNum}
                     <button 
                       onClick={handleCopy}
                       className="text-topbarText/40 hover:text-gold transition-colors ml-4"
                     >
                        {copied ? 'COPIED' : <Copy size={16} />}
                     </button>
                  </div>
               </div>
            </div>
          )}
          
          <div className="bg-accent/5 p-8 text-left space-y-4 mb-12 rounded-none">
            <h3 className="text-[9px] uppercase tracking-widest font-bold text-topbarText pb-4">Order Overview</h3>
            <div className="flex justify-between text-xs py-2">
               <span className="text-topbarText/60">Total Paid</span>
               <span className="font-bold text-topbarText">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-xs py-2">
               <span className="text-topbarText/60">Fulfillment</span>
               <span className="text-topbarText">Standard Processing (1-2 days)</span>
            </div>
          </div>
          
          <p className="text-sm text-topbarText/70 leading-relaxed mb-12">
            A secure confirmation has been dispatched to your email. You will receive cryptographic tracking details once your order leaves our atelier.
          </p>

          <button onClick={onBack} className="luxury-button-filled w-full font-bold">Return to Storefront</button>
        </motion.div>
      </div>
    );
  }

  if (cart.length === 0 && !isSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-8 px-4 text-center bg-paper">
        <h2 className="font-serif text-5xl italic text-ink">Your bag is empty</h2>
        <p className="text-muted tracking-[0.4em] uppercase text-[10px] font-bold">Ready to find your perfect pair?</p>
        <button onClick={onBack} className="luxury-button">Begin Shopping</button>
      </div>
    );
  }

  return (
    <div className="bg-paper min-h-screen py-8 lg:py-24 px-2 md:px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left Column: Form / Steps */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-8 md:space-y-12">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-muted hover:text-ink transition-colors text-[10px] uppercase tracking-[0.2em] font-bold"
          >
            <ChevronLeft size={16} /> Continue Shopping
          </button>

          <div className="space-y-20">
            <section>
              <div className="flex items-center gap-6 mb-10">
                 <div className="w-10 h-10 flex items-center justify-center text-xs font-bold bg-accent/10 rounded-none italic serif shadow-sm">01</div>
                 <h2 className="text-[11px] uppercase tracking-[0.3em] font-bold">Contact Profile</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input 
                  type="text" 
                  placeholder="First Name" 
                  value={customerInfo.firstName}
                  onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                  className="bg-accent/10 text-ink placeholder:text-muted/40 px-6 py-5 text-xs font-bold uppercase tracking-widest focus:outline-none shadow-inner transition-all" 
                />
                <input 
                  type="text" 
                  placeholder="Last Name" 
                  value={customerInfo.lastName}
                  onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                  className="bg-accent/10 text-ink placeholder:text-muted/40 px-6 py-5 text-xs font-bold uppercase tracking-widest focus:outline-none shadow-inner transition-all" 
                />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                  className="bg-accent/10 text-ink placeholder:text-muted/40 px-6 py-5 text-xs font-bold uppercase tracking-widest focus:outline-none shadow-inner transition-all md:col-span-2" 
                />
              </div>
            </section>

            <section>
              <div className="flex items-center gap-6 mb-10">
                 <div className="w-10 h-10 flex items-center justify-center text-xs font-bold bg-accent/10 rounded-none italic serif shadow-sm">02</div>
                 <h2 className="text-[11px] uppercase tracking-[0.3em] font-bold">Shipping Logistics</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input 
                   type="text" 
                   placeholder="Street Address" 
                   value={customerInfo.address}
                   onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                   className="bg-accent/10 text-ink placeholder:text-muted/40 px-6 py-5 text-xs font-bold uppercase tracking-widest focus:outline-none shadow-inner transition-all md:col-span-2" 
                />
                <input type="text" placeholder="Apt, Suite, Room (Optional)" className="bg-accent/10 text-ink placeholder:text-muted/40 px-6 py-5 text-xs font-bold uppercase tracking-widest focus:outline-none shadow-inner transition-all md:col-span-2" />
                <input 
                  type="text" 
                  placeholder="City" 
                  value={customerInfo.city}
                  onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                  className="bg-accent/10 text-ink placeholder:text-muted/40 px-6 py-5 text-xs font-bold uppercase tracking-widest focus:outline-none shadow-inner transition-all" 
                />
                <input 
                  type="text" 
                  placeholder="Postal Code" 
                  value={customerInfo.postalCode}
                  onChange={(e) => setCustomerInfo({...customerInfo, postalCode: e.target.value})}
                  className="bg-accent/10 text-ink placeholder:text-muted/40 px-6 py-5 text-xs font-bold uppercase tracking-widest focus:outline-none shadow-inner transition-all" 
                />
                <select 
                  value={customerInfo.country}
                  onChange={(e) => setCustomerInfo({...customerInfo, country: e.target.value})}
                  className="bg-accent/10 text-ink px-6 py-5 text-xs font-bold uppercase tracking-widest focus:outline-none shadow-inner transition-all appearance-none"
                >
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United States">United States</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Italy">Italy</option>
                  <option value="Ireland">Ireland</option>
                  <option value="Australia">Australia</option>
                  <option value="Canada">Canada</option>
                  <option value="Japan">Japan</option>
                  <option value="Switzerland">Switzerland</option>
                  <option value="Spain">Spain</option>
                  <option value="New Zealand">New Zealand</option>
                  <option value="Norway">Norway</option>
                  <option value="Netherlands">Netherlands</option>
                  <option value="China">China</option>
                  <option value="United Arab Emirates">UAE</option>
                  <option value="Other">Other (Worldwide)</option>
                </select>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-6 mb-10">
                 <div className="w-10 h-10 flex items-center justify-center text-xs font-bold bg-accent/10 rounded-none italic serif shadow-sm">03</div>
                 <h2 className="text-[11px] uppercase tracking-[0.3em] font-bold">Delivery Priority</h2>
              </div>
              <div className="space-y-4">
                <div className="p-6 bg-accent/10 flex justify-between items-center group shadow-sm">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-paper flex items-center justify-center text-gold">
                         <Ship size={18} />
                      </div>
                      <div>
                         <p className="text-[10px] uppercase font-bold tracking-widest">{selectedRegion?.name || 'Standard Courier'}</p>
                         <p className="text-[8px] text-muted uppercase mt-1">Priority handling to {customerInfo.country}</p>
                      </div>
                   </div>
                   <span className="text-sm font-bold text-ink">{formatPrice(shippingPrice)}</span>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-6 mb-10">
                 <div className="w-10 h-10 flex items-center justify-center text-xs font-bold bg-accent/10 rounded-none italic serif shadow-sm">04</div>
                 <h2 className="text-[11px] uppercase tracking-[0.3em] font-bold">Replenishment Profile</h2>
              </div>
              <div className="space-y-4">
                 <div className={`transition-all rounded-none shadow-sm ${isSubscription ? 'bg-accent/10 shadow-xl' : 'bg-accent/5'}`}>
                    <button 
                      onClick={() => {
                        if (!existingActiveSubscription) {
                          setIsSubscription(!isSubscription);
                        }
                      }}
                      disabled={!!existingActiveSubscription}
                      className={`w-full flex justify-between items-center px-4 md:px-8 py-6 transition-all rounded-none ${
                        isSubscription ? 'bg-ink text-paper shadow-xl' : 'hover:bg-accent/10'
                      } ${existingActiveSubscription ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                       <div className="flex items-center gap-4">
                          <div className={`w-4 h-4 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] ${isSubscription ? 'bg-paper shadow-none' : 'bg-paper/50'} flex items-center justify-center`}>
                            {isSubscription && <div className="w-2 h-2 bg-ink rounded-full" />}
                            {existingActiveSubscription && <Check size={10} className="text-emerald-500" />}
                          </div>
                          <div className="text-left">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold block">
                              {existingActiveSubscription ? 'Active Subscription Secured' : 'Subscribe & Save'}
                            </span>
                            <span className="text-[8px] uppercase tracking-widest opacity-50 block mt-1">
                              {existingActiveSubscription 
                                ? `Already enrolled in ${existingActiveSubscription.interval} replenishment`
                                : 'Automated order delivered to your atelier'}
                            </span>
                          </div>
                       </div>
                       <div className="text-right">
                          <span className={`text-[10px] font-mono font-bold italic ${isSubscription ? 'text-paper' : 'text-gold'}`}>
                            {existingActiveSubscription ? 'Priority Status Active' : 'Up to 15% Savings'}
                          </span>
                       </div>
                    </button>

                    <AnimatePresence>
                      {isSubscription && !existingActiveSubscription && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-8 pb-8 pt-4 space-y-6">
                             <div className="grid grid-cols-2 gap-6">
                                <button 
                                  onClick={() => setSubscriptionInterval('fortnightly')}
                                  className={`flex flex-col p-6 text-left transition-all rounded-none shadow-sm ${subscriptionInterval === 'fortnightly' ? 'bg-paper text-ink shadow-md' : 'bg-transparent opacity-60 hover:opacity-100'}`}
                                >
                                   <span className="text-[10px] uppercase tracking-tighter font-bold mb-2">Every 2 Weeks</span>
                                   <span className="text-xs font-mono font-bold">15% Discount</span>
                                   <span className="text-[8px] uppercase tracking-widest opacity-40 mt-2 italic">Priority Processing</span>
                                </button>
                                <button 
                                  onClick={() => setSubscriptionInterval('monthly')}
                                  className={`flex flex-col p-6 text-left transition-all rounded-none shadow-sm ${subscriptionInterval === 'monthly' ? 'bg-paper text-ink shadow-md' : 'bg-transparent opacity-60 hover:opacity-100'}`}
                                >
                                   <span className="text-[10px] uppercase tracking-tighter font-bold mb-2">Every 4 Weeks</span>
                                   <span className="text-xs font-mono font-bold">10% Discount</span>
                                   <span className="text-[8px] uppercase tracking-widest opacity-40 mt-2 italic">Standard Processing</span>
                                </button>
                             </div>
                             <p className="text-[9px] text-muted italic serif max-w-md">
                                Subscription members receive exclusive priority access to future drops and limited editions. Cancel or modify your cycle at any time via your customer profile.
                             </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {existingActiveSubscription && (
                       <div className="px-8 pb-8 pt-2">
                          <p className="text-[9px] text-emerald-700/60 font-bold uppercase tracking-widest">
                             Note: You may only maintain one active replenishment cycle at a time to ensure exclusive priority remains available for all atelier members.
                          </p>
                       </div>
                    )}
                 </div>
              </div>
            </section>

            <section id="requirement-agreements" className="space-y-8 bg-accent/5 p-8 shadow-inner">
               <div className="flex items-center gap-4 mb-2">
                  <Lock size={14} className="text-muted" />
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-ink">Requirement Agreements</h3>
               </div>
               
               <div className="space-y-8">
                  <label className="flex items-start gap-5 cursor-pointer group">
                    <div className="luxe-checkbox mt-1">
                      <input 
                        type="checkbox" 
                        checked={agreeTerms}
                        onChange={(e) => {
                          setAgreeTerms(e.target.checked);
                          if (e.target.checked && agreeData) setShowError(false);
                        }}
                      />
                      <div className="luxe-checkbox-inner">
                        <Check size={14} className="text-paper" strokeWidth={3} />
                      </div>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] leading-relaxed text-muted group-hover:text-ink transition-colors flex-grow">
                      I agree to the Terms of Service and Return Policy. I acknowledge that lashes removed from their original tray cannot be returned due to hygiene regulations.
                    </span>
                  </label>
                  
                  <label className="flex items-start gap-5 cursor-pointer group">
                    <div className="luxe-checkbox mt-1">
                      <input 
                        type="checkbox" 
                        checked={agreeData}
                        onChange={(e) => {
                          setAgreeData(e.target.checked);
                          if (e.target.checked && agreeTerms) setShowError(false);
                        }}
                      />
                      <div className="luxe-checkbox-inner">
                        <Check size={14} className="text-paper" strokeWidth={3} />
                      </div>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] leading-relaxed text-muted group-hover:text-ink transition-colors flex-grow">
                      I consent to the secure processing of my personal data for order fulfillment as outlined in the Privacy Policy.
                    </span>
                  </label>
               </div>

               {showError && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 text-red-700 text-[10px] font-bold uppercase tracking-widest bg-red-50 p-5 shadow-lg"
                  >
                     <AlertCircle size={14} /> 
                     Please accept all requirement agreements to finalize.
                  </motion.div>
               )}
            </section>

            <section>
              <div className="flex items-center gap-6 mb-10">
                 <div className="w-10 h-10 flex items-center justify-center text-xs font-bold bg-accent/10 rounded-none italic serif shadow-sm">05</div>
                 <h2 className="text-[11px] uppercase tracking-[0.3em] font-bold">Financial Selection</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 {enabledPayments.map(p => (
                   <button 
                     key={p.id} 
                     onClick={() => setSelectedPaymentId(p.id)}
                     className={`p-4 md:p-8 transition-all flex flex-col items-center gap-4 group shadow-sm hover:shadow-xl ${
                       selectedPaymentId === p.id ? 'bg-ink text-paper shadow-xl' : 'bg-accent/5 hover:bg-accent/10'
                     }`}
                   >
                      <div className={`transition-colors ${selectedPaymentId === p.id ? 'text-paper' : 'text-muted group-hover:text-ink'}`}>
                        {p.type === 'card' && <CreditCard size={20} />}
                        {p.type === 'paypal' && <Ship size={20} />}
                        {p.type === 'klarna' && <Lock size={20} />}
                        {p.type === 'test' && <Beaker size={20} />}
                      </div>
                      <span className="text-[9px] uppercase font-bold tracking-[0.2em]">{p.name}</span>
                   </button>
                 ))}
              </div>

              {/* Dynamic Payment Method UI */}
              <div className="bg-accent/5 px-0 py-6 md:p-6 shadow-inner min-h-[150px]">
                 {selectedPaymentId && (
                    <>
                       {paymentMethods.find(p => p.id === selectedPaymentId)?.type === 'paypal' && (
                         <div className="flex flex-col items-center justify-center h-full">
                           <div className="w-full max-w-sm">
                             <PayPalScriptProvider options={{ clientId: (import.meta as any).env.VITE_PAYPAL_CLIENT_ID || "test", currency: storeSettings.currency === '£' ? 'GBP' : (storeSettings.currency === '$' ? 'USD' : 'EUR') }}>
                               <PayPalButtons style={{ layout: "vertical", shape: "rect", color: "black" }} 
                                 onClick={(data, actions) => {
                                   if (!agreeTerms || !agreeData) {
                                     setShowError(true);
                                     const element = document.getElementById('requirement-agreements');
                                     if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                     return actions.reject();
                                   }
                                   return actions.resolve();
                                 }}
                                 createOrder={(data, actions) => {
                                   return actions.order.create({
                                     intent: "CAPTURE",
                                     purchase_units: [{ amount: { value: total.toString(), currency_code: storeSettings.currency === '£' ? 'GBP' : (storeSettings.currency === '$' ? 'USD' : 'EUR') } }]
                                   });
                                 }}
                                 onApprove={async (data, actions) => {
                                   if (actions.order) {
                                     const details = await actions.order.capture();
                                     handleApproveAuth({ 
                                       paypal_order_id: details.id, 
                                       payment_method_id: selectedPaymentId || undefined 
                                     });
                                   }
                                 }}
                               />
                             </PayPalScriptProvider>
                           </div>
                         </div>
                       )}

                       {paymentMethods.find(p => p.id === selectedPaymentId)?.type === 'klarna' && (
                         <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-8">
                            <Lock size={32} className="text-muted" strokeWidth={1} />
                            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-ink">Pay Later with Klarna</p>
                            <p className="text-xs text-muted max-w-xs leading-relaxed">You will be redirected to Klarna to complete your purchase securely.</p>
                         </div>
                       )}
                       
                       {paymentMethods.find(p => p.id === selectedPaymentId)?.type === 'card' && (
                          <div className="w-full">
                            {isFetchingSecret ? (
                              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                 <div className="w-8 h-8 border-2 border-ink/10 border-t-ink rounded-full animate-spin" />
                                 <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-ink/40">Securing Payment Tunnel...</p>
                              </div>
                            ) : (stripeClientSecret && stripeClientSecret.startsWith('pi_')) ? (
                                 <Elements 
                                   key={stripeClientSecret} 
                                   stripe={stripePromise} 
                                   options={{ 
                                     clientSecret: stripeClientSecret,
                                     appearance: {
                                       theme: 'night',
                                       variables: {
                                         fontFamily: 'Inter, system-ui, sans-serif',
                                         colorText: storeSettings.colors.ink,
                                         colorBackground: storeSettings.colors.paper,
                                         colorPrimary: storeSettings.colors.gold || '#D4AF37',
                                         colorDanger: '#df1b41',
                                         spacingUnit: '4px',
                                         borderRadius: '0px',
                                       },
                                       rules: {
                                         '.Input': {
                                           border: 'none',
                                           boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)',
                                           backgroundColor: 'rgba(0,0,0,0.02)',
                                         },
                                         '.Tab': {
                                           border: 'none',
                                           boxShadow: 'none',
                                         },
                                         '.Tab:hover': {
                                           backgroundColor: 'rgba(0,0,0,0.05)',
                                         },
                                         '.Tab--selected': {
                                           backgroundColor: storeSettings.colors.ink,
                                           color: storeSettings.colors.paper,
                                         }
                                       }
                                     } as any
                                   }}
                                 >
                                 <StripeCheckoutForm 
                                   total={total} 
                                   email={customerInfo.email}
                                   currency={storeSettings.currency}
                                   onComplete={(piid) => handleApproveAuth({ 
                                     stripe_payment_intent_id: piid, 
                                     payment_method_id: selectedPaymentId || undefined 
                                   })} 
                                   color={storeSettings.colors.ink} 
                                   formatPrice={formatPrice}
                                   agreeTerms={agreeTerms}
                                   agreeData={agreeData}
                                   onShowError={setShowError}
                                   clientSecret={stripeClientSecret}
                                 />
                               </Elements>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-10 text-center">
                                 <AlertCircle size={24} className="text-muted mb-4 opacity-20" strokeWidth={1} />
                                 <p className="text-[9px] text-muted max-w-xs leading-relaxed uppercase font-bold tracking-[0.3em]">
                                    {total <= 0 
                                      ? "Order Total must be greater than zero to initialize gateway"
                                      : !customerInfo.email 
                                        ? "Please provide your email address above to unlock secure payment methods."
                                        : "Waiting for secure connection to Stripe..."}
                                 </p>
                              </div>
                            )}
                          </div>
                        )}

                       {paymentMethods.find(p => p.id === selectedPaymentId)?.type === 'test' && (
                         <div className="flex flex-col items-center justify-center h-full text-center py-8 bg-amber-50">
                            <Beaker size={32} className="text-amber-800 mb-4" strokeWidth={1} />
                            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-amber-900 pb-2">Developer Test Environment</p>
                            <p className="text-xs text-amber-800/70 max-w-xs leading-relaxed">No real charges will be made. Click 'Finalize Order' to simulate a successful payment.</p>
                         </div>
                       )}
                    </>
                 )}
              </div>
            </section>


            {selectedPaymentId && paymentMethods.find(p => p.id === selectedPaymentId)?.type !== 'paypal' && paymentMethods.find(p => p.id === selectedPaymentId)?.type !== 'card' && (
              <button 
                onClick={handleFinalize}
                disabled={isProcessing}
               className="w-full bg-ink text-paper py-7 text-xs font-bold uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(0,0,0,0.2)] disabled:opacity-50 border-none relative overflow-hidden group"
              >
                <span className="relative z-10">{isProcessing ? 'Initializing Payment...' : 'Finalize order'}</span>
                <div className="absolute inset-0 bg-gold/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-12 xl:col-span-5">
           <div className="sticky top-32 bg-accent/5 p-8 lg:p-12 space-y-12 shadow-2xl">
              <div className="flex flex-col gap-4">
                 <h2 className="font-serif text-3xl italic text-ink">Bag Summary</h2>
                 <div className="flex gap-2">
                    <input 
                       type="text" 
                       placeholder="PROMO CODE" 
                       value={promoCode}
                       onChange={e => setPromoCode(e.target.value.toUpperCase())}
                       className="bg-paper flex-grow px-4 py-3 text-[10px] font-bold tracking-widest outline-none border-b border-accent/10 focus:border-gold transition-colors"
                    />
                    <button onClick={handleApplyPromo} className="px-6 bg-ink text-paper text-[9px] font-bold uppercase tracking-widest hover:bg-gold transition-all">Apply</button>
                 </div>
                 {couponError && <p className="text-[9px] text-red-600 font-bold uppercase tracking-widest">{couponError}</p>}
                 {appliedCoupon && <p className="text-[9px] text-green-600 font-bold uppercase tracking-widest flex items-center gap-2"><CheckCircle2 size={10}/> Applied: {appliedCoupon.code}</p>}
              </div>
              
              <div className="space-y-10 max-h-[40vh] overflow-y-auto no-scrollbar pr-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-8">
                    <div className="w-24 aspect-[4/5] bg-paper p-1 shrink-0 rounded-none shadow-xl relative">
                      {item.preOrderEnabled && (
                        <div className="absolute top-2 left-2 z-10 bg-gold text-paper px-2 py-0.5 text-[7px] font-bold uppercase tracking-widest">
                          Pre
                        </div>
                      )}
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale-[10%] rounded-none" />
                    </div>
                    <div className="flex-grow flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-serif text-xl italic text-ink">{item.name}</h3>
                          <button onClick={() => removeFromCart(item.id)} className="text-muted hover:text-ink transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-muted mt-2">
                          {item.preOrderEnabled ? (
                            <span className="text-gold">Pre-order Edition</span>
                          ) : 'Glaze Series Profile'}
                        </p>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest px-4 py-2 bg-paper shadow-[0_5px_15px_rgba(0,0,0,0.05)]">
                          <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="text-ink/40 hover:text-ink transition-all active:scale-90">-</button>
                          <span className="text-ink w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="text-ink/40 hover:text-ink transition-all active:scale-90">+</button>
                        </div>
                        <p className="text-sm font-bold text-ink">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6 pt-12 shadow-[0_-1px_0_rgba(0,0,0,0.05)]">
                <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] font-bold text-muted">
                   <span>Logistics</span>
                   <span className="text-ink">{formatPrice(shippingPrice)}</span>
                </div>
                {discountAmount > 0 && (
                   <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] font-bold text-green-600">
                      <span>Applied Offer</span>
                      <span>-{formatPrice(discountAmount)}</span>
                   </div>
                )}
                {isSubscription && (
                  <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] font-bold text-gold">
                    <span>Membership Discount</span>
                    <span>-{formatPrice(subscriptionDiscount)}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                   <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] font-bold text-muted">
                      <span>Estimated Tax ({taxRate}%)</span>
                      <span className="text-ink">{formatPrice(taxAmount)}</span>
                   </div>
                )}
                <div className="flex justify-between text-ink p-6 bg-ink/5 mt-6 shadow-inner">
                   <span className="text-xs uppercase tracking-[0.4em] font-bold">Total Due</span>
                   <span className="text-2xl font-bold">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.4em] text-muted justify-center font-bold">
                 <Lock size={12} /> Secure Encryption Active
              </div>

              {cart.some(item => item.preOrderEnabled) && (
                <div className="pt-6 mt-6 bg-gold/5 p-6 flex gap-4 items-start shadow-inner">
                   <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                      <Clock size={14} className="text-gold" />
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] uppercase font-bold text-gold tracking-widest">Pre-order Notice</p>
                      <p className="text-[8px] leading-relaxed text-muted uppercase tracking-widest italic">
                        Your bag contains pre-order items. These will ship once the official window opens. See product pages for specific dates.
                      </p>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* 3D Secure Verification Modal */}
      <AnimatePresence>
        {show3DSecure && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-ink/40 backdrop-blur-md"
              onClick={() => { setShow3DSecure(false); setIsProcessing(false); }}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-paper max-w-lg w-full shadow-[0_60px_120px_rgba(0,0,0,0.4)] relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gold overflow-hidden">
                <motion.div 
                  className="h-full bg-ink w-1/3"
                  animate={{ x: ['-100%', '300%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </div>

              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-accent/20 flex items-center justify-center mx-auto mb-8">
                  <ShieldCheck size={32} className="text-ink" strokeWidth={1} />
                </div>
                
                {isSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 text-center"
                  >
                    <CheckCircle2 size={48} className="mx-auto text-green-600 mb-6" strokeWidth={1} />
                    <h3 className="font-serif text-3xl italic text-ink mb-2">Order Confirmed</h3>
                    <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-muted mb-8">Reference ID: {createdOrder?.order_number ? formatOrderNumber(createdOrder.order_number) : '#LG-PENDING'}</p>
                    
                    <div className="bg-accent/5 p-8 mb-8 space-y-4 text-left">
                       <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
                          <span className="text-muted">Status</span>
                          <span className="text-green-600">Finalized</span>
                       </div>
                       <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
                          <span className="text-muted">Courier</span>
                          <span className="text-ink">Expedited Atelier</span>
                       </div>
                       <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold pt-4 border-t border-ink/5">
                          <span className="text-muted">Total Paid</span>
                          <span className="text-ink">{formatPrice(total)}</span>
                       </div>
                    </div>

                    <button 
                      onClick={() => { setShow3DSecure(false); onBack(); }}
                      className="bg-ink text-paper py-5 w-full text-[10px] font-bold uppercase tracking-[0.4em] shadow-xl hover:bg-ink/90 transition-all"
                    >
                       Return to Storefront
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <h3 className="font-serif text-2xl italic text-ink mb-2">Secure Authentication</h3>
                    <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-muted mb-8">Authorization Request Sent to Bank</p>
                    
                    <div className="bg-paper shadow-[inset_0_2px_15px_rgba(0,0,0,0.05)] p-6 mb-8">
                      <p className="text-[8px] uppercase font-bold tracking-widest text-muted mb-1">Merchant</p>
                      <p className="text-xs font-bold text-ink mb-4">Lash Glaze</p>
                      <p className="text-[8px] uppercase font-bold tracking-widest text-muted mb-1">Amount Due</p>
                      <p className="text-2xl font-bold font-serif italic">
                         {selectedPaymentId && paymentMethods.find(p => p.id === selectedPaymentId)?.type === 'test' && isSubscription 
                           ? formatPrice(0) 
                           : formatPrice(total)}
                       </p>
                    </div>

                    <div className="flex flex-col gap-3">
                       <button 
                         onClick={() => handleApproveAuth({ payment_method_id: selectedPaymentId || undefined })}
                         className="bg-ink text-paper py-5 text-[9px] font-bold uppercase tracking-[0.4em] hover:bg-ink/90 transition-all shadow-xl"
                       >
                         Verify Transaction
                       </button>
                       <button 
                         onClick={() => { setShow3DSecure(false); setIsProcessing(false); }}
                         className="text-[8px] uppercase tracking-[0.2em] font-bold text-muted hover:text-red-700 transition-colors py-2"
                       >
                         Decline & Return
                       </button>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-4 border-t border-ink/5 pt-8">
                       <span className="text-[8px] font-bold tracking-widest opacity-30">PCI DSS COMPLIANT</span>
                       <div className="w-1 h-1 bg-ink/10 rounded-full" />
                       <span className="text-[8px] font-bold tracking-widest opacity-30">TLS 1.3 ENCRYPTION</span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

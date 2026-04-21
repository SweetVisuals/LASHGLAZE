/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Order, Customer, PaymentMethod, StoreSettings, ShippingRegion, TaxRule, Coupon, Policy } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../data';

import { supabase } from '../supabase';
import { Database } from '../types/database';
import { formatPrice as formatPriceUtil } from '../utils/format';

interface CartItem extends Product {
  quantity: number;
}

interface AppContextType {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  paymentMethods: PaymentMethod[];
  shippingRegions: ShippingRegion[];
  taxRules: TaxRule[];
  categories: Category[];
  coupons: Coupon[];
  policies: Policy[];
  cart: CartItem[];
  
  setProducts: (products: Product[]) => void;
  setOrders: (orders: Order[]) => void;
  setPaymentMethods: (methods: PaymentMethod[]) => void;
  setShippingRegions: (regions: ShippingRegion[]) => void;
  setTaxRules: (rules: TaxRule[]) => void;
  setCoupons: (coupons: Coupon[]) => void;
  setPolicies: (policies: Policy[]) => void;
  setStoreSettings: (settings: StoreSettings) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  loginAsAdmin: () => void;
  logout: () => void;
  loginCustomer: () => void;
  logoutCustomer: () => void;
  updateStoreSettings: (settings: StoreSettings) => Promise<void>;
  saveProduct: (product: Product) => Promise<void>;
  deleteProductFromDb: (id: string) => Promise<void>;
  formatPrice: (amount: number) => string;
  signInWithGoogle: () => Promise<void>;
  togglePaymentMethod: (id: string, enabled: boolean) => Promise<void>;
  saveCategory: (name: string, id?: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  saveShippingRegion: (region: ShippingRegion) => Promise<void>;
  deleteShippingRegion: (id: string) => Promise<void>;
  saveTaxRule: (rule: TaxRule) => Promise<void>;
  deleteTaxRule: (id: string) => Promise<void>;
  saveCoupon: (coupon: Coupon) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  savePolicy: (policy: Policy) => Promise<void>;
  createOrder: (orderData: { customer_name: string, customer_email: string, total: number, items: { product_id: string, quantity: number, price: number }[] }) => Promise<any | null>;
  deleteOrder: (orderId: string) => Promise<boolean>;
  formatOrderNumber: (num?: number) => string;
  isInitialLoading: boolean;
  isAdmin: boolean;
  isCustomerLoggedIn: boolean;
  storeSettings: StoreSettings;
  user: any | null;
  dropExpiry: Date;
  isDropActive: boolean;
}


const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [shippingRegions, setShippingRegions] = useState<ShippingRegion[]>([]);
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(false);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [user, setUser] = useState<any>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  
  useEffect(() => {
    const checkAdmin = async (userId: string, email: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      return data?.role === 'admin' || email === 'admin@lashglaze.com';
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsCustomerLoggedIn(!!session?.user);
      
      if (session?.user) {
        checkAdmin(session.user.id, session.user.email || '').then(isActuallyAdmin => {
          setIsAdmin(isActuallyAdmin);
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsCustomerLoggedIn(!!session?.user);
      
      if (session?.user) {
        checkAdmin(session.user.id, session.user.email || '').then(isActuallyAdmin => {
          setIsAdmin(isActuallyAdmin);
        });
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    const initializeStore = async () => {
      try {
        // Fetch Settings
        const { data: settingsData } = await supabase
          .from('store_settings')
          .select('*')
          .single();
        
        if (settingsData) {
          setStoreSettings({
            name: settingsData.name,
            currency: settingsData.currency || '£',
            logo: settingsData.logo || '',
            heroBannerUrl: settingsData.hero_banner_url || INITIAL_SETTINGS.heroBannerUrl,
            instagramUrl: settingsData.instagram_url || INITIAL_SETTINGS.instagramUrl,
            tiktokUrl: settingsData.tiktok_url || INITIAL_SETTINGS.tiktokUrl,
            colors: (settingsData.colors as any) || INITIAL_SETTINGS.colors
          });
        }

        // Fetch Products
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (productsData) {
          setProducts(productsData.map(p => ({
            ...p,
            salePrice: p.sale_price ?? undefined,
            variants: (p.variants as any) || undefined,
            preOrderEnabled: p.pre_order_enabled ?? false,
            preOrderEndsAt: p.pre_order_ends_at ?? undefined,
            preOrderPrice: p.pre_order_price ?? undefined,
            limitedTimeEnabled: p.limited_time_enabled ?? false,
            limitedTimeEndsAt: p.limited_time_ends_at ?? undefined
          })) as any);
        }

        // Fetch Shipping Regions
        const { data: regionsData } = await supabase
          .from('shipping_regions')
          .select('*')
          .order('name');
        
        if (regionsData) {
          setShippingRegions(regionsData.map(r => ({
            id: r.id,
            name: r.name,
            countries: r.countries || [],
            shippingPrice: r.shipping_price,
            isDefault: r.is_default
          })));
        }

        // Fetch Tax Rules
        const { data: taxData } = await supabase
          .from('tax_rules')
          .select('*')
          .order('name');
        
        if (taxData) {
          setTaxRules(taxData.map(t => ({
            id: t.id,
            name: t.name,
            rate: t.rate,
            regionId: t.region_id,
            isGlobal: t.is_global
          })));
        }

        // Fetch Coupons
        const { data: couponsData } = await supabase
          .from('coupons')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (couponsData) {
          setCoupons(couponsData.map(c => ({
            id: c.id,
            code: c.code,
            discountType: c.discount_type as any,
            discountValue: c.discount_value,
            minPurchase: c.min_purchase,
            requiredProductId: c.required_product_id,
            benefitProductId: c.benefit_product_id,
            active: c.active,
            expiryDate: c.expiry_date,
            usageCount: c.usage_count || 0
          })));
        }

        // Fetch Policies
        const { data: policiesData } = await supabase
          .from('policies')
          .select('*')
          .order('type');
        
        if (policiesData) {
          setPolicies(policiesData.map(p => ({
             id: p.id,
             type: p.type as any,
             content: p.content,
             published: p.published,
             updatedAt: p.updated_at
          })));
        }

        // Fetch Payment Methods
        const { data: paymentData } = await supabase
          .from('payment_methods')
          .select('*');
          
        if (paymentData) {
          setPaymentMethods(paymentData as any);
        }

        // Fetch Categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (categoriesData) {
          setCategories(categoriesData as any);
        }
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    initializeStore().then(() => {
      // Small delay to ensure the theme useEffect has a chance to execute
      setTimeout(() => setIsInitialLoading(false), 500);
    });
  }, []);

  // Fetch Data Based on Auth State
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setOrders([]);
        setCustomers([]);
        return;
      }

      try {
        if (isAdmin) {
          // Admin: Fetch all data
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('*');
          
          const { data: ordersData } = await supabase
            .from('orders')
            .select(`
              id, profile_id, customer_name, total, status, created_at, order_number,
              order_items ( product_id, quantity, price )
            `)
            .order('created_at', { ascending: false });
          
          let fetchedOrders: any[] = [];
          if (ordersData) {
            fetchedOrders = ordersData.map((o: any) => ({
              id: o.id,
              orderNumber: o.order_number,
              customerId: o.profile_id,
              customerName: o.customer_name || 'Anonymous',
              total: o.total,
              status: o.status as any,
              createdAt: o.created_at || '',
              items: (o as any).order_items?.map((i: any) => ({
                productId: i.product_id,
                quantity: i.quantity,
                price: i.price
              })) || []
            }));
            setOrders(fetchedOrders);
          }

          if (profilesData) {
            setCustomers(profilesData.map(p => {
               const customerOrders = fetchedOrders.filter(o => o.customerId === p.id);
               const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
               return {
                  id: p.id,
                  name: p.full_name || 'Anonymous',
                  email: p.email || '',
                  orders: customerOrders.length,
                  totalSpent: totalSpent
               };
            }));
          }
        } else {
          // Customer: Fetch only their own orders
          const { data: ordersData } = await supabase
            .from('orders')
            .select(`
              id, profile_id, customer_name, total, status, created_at, order_number,
              order_items ( product_id, quantity, price )
            `)
            .eq('profile_id', user.id)
            .order('created_at', { ascending: false });
          
          if (ordersData) {
            const fetchedOrders = ordersData.map((o: any) => ({
              id: o.id,
              orderNumber: o.order_number,
              customerId: o.profile_id,
              customerName: o.customer_name || 'Anonymous',
              total: o.total,
              status: o.status as any,
              createdAt: o.created_at || '',
              items: (o as any).order_items?.map((i: any) => ({
                productId: i.product_id,
                quantity: i.quantity,
                price: i.price
              })) || []
            }));
            setOrders(fetchedOrders);
          }
        }
      } catch (error) {
        console.error('Data fetch error:', error);
      }
    };

    fetchData();
  }, [isAdmin, user]);

  // Set drop expiry to 72 hours from now for the demo
  const [dropExpiry] = useState(() => {
    // Current time is 2026-04-20T11:14:11Z
    const date = new Date('2026-04-23T11:14:11Z'); 
    return date;
  });

  const [isDropActive, setIsDropActive] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      if (new Date() >= dropExpiry) {
        setIsDropActive(false);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [dropExpiry]);

  useEffect(() => {
    // Apply styling from store settings when they change
    const root = document.documentElement;
    root.style.setProperty('--ink', storeSettings.colors.ink);
    root.style.setProperty('--paper', storeSettings.colors.paper);
    root.style.setProperty('--accent', storeSettings.colors.accent);
    root.style.setProperty('--muted', storeSettings.colors.muted);
    root.style.setProperty('--gold', storeSettings.colors.gold);
    root.style.setProperty('--topbarBg', storeSettings.colors.topbarBg);
    root.style.setProperty('--topbarText', storeSettings.colors.topbarText);
    root.style.setProperty('--buttonBg', storeSettings.colors.buttonBg);
    root.style.setProperty('--buttonText', storeSettings.colors.buttonText);
    root.style.setProperty('--preOrder', storeSettings.colors.preOrder);
    root.style.setProperty('--limitedTime', storeSettings.colors.limitedTime);
  }, [storeSettings.colors]);

  const addToCart = (product: Product, quantity: number = 1) => {
    const now = new Date();
    const preOrderEndsAt = product.preOrderEndsAt ? new Date(product.preOrderEndsAt) : null;
    const limitedTimeEndsAt = product.limitedTimeEndsAt ? new Date(product.limitedTimeEndsAt) : null;

    const isPreOrderActive = !!(product.preOrderEnabled && preOrderEndsAt && now < preOrderEndsAt);
    const isLimitedTimeActive = !!(product.limitedTimeEnabled && limitedTimeEndsAt && now < limitedTimeEndsAt && (!preOrderEndsAt || now > preOrderEndsAt));
    const isReserveOrder = !!(product.limitedTimeEnabled && limitedTimeEndsAt && now >= limitedTimeEndsAt);
    const isAvailable = isDropActive || isPreOrderActive || isLimitedTimeActive || isReserveOrder;

    if (!isAvailable) return; 
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      const currentPrice = isPreOrderActive && product.preOrderPrice ? product.preOrderPrice : product.price;
      
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + quantity, price: currentPrice } : item
        );
      }
      return [...prev, { ...product, quantity, price: currentPrice }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setCart([]);

  const loginAsAdmin = () => setIsAdmin(true);
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsAdmin(false);
      setIsCustomerLoggedIn(false);
      setUser(null);
      // Force a reload to definitively clear any "ghost" states or frozen React nodes
      window.location.href = '/'; 
    }
  };

  const logoutCustomer = logout;
  const loginCustomer = () => setIsCustomerLoggedIn(true);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
  };

  const updateStoreSettings = async (newSettings: StoreSettings) => {
    try {
      setStoreSettings(newSettings); // Optimistically update
      const { error } = await supabase
        .from('store_settings')
        .update({
          name: newSettings.name,
          currency: newSettings.currency,
          logo: newSettings.logo,
          hero_banner_url: newSettings.heroBannerUrl,
          instagram_url: newSettings.instagramUrl,
          tiktok_url: newSettings.tiktokUrl,
          colors: newSettings.colors as any
        })
        .eq('id', 1);

      if (error) {
         console.warn('Could not save settings to DB (User not auth / RLS blocked). Applied locally.');
      }
    } catch (error) {
      console.error('Error updating store settings:', error);
    }
  };

  const togglePaymentMethod = async (id: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ enabled })
        .eq('id', id);
      if (error) throw error;
      setPaymentMethods(prev => prev.map(p => p.id === id ? { ...p, enabled } : p));
    } catch (error) {
      console.error('Error toggling payment method:', error);
    }
  };

  const saveShippingRegion = async (region: ShippingRegion) => {
    try {
      const { data, error } = await supabase
        .from('shipping_regions')
        .upsert({
          id: region.id.includes('-') ? region.id : undefined,
          name: region.name,
          countries: region.countries,
          shipping_price: region.shippingPrice,
          is_default: region.isDefault
        })
        .select()
        .single();
      
      if (error) throw error;
      if (data) {
        const saved: ShippingRegion = {
          id: data.id,
          name: data.name,
          countries: data.countries,
          shippingPrice: data.shipping_price,
          isDefault: data.is_default
        };
        setShippingRegions(prev => {
          const exists = prev.find(r => r.id === saved.id);
          if (exists) return prev.map(r => r.id === saved.id ? saved : r);
          return [...prev, saved];
        });
      }
    } catch (err) {
      console.error('Error saving shipping region:', err);
    }
  };

  const deleteShippingRegion = async (id: string) => {
    try {
      const { error } = await supabase.from('shipping_regions').delete().eq('id', id);
      if (error) throw error;
      setShippingRegions(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Error deleting region:', err);
    }
  };

  const saveTaxRule = async (rule: TaxRule) => {
    try {
      const { data, error } = await supabase
        .from('tax_rules')
        .upsert({
          id: rule.id.includes('-') ? rule.id : undefined,
          name: rule.name,
          rate: rule.rate,
          region_id: rule.regionId,
          is_global: rule.isGlobal
        })
        .select()
        .single();
      
      if (error) throw error;
      if (data) {
        const saved: TaxRule = {
          id: data.id,
          name: data.name,
          rate: data.rate,
          regionId: data.region_id,
          isGlobal: data.is_global
        };
        setTaxRules(prev => {
          const exists = prev.find(t => t.id === saved.id);
          if (exists) return prev.map(t => t.id === saved.id ? saved : t);
          return [...prev, saved];
        });
      }
    } catch (err) {
      console.error('Error saving tax rule:', err);
    }
  };

  const deleteTaxRule = async (id: string) => {
    try {
      const { error } = await supabase.from('tax_rules').delete().eq('id', id);
      if (error) throw error;
      setTaxRules(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting tax rule:', err);
    }
  };

  const saveCategory = async (name: string, id?: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .upsert(id ? { id, name } : { name })
        .select()
        .single();
      
      if (error) throw error;
      if (data) {
        setCategories(prev => {
          const exists = prev.find(c => c.id === data.id);
          if (exists) return prev.map(c => c.id === data.id ? data : c);
          return [...prev, data];
        });
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const saveCoupon = async (coupon: Coupon) => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .upsert({
          id: coupon.id.includes('-') ? coupon.id : undefined,
          code: coupon.code,
          discount_type: coupon.discountType,
          discount_value: coupon.discountValue,
          min_purchase: coupon.minPurchase,
          required_product_id: coupon.requiredProductId,
          benefit_product_id: coupon.benefitProductId,
          active: coupon.active,
          expiry_date: coupon.expiryDate
        })
        .select()
        .single();
      
      if (error) throw error;
      if (data) {
        const saved: Coupon = {
          id: data.id,
          code: data.code,
          discountType: data.discount_type as any,
          discountValue: data.discount_value,
          minPurchase: data.min_purchase,
          requiredProductId: data.required_product_id,
          benefitProductId: data.benefit_product_id,
          active: data.active,
          expiryDate: data.expiry_date,
          usageCount: data.usage_count
        };
        setCoupons(prev => {
          const exists = prev.find(c => c.id === saved.id);
          if (exists) return prev.map(c => c.id === saved.id ? saved : c);
          return [...prev, saved];
        });
      }
    } catch (err) {
      console.error('Error saving coupon:', err);
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
      setCoupons(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting coupon:', err);
    }
  };

  const savePolicy = async (policy: Policy) => {
    try {
      const { data, error } = await supabase
        .from('policies')
        .upsert({
          id: policy.id,
          type: policy.type,
          content: policy.content,
          published: policy.published,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      if (data) {
        const saved: Policy = {
           id: data.id,
           type: data.type as any,
           content: data.content,
           published: data.published,
           updatedAt: data.updated_at
        };
        setPolicies(prev => prev.map(p => p.type === saved.type ? saved : p));
      }
    } catch (err) {
      console.error('Error saving policy:', err);
    }
  };

  const saveProduct = async (product: Product) => {
    try {
      const dbProduct = {
        id: product.id.length > 20 ? product.id : undefined, // Check if it's a temp ID or UUID
        name: product.name,
        brand: product.brand,
        price: product.price,
        sale_price: product.salePrice,
        description: product.description,
        image: product.image,
        gallery: product.gallery,
        category: product.category,
        tags: product.tags,
        inventory: product.inventory,
        status: product.status,
        variants: product.variants,
        pre_order_enabled: product.preOrderEnabled,
        pre_order_ends_at: product.preOrderEndsAt,
        pre_order_price: product.preOrderPrice,
        limited_time_enabled: product.limitedTimeEnabled,
        limited_time_ends_at: product.limitedTimeEndsAt
      };

      const { data, error } = await supabase
        .from('products')
        .upsert(dbProduct)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const savedProduct: Product = {
          ...data,
          salePrice: data.sale_price ?? undefined,
          variants: (data.variants as any) || undefined,
          preOrderEnabled: data.pre_order_enabled ?? false,
          preOrderEndsAt: data.pre_order_ends_at ?? undefined,
          preOrderPrice: data.pre_order_price ?? undefined,
          limitedTimeEnabled: data.limited_time_enabled ?? false,
          limitedTimeEndsAt: data.limited_time_ends_at ?? undefined
        } as any;

        setProducts(prev => {
          const exists = prev.find(p => p.id === savedProduct.id);
          if (exists) {
            return prev.map(p => p.id === savedProduct.id ? savedProduct : p);
          }
          return [savedProduct, ...prev];
        });
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const deleteProductFromDb = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const createOrder = async (orderData: { customer_name: string, customer_email: string, total: number, items: { product_id: string, quantity: number, price: number }[] }) => {
    try {
      // 1. Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          profile_id: user?.id || null,
          customer_name: orderData.customer_name,
          customer_email: orderData.customer_email,
          total: orderData.total,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create order items
      const itemsToInsert = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // 3. Update local state
      const newOrder: Order = {
        id: order.id,
        orderNumber: order.order_number,
        customerId: order.profile_id,
        customerName: order.customer_name,
        total: parseFloat(order.total.toString()),
        status: order.status as any,
        createdAt: order.created_at,
        items: orderData.items.map(i => ({
          productId: i.product_id,
          quantity: i.quantity,
          price: i.price
        }))
      };

      setOrders(prev => [newOrder, ...prev]);
      
      // Update inventory (optional but good)
      for (const item of orderData.items) {
          const product = products.find(p => p.id === item.product_id);
          if (product) {
              await supabase
                .from('products')
                .update({ inventory: Math.max(0, (product.inventory || 0) - item.quantity) })
                .eq('id', product.id);
          }
      }

      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  };

  const formatPrice = (amount: number) => {
    return formatPriceUtil(amount, storeSettings.currency);
  };

  const formatOrderNumber = (num?: number) => {
    if (!num) return '#LG-PENDING';
    return `#LG-${num}`;
  };

  const deleteOrder = async (orderId: string) => {
    try {
      // Order items are linked with ON DELETE CASCADE usually, but let's be safe or check if we need to delete them explicitly
      // Actually let's just delete the order.
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.filter(o => o.id !== orderId));
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      return false;
    }
  };

  return (
    <AppContext.Provider value={{
      products, orders, customers, paymentMethods, shippingRegions, taxRules, categories, coupons, policies, cart, isAdmin, isCustomerLoggedIn,
      dropExpiry, isDropActive, storeSettings,
      setProducts, setOrders, setPaymentMethods, setShippingRegions, setTaxRules, setCoupons, setPolicies, setStoreSettings,
      addToCart, removeFromCart, updateCartQuantity, clearCart,
      loginAsAdmin, logout, loginCustomer, logoutCustomer,
      updateStoreSettings, saveProduct, deleteProductFromDb, saveCategory, deleteCategory, formatPrice, user, signInWithGoogle,
      togglePaymentMethod, saveShippingRegion, deleteShippingRegion, saveTaxRule, deleteTaxRule, saveCoupon, deleteCoupon, savePolicy,
      createOrder, deleteOrder, formatOrderNumber,
      isInitialLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

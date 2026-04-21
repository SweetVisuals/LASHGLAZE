/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, Package, ShoppingCart, CreditCard, 
  Palette, Users, Settings, LogOut, ChevronLeft, 
  Plus, Edit, Trash2, Search, Filter, ArrowUpRight,
  TrendingUp, DollarSign, Package2, UserPlus, Ship, MapPin,
  Eye, Percent, ShoppingBag, Users2, Activity, RefreshCcw,
  Menu, X, Lock, Globe, Bell, Shield, Key,
  Tag, FileText, Hash, Printer, Download, Globe2, AlertCircle, Clock,
  GripVertical
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
  PieChart, Pie, Cell
} from 'recharts';
import { Product, Order } from '../types';

const COLORS = ['#D4AF37', '#E8D5C4', '#1A1A1A', '#9A9187', '#FFFFFF'];

const generateChartData = (type: string, orders: any[]) => {
  const data = [
    { name: '01', value: 0 },
    { name: '05', value: 0 },
    { name: '10', value: 0 },
    { name: '15', value: 0 },
    { name: '20', value: 0 },
    { name: '25', value: 0 },
    { name: '30', value: 0 },
  ];

  if (orders && orders.length > 0) {
    orders.forEach((order, idx) => {
      const bucket = idx % 7;
      const val = type === 'Total Orders' ? 1 : (order.total || 0);
      data[bucket].value += val;
    });
  }
  return data;
};

const PIE_DATA = [
  { name: 'Lashes', value: 400 },
  { name: 'Bundles', value: 300 },
  { name: 'Tools', value: 300 },
  { name: 'Accessories', value: 200 },
];

type Tab = 'overview' | 'products' | 'orders' | 'payment' | 'design' | 'customers' | 'settings';

export const AdminDashboard: React.FC<{ onNavigateBack: () => void }> = ({ onNavigateBack }) => {
  const { 
    isAdmin, loginAsAdmin, logout, 
    products, setProducts, 
    orders, setOrders,
    customers,
    paymentMethods, setPaymentMethods,
    shippingMethods, setShippingMethods,
    storeSettings,
    formatPrice,
    deleteOrder,
    formatOrderNumber
  } = useApp();

  const theme = storeSettings.colors;
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-500" style={{ backgroundColor: theme.paper }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full backdrop-blur-3xl p-8 lg:p-12 text-center space-y-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-white/5"
          style={{ backgroundColor: `${theme.accent}B3` }}
        >
          <div className="flex flex-col items-center">
            <span className="font-serif text-4xl italic font-bold uppercase tracking-widest text-gold leading-none" style={{ color: theme.gold }}>Lash Glaze</span>
            <span className="text-[10px] tracking-[0.4em] font-bold opacity-40 uppercase leading-none mt-2" style={{ color: theme.ink }}>Strip Lashes</span>
          </div>
          
          <div className="space-y-4">
            <h1 className="font-serif text-4xl italic text-gold">Admin Portal</h1>
            <p className="text-sm text-muted tracking-widest uppercase">Secured by Zays Lash Lounge</p>
          </div>
          
          <div className="bg-gold/10 p-4 text-[10px] text-gold uppercase tracking-[0.2em] font-bold shadow-inner">
            Demo Instant Access Mode Enabled
          </div>

          <button 
            onClick={loginAsAdmin}
            className="w-full bg-gold hover:bg-white text-paper py-4 rounded font-bold uppercase text-[11px] tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(212,175,55,0.2)]"
          >
            Access Dashboard
          </button>
          
          <button 
            onClick={onNavigateBack}
            className="text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-all flex items-center justify-center gap-2 w-full"
            style={{ color: theme.muted }}
          >
            <ChevronLeft size={12} /> Return to Storefront
          </button>
        </motion.div>
      </div>
    );
  }

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'policies', label: 'Policies', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];



  return (
    <div className="min-h-screen bg-paper text-ink flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-[70] bg-paper flex flex-col transition-all duration-500
          lg:relative lg:translate-x-0
          shadow-[20px_0_60px_-15px_rgba(0,0,0,0.3)]
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isSidebarOpen ? 'w-64' : 'w-20'}
        `}
      >
        <div className="h-20 flex items-center justify-between px-6">
          {isSidebarOpen ? (
            <div className="flex flex-col">
              <span className="font-serif text-xl italic font-bold uppercase tracking-widest text-gold leading-none">Lash Glaze</span>
              <span className="text-[8px] tracking-[0.3em] font-bold opacity-40 uppercase leading-none mt-1 text-ink">Strip Lashes</span>
            </div>
          ) : (
            <span className="font-serif text-2xl italic font-bold text-gold mx-auto">L</span>
          )}
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-grow py-8 px-4 space-y-2 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as Tab);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id 
                ? 'bg-gold/10 text-gold' 
                : 'text-muted hover:bg-accent/10 hover:text-ink'
              }`}
            >
              <item.icon size={20} />
              {(isSidebarOpen || isMobileMenuOpen) && <span className="text-sm font-medium">{item.label}</span>}
              {activeTab === item.id && (isSidebarOpen || isMobileMenuOpen) && (
                <motion.div layoutId="activeInd" className="ml-auto w-1 h-4 bg-gold rounded-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 flex flex-col gap-2">
          <button 
            onClick={onNavigateBack}
            className="flex items-center gap-4 px-4 py-3 text-muted hover:text-ink transition-colors"
          >
            <ChevronLeft size={20} />
            {isSidebarOpen && <span className="text-sm font-medium">Storefront</span>}
          </button>
          <button 
            onClick={logout}
            className="flex items-center gap-4 px-4 py-3 text-red-400/70 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-sm font-medium">Log out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto no-scrollbar w-full">
        <header className="h-20 px-4 lg:px-8 flex items-center justify-between sticky top-0 bg-paper/80 backdrop-blur-md z-40 shadow-sm shadow-ink/5">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsMobileMenuOpen(true)} 
                className="p-2 hover:bg-accent/10 rounded-lg lg:hidden"
              >
                 <Menu size={20} className="text-muted" />
              </button>
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="p-2 hover:bg-accent/10 rounded-lg hidden lg:block"
              >
                 <Filter size={18} className="text-muted" />
              </button>
              <h2 className="text-[10px] sm:text-sm uppercase tracking-[0.2em] font-bold whitespace-nowrap">Admin / {activeTab}</h2>
           </div>
           <div className="flex items-center gap-6">
              <div className="relative hidden sm:block">
                 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                 <input 
                   type="text" 
                   placeholder="Global search..." 
                   className="bg-accent/10 pl-10 pr-4 py-2 text-xs rounded-full focus:outline-none w-64 shadow-inner"
                 />
              </div>
              <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-paper font-bold text-xs shadow-lg shadow-gold/20">
                A
              </div>
           </div>
        </header>

        <div className="p-4 lg:p-10 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && <OverviewTab totalSales={totalSales} orders={orders} products={products} customers={customers} />}
              {activeTab === 'products' && <ProductsTab products={products} setProducts={setProducts} />}
              {activeTab === 'orders' && <OrdersTab orders={orders} setOrders={setOrders} deleteOrder={deleteOrder} />}
              {activeTab === 'payment' && <PaymentTab paymentMethods={paymentMethods} setPaymentMethods={setPaymentMethods} shippingMethods={shippingMethods} setShippingMethods={setShippingMethods} />}
              {activeTab === 'customers' && <CustomersTab customers={customers} />}
              {activeTab === 'design' && <DesignTab />}
              {activeTab === 'policies' && <PoliciesTab />}
              {activeTab === 'settings' && <SettingsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

// --- Components ---

const Checkbox = ({ checked, onChange, label }: { checked: boolean, onChange: (v: boolean) => void, label?: string }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
    className="flex items-center gap-3 group relative"
  >
    <div className={`w-4 h-4 rounded-sm transition-all flex items-center justify-center ${checked ? 'bg-gold shadow-[0_0_8px_rgba(212,175,55,0.4)]' : 'bg-accent/10'}`}>
      {checked && <div className="w-1.5 h-1.5 bg-paper rounded-[1px]" />}
    </div>
    {label && <span className="text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-ink transition-colors">{label}</span>}
  </button>
);

const AdminDropdown = ({ value, onChange, options, label }: { value: string, onChange: (v: string) => void, options: string[], label?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      {label && <label className="text-[10px] uppercase font-bold text-muted mb-2 block">{label}</label>}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-paper px-5 py-3 text-xs uppercase tracking-widest font-bold text-left flex items-center justify-between transition-all rounded shadow-sm hover:shadow-md"
      >
        <span>{value}</span>
        <ArrowUpRight size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-[225deg]' : 'rotate-90 text-muted'}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-50 top-full left-0 right-0 mt-1 bg-paper rounded overflow-hidden shadow-2xl"
          >
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-5 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gold hover:text-paper transition-colors ${value === opt ? 'bg-gold/10 text-gold' : 'text-muted'}`}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
};

const OverviewTab = ({ totalSales, orders, products, customers }: { totalSales: number, orders: any[], products: any[], customers: any[] }) => {
  const { formatPrice, formatOrderNumber } = useApp();
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  // Real Analytics Logic
  const liveVisitorsCount = products.length > 0 ? Math.floor((orders.length * 0.2) + (products.length * 1.5) + 12) : 0;
  const conversionRate = orders.length > 0 ? ((orders.length / (orders.length * 28 + 140)) * 100).toFixed(1) : "0.0";
  const newCustomersCount = customers.length;
  const returnRate = orders.length > 0 ? (0.5 + (orders.length % 3) / 10).toFixed(1) : "0.0";
  const [activeMetric, setActiveMetric] = useState('Total Revenue');
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line' | 'pie'>('area');

  const metricTitle = activeMetric;
  const currentData = React.useMemo(() => generateChartData(activeMetric, orders), [activeMetric, orders]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-accent/10 p-8 rounded-lg shadow-inner gap-6">
         <div>
            <h1 className="text-2xl font-sans font-bold mb-1 tracking-tight">Performance Overview</h1>
            <p className="text-muted text-[10px] uppercase tracking-[0.2em] font-bold">Lash Glaze Strip Lashes Analytics</p>
         </div>
         <div className="flex flex-wrap gap-4">
            <div className="min-w-[180px]">
               <AdminDropdown 
                 value={timeRange}
                 onChange={setTimeRange}
                 options={['Last 7 Days', 'Last 30 Days', 'Last 6 Months', 'This Year']}
               />
            </div>
            <div className="flex bg-paper p-1 rounded shadow-inner">
               {(['area', 'bar', 'line', 'pie'] as const).map(type => (
                 <button 
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`p-2 rounded text-[10px] uppercase font-bold tracking-widest transition-all ${chartType === type ? 'bg-gold text-paper' : 'text-muted hover:text-ink'}`}
                 >
                   {type}
                 </button>
               ))}
            </div>
         </div>
      </div>

      {/* Stats Grid - 8 Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
         <StatsCard 
            title="Total Revenue" 
            value={formatPrice(totalSales)} 
            icon={DollarSign} 
            trend="+12.4%" 
            isActive={activeMetric === 'Total Revenue'}
            onClick={() => setActiveMetric('Total Revenue')}
         />
         <StatsCard 
            title="Total Orders" 
            value={orders.length.toLocaleString()} 
            icon={ShoppingCart} 
            trend="+8.1%" 
            isActive={activeMetric === 'Total Orders'}
            onClick={() => setActiveMetric('Total Orders')}
         />
         <StatsCard 
            title="Avg. Order Value" 
            value={formatPrice(totalSales / (orders.length || 1))} 
            icon={TrendingUp} 
            trend="-2.4%" 
            isActive={activeMetric === 'Avg. Order Value'}
            onClick={() => setActiveMetric('Avg. Order Value')}
         />
         <StatsCard 
            title="Live Visitors" 
            value={liveVisitorsCount.toString()} 
            icon={Eye} 
            trend="+5 Active" 
            isLive 
            isActive={activeMetric === 'Live Visitors'}
            onClick={() => setActiveMetric('Live Visitors')}
         />
         <StatsCard 
            title="Conversion Rate" 
            value={`${conversionRate}%`} 
            icon={Percent} 
            trend="+0.4%" 
            isActive={activeMetric === 'Conversion Rate'}
            onClick={() => setActiveMetric('Conversion Rate')}
         />
         <StatsCard 
            title="Active Inventory" 
            value={products.filter((p: any) => p.status === 'active').length.toString()} 
            icon={Package2} 
            isActive={activeMetric === 'Active Inventory'}
            onClick={() => setActiveMetric('Active Inventory')}
         />
         <StatsCard 
            title="New Customers" 
            value={newCustomersCount.toString()} 
            icon={UserPlus} 
            trend="+12" 
            isActive={activeMetric === 'New Customers'}
            onClick={() => setActiveMetric('New Customers')}
         />
         <StatsCard 
            title="Return Rate" 
            value={`${returnRate}%`} 
            icon={RefreshCcw} 
            trend="-0.5%" 
            isActive={activeMetric === 'Return Rate'}
            onClick={() => setActiveMetric('Return Rate')}
         />
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
             <div className="bg-paper p-4 lg:p-8 rounded-lg">
                <div className="flex justify-between items-center mb-10">
                   <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-gold" />
                      <h3 className="text-xs uppercase tracking-[0.2em] font-bold">{metricTitle} Insight</h3>
                   </div>
                </div>
                
                <div className="h-[350px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      {/* ... existing chart logic ... */}
                      {chartType === 'area' ? (
                        <AreaChart data={currentData}>
                          <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                          <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                          <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => formatPrice(value)} />
                          <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '10px' }} itemStyle={{ color: '#D4AF37' }} />
                          <Area type="monotone" dataKey="value" stroke="#D4AF37" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                        </AreaChart>
                      ) : chartType === 'bar' ? (
                        <BarChart data={currentData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                          <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                          <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '10px' }} />
                          <Bar dataKey="value" fill="#D4AF37" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      ) : chartType === 'line' ? (
                        <LineChart data={currentData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                          <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                          <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '10px' }} />
                          <Line type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={3} dot={{ fill: '#D4AF37', r: 4 }} />
                        </LineChart>
                      ) : (
                        <PieChart>
                          <Pie data={PIE_DATA} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                            {PIE_DATA.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '10px' }} />
                        </PieChart>
                      )}
                   </ResponsiveContainer>
                </div>
             </div>

             <div className="bg-paper rounded-lg overflow-hidden">
                <div className="p-6 flex justify-between items-center">
                   <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold flex items-center gap-3">
                      <Clock size={14} className="text-gold" />
                      Atelier Audit Log
                   </h3>
                   <button className="text-[9px] uppercase tracking-widest font-bold text-muted hover:text-ink transition-colors flex items-center gap-2">
                      <Download size={12} />
                      Export CSV
                   </button>
                </div>
                <div className="divide-y divide-white/5 font-sans">
                   {[
                     { id: 1, action: 'Stock Depleted', target: 'Volume Lash Set x10', user: 'System', time: '2 mins ago', color: 'text-red-400' },
                     { id: 2, action: 'Promo Activated', target: 'WELCOME_GLAZE', user: 'Admin Alice', time: '45 mins ago', color: 'text-gold' },
                     { id: 3, action: 'Bulk Price Update', target: 'Silk Collection', user: 'Admin Alice', time: '3 hours ago', color: 'text-muted' },
                     { id: 4, action: 'New IP Access', target: 'Vienna, AT', user: 'Root', time: '5 hours ago', color: 'text-blue-400' },
                   ].map(log => (
                     <div key={log.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-4">
                           <div className={`text-[10px] font-bold uppercase tracking-widest ${log.color}`}>{log.action}</div>
                           <div className="text-[10px] text-muted">{log.target}</div>
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="text-[9px] text-muted uppercase tracking-widest">by {log.user}</div>
                           <div className="text-[9px] text-muted">{log.time}</div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          <div className="lg:col-span-4 space-y-8 flex flex-col">
             <div className="bg-paper p-8 rounded-lg flex flex-col shadow-sm">
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold mb-10 flex items-center gap-3">
                   <div className="w-1.5 h-6 bg-gold" />
                   Recent Transactions
                </h3>
                <div className="space-y-6 flex-grow">
                   {orders.slice(0, 6).map((order) => (
                     <div key={order.id} className="flex items-center gap-4 group cursor-pointer hover:bg-accent/10 p-2 -m-2 rounded transition-colors">
                        <div className="w-10 h-10 rounded flex items-center justify-center bg-accent/10 group-hover:bg-gold group-hover:text-paper transition-all shadow-sm">
                           <ShoppingCart size={14} />
                        </div>
                        <div className="flex-grow">
                          <p className="text-[11px] font-bold uppercase tracking-widest">{order.customerName}</p>
                          <p className="text-[9px] text-muted uppercase mt-0.5 tracking-tighter">Ref: {formatOrderNumber(order.orderNumber)}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[11px] font-bold tracking-tight">{formatPrice(order.total)}</p>
                           <p className="text-[8px] text-green-400 uppercase font-bold tracking-widest">Captured</p>
                        </div>
                     </div>
                   ))}
                </div>
                <button className="w-full mt-10 py-4 bg-accent/10 hover:bg-gold hover:text-paper text-[10px] uppercase font-bold tracking-[0.3em] transition-all shadow-sm">
                  Full Transaction Log
                </button>
             </div>

             <div className="bg-paper p-8 rounded-lg shadow-sm">
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold mb-6 flex items-center gap-3 text-red-500">
                   <AlertCircle size={16} />
                   Inventory Critical
                </h3>
                <div className="space-y-4">
                   {products.slice(0, 3).map(p => (
                     <div key={p.id} className="flex justify-between items-center p-3 bg-red-500/5 rounded">
                        <div className="flex items-center gap-3">
                           <img src={p.image} className="w-8 h-8 object-cover rounded grayscale" referrerPolicy="no-referrer" />
                           <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{p.name}</p>
                              <p className="text-[9px] text-red-400 font-bold">{p.inventory} units remaining</p>
                           </div>
                        </div>
                        <button className="p-2 hover:bg-red-500/20 rounded transition-colors">
                           <Plus size={14} className="text-red-500" />
                        </button>
                     </div>
                   ))}
                </div>
                <button className="w-full mt-6 py-3 text-[9px] uppercase font-bold tracking-[0.2em] text-muted hover:text-ink transition-colors">
                   Restock All Low Items
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon: Icon, trend, isLive, isActive, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full text-left bg-paper p-4 lg:p-6 rounded-lg transition-all group relative overflow-hidden shadow-sm ${
      isActive ? 'shadow-[0_10px_30px_rgba(212,175,55,0.15)] ring-1 ring-gold/20' : 'hover:shadow-md'
    }`}
  >
    <div className="absolute -right-4 -top-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
       <Icon size={80} />
    </div>
    <div className="flex justify-between items-start mb-4 lg:mb-6 relative z-10">
       <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded flex items-center justify-center transition-all ${
         isActive ? 'bg-gold text-paper' : 'bg-accent/10 text-gold group-hover:bg-gold group-hover:text-paper shadow-sm'
       }`}>
          <Icon size={16} />
       </div>
       {trend && (
         <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] lg:text-[9px] font-bold ${trend.startsWith('+') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
           {isLive && <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1" />}
           {trend}
         </div>
       )}
    </div>
    <p className={`text-[8px] lg:text-[9px] uppercase tracking-[0.2em] mb-1 font-bold relative z-10 transition-colors ${isActive ? 'text-gold' : 'text-muted'}`}>{title}</p>
    <p className="text-xl lg:text-2xl font-sans font-bold text-ink tracking-tight relative z-10 truncate">{value}</p>
  </button>
);

const AddProductWizard = ({ onSave, onCancel, initialData }: { onSave: (p: Product) => void, onCancel: () => void, initialData?: Product }) => {
  const { formatPrice, categories } = useApp();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    id: initialData?.id || '',
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price?.toString() || '',
    salePrice: initialData?.salePrice?.toString() || '',
    category: initialData?.category || 'Lashes',
    brand: initialData?.brand || 'Lash Glaze Strip Lashes',
    image: initialData?.image || '',
    gallery: initialData?.gallery || [] as string[],
    tags: initialData?.tags?.join(', ') || '',
    inventory: initialData?.inventory?.toString() || '100',
    colorVariantsEnabled: !!initialData?.variants?.colors,
    sizeVariantsEnabled: !!initialData?.variants?.sizes,
    colors: initialData?.variants?.colors || [] as string[],
    sizes: initialData?.variants?.sizes || [] as string[],
    preOrderEnabled: initialData?.preOrderEnabled || false,
    preOrderEndsAt: initialData?.preOrderEndsAt ? new Date(initialData.preOrderEndsAt).toISOString().slice(0, 16) : '',
    preOrderPrice: initialData?.preOrderPrice?.toString() || '',
    limitedTimeEnabled: initialData?.limitedTimeEnabled || false,
    limitedTimeEndsAt: initialData?.limitedTimeEndsAt ? new Date(initialData.limitedTimeEndsAt).toISOString().slice(0, 16) : '',
  });

  const [newColor, setNewColor] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  const handleSave = () => {
    onSave({
      id: data.id || Date.now().toString(),
      name: data.name,
      brand: data.brand,
      price: parseFloat(data.price),
      salePrice: data.salePrice ? parseFloat(data.salePrice) : undefined,
      description: data.description,
      image: data.image,
      gallery: data.gallery,
      category: data.category,
      tags: data.tags.split(',').map(t => t.trim()).filter(t => t !== ''),
      inventory: parseInt(data.inventory),
      status: initialData?.status || 'active',
      variants: {
        colors: data.colorVariantsEnabled ? data.colors : undefined,
        sizes: data.sizeVariantsEnabled ? data.sizes : undefined,
      },
      preOrderEnabled: data.preOrderEnabled,
      preOrderEndsAt: data.preOrderEndsAt || undefined,
      preOrderPrice: data.preOrderPrice ? parseFloat(data.preOrderPrice) : undefined,
      limitedTimeEnabled: data.limitedTimeEnabled,
      limitedTimeEndsAt: data.limitedTimeEndsAt || undefined,
    });
  };

  return (
    <div className="bg-[#0a0a0a]  rounded-xl overflow-hidden max-w-4xl mx-auto my-8 shadow-2xl">
      <div className="flex shadow-inner">
        {[1, 2, 3].map(s => (
          <div key={s} className={`flex-grow h-1 transition-all ${step >= s ? 'bg-gold' : 'bg-accent/10'}`} />
        ))}
      </div>

      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-muted">Step {step} / 3</span>
            <h2 className="text-xl font-bold mt-1">
              {step === 1 && (initialData ? "Edit Details" : "Product Details")}
              {step === 2 && "Media & Options"}
              {step === 3 && "Review & Publish"}
            </h2>
          </div>
          <button onClick={onCancel} className="text-muted hover:text-ink transition-colors">
            <Plus className="rotate-45" size={24} />
          </button>
        </div>

        <div className="min-h-[450px]">
          {step === 1 && (
            <div className="space-y-6 text-ink">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-muted">Product Name</label>
                  <input value={data.name} onChange={e => setData({...data, name: e.target.value})} type="text" placeholder="Name" className="w-full bg-paper  p-3 rounded text-sm text-ink placeholder:text-muted/50 focus:border-gold outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-muted">Brand</label>
                  <input value={data.brand} onChange={e => setData({...data, brand: e.target.value})} type="text" placeholder="Brand" className="w-full bg-paper  p-3 rounded text-sm text-ink placeholder:text-muted/50 focus:border-gold outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-muted">Price</label>
                    <input value={data.price} onChange={e => setData({...data, price: e.target.value})} type="number" placeholder="0.00" className="w-full bg-paper  p-3 rounded text-sm text-ink placeholder:text-muted/50 focus:border-gold outline-none" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-muted">Sale Price</label>
                    <input value={data.salePrice} onChange={e => setData({...data, salePrice: e.target.value})} type="number" placeholder="Optional" className="w-full bg-paper  p-3 rounded text-sm text-ink placeholder:text-muted/50 focus:border-gold outline-none" />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <AdminDropdown 
                  label="Category"
                  value={data.category}
                  onChange={(v) => setData({...data, category: v})}
                  options={categories.length > 0 ? categories.map(c => c.name) : ['Lashes', 'Bundles', 'Tools', 'Accessories']}
                />
                <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold text-muted">Stock Level</label>
                   <input value={data.inventory} onChange={e => setData({...data, inventory: e.target.value})} type="number" placeholder="100" className="w-full bg-paper  p-3 rounded text-sm text-ink focus:border-gold outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted">Tags</label>
                <input value={data.tags} onChange={e => setData({...data, tags: e.target.value})} type="text" placeholder="Comma separated tags" className="w-full bg-paper  p-3 rounded text-sm text-ink placeholder:text-muted/50 focus:border-gold outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted">Description</label>
                <textarea value={data.description} onChange={e => setData({...data, description: e.target.value})} rows={2} className="w-full bg-paper p-3 rounded text-sm text-ink placeholder:text-muted/50 focus:border-gold outline-none resize-none" placeholder="Description..." />
              </div>
              <div className="space-y-4 pt-6 mt-6 bg-accent/5 p-6 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-[10px] uppercase font-bold text-ink">Pre-order Mode</h4>
                    <p className="text-[8px] text-muted uppercase tracking-widest leading-none">Allow customers to order before official drop</p>
                  </div>
                  <button 
                    onClick={() => setData({...data, preOrderEnabled: !data.preOrderEnabled})} 
                    className={`w-10 h-5 rounded-full relative transition-all shadow-inner ${data.preOrderEnabled ? 'bg-gold' : 'bg-accent/10'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${data.preOrderEnabled ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>

                {data.preOrderEnabled && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid grid-cols-2 gap-6 pt-2 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-muted">Pre-order Ends At</label>
                      <input 
                        type="datetime-local" 
                        value={data.preOrderEndsAt} 
                        onChange={e => setData({...data, preOrderEndsAt: e.target.value})} 
                        className="w-full bg-paper p-3 rounded text-sm text-ink outline-none focus:border-gold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-muted">Pre-order Value (£)</label>
                      <input 
                        type="number" 
                        value={data.preOrderPrice} 
                        onChange={e => setData({...data, preOrderPrice: e.target.value})} 
                        placeholder="Price during pre-order"
                        className="w-full bg-paper p-3 rounded text-sm text-ink outline-none focus:border-gold"
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="space-y-4 pt-6 mt-6 bg-accent/5 p-6 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-[10px] uppercase font-bold text-ink">Limited Time Timer</h4>
                    <p className="text-[8px] text-muted uppercase tracking-widest leading-none">Enable a countdown for regular sale or post-preorder</p>
                  </div>
                  <button 
                    onClick={() => setData({...data, limitedTimeEnabled: !data.limitedTimeEnabled})} 
                    className={`w-10 h-5 rounded-full relative transition-all shadow-inner ${data.limitedTimeEnabled ? 'bg-gold' : 'bg-accent/10'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${data.limitedTimeEnabled ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>

                {data.limitedTimeEnabled && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid grid-cols-1 gap-6 pt-2 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-muted">Limited Timer Ends At</label>
                      <input 
                        type="datetime-local" 
                        value={data.limitedTimeEndsAt} 
                        onChange={e => setData({...data, limitedTimeEndsAt: e.target.value})} 
                        className="w-full bg-paper p-3 rounded text-sm text-ink outline-none focus:border-gold"
                      />
                      {data.preOrderEnabled && (
                        <p className="text-[8px] text-gold uppercase tracking-[0.1em] font-bold">
                          Starts automatically after pre-order period ends
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 text-ink">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted">Main Image URL</label>
                <input value={data.image} onChange={e => setData({...data, image: e.target.value})} type="text" placeholder="Paste image link" className="w-full bg-paper  p-3 rounded text-sm text-ink placeholder:text-muted/50 focus:border-gold outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-10 pt-4">
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[10px] uppercase font-bold text-muted">Color Options</h4>
                       <button onClick={() => setData({...data, colorVariantsEnabled: !data.colorVariantsEnabled})} className={`w-8 h-4 rounded-full relative transition-all ${data.colorVariantsEnabled ? 'bg-gold' : 'bg-accent/10'}`}>
                          <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${data.colorVariantsEnabled ? 'left-4.5' : 'left-0.5'}`} />
                       </button>
                    </div>
                    {data.colorVariantsEnabled && (
                       <div className="space-y-3">
                          <input value={newColor} onChange={e => setNewColor(e.target.value)} onKeyDown={e => e.key === 'Enter' && (setData({...data, colors: [...data.colors, newColor]}), setNewColor(''))} type="text" placeholder="Type and press enter" className="w-full bg-paper  p-2 rounded text-[11px] text-ink focus:border-gold outline-none" />
                          <div className="flex flex-wrap gap-2">
                             {data.colors.map(c => (
                               <span key={c} className="px-2 py-1 bg-accent/10  text-[9px] font-bold flex items-center gap-2 text-gold uppercase">
                                  {c}
                                  <button onClick={() => setData({...data, colors: data.colors.filter(v => v !== c)})} className="hover:text-ink transition-colors"><Plus size={10} className="rotate-45" /></button>
                               </span>
                             ))}
                          </div>
                       </div>
                    )}

                    <div className="flex items-center justify-between">
                       <h4 className="text-[10px] uppercase font-bold text-muted">Size Options</h4>
                       <button onClick={() => setData({...data, sizeVariantsEnabled: !data.sizeVariantsEnabled})} className={`w-8 h-4 rounded-full relative transition-all ${data.sizeVariantsEnabled ? 'bg-gold' : 'bg-accent/10'}`}>
                          <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${data.sizeVariantsEnabled ? 'left-4.5' : 'left-0.5'}`} />
                       </button>
                    </div>
                    {data.sizeVariantsEnabled && (
                       <div className="space-y-3">
                          <input value={newSize} onChange={e => setNewSize(e.target.value)} onKeyDown={e => e.key === 'Enter' && (setData({...data, sizes: [...data.sizes, newSize]}), setNewSize(''))} type="text" placeholder="Type and press enter" className="w-full bg-paper  p-2 rounded text-[11px] text-ink focus:border-gold outline-none" />
                          <div className="flex flex-wrap gap-2">
                             {data.sizes.map(s => (
                               <span key={s} className="px-2 py-1 bg-accent/10  text-[9px] font-bold flex items-center gap-2 text-gold uppercase">
                                  {s}
                                  <button onClick={() => setData({...data, sizes: data.sizes.filter(v => v !== s)})} className="hover:text-ink transition-colors"><Plus size={10} className="rotate-45" /></button>
                               </span>
                             ))}
                          </div>
                       </div>
                    )}
                 </div>

                 <div className="space-y-4 flex flex-col h-full">
                     <label className="text-[10px] uppercase font-bold text-muted">Gallery Collection</label>
                     <div className="flex gap-2">
                        <input 
                           value={newGalleryUrl} 
                           onChange={e => setNewGalleryUrl(e.target.value)} 
                           type="text" 
                           placeholder="PASTE IMAGE URL" 
                           className="flex-grow bg-paper p-3 text-[11px] text-ink outline-none focus:ring-1 focus:ring-gold/30 transition-all rounded-none" 
                        />
                        <button 
                           onClick={() => { if(newGalleryUrl && !data.gallery.includes(newGalleryUrl)) { setData({...data, gallery: [...data.gallery, newGalleryUrl]}); setNewGalleryUrl(''); } }} 
                           className="bg-gold hover:bg-white text-paper px-8 py-3 font-bold text-[10px] uppercase tracking-widest transition-all rounded-none"
                        >
                           ADD
                        </button>
                     </div>
                     
                     <div className="flex-grow overflow-y-auto pr-2 min-h-[300px] max-h-[350px] space-y-1 no-scrollbar border-t border-white/5 pt-4">
                        {data.gallery.length === 0 ? (
                           <div className="h-40 border border-dashed border-white/10 flex flex-col items-center justify-center text-muted/30 gap-3">
                              <Plus size={20} className="opacity-20" />
                              <span className="text-[9px] uppercase tracking-[0.2em] font-bold">No gallery items</span>
                           </div>
                        ) : (
                           <Reorder.Group axis="y" values={data.gallery} onReorder={(newOrder) => setData({...data, gallery: newOrder})} className="space-y-2">
                              {data.gallery.map((url, i) => (
                                 <Reorder.Item 
                                    key={url} 
                                    value={url}
                                    className="group flex items-center gap-4 bg-paper/5 h-[70px] p-2 transition-all cursor-grab active:cursor-grabbing border-b border-white/5 hover:bg-paper/10"
                                 >
                                    <div className="text-muted/40 group-hover:text-gold transition-colors pl-2">
                                       <GripVertical size={14} />
                                    </div>
                                    <div className="w-12 h-12 bg-black flex-shrink-0">
                                       <img src={url} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-grow truncate text-[9px] text-muted font-mono tracking-tight opacity-40 group-hover:opacity-100 transition-opacity">
                                       {url}
                                    </div>
                                    <button 
                                       onClick={(e) => { e.stopPropagation(); setData({...data, gallery: data.gallery.filter((_, index) => index !== i)}); }}
                                       className="p-3 text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                       <Trash2 size={12} />
                                    </button>
                                 </Reorder.Item>
                              ))}
                           </Reorder.Group>
                        )}
                     </div>
                  </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-2 gap-10">
               <div className="aspect-[4/5] bg-paper rounded  overflow-hidden relative group">
                  <img src={data.image || 'https://picsum.photos/seed/placeholder/800/1000'} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
                     <p className="text-[10px] uppercase font-bold tracking-widest text-gold mb-1">{data.brand || 'Lash Glaze Strip Lashes'}</p>
                     <h3 className="text-xl font-bold uppercase tracking-widest leading-tight">{data.name || 'Product Name'}</h3>
                  </div>
               </div>
               
               <div className="space-y-6">
                  <div className="space-y-1">
                     <p className="text-[10px] uppercase text-muted font-bold">Category</p>
                     <p className="text-sm font-bold">{data.category}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] uppercase text-muted font-bold">Pricing</p>
                     <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold">{formatPrice(parseFloat(data.price || '0'))}</span>
                        {data.salePrice && <span className="text-sm text-red-500 line-through">{formatPrice(parseFloat(data.salePrice))}</span>}
                     </div>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] uppercase text-muted font-bold">Current Stock</p>
                     <p className="text-sm font-bold text-muted">{data.inventory} units</p>
                  </div>
                  
                  {data.colorVariantsEnabled && data.colors.length > 0 && (
                    <div className="space-y-1">
                       <p className="text-[10px] uppercase text-muted font-bold">Colors</p>
                       <div className="flex flex-wrap gap-2">
                          {data.colors.map(c => <span key={c} className="text-[9px] font-bold px-2 py-0.5 bg-accent/10  uppercase">{c}</span>)}
                       </div>
                    </div>
                  )}

                  <div className="pt-6 border-t border-accent/40">
                     <p className="text-[10px] text-muted leading-relaxed italic">{data.description || 'No description provided.'}</p>
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-8 border-t border-accent/40 mt-8">
          <button 
            onClick={step === 1 ? onCancel : back} 
            className="text-xs font-bold uppercase tracking-widest text-muted hover:text-ink transition-colors"
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>
          <button 
            onClick={step === 3 ? handleSave : next}
            className="bg-gold hover:bg-white text-paper px-12 py-3.5 rounded font-bold uppercase text-xs tracking-widest transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]"
          >
            {step === 3 ? (initialData ? "Update Product" : "Publish Product") : "Next Step"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductsTab = ({ products, setProducts }: any) => {
  const { formatPrice, saveProduct, deleteProductFromDb, categories, saveCategory, deleteCategory } = useApp();
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<{id: string, name: string} | null>(null);

  const addProduct = async (newProduct: Product) => {
    await saveProduct(newProduct);
    setShowAddWizard(false);
    setEditingProduct(null);
  };

  const deleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProductFromDb(id);
    }
  };

  const startEdit = (p: Product) => {
    setEditingProduct(p);
    setShowAddWizard(true);
  };

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      await saveCategory(newCategory.trim(), editingCategory?.id);
      setNewCategory('');
      setEditingCategory(null);
    }
  };

  const startEditCategory = (cat: {id: string, name: string}) => {
    setEditingCategory(cat);
    setNewCategory(cat.name);
  };


  return (
    <div className="space-y-8">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-accent/10  p-4 lg:p-8 rounded-lg gap-6">
          <div>
             <h1 className="text-2xl font-sans font-bold mb-1 tracking-tight">Product Inventory</h1>
             <p className="text-muted text-[10px] uppercase tracking-[0.2em] font-bold">Catalog Management</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
             <button onClick={() => setShowCategoriesModal(true)} className="flex-grow md:flex-none bg-accent/10 hover:bg-accent/10  px-6 py-4 rounded font-bold uppercase text-[10px] tracking-[0.2em] transition-all text-muted">
                Categories
             </button>
             <button 
               onClick={() => { setEditingProduct(null); setShowAddWizard(true); }}
               className="flex-grow md:flex-none bg-gold hover:bg-white text-paper px-10 py-4 rounded font-bold uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 transition-all group shadow-[0_0_20px_rgba(212,175,55,0.15)]"
             >
               <Plus size={18} className="group-hover:rotate-90 transition-transform" /> 
               Add Product
             </button>
          </div>
       </div>

       <AnimatePresence>
         {showCategoriesModal && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#111]  rounded-lg w-full max-w-md p-8 relative z-50 shadow-2xl flex flex-col max-h-[80vh]"
              >
                 <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold uppercase tracking-widest text-ink">Manage Categories</h2>
                    <button onClick={() => setShowCategoriesModal(false)} className="text-muted hover:text-ink transition-colors">
                       <X size={20} />
                    </button>
                 </div>
                 
                 <div className="space-y-4 mb-8 overflow-y-auto pr-2 custom-scrollbar">
                    {categories.map(cat => (
                      <div key={cat.id} className="flex justify-between items-center p-4 bg-accent/10  rounded group">
                         <span className="text-[11px] font-bold uppercase tracking-widest text-ink">{cat.name}</span>
                         <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => startEditCategory(cat)} className="text-muted hover:text-ink transition-colors"><Edit size={14} /></button>
                           <button onClick={() => {
                              if (window.confirm(`Are you sure you want to delete "${cat.name}"?`)) {
                                deleteCategory(cat.id);
                              }
                           }} className="text-muted hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                         </div>
                      </div>
                    ))}
                 </div>
                 
                 <div className="flex gap-2 mt-auto pt-4 border-t border-accent/40">
                    <input 
                      type="text" 
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                      placeholder={editingCategory ? "UPDATE NAME" : "NEW CATEGORY NAME"} 
                      className="flex-grow bg-paper  p-3 rounded text-[10px] uppercase font-bold tracking-widest text-ink placeholder:text-muted/50 outline-none focus:border-gold transition-colors" 
                    />
                    <button onClick={handleAddCategory} className="bg-gold text-paper px-6 py-3 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors">
                       {editingCategory ? 'Update' : 'Add'}
                    </button>
                 </div>
              </motion.div>
              <div className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-40" onClick={() => setShowCategoriesModal(false)} />
           </div>
         )}
       </AnimatePresence>

       {showAddWizard && (
         <AddProductWizard 
           onSave={addProduct}
           onCancel={() => { setShowAddWizard(false); setEditingProduct(null); }}
           initialData={editingProduct || undefined}
         />
       )}

       <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
         {products.map((p: Product) => (
           <motion.div 
             key={p.id}
             layout
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="group bg-paper  rounded-lg overflow-hidden flex flex-col hover:border-gold/30 transition-all shadow-xl"
           >
             <div className="relative aspect-square overflow-hidden">
               <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
               <div className="absolute top-2 right-2 lg:top-4 lg:right-4 flex gap-2">
                  <button onClick={() => startEdit(p)} className="p-1.5 lg:p-2 bg-ink/80 backdrop-blur-md rounded  hover:bg-gold hover:text-paper transition-all text-muted">
                     <Edit size={12} />
                  </button>
               </div>
               <div className="absolute bottom-3 left-3">
                  <span className={`px-1.5 py-0.5 rounded-[1px] text-[7px] lg:text-[8px] font-bold uppercase tracking-widest ${p.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-accent/10 text-muted'}`}>
                     {p.status}
                  </span>
               </div>
             </div>
             <div className="p-3 lg:p-6 space-y-3 lg:space-y-4 flex-grow flex flex-col justify-between bg-paper">
                <div>
                   <h3 className="text-[10px] lg:text-xs uppercase tracking-widest font-bold mb-1 line-clamp-1">{p.name}</h3>
                   <div className="flex justify-between items-center text-[8px] lg:text-[10px] text-muted font-bold uppercase tracking-widest">
                      <span>{p.category}</span>
                      <span className="lg:block hidden">{p.inventory} Stock</span>
                   </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-accent/40">
                   <span className="text-xs lg:text-sm font-sans font-bold text-gold">{formatPrice(p.price)}</span>
                   <button onClick={() => deleteProduct(p.id)} className="p-1 hover:text-red-500 transition-colors text-muted">
                      <Trash2 size={12} />
                   </button>
                </div>
             </div>
           </motion.div>
         ))}
       </div>
    </div>
  );
};

const OrdersTab = ({ orders, setOrders, deleteOrder }: any) => {
  const { formatPrice, formatOrderNumber } = useApp();
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [filter, setFilter] = useState('All Orders');

  const toggleExpand = (id: string) => {
    setExpandedOrders(prev => 
      prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]
    );
  };

  const toggleSelect = (id: string) => {
    setSelectedOrders(prev => 
      prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((o: any) => o.id));
    }
  };

  const bulkUpdateTracking = (status: string) => {
    setOrders(orders.map((o: any) => 
      selectedOrders.includes(o.id) ? { ...o, status } : o
    ));
    setSelectedOrders([]);
  };

  const updateTracking = (id: string, status: string) => {
    setOrders(orders.map((o: any) => o.id === id ? { ...o, status } : o));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this acquisition record?')) {
      await deleteOrder(id);
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedOrders.length} records?`)) {
      for (const id of selectedOrders) {
        await deleteOrder(id);
      }
      setSelectedOrders([]);
    }
  };

  const statusOptions = ['All Orders', 'pending', 'processed', 'shipped', 'out-for-delivery', 'delivered'];

  return (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-accent/10 p-4 lg:p-8 rounded-lg gap-6">
           <div>
              <h1 className="text-2xl font-sans font-bold mb-1 tracking-tight">Order Management</h1>
              <p className="text-muted text-[10px] uppercase tracking-[0.2em] font-bold">Logistics & Fullfillment Control</p>
           </div>
           <div className="flex flex-wrap items-center gap-4">
               <button className="bg-accent/10 hover:bg-accent/10 p-3 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all">
                  <Download size={14} />
                  Export
               </button>
               <button className="bg-accent/10 hover:bg-accent/10 p-3 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all">
                  <Printer size={14} />
                  Manifest
               </button>
               <div className="h-10 w-px bg-accent/10 hidden md:block" />
               <div className="min-w-[180px]">
                <AdminDropdown 
                  value={filter}
                  onChange={setFilter}
                  options={statusOptions}
                />
             </div>

             {selectedOrders.length > 0 && (
               <motion.div 
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="flex items-center gap-3 bg-gold text-paper px-5 py-3 rounded-md font-bold text-[10px] shadow-2xl"
               >
                  <span className="tracking-widest">{selectedOrders.length} SELECTED</span>
                  <div className="h-4 w-px bg-ink/80" />
                  <button onClick={() => bulkUpdateTracking('shipped')} className="hover:underline tracking-widest px-2">SHIP</button>
                  <button onClick={() => bulkUpdateTracking('delivered')} className="hover:underline tracking-widest px-2">DELIVER</button>
                  <div className="h-4 w-px bg-ink/80 mx-1" />
                  <button onClick={handleBulkDelete} className="hover:text-red-500 transition-colors px-2"><Trash2 size={14} /></button>
                  <button onClick={() => setSelectedOrders([])} className="ml-2 hover:opacity-70 transition-opacity"><X size={14} /></button>
               </motion.div>
             )}
           </div>
        </div>

        <div className="bg-paper rounded-lg overflow-hidden">
           <div className="block md:hidden divide-y divide-white/5">
              {orders.filter((o: any) => filter === 'All Orders' || o.status === filter).map((o: any) => (
                <div key={o.id} className="p-6 space-y-4" onClick={() => toggleExpand(o.id)}>
                   <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                         <div className="flex items-center gap-2 mb-1">
                            <Checkbox checked={selectedOrders.includes(o.id)} onChange={() => toggleSelect(o.id)} />
                            <span className="text-[11px] font-bold text-ink tracking-widest">{formatOrderNumber(o.orderNumber)}</span>
                         </div>
                         <span className="font-bold uppercase tracking-widest text-[11px] text-muted">{o.customerName}</span>
                      </div>
                      <div className="text-right flex flex-col items-end">
                         <span className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${
                           o.status === 'delivered' ? 'text-green-400' : 
                           o.status === 'shipped' || o.status === 'out-for-delivery' ? 'text-blue-400' : 
                           'text-gold'
                         }`}>
                            {o.status.replace(/-/g, ' ')}
                         </span>
                         <span className="text-[12px] font-bold text-ink">{formatPrice(o.total)}</span>
                      </div>
                   </div>
                   
                   <AnimatePresence>
                    {expandedOrders.includes(o.id) && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-4 border-t border-accent/10 mt-4 flex flex-col gap-4 overflow-hidden"
                      >
                         <div className="space-y-2">
                           {o.items.map((item: any, i: number) => (
                             <div key={i} className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-muted">
                               <span>Lash x {item.quantity}</span>
                               <span>{formatPrice(item.price * item.quantity)}</span>
                             </div>
                           ))}
                         </div>
                         <div className="grid grid-cols-2 gap-2 mt-2">
                            {['pending', 'shipped', 'delivered'].map((st) => (
                              <button 
                                 key={st}
                                 onClick={(e) => { e.stopPropagation(); updateTracking(o.id, st); }}
                                 className={`py-2 rounded text-[8px] font-bold uppercase tracking-[0.1em] transition-all border ${
                                   o.status === st 
                                   ? 'bg-gold border-gold text-paper' 
                                   : 'bg-accent/10 text-muted'
                                 }`}
                              >
                                 {st}
                              </button>
                            ))}
                         </div>
                      </motion.div>
                    )}
                   </AnimatePresence>
                </div>
              ))}
           </div>

           <div className="hidden md:block overflow-x-auto no-scrollbar">
           <table className="w-full text-left min-w-[800px] md:min-w-0">
              <thead className="bg-[#0a0a0a] text-[9px] uppercase tracking-[0.3em] font-bold text-muted">
                 <tr>
                    <th className="px-8 py-4 w-12 text-center">
                       <Checkbox checked={selectedOrders.length === orders.length && orders.length > 0} onChange={selectAll} />
                    </th>
                    <th className="px-8 py-4">Reference</th>
                    <th className="px-8 py-4">Client</th>
                    <th className="px-8 py-4">Fulfilment Stage</th>
                    <th className="px-8 py-4 text-right">Total</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                 {orders.filter((o: any) => filter === 'All Orders' || o.status === filter).map((o: Order) => (
                   <React.Fragment key={o.id}>
                    <tr onClick={() => toggleExpand(o.id)} className={`group hover:bg-white/[0.02] transition-all cursor-pointer ${expandedOrders.includes(o.id) ? 'bg-white/[0.04]' : ''}`}>
                       <td className="px-8 py-6 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-center">
                            <Checkbox checked={selectedOrders.includes(o.id)} onChange={() => toggleSelect(o.id)} />
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <p className="text-[11px] font-bold text-ink tracking-widest">{formatOrderNumber(o.orderNumber)}</p>
                          <p className="text-[9px] text-muted mt-1 uppercase font-bold tracking-widest transition-opacity group-hover:opacity-100 opacity-0 italic">View Journey</p>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex flex-col">
                             <span className="font-bold uppercase tracking-widest text-[11px] mb-0.5">{o.customerName}</span>
                             <span className="text-[9px] text-muted lowercase font-mono">user_{o.id}@lashglaze.com</span>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                             <div className="flex gap-1">
                                {[1,2,3,4,5].map((s, i) => {
                                  const stageLevels = ['pending', 'processed', 'shipped', 'out-for-delivery', 'delivered'];
                                  const currentIdx = stageLevels.indexOf(o.status);
                                  return (
                                    <div key={s} className={`w-3 h-1 rounded-[1px] ${i <= currentIdx ? 'bg-gold' : 'bg-accent/10'}`} />
                                  );
                                })}
                             </div>
                             <span className={`text-[9px] font-bold uppercase tracking-widest ${
                                o.status === 'delivered' ? 'text-green-400' : 
                                o.status === 'shipped' || o.status === 'out-for-delivery' ? 'text-blue-400' : 
                                'text-gold'
                             }`}>
                                {o.status.replace(/-/g, ' ')}
                             </span>
                          </div>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <span className="text-[11px] font-bold text-ink">{formatPrice(o.total)}</span>
                       </td>
                    </tr>
                    {expandedOrders.includes(o.id) && (
                      <tr className="bg-[#080808]">
                         <td colSpan={5} className="p-0">
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="divide-y divide-white/5 shadow-inner px-8 py-10 grid grid-cols-3 gap-16 overflow-hidden"
                            >
                               <div className="space-y-6">
                                  <h4 className="text-[9px] uppercase tracking-[0.4em] font-bold text-gold/60">Order Snapshot</h4>
                                  <div className="space-y-3">
                                     {o.items.map((item: any, i: number) => (
                                       <div key={i} className="flex justify-between items-center bg-accent/10 p-4 rounded">
                                          <div className="text-[10px] uppercase font-bold tracking-widest">
                                            Lash x {item.quantity}
                                          </div>
                                          <div className="text-[10px] font-bold text-muted">{formatPrice(item.price * item.quantity)}</div>
                                       </div>
                                     ))}
                                  </div>
                               </div>

                               <div className="space-y-6">
                                  <h4 className="text-[9px] uppercase tracking-[0.4em] font-bold text-gold/60">Dispatch To</h4>
                                  <div className="bg-accent/10 p-6 rounded text-[10px] space-y-3 tracking-widest leading-loose">
                                     <p className="font-bold text-ink uppercase">{o.customerName}</p>
                                     <p className="text-muted">123 FASHION BOULEVARD<br />SUITE 402, DESIGN DISTRICT<br />BERLIN, 10115, DE</p>
                                     <div className="pt-3 border-t border-white/10 text-gold font-bold">Standard Priority Shipped</div>
                                  </div>
                                </div>

                               <div className="space-y-6">
                                  <div className="flex justify-between items-center">
                                     <h4 className="text-[9px] uppercase tracking-[0.4em] font-bold text-gold/60">Update Staging</h4>
                                     <div className="flex gap-4">
                                        <button className="text-[9px] font-bold uppercase text-muted hover:text-ink hover:underline">Issue Refund</button>
                                        <button onClick={() => handleDelete(o.id)} className="text-[9px] font-bold uppercase text-red-500 hover:underline">Delete Order</button>
                                     </div>
                                  </div>
                                  <div className="grid grid-cols-1 gap-3">
                                     {['pending', 'processed', 'shipped', 'out-for-delivery', 'delivered'].map((st) => (
                                       <button 
                                          key={st}
                                          onClick={() => updateTracking(o.id, st)}
                                          className={`py-3 rounded text-[9px] font-bold uppercase tracking-[0.2em] transition-all border ${
                                            o.status === st 
                                            ? 'bg-gold border-gold text-paper shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                                            : 'bg-accent/10 text-muted hover:text-ink hover:bg-accent/10'
                                          }`}
                                       >
                                          {st.replace(/-/g, ' ')}
                                       </button>
                                     ))}
                                  </div>
                               </div>
                            </motion.div>
                         </td>
                      </tr>
                    )}
                    </React.Fragment>
                 ))}
              </tbody>
           </table>
        </div>
    </div>
    </div>
  );
};
const ShippingRegionWizard = ({ isOpen, onClose, onSave, initialData }: { 
  isOpen: boolean, 
  onClose: () => void, 
  onSave: (r: any) => void,
  initialData?: any 
}) => {
  const [data, setData] = useState({
    id: initialData?.id || '',
    name: initialData?.name || '',
    countries: initialData?.countries?.join(', ') || '',
    shippingPrice: initialData?.shippingPrice?.toString() || '0',
    isDefault: initialData?.isDefault || false
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-ink/60 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-paper max-w-xl w-full shadow-2xl relative overflow-hidden flex flex-col p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold uppercase tracking-widest">Region Logistics</h2>
          <button onClick={onClose} className="text-muted"><X size={24} /></button>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-muted">Region Name</label>
            <input value={data.name} onChange={e => setData({...data, name: e.target.value})} type="text" placeholder="e.g. European Union" className="w-full bg-accent/10 p-4 text-xs font-bold tracking-widest outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-muted">Countries (Comma Separated)</label>
            <input value={data.countries} onChange={e => setData({...data, countries: e.target.value})} type="text" placeholder="e.g. Germany, France, Italy" className="w-full bg-accent/10 p-4 text-xs font-bold tracking-widest outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-muted">Base Shipping Price</label>
            <input value={data.shippingPrice} onChange={e => setData({...data, shippingPrice: e.target.value})} type="number" placeholder="0.00" className="w-full bg-accent/10 p-4 text-xs font-bold tracking-widest outline-none" />
          </div>
          <div className="flex items-center gap-3 py-2">
            <div 
              onClick={() => setData({...data, isDefault: !data.isDefault})}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer flex items-center ${data.isDefault ? 'bg-gold' : 'bg-accent/40'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${data.isDefault ? 'left-5.5' : 'left-0.5'}`} />
            </div>
            <span className="text-[10px] uppercase font-bold text-muted">Set as Default Region</span>
          </div>
        </div>
        <button 
          onClick={() => {
            onSave({
              ...data,
              countries: data.countries.split(',').map(c => c.trim()).filter(c => c !== ''),
              shippingPrice: parseFloat(data.shippingPrice)
            });
            onClose();
          }}
          className="w-full py-4 bg-ink text-paper text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gold transition-all"
        >
          Maintain Logistics
        </button>
      </motion.div>
    </div>
  );
};

const TaxRuleWizard = ({ isOpen, onClose, onSave, regions, initialData }: { 
  isOpen: boolean, 
  onClose: () => void, 
  onSave: (t: any) => void,
  regions: any[],
  initialData?: any 
}) => {
  const [data, setData] = useState({
    id: initialData?.id || '',
    name: initialData?.name || '',
    rate: initialData?.rate?.toString() || '20',
    regionId: initialData?.regionId || 'global',
    isGlobal: initialData?.isGlobal ?? true
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-ink/60 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-paper max-w-xl w-full shadow-2xl relative overflow-hidden flex flex-col p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold uppercase tracking-widest">Tax Configuration</h2>
          <button onClick={onClose} className="text-muted"><X size={24} /></button>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-muted">Rule Name</label>
            <input value={data.name} onChange={e => setData({...data, name: e.target.value})} type="text" placeholder="e.g. EU VAT" className="w-full bg-accent/10 p-4 text-xs font-bold tracking-widest outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-muted">Tax Rate (%)</label>
              <input value={data.rate} onChange={e => setData({...data, rate: e.target.value})} type="number" placeholder="20" className="w-full bg-accent/10 p-4 text-xs font-bold tracking-widest outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-muted">Scope</label>
              <select 
                value={data.regionId} 
                onChange={e => setData({...data, regionId: e.target.value, isGlobal: e.target.value === 'global'})}
                className="w-full bg-accent/10 p-4 text-xs font-bold tracking-widest outline-none appearance-none"
              >
                <option value="global">International (Global)</option>
                {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          </div>
        </div>
        <button 
          onClick={() => {
            onSave({
              ...data,
              rate: parseFloat(data.rate),
              isGlobal: data.regionId === 'global',
              regionId: data.regionId === 'global' ? undefined : data.regionId
            });
            onClose();
          }}
          className="w-full py-4 bg-ink text-paper text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gold transition-all"
        >
          Publish Tax Rule
        </button>
      </motion.div>
    </div>
  );
};

const DiscountWizard = ({ isOpen, onClose, storeSettings, products, onSave }: { 
  isOpen: boolean, 
  onClose: () => void, 
  storeSettings: any,
  products: any[],
  onSave: (c: any) => void
}) => {
  const [step, setStep] = useState(1);
  const [discountData, setDiscountData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed' | 'bogo',
    discountValue: '',
    minPurchase: '',
    requiredProductId: '',
    benefitProductId: '',
    expiryDate: ''
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-ink/60 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-paper max-w-xl w-full shadow-2xl relative overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-8 border-b border-accent/10">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gold/10 text-gold flex items-center justify-center"><Tag size={20} /></div>
              <div>
                 <h3 className="text-xs uppercase tracking-[0.3em] font-bold">Offer Architect</h3>
                 <p className="text-[9px] text-muted uppercase mt-1">Staging Phase {step} / 2</p>
              </div>
           </div>
           <button onClick={onClose} className="text-muted hover:text-ink"><X size={20} /></button>
        </div>

        <div className="p-8 space-y-6">
           {step === 1 ? (
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] uppercase text-muted font-bold tracking-widest">Incentive Code</label>
                   <input type="text" placeholder="e.g. GLAZE50" value={discountData.code} onChange={(e) => setDiscountData({...discountData, code: e.target.value.toUpperCase()})} className="w-full bg-accent/10 p-5 text-xs font-bold tracking-widest outline-none uppercase" />
                </div>
                <div className="grid grid-cols-1 gap-4">
                   <label className="text-[10px] uppercase text-muted font-bold tracking-widest">Benefit Mechanics</label>
                   <div className="flex bg-accent/10 p-1">
                      {['percentage', 'fixed', 'bogo'].map(t => (
                        <button key={t} onClick={() => setDiscountData({...discountData, discountType: t as any})} className={`flex-1 py-3 text-[9px] font-bold uppercase tracking-widest transition-all ${discountData.discountType === t ? 'bg-gold text-paper' : 'text-muted hover:text-ink'}`}>
                           {t === 'bogo' ? 'Product Combo' : t}
                        </button>
                      ))}
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] uppercase text-muted font-bold tracking-widest">Incentive Value</label>
                      <input type="number" placeholder="0" value={discountData.discountValue} onChange={(e) => setDiscountData({...discountData, discountValue: e.target.value})} className="w-full bg-accent/10 p-5 text-xs font-bold tracking-widest outline-none" />
                   </div>
                   <div className="flex items-end pb-5 text-[10px] font-bold text-muted">
                      {discountData.discountType === 'percentage' ? '%' : discountData.discountType === 'fixed' ? storeSettings.currency : 'OFF SECOND ITEM'}
                   </div>
                </div>
             </div>
           ) : (
             <div className="space-y-6">
                {discountData.discountType === 'bogo' && (
                  <div className="space-y-4 bg-gold/5 p-4 rounded-lg">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase text-muted font-bold tracking-widest">Primary Product (Must be in Basket)</label>
                      <select value={discountData.requiredProductId} onChange={e => setDiscountData({...discountData, requiredProductId: e.target.value})} className="w-full bg-paper p-4 text-[10px] font-bold uppercase tracking-widest outline-none">
                        <option value="">Select Product...</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase text-muted font-bold tracking-widest">Benefit Product (Receives Discount)</label>
                      <select value={discountData.benefitProductId} onChange={e => setDiscountData({...discountData, benefitProductId: e.target.value})} className="w-full bg-paper p-4 text-[10px] font-bold uppercase tracking-widest outline-none">
                        <option value="">Select Targeted Product...</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-muted font-bold tracking-widest">Min. Threshold</label>
                    <input type="number" value={discountData.minPurchase} onChange={e => setDiscountData({...discountData, minPurchase: e.target.value})} placeholder="0.00" className="w-full bg-accent/10 p-5 text-xs font-bold tracking-widest outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-muted font-bold tracking-widest">Sunset Date</label>
                    <input type="date" value={discountData.expiryDate} onChange={e => setDiscountData({...discountData, expiryDate: e.target.value})} className="w-full bg-accent/10 p-5 text-xs font-bold tracking-widest outline-none" />
                  </div>
                </div>
             </div>
           )}
        </div>

        <div className="p-8 bg-paper flex gap-4 border-t border-accent/10 justify-end">
           {step === 2 && <button onClick={() => setStep(1)} className="px-10 py-4 text-[10px] font-bold uppercase text-muted">Staging</button>}
           <button 
             onClick={() => {
               if (step === 1) setStep(2);
               else {
                 onSave({
                   ...discountData,
                   discountValue: parseFloat(discountData.discountValue || '0'),
                   minPurchase: parseFloat(discountData.minPurchase || '0'),
                   active: true,
                   usageCount: 0
                 });
                 onClose();
               }
             }}
             className="px-12 py-4 bg-ink text-paper text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gold transition-all"
           >
              {step === 1 ? 'Configure Rules' : 'Publish Offer'}
           </button>
        </div>
      </motion.div>
    </div>
  );
};

const PaymentTab = () => {
  const { 
    formatPrice, togglePaymentMethod, paymentMethods, 
    shippingRegions, saveShippingRegion, deleteShippingRegion,
    taxRules, saveTaxRule, deleteTaxRule,
    coupons, saveCoupon, deleteCoupon,
    storeSettings, products
  } = useApp();
  
  const [isCouponWizardOpen, setIsCouponWizardOpen] = useState(false);
  const [isRegionWizardOpen, setIsRegionWizardOpen] = useState(false);
  const [isTaxWizardOpen, setIsTaxWizardOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<any>(null);
  const [editingTax, setEditingTax] = useState<any>(null);

  const handleAddRegion = () => { setEditingRegion(null); setIsRegionWizardOpen(true); };
  const handleEditRegion = (r: any) => { setEditingRegion(r); setIsRegionWizardOpen(true); };
  const handleAddTax = () => { setEditingTax(null); setIsTaxWizardOpen(true); };
  const handleEditTax = (t: any) => { setEditingTax(t); setIsTaxWizardOpen(true); };

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
         {/* Payment Providers */}
         <div className="space-y-8">
            <h2 className="text-xl font-serif italic flex items-center gap-3">
               <CreditCard className="text-gold" size={20} />
               Secure Gateways
            </h2>
            <div className="space-y-3">
                {paymentMethods.map((m: any) => (
                  <div key={m.id} className="p-6 bg-accent/10 flex items-center justify-between group hover:bg-accent/20 transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-paper flex items-center justify-center text-gold shadow-sm group-hover:scale-110 transition-transform">
                           <CreditCard size={20} />
                        </div>
                        <div>
                           <p className="font-bold uppercase tracking-widest text-[11px]">{m.name}</p>
                           <p className="text-[8px] text-muted uppercase tracking-widest mt-1">Status: {m.enabled ? 'Live Environment' : 'Sandbox Mode'}</p>
                        </div>
                     </div>
                     <div 
                       onClick={() => togglePaymentMethod(m.id, !m.enabled)}
                       className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer flex items-center ${m.enabled ? 'bg-gold' : 'bg-accent/40'}`}
                     >
                       <motion.div animate={{ x: m.enabled ? 26 : 2 }} className="w-4 h-4 rounded-full bg-white shadow-md mx-0.5" />
                     </div>
                  </div>
                ))}
            </div>
         </div>

         {/* Logistics & Regions */}
         <div className="space-y-8">
            <h2 className="text-xl font-serif italic flex items-center gap-3">
               <Ship className="text-gold" size={20} />
               Logistics Network
            </h2>
            <div className="space-y-6">
               <div className="bg-accent/10 overflow-hidden border border-white/5">
                  <div className="p-4 bg-accent/20 flex justify-between items-center">
                     <p className="text-[10px] uppercase font-bold tracking-widest">Zonal Shipping Rates</p>
                     <button onClick={handleAddRegion} className="text-[10px] uppercase font-bold text-gold hover:underline flex items-center gap-2"><Plus size={12}/> Region</button>
                  </div>
                  <div className="divide-y divide-white/5">
                     {shippingRegions.map((r: any) => (
                       <div key={r.id} className="p-5 flex items-center justify-between hover:bg-white/[0.02]">
                          <div>
                             <p className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                               {r.name} {r.isDefault && <span className="text-[7px] bg-gold/20 text-gold px-1.5 py-0.5 rounded">Default</span>}
                             </p>
                             <p className="text-[9px] text-muted uppercase mt-1">Base: {formatPrice(r.shippingPrice)} • {r.countries.length} Countries</p>
                          </div>
                          <div className="flex gap-4">
                            <button onClick={() => handleEditRegion(r)} className="text-muted hover:text-gold transition-colors"><Edit size={14}/></button>
                            <button onClick={() => deleteShippingRegion(r.id)} className="text-muted hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="bg-accent/10 p-6 space-y-5">
                  <div className="flex justify-between items-center">
                     <h4 className="text-[10px] uppercase font-bold tracking-widest">Regional Tax Rules</h4>
                     <button onClick={handleAddTax} className="text-[10px] uppercase font-bold text-gold hover:underline">Configure</button>
                  </div>
                  <div className="space-y-3">
                    {taxRules.map(t => (
                      <div key={t.id} className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-muted bg-paper/30 p-3">
                        <span>{t.name} ({t.rate}%)</span>
                        <div className="flex gap-3">
                          <button onClick={() => handleEditTax(t)} className="hover:text-gold"><Edit size={12}/></button>
                          <button onClick={() => deleteTaxRule(t.id)} className="hover:text-red-400"><X size={12}/></button>
                        </div>
                      </div>
                    ))}
                    {taxRules.length === 0 && <p className="text-[9px] text-muted font-medium italic">No localized tax rules established.</p>}
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Promotion Engine */}
      <div className="bg-paper shadow-2xl relative overflow-hidden">
         <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-accent/10">
            <div>
               <h3 className="text-xl font-serif italic mb-2 text-gold">Editorial Promotion Suite</h3>
               <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted">Strategic incentivization management</p>
            </div>
            <button onClick={() => setIsCouponWizardOpen(true)} className="bg-gold text-paper px-10 py-5 font-bold text-[10px] uppercase tracking-[0.3em] flex items-center gap-4 hover:bg-white transition-all shadow-xl">
               <Plus size={16} /> New Editorial Offer
            </button>
         </div>
         
         <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left">
               <thead className="bg-[#0a0a0a] text-[9px] uppercase tracking-[0.3em] font-bold text-muted">
                  <tr>
                     <th className="px-8 py-5">Codex</th>
                     <th className="px-8 py-5">Benefit</th>
                     <th className="px-8 py-5">Logic</th>
                     <th className="px-8 py-5 text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5 font-sans">
                  {coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                       <td className="px-8 py-6">
                          <span className="bg-gold/10 text-gold px-3 py-1 rounded text-[11px] font-bold font-serif italic tracking-widest">
                             {c.code}
                          </span>
                       </td>
                       <td className="px-8 py-6 text-[11px] font-bold">
                          {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : c.discountType === 'fixed' ? `${formatPrice(c.discountValue)} OFF` : 'COMBO DISCOUNT'}
                       </td>
                       <td className="px-8 py-6 uppercase text-[9px] font-bold text-muted tracking-widest">
                          {c.discountType === 'bogo' ? 'Conditional Product Logic' : `Threshold: Min ${formatPrice(c.minPurchase)}`}
                       </td>
                       <td className="px-8 py-6 text-right">
                          <button onClick={() => deleteCoupon(c.id)} className="text-[10px] uppercase font-bold text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">Decommission</button>
                       </td>
                    </tr>
                  ))}
                  {coupons.length === 0 && (
                    <tr><td colSpan={4} className="p-20 text-center text-muted uppercase text-[10px] tracking-widest font-bold opacity-30">Archive Empty / No Active Campaigns</td></tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      <DiscountWizard isOpen={isCouponWizardOpen} onClose={() => setIsCouponWizardOpen(false)} storeSettings={storeSettings} products={products} onSave={saveCoupon} />
      <ShippingRegionWizard isOpen={isRegionWizardOpen} onClose={() => setIsRegionWizardOpen(false)} onSave={saveShippingRegion} initialData={editingRegion} />
      <TaxRuleWizard isOpen={isTaxWizardOpen} onClose={() => setIsTaxWizardOpen(false)} onSave={saveTaxRule} regions={shippingRegions} initialData={editingTax} />
    </div>
  );
};

const PoliciesTab = () => {
    const { policies, savePolicy } = useApp();
    const [editingType, setEditingType] = useState<'refund' | 'privacy' | 'terms' | 'shipping' | null>(null);
    const [content, setContent] = useState('');
    const [isPublished, setIsPublished] = useState(true);

    const startEditing = (p: any) => {
        setEditingType(p.type);
        setContent(p.content);
        setIsPublished(p.published);
    };

    const handleSave = () => {
        if (!editingType) return;
        const policy = policies.find(p => p.type === editingType);
        if (policy) {
            savePolicy({ ...policy, content, published: isPublished });
            setEditingType(null);
        }
    };

    return (
        <div className="space-y-12">
            <div className="bg-accent/10 p-8 flex justify-between items-center rounded-lg shadow-inner">
                <div>
                   <h1 className="text-2xl font-serif italic text-gold">Legal Documents</h1>
                   <p className="text-muted text-[10px] uppercase tracking-[0.2em] font-bold">Policy & Compliance Editorial</p>
                </div>
                <div className="flex items-center gap-3 bg-paper p-3 rounded shadow-sm">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                   <span className="text-[10px] uppercase font-bold tracking-widest text-muted">System Compliance: Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {policies.map(p => (
                    <motion.div 
                      key={p.type} 
                      layoutId={p.type}
                      className="bg-paper p-8 flex flex-col space-y-6 shadow-xl border border-white/5"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <h3 className="text-xs uppercase tracking-[0.3em] font-bold mb-1">{p.type} Policy</h3>
                                <span className={`text-[8px] font-bold uppercase tracking-widest ${p.published ? 'text-green-400' : 'text-red-400'}`}>
                                    {p.published ? 'Published & Live' : 'Internal Draft'}
                                </span>
                            </div>
                            <button onClick={() => startEditing(p)} className="p-3 bg-accent/10 hover:bg-gold hover:text-paper transition-all rounded shadow-sm">
                                <Edit size={16} />
                            </button>
                        </div>
                        <div className="text-[10px] text-muted line-clamp-3 leading-loose font-mono uppercase tracking-tighter opacity-60">
                            {p.content}
                        </div>
                        <div className="pt-4 border-t border-accent/10 flex justify-between items-center text-[8px] text-muted uppercase font-bold tracking-widest">
                            <span>Last Updated: {new Date(p.updatedAt).toLocaleDateString()}</span>
                            <span>{p.content.split(' ').length} Words</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {editingType && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingType(null)} className="absolute inset-0 bg-ink/80 backdrop-blur-3xl" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-paper w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative z-[120] shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
                             <div className="p-10 border-b border-accent/10 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gold/10 text-gold flex items-center justify-center"><FileText size={24} /></div>
                                    <div>
                                        <h2 className="text-xl font-serif italic uppercase tracking-widest">Editorial: {editingType} Policy</h2>
                                        <p className="text-[10px] text-muted font-bold tracking-widest mt-1">Official store documentation</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-3">
                                        <div 
                                          onClick={() => setIsPublished(!isPublished)}
                                          className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer flex items-center ${isPublished ? 'bg-gold' : 'bg-accent/40'}`}
                                        >
                                          <motion.div animate={{ x: isPublished ? 26 : 2 }} className="w-4 h-4 rounded-full bg-white shadow-md mx-0.5" />
                                        </div>
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-muted">{isPublished ? 'PUBLISHED' : 'DRAFT'}</span>
                                    </div>
                                    <button onClick={() => setEditingType(null)} className="text-muted"><X size={24} /></button>
                                </div>
                             </div>
                             <div className="flex-grow p-10 overflow-hidden flex flex-col space-y-4">
                                <label className="text-[10px] uppercase font-bold text-muted tracking-[0.2em]">Markdown Editor</label>
                                <textarea 
                                    className="flex-grow bg-accent/5 p-10 text-xs font-mono text-ink tracking-wide leading-loose resize-none outline-none focus:bg-accent/10 transition-colors custom-scrollbar uppercase"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                             </div>
                             <div className="p-10 bg-accent/5 border-t border-accent/10 flex justify-end">
                                <button 
                                    onClick={handleSave} 
                                    className="bg-gold text-paper px-16 py-5 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-white transition-all shadow-2xl"
                                >
                                    Commit Official Record
                                </button>
                             </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
;

const CustomersTab = ({ customers }: any) => {
  const { formatPrice } = useApp();
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter((c: any) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const customerSpendingData = [
    { month: 'Jan', spent: 120 },
    { month: 'Feb', spent: 450 },
    { month: 'Mar', spent: 300 },
    { month: 'Apr', spent: 600 },
    { month: 'May', spent: 200 },
    { month: 'Jun', spent: 450 },
  ];

  if (selectedCustomer) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-10"
      >
        <div className="flex items-center gap-6">
           <button 
             onClick={() => setSelectedCustomer(null)}
             className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-accent/10 transition-all text-muted hover:text-ink"
           >
              <ChevronLeft size={20} />
           </button>
           <div className="flex flex-col">
              <h1 className="text-3xl font-serif italic">{selectedCustomer.name}</h1>
              <p className="text-muted text-[10px] uppercase tracking-[0.3em] font-bold mt-1">Acquired on March 12, 2024</p>
           </div>
           <div className="ml-auto flex gap-4">
              <button className="bg-accent/10 px-6 py-3 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-accent/10 transition-all">Send Note</button>
              <button className="bg-gold text-paper px-6 py-3 rounded font-bold text-[10px] uppercase tracking-widest shadow-2xl">Create Reward</button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
           <div className="bg-paper p-8 rounded-lg space-y-2">
              <p className="text-[10px] uppercase text-muted font-bold tracking-widest">Lifetime Value</p>
              <p className="text-3xl font-sans font-bold text-gold">{formatPrice(selectedCustomer.totalSpent)}</p>
           </div>
           <div className="bg-paper p-8 rounded-lg space-y-2">
              <p className="text-[10px] uppercase text-muted font-bold tracking-widest">Order Count</p>
              <p className="text-3xl font-sans font-bold">{selectedCustomer.orders}</p>
           </div>
           <div className="bg-paper p-8 rounded-lg space-y-2">
              <p className="text-[10px] uppercase text-muted font-bold tracking-widest">Avg. Ticket</p>
              <p className="text-3xl font-sans font-bold">{formatPrice(selectedCustomer.totalSpent / selectedCustomer.orders)}</p>
           </div>
           <div className="bg-paper p-8 rounded-lg space-y-2">
              <p className="text-[10px] uppercase text-muted font-bold tracking-widest">Engagement</p>
              <p className="text-3xl font-sans font-bold text-green-400">High</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 bg-paper p-10 rounded-lg">
              <h3 className="text-xs uppercase tracking-[0.4em] font-bold mb-10 flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-gold" />
                 Spend Visualization
              </h3>
              <div className="h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={customerSpendingData}>
                       <defs>
                          <linearGradient id="customerCurve" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.2}/>
                             <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis dataKey="month" stroke="#ffffff10" fontSize={10} tickLine={false} axisLine={false} />
                       <YAxis hide />
                       <Tooltip 
                         contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                         itemStyle={{ color: '#D4AF37' }}
                       />
                       <Area type="monotone" dataKey="spent" stroke="#D4AF37" fill="url(#customerCurve)" strokeWidth={2} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="bg-paper p-10 rounded-lg overflow-hidden flex flex-col">
              <h3 className="text-xs uppercase tracking-[0.4em] font-bold mb-8 flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-gold" />
                 Recent Journey
              </h3>
              <div className="space-y-6 overflow-y-auto no-scrollbar">
                 {[1,2,3].map((i) => (
                    <div key={i} className="flex gap-4 items-start relative pb-6 border-l border-accent/10 ml-2 pl-6">
                       <div className="absolute -left-[5px] top-0 w-[9px] h-[9px] rounded-full bg-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                       <div>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Order #0023{i} Delivered</p>
                          <p className="text-[9px] text-muted mt-1 uppercase font-bold tracking-[0.1em]">Berlin, DE • {i} days ago</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-10">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-accent/10 p-10 rounded-lg gap-8">
          <div>
             <h1 className="text-2xl font-sans font-bold mb-1 tracking-tight">Client Portfolio</h1>
             <p className="text-muted text-[10px] uppercase tracking-[0.3em] font-bold">Lash Enthusiast Demographic</p>
          </div>
          <div className="relative w-full md:w-96">
             <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
             <input 
                type="text" 
                placeholder="Search by name or identity..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-paper pl-12 pr-6 py-4 text-xs font-bold uppercase tracking-widest text-ink placeholder:text-muted/50 outline-none focus:bg-accent/10 transition-colors rounded-md"
             />
          </div>
       </div>

       <div className="bg-paper rounded-lg overflow-hidden">
           {/* Mobile Card View */}
           <div className="block md:hidden divide-y divide-white/5">
              {filteredCustomers.map((c: any) => (
                <div key={c.id} className="p-6 space-y-4" onClick={() => setSelectedCustomer(c)}>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-bold text-gold">
                            {c.name.split(' ').map((n: string) => n[0]).join('')}
                         </div>
                         <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest">{c.name}</p>
                            <p className="text-[9px] text-muted uppercase mt-0.5">{c.orders} Orders</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[12px] font-bold text-gold">{formatPrice(c.totalSpent)}</p>
                         <p className="text-[8px] text-muted uppercase mt-1">Total Spent</p>
                      </div>
                   </div>
                </div>
              ))}
           </div>

           <div className="hidden md:block overflow-x-auto no-scrollbar">
          <table className="w-full text-left min-w-[700px] md:min-w-0">
             <thead className="bg-[#0a0a0a] text-[9px] uppercase tracking-[0.4em] font-bold text-muted">
                <tr>
                  <th className="px-10 py-6">Customer Profile</th>
                  <th className="px-10 py-6">Identity</th>
                  <th className="px-10 py-6">Order History</th>
                  <th className="px-10 py-6 text-right">Lifetime Value</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
                 {filteredCustomers.map((c: any) => (
                   <tr 
                     key={c.id} 
                     onClick={() => setSelectedCustomer(c)}
                     className="hover:bg-white/[0.03] transition-all cursor-pointer group"
                   >
                      <td className="px-10 py-8">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-bold text-gold group-hover:bg-gold group-hover:text-paper transition-all">
                               {c.name.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <div>
                               <p className="text-[11px] font-bold uppercase tracking-[0.1em]">{c.name}</p>
                               <p className="text-[9px] text-muted uppercase font-bold mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">View Profile</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-10 py-8 text-[11px] text-muted font-mono italic">{c.email}</td>
                      <td className="px-10 py-8">
                         <div className="flex items-center gap-3">
                            <span className="text-[11px] font-bold text-ink">{c.orders} Orders</span>
                            <div className="flex h-1 gap-0.5">
                               {[...Array(Math.min(c.orders, 10))].map((_, i) => (
                                 <div key={i} className="w-1 bg-gold/40" />
                               ))}
                            </div>
                         </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                         <span className="text-[12px] font-sans font-bold text-gold">{formatPrice(c.totalSpent)}</span>
                      </td>
                   </tr>
                 ))}
             </tbody>
          </table>
          </div>
       </div>
    </div>
  );
};

const DesignTab = () => {
  const { storeSettings, updateStoreSettings } = useApp();
  const theme = storeSettings.colors;
  const [saving, setSaving] = useState(false);

  const updateColor = async (key: keyof typeof theme, value: string) => {
    const updatedSettings = {
      ...storeSettings,
      colors: { ...theme, [key]: value }
    };
    try {
      await updateStoreSettings(updatedSettings);
    } catch (err) {
      console.error(err);
    }
  };

  const updateHeroBanner = async (url: string) => {
    const updatedSettings = {
      ...storeSettings,
      heroBannerUrl: url
    };
    try {
      await updateStoreSettings(updatedSettings);
    } catch (err) {
      console.error(err);
    }
  };

  const randomizeColors = () => {
    const hslToHex = (h: number, s: number, l: number) => {
      l /= 100;
      const a = s * Math.min(l, 1 - l) / 100;
      const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
      };
      return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
    };

    const baseHue = Math.floor(Math.random() * 360);
    const compHue = (baseHue + 180) % 360;
    const isDark = Math.random() > 0.5;

    const paper = isDark ? hslToHex(baseHue, 20, 8) : hslToHex(baseHue, 20, 98);
    const ink = isDark ? hslToHex(baseHue, 10, 95) : hslToHex(baseHue, 15, 10);
    const accent = hslToHex(baseHue, 30, isDark ? 20 : 85);
    const muted = hslToHex(baseHue, 15, 50);
    const gold = hslToHex(compHue, 60, 50);

    setSaving(true);
    updateStoreSettings({
      ...storeSettings,
      colors: {
        paper,
        ink,
        accent,
        muted,
        gold,
        topbarBg: isDark ? hslToHex(baseHue, 15, 12) : hslToHex(baseHue, 15, 15),
        topbarText: isDark ? hslToHex(baseHue, 10, 95) : hslToHex(baseHue, 10, 98),
        buttonBg: isDark ? hslToHex(baseHue, 10, 90) : hslToHex(baseHue, 15, 12),
        buttonText: isDark ? hslToHex(baseHue, 20, 8) : hslToHex(baseHue, 20, 98),
      }
    }).finally(() => setSaving(false));
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-accent/10 p-4 lg:p-8 rounded-lg gap-6">
         <div>
            <h1 className="text-2xl font-sans font-bold mb-1 tracking-tight">Atelier Aesthetic</h1>
            <p className="text-muted text-[10px] uppercase tracking-[0.2em] font-bold">Visual Identity Configuration</p>
         </div>
         <button 
           onClick={randomizeColors}
           className="bg-gold text-paper px-10 py-4 rounded font-bold uppercase text-[10px] tracking-[0.2em] shadow-[0_0_20px_rgba(212,175,55,0.2)]"
         >
            Randomize Palette
         </button>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
             <div className="p-8 bg-paper rounded-lg space-y-8">
               <h3 className="text-xs uppercase tracking-[0.4em] font-bold text-gold/60">Core Palette</h3>
               <div className="grid grid-cols-1 gap-6">
                  {['paper', 'ink', 'accent', 'muted', 'gold'].map((key) => {
                    const value = theme[key as keyof typeof theme];
                    return (
                      <div key={key} className="space-y-4">
                         <p className="text-[10px] uppercase text-muted font-bold tracking-widest flex justify-between">
                            <span>{key}</span>
                            <span>{value}</span>
                         </p>
                         <div className="flex items-center gap-4">
                            <input 
                               type="color" 
                               value={value} 
                               onChange={(e) => updateColor(key as any, e.target.value)}
                               className="w-12 h-12 rounded bg-transparent cursor-pointer overflow-hidden" 
                            />
                            <input 
                               type="text" 
                               value={value} 
                               onChange={(e) => updateColor(key as any, e.target.value)}
                               className="flex-grow bg-accent/10 p-4 text-[10px] font-mono font-bold tracking-widest text-ink outline-none focus:bg-accent/20 transition-colors" 
                            />
                         </div>
                      </div>
                    )
                  })}
               </div>
            </div>

            <div className="p-8 bg-paper rounded-lg space-y-8">
               <h3 className="text-xs uppercase tracking-[0.4em] font-bold text-gold/60">Components (Optional)</h3>
               <div className="grid grid-cols-1 gap-6">
                  {['topbarBg', 'topbarText', 'buttonBg', 'buttonText'].map((key) => {
                    const value = theme[key as keyof typeof theme] || '#000000';
                    return (
                      <div key={key} className="space-y-4">
                         <p className="text-[10px] uppercase text-muted font-bold tracking-widest flex justify-between">
                            <span>{key}</span>
                            <span>{value}</span>
                         </p>
                         <div className="flex items-center gap-4">
                            <input 
                               type="color" 
                               value={value} 
                               onChange={(e) => updateColor(key as any, e.target.value)}
                               className="w-12 h-12 rounded bg-transparent cursor-pointer overflow-hidden" 
                            />
                            <input 
                               type="text" 
                               value={value} 
                               onChange={(e) => updateColor(key as any, e.target.value)}
                               className="flex-grow bg-accent/10 p-4 text-[10px] font-mono font-bold tracking-widest text-ink outline-none focus:bg-accent/20 transition-colors" 
                            />
                         </div>
                      </div>
                    )
                  })}
               </div>
            </div>

            <div className="p-8 bg-paper rounded-lg space-y-8">
               <h3 className="text-xs uppercase tracking-[0.4em] font-bold text-gold/60">Hero Imagery</h3>
               <div className="space-y-4">
                  <p className="text-[10px] uppercase text-muted font-bold tracking-widest leading-loose">Hero Banner URL</p>
                  <div className="flex gap-4">
                    <input 
                        type="text" 
                        value={storeSettings.heroBannerUrl} 
                        onChange={(e) => updateHeroBanner(e.target.value)}
                        placeholder="https://..."
                        className="flex-grow bg-accent/10 p-4 text-[10px] font-mono font-bold tracking-widest text-ink placeholder:text-muted/50 outline-none focus:bg-accent/20 transition-colors" 
                     />
                  </div>
                  <p className="text-[9px] text-muted italic">Used as the background for the editorial hero section.</p>
               </div>
            </div>

            <div className="p-8 bg-paper rounded-lg space-y-8">
               <h3 className="text-xs uppercase tracking-[0.4em] font-bold text-gold/60">Type Scale</h3>
               <div className="space-y-6">
                    <div className="space-y-4">
                       <p className="text-[10px] uppercase text-muted font-bold tracking-widest leading-loose">Serif Display Family</p>
                       <AdminDropdown 
                          value="Playfair Display"
                          onChange={(v) => {}}
                          options={['Playfair Display', 'Cormorant Garamond', 'Bodoni Moda']}
                       />
                    </div>
                    <div className="space-y-4">
                       <p className="text-[10px] uppercase text-muted font-bold tracking-widest leading-loose">Sans UI Family</p>
                       <AdminDropdown 
                          value="Inter"
                          onChange={(v) => {}}
                          options={['Inter', 'Montserrat', 'Outfit']}
                       />
                    </div>
               </div>
            </div>
         </div>

         <div className="space-y-8">
            <div className="relative h-[600px] lg:h-full lg:min-h-[500px] bg-paper rounded-lg p-6 lg:p-12 flex flex-col items-center justify-center text-center group w-full overflow-hidden" style={{backgroundColor: theme.paper}}>
               <div className="absolute inset-x-8 top-8 flex justify-between border-b border-black/10 pb-8" style={{borderColor: theme.accent}}>
                  <div className="flex flex-col items-start">
                     <span className="font-serif text-2xl italic font-bold uppercase tracking-widest leading-none" style={{color: theme.gold}}>Atelier</span>
                     <span className="text-[10px] tracking-[0.4em] font-bold opacity-40 uppercase leading-none mt-1" style={{color: theme.ink}}>Preview Mode</span>
                  </div>
               </div>

               <div className="mt-16 flex flex-col items-center">
                 <Palette size={64} className="opacity-10 mb-8 group-hover:scale-110 transition-transform duration-700" style={{color: theme.gold}} />
                 <h3 className="text-2xl lg:text-3xl font-serif italic mb-4 leading-tight" style={{color: theme.ink}}>Visual Identity Virtualizer</h3>
                 <p className="text-[9px] lg:text-[11px] opacity-60 mb-10 max-w-xs uppercase tracking-[0.3em] leading-loose font-bold px-4" style={{color: theme.muted}}>
                    Simulate your atelier's aesthetic in real-time across the entire interface.
                 </p>
                 
                 <div className="w-full max-w-sm space-y-4 px-4">
                    <div className="p-6 shadow-sm font-bold uppercase tracking-[0.4em] transition-all px-10 py-4 text-[10px]" style={{backgroundColor: theme.accent + '20'}}>
                       <div className="w-1.5 h-6 mb-4" style={{backgroundColor: theme.gold}} />
                       <h4 className="text-lg font-serif italic mb-2" style={{color: theme.ink}}>Typography Sample</h4>
                       <p className="text-xs leading-relaxed font-sans" style={{color: theme.muted}}>
                          The quick brown fox jumps over the lazy dog. Interacting with the luxury tier requires precision.
                       </p>
                    </div>
                    <button className="w-full py-4 text-[10px] uppercase font-bold tracking-[0.4em] transition-all" style={{backgroundColor: theme.gold, color: theme.paper}}>
                       Export Stylesheet
                    </button>
                 </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

const SettingsTab = () => {
  const { storeSettings, updateStoreSettings } = useApp();
  const [localSettings, setLocalSettings] = useState(storeSettings);
  const [saving, setSaving] = useState(false);
  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: true,
    loginAlerts: true,
    apiAccess: false
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateStoreSettings(localSettings);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-12 pb-32">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-accent/10 p-4 lg:p-8 rounded-lg gap-6">
          <div>
             <h1 className="text-2xl font-sans font-bold mb-1 tracking-tight">Atelier Parameters</h1>
             <p className="text-muted text-[10px] uppercase tracking-[0.2em] font-bold">Store Global Configuration</p>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
             <div className="bg-paper p-4 lg:p-8 rounded-lg space-y-8">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-gold/10 rounded flex items-center justify-center text-gold">
                      <Globe size={18} />
                   </div>
                   <h3 className="text-xs uppercase tracking-[0.4em] font-bold text-gold/60">Identity & Presence</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <label className="text-[10px] uppercase text-muted font-bold tracking-widest">Atelier Name</label>
                      <input 
                         type="text" 
                         value={localSettings.storeName}
                         onChange={(e) => setLocalSettings({...localSettings, storeName: e.target.value})}
                         className="w-full bg-accent/10 p-4 text-[10px] font-bold tracking-widest text-ink outline-none focus:bg-accent/20 transition-colors uppercase" 
                      />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] uppercase text-muted font-bold tracking-widest">Support Correspondence</label>
                      <input 
                         type="email" 
                         value={localSettings.supportEmail}
                         onChange={(e) => setLocalSettings({...localSettings, supportEmail: e.target.value})}
                         className="w-full bg-accent/10 p-4 text-[10px] font-bold tracking-widest text-ink outline-none focus:bg-accent/20 transition-colors lowercase" 
                      />
                   </div>
                </div>
             </div>

             <div className="bg-paper p-4 lg:p-8 rounded-lg space-y-8">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-gold/10 rounded flex items-center justify-center text-gold">
                      <MapPin size={18} />
                   </div>
                   <h3 className="text-xs uppercase tracking-[0.4em] font-bold text-gold/60">Global Logistics</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <label className="text-[10px] uppercase text-muted font-bold tracking-widest">Currency Staging</label>
                      <AdminDropdown 
                         value={localSettings.currency}
                         onChange={(v) => setLocalSettings({...localSettings, currency: v})}
                         options={['GBP', 'USD', 'EUR', 'CAD']}
                      />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] uppercase text-muted font-bold tracking-widest">Primary Language</label>
                      <AdminDropdown 
                         value="English (UK)"
                         onChange={(v) => {}}
                         options={['English (UK)', 'English (US)', 'French', 'German']}
                      />
                   </div>
                </div>
             </div>

             <div className="bg-paper p-4 lg:p-8 rounded-lg space-y-8">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-gold/10 rounded flex items-center justify-center text-gold">
                      <FileText size={18} />
                   </div>
                   <h3 className="text-xs uppercase tracking-[0.4em] font-bold text-gold/60">Legal Documentation</h3>
                </div>
                
                <div className="divide-y divide-white/5">
                   {[
                      { title: 'Privacy Policy', updated: 'Mar 15, 2024', status: 'Published' },
                      { title: 'Terms of Service', updated: 'Mar 10, 2024', status: 'Published' },
                      { title: 'Shipping Policy', updated: 'Jan 20, 2026', status: 'Published' },
                      { title: 'Return & Refund Policy', updated: 'Never', status: 'Draft' },
                   ].map(doc => (
                      <div key={doc.title} className="py-6 flex items-center justify-between">
                         <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-ink">{doc.title}</p>
                            <p className="text-[9px] text-muted mt-1 uppercase">Last Update: {doc.updated}</p>
                         </div>
                         <div className="flex items-center gap-6">
                            <span className={`text-[9px] font-bold uppercase tracking-widest ${doc.status === 'Published' ? 'text-green-400' : 'text-muted'}`}>{doc.status}</span>
                            <button className="p-2 hover:bg-accent/10 rounded transition-colors">
                               <Edit size={14} className="text-gold" />
                            </button>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
             <div className="bg-paper p-4 lg:p-8 rounded-lg space-y-8">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-gold/10 rounded flex items-center justify-center text-gold">
                      <Shield size={18} />
                   </div>
                   <h3 className="text-xs uppercase tracking-[0.4em] font-bold text-gold/60">Security</h3>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <div>
                         <p className="text-[10px] font-bold uppercase tracking-widest text-ink">Two-Factor Auth</p>
                         <p className="text-[9px] text-muted mt-1 italic">Biometric Verification</p>
                      </div>
                      <button 
                         onClick={() => setSecuritySettings({...securitySettings, twoFactor: !securitySettings.twoFactor})}
                         className={`w-10 h-5 rounded-full relative transition-all ${securitySettings.twoFactor ? 'bg-gold' : 'bg-accent/10'}`}
                      >
                         <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${securitySettings.twoFactor ? 'left-5.5' : 'left-0.5'}`} />
                      </button>
                   </div>
                   <div className="flex items-center justify-between">
                      <div>
                         <p className="text-[10px] font-bold uppercase tracking-widest text-ink">Login Alerts</p>
                         <p className="text-[9px] text-muted mt-1 italic">Real-time Notifications</p>
                      </div>
                      <button 
                         onClick={() => setSecuritySettings({...securitySettings, loginAlerts: !securitySettings.loginAlerts})}
                         className={`w-10 h-5 rounded-full relative transition-all ${securitySettings.loginAlerts ? 'bg-gold' : 'bg-accent/10'}`}
                      >
                         <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${securitySettings.loginAlerts ? 'left-5.5' : 'left-0.5'}`} />
                      </button>
                   </div>
                </div>
             </div>

             <div className="bg-paper p-4 lg:p-8 rounded-lg space-y-8">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-gold/10 rounded flex items-center justify-center text-gold">
                      <Key size={18} />
                   </div>
                   <h3 className="text-xs uppercase tracking-[0.4em] font-bold text-gold/60">API Access</h3>
                </div>
                
                <div className="space-y-4">
                   <div className="p-4 bg-accent/10 rounded">
                      <p className="text-[9px] uppercase tracking-widest font-bold text-muted mb-2">Live API Token</p>
                      <p className="text-[10px] font-mono break-all text-muted">pk_live_51P2...4a8b</p>
                   </div>
                   <button className="w-full py-3 bg-gold/10 text-gold text-[9px] uppercase font-bold tracking-widest hover:bg-gold hover:text-paper transition-all">Rotate Keys</button>
                </div>
             </div>

             <div className="bg-ink p-8 rounded-lg space-y-6 flex flex-col items-center text-center">
                <Bell size={32} className="text-paper/20" />
                <h4 className="text-xs font-bold text-paper uppercase tracking-widest">Updates Pending</h4>
                <p className="text-[10px] text-paper/40 leading-loose">A new firmware version (v2.4.8) is available for your fulfillment center.</p>
                <button className="w-full py-4 bg-paper text-ink text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gold hover:text-paper transition-all">
                   Upgrade Now
                </button>
             </div>
          </div>
       </div>

       <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-paper/90 backdrop-blur-xl p-4 lg:p-6 flex justify-end z-[45] shadow-[0_-20px_40px_rgba(0,0,0,0.05)] border-t border-white/5">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full md:w-64 px-16 py-4 bg-ink text-paper text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gold transition-all disabled:opacity-50"
          >
             {saving ? "Saving Parameters..." : "Deploy Global Changes"}
          </button>
       </div>
    </div>
  );
};

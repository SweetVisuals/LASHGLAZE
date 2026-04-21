const fs = require('fs');

const filePath = 'src/pages/AdminDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const startIdx = content.indexOf('const SettingsTab = () => {');
if (startIdx === -1) {
  console.log("Could not find SettingsTab");
  process.exit(1);
}

const endIdx = content.indexOf('};\n', startIdx) + 3;

const replacement = `const SettingsTab = () => {
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
    <>
      <div className="space-y-12 pb-20">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-accent/10 p-4 lg:p-8 rounded-lg gap-6">
          <div>
             <h1 className="text-2xl font-sans font-bold mb-1 tracking-tight">Atelier Configuration</h1>
             <p className="text-muted text-[10px] uppercase tracking-[0.2em] font-bold">System Wide Parameters</p>
          </div>
          <button className=" luxury-button w-full md:w-auto">
             Hard Reset Store
          </button>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
             <div className="bg-paper p-4 lg:p-8 rounded-lg space-y-8">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-gold/10 rounded flex items-center justify-center text-gold">
                      <Globe size={18} />
                   </div>
                   <h3 className="text-xs uppercase tracking-[0.4em] font-bold">Identity & Presence</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-4">
                      <label className="text-[10px] uppercase text-muted font-bold tracking-widest">Atelier Nomenclature</label>
                      <input 
                        type="text" 
                        value={localSettings.name} 
                        onChange={(e) => setLocalSettings({...localSettings, name: e.target.value})}
                        className="w-full bg-accent/10 p-4 text-xs font-bold tracking-widest text-ink outline-none focus:bg-accent/20 transition-all uppercase" 
                      />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] uppercase text-muted font-bold tracking-widest">Support Channel</label>
                      <input 
                        type="email" 
                        defaultValue="concierge@lashglaze.com" 
                        className="w-full bg-accent/10 p-4 text-xs font-bold tracking-widest text-ink outline-none focus:bg-accent/20 transition-all" 
                      />
                   </div>
                   <div className="space-y-4">
                      <AdminDropdown 
                        label="Primary Currency"
                        value={localSettings.currency === '€' ? 'EUR (€)' : localSettings.currency === '$' ? 'USD ($)' : 'GBP (£)'}
                        onChange={(v: string) => {
                          const symbol = v.includes('€') ? '€' : v.includes('$') ? '$' : '£';
                          setLocalSettings({...localSettings, currency: symbol});
                        }}
                        options={['EUR (€)', 'USD ($)', 'GBP (£)']}
                      />
                   </div>
                   <div className="space-y-4">
                      <AdminDropdown 
                        label="System Language"
                        value="English (UK)"
                        onChange={() => {}}
                        options={['English (UK)', 'German', 'French']}
                      />
                   </div>
                   <div className="space-y-4 md:col-span-2">
                      <label className="text-[10px] uppercase text-muted font-bold tracking-widest">Hero Banner Image URL</label>
                      <input 
                        type="text" 
                        value={localSettings.heroBannerUrl} 
                        onChange={(e) => setLocalSettings({...localSettings, heroBannerUrl: e.target.value})}
                        placeholder="https://..."
                        className="w-full bg-accent/10 p-4 text-xs font-bold tracking-widest text-ink outline-none focus:bg-accent/20 transition-all" 
                      />
                   </div>
                </div>
             </div>

             <div className="bg-paper p-4 lg:p-8 rounded-lg space-y-8">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-gold/10 rounded flex items-center justify-center text-gold">
                      <Globe2 size={18} />
                   </div>
                   <h3 className="text-xs uppercase tracking-[0.4em] font-bold">SEO & Discovery</h3>
                </div>
                
                <div className="space-y-6">
                   <div className="space-y-4">
                      <label className="text-[10px] uppercase text-muted font-bold tracking-widest">Global Meta Title</label>
                      <input type="text" defaultValue="Lash Glaze Strip Lashes | Premium Laboratory Aesthetic Lashes" className="w-full bg-accent/10 p-4 text-xs font-bold tracking-widest text-ink outline-none focus:bg-accent/20 transition-all" />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] uppercase text-muted font-bold tracking-widest">Global Meta Description</label>
                      <textarea rows={3} defaultValue="Discover the future of lash artistry with our professional silk and volume collections. Hand-crafted for the modern atelier." className="w-full bg-accent/10 p-4 text-xs font-medium text-ink outline-none focus:bg-accent/20 transition-all resize-none" />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                          <label className="text-[10px] uppercase text-muted font-bold tracking-widest">Instagram URL</label>
                          <input
                            type="text"
                            value={localSettings.instagramUrl}
                            onChange={(e) => setLocalSettings({...localSettings, instagramUrl: e.target.value})}
                            className="w-full bg-accent/10 p-4 text-xs font-bold text-ink outline-none focus:bg-accent/20 transition-all"
                            placeholder="https://instagram.com/..."
                          />
                       </div>
                       <div className="space-y-4">
                          <label className="text-[10px] uppercase text-muted font-bold tracking-widest">TikTok URL</label>
                          <input
                            type="text"
                            value={localSettings.tiktokUrl}
                            onChange={(e) => setLocalSettings({...localSettings, tiktokUrl: e.target.value})}
                            className="w-full bg-accent/10 p-4 text-xs font-bold text-ink outline-none focus:bg-accent/20 transition-all"
                            placeholder="https://tiktok.com/@..."
                          />
                       </div>
                         <div className="p-4 bg-green-500/5 rounded text-[10px] font-bold text-green-400 uppercase tracking-widest">Indexing Enabled • Stable</div>
                      </div>
                   </div>
                </div>

             <div className="bg-paper p-4 lg:p-8 rounded-lg space-y-8">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-gold/10 rounded flex items-center justify-center text-gold">
                      <FileText size={18} />
                   </div>
                   <h3 className="text-xs uppercase tracking-[0.4em] font-bold">Legal Dokumentation</h3>
                </div>
                
                <div className="divide-y divide-white/5 shadow-inner">
                   {[
                     { title: 'Terms of Service', updated: 'Mar 12, 2026', status: 'Published' },
                     { title: 'Privacy Policy', updated: 'Apr 05, 2026', status: 'Published' },
                     { title: 'Shipping Policy', updated: 'Jan 20, 2026', status: 'Published' },
                     { title: 'Return & Refund Policy', updated: 'Never', status: 'Draft' },
                   ].map(doc => (
                     <div key={doc.title} className="py-6 flex items-center justify-between">
                        <div>
                           <p className="text-[11px] font-bold uppercase tracking-widest">{doc.title}</p>
                           <p className="text-[9px] text-muted mt-1 uppercase">Last Update: {doc.updated}</p>
                        </div>
                        <div className="flex items-center gap-6">
                           <span className={\`text-[9px] font-bold uppercase tracking-widest \${doc.status === 'Published' ? 'text-green-400' : 'text-muted'}\`}>{doc.status}</span>
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
                   <h3 className="text-xs uppercase tracking-[0.4em] font-bold">Security</h3>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <div>
                         <p className="text-[10px] font-bold uppercase tracking-widest">Two-Factor Auth</p>
                         <p className="text-[9px] text-muted mt-1 italic">Biometric Verification</p>
                      </div>
                      <button 
                         onClick={() => setSecuritySettings({...securitySettings, twoFactor: !securitySettings.twoFactor})}
                         className={\`w-10 h-5 rounded-full relative transition-all \${securitySettings.twoFactor ? 'bg-gold' : 'bg-accent/10'}\`}
                      >
                         <div className={\`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all \${securitySettings.twoFactor ? 'left-5.5' : 'left-0.5'}\`} />
                      </button>
                   </div>
                   <div className="flex items-center justify-between">
                      <div>
                         <p className="text-[10px] font-bold uppercase tracking-widest">Login Alerts</p>
                         <p className="text-[9px] text-muted mt-1 italic">Real-time Notifications</p>
                      </div>
                      <button 
                         onClick={() => setSecuritySettings({...securitySettings, loginAlerts: !securitySettings.loginAlerts})}
                         className={\`w-10 h-5 rounded-full relative transition-all \${securitySettings.loginAlerts ? 'bg-gold' : 'bg-accent/10'}\`}
                      >
                         <div className={\`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all \${securitySettings.loginAlerts ? 'left-5.5' : 'left-0.5'}\`} />
                      </button>
                   </div>
                </div>
             </div>

             <div className="bg-paper p-4 lg:p-8 rounded-lg space-y-8">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-gold/10 rounded flex items-center justify-center text-gold">
                      <Key size={18} />
                   </div>
                   <h3 className="text-xs uppercase tracking-[0.4em] font-bold">API Access</h3>
                </div>
                
                <div className="space-y-4">
                   <div className="p-4 bg-accent/10 rounded">
                      <p className="text-[9px] uppercase tracking-widest font-bold text-muted mb-2">Live API Token</p>
                      <p className="text-[10px] font-mono break-all text-muted">pk_live_51P2...4a8b</p>
                   </div>
                   <button className="w-full py-3 bg-gold/10 text-gold text-[9px] uppercase font-bold tracking-widest hover:bg-gold hover:text-paper transition-all">Rotate Keys</button>
                </div>
             </div>

             <div className="bg-white p-8 rounded-lg space-y-6 flex flex-col items-center text-center">
                <Bell size={32} className="text-black/20" />
                <h4 className="text-xs font-bold text-paper uppercase tracking-widest">Updates Pending</h4>
                <p className="text-[10px] text-black/40 leading-loose">A new firmware version (v2.4.8) is available for your fulfillment center.</p>
                <button className="w-full py-4 bg-paper text-ink text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gold hover:text-paper transition-all">
                   Upgrade Now
                </button>
             </div>
          </div>
       </div>
      </div>

       <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-paper/90 backdrop-blur-xl p-4 lg:p-6 flex justify-end z-[45] shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="luxury-button-filled w-full md:w-64 px-16 disabled:opacity-50"
            style={{ backgroundColor: storeSettings.colors.ink, color: storeSettings.colors.paper }}
          >
             {saving ? "Saving..." : "Save All Changes"}
          </button>
       </div>
    </>
  );
};`;

const newContent = content.substring(0, startIdx) + replacement + content.substring(endIdx);
fs.writeFileSync(filePath, newContent, 'utf-8');
console.log("Success");

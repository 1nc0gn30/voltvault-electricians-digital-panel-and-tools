import { useState, useEffect, type ChangeEvent } from 'react';
import { LayoutDashboard, Calculator, Settings, Plus, Home as HomeIcon, Zap, MapPin, ChevronRight, Trash2, Save, X, Lightbulb, Power, ToggleLeft, Cpu, Layout, Menu, ClipboardList, FolderOpen, FileText, Sparkles, Package, Clock, Info, Upload, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { useLocalStorage } from './hooks/useLocalStorage';
import { House, Breaker, MappedItem, View, ItemType, WorkItem, Document, PropertyType, Panel } from './types';

// --- Components ---

const Sidebar = ({ currentView, setView, isOpen, onClose }: { currentView: View, setView: (v: View) => void, isOpen: boolean, onClose: () => void }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'calculator', icon: Calculator, label: 'Calculators' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className={`w-64 bg-slate-900 text-white h-full fixed lg:relative left-0 top-0 flex flex-col border-r border-slate-800 z-50 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500 p-2 rounded-lg">
              <Zap className="text-slate-900 w-6 h-6 fill-current" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">VoltVault</h1>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setView(item.id as View); onClose(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentView === item.id 
                  ? 'bg-yellow-500 text-slate-900 font-semibold shadow-lg shadow-yellow-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 p-4 rounded-xl">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Status</p>
            <div className="flex items-center gap-2 text-sm text-green-400">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Local Storage Active
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const MobileHeader = ({ onOpenMenu }: { onOpenMenu: () => void }) => (
  <header className="lg:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-30 border-b border-slate-800">
    <div className="flex items-center gap-2">
      <div className="bg-yellow-500 p-1.5 rounded-lg">
        <Zap className="text-slate-900 w-5 h-5 fill-current" />
      </div>
      <span className="font-bold tracking-tight">VoltVault</span>
    </div>
    <button onClick={onOpenMenu} className="p-2 text-slate-400 hover:text-white">
      <Menu size={24} />
    </button>
  </header>
);

const OhmCalculator = () => {
  const [v, setV] = useState('');
  const [i, setI] = useState('');
  const [r, setR] = useState('');
  const [p, setP] = useState('');

  const calculate = () => {
    const vn = parseFloat(v);
    const in_ = parseFloat(i);
    const rn = parseFloat(r);
    const pn = parseFloat(p);
    const hasV = Number.isFinite(vn);
    const hasI = Number.isFinite(in_);
    const hasR = Number.isFinite(rn);
    const hasP = Number.isFinite(pn);

    if (hasV && hasI && in_ !== 0) { setR((vn / in_).toFixed(2)); setP((vn * in_).toFixed(2)); }
    else if (hasV && hasR && rn !== 0) { setI((vn / rn).toFixed(2)); setP((vn * vn / rn).toFixed(2)); }
    else if (hasI && hasR) { setV((in_ * rn).toFixed(2)); setP((in_ * in_ * rn).toFixed(2)); }
    else if (hasP && hasV && vn !== 0) { setI((pn / vn).toFixed(2)); setR((vn * vn / pn).toFixed(2)); }
    else if (hasP && hasI && in_ !== 0) { setV((pn / in_).toFixed(2)); setR((pn / (in_ * in_)).toFixed(2)); }
  };

  const clear = () => { setV(''); setI(''); setR(''); setP(''); };

  return (
    <div className="vv-card p-6 rounded-2xl">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Zap size={20} className="text-amber-400" /> Ohm's Law Calculator
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Voltage (V)</label>
          <input type="number" value={v} onChange={(e) => setV(e.target.value)} className="vv-input w-full p-2 rounded-lg" placeholder="Volts" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Current (I)</label>
          <input type="number" value={i} onChange={(e) => setI(e.target.value)} className="vv-input w-full p-2 rounded-lg" placeholder="Amps" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Resistance (R)</label>
          <input type="number" value={r} onChange={(e) => setR(e.target.value)} className="vv-input w-full p-2 rounded-lg" placeholder="Ohms" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Power (P)</label>
          <input type="number" value={p} onChange={(e) => setP(e.target.value)} className="vv-input w-full p-2 rounded-lg" placeholder="Watts" />
        </div>
      </div>
      <div className="flex gap-2 mt-6">
        <button onClick={calculate} className="flex-1 vv-button-primary py-2 rounded-lg transition-colors">Calculate</button>
        <button onClick={clear} className="px-4 py-2 vv-button-secondary rounded-lg transition-colors text-slate-300">Clear</button>
      </div>
    </div>
  );
};

const VoltageDropCalc = () => {
  const [dist, setDist] = useState('');
  const [load, setLoad] = useState('');
  const [voltage, setVoltage] = useState('120');
  const [gauge, setGauge] = useState('12');
  const [result, setResult] = useState<number | null>(null);

  const resistances: Record<string, number> = {
    '14': 3.07, '12': 1.93, '10': 1.21, '8': 0.764, '6': 0.491, '4': 0.308, '2': 0.194
  };

  const calculate = () => {
    const d = parseFloat(dist);
    const l = parseFloat(load);
    const v = parseFloat(voltage);
    const r = resistances[gauge];
    if (Number.isFinite(d) && Number.isFinite(l) && Number.isFinite(v) && Number.isFinite(r)) {
      const drop = (2 * d * l * (r / 1000));
      setResult(parseFloat(((drop / v) * 100).toFixed(2)));
    }
  };

  const clear = () => {
    setDist('');
    setLoad('');
    setVoltage('120');
    setGauge('12');
    setResult(null);
  };

  return (
    <div className="vv-card p-6 rounded-2xl">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Cpu size={20} className="text-sky-400" /> Voltage Drop Calculator
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Distance (ft)</label>
            <input type="number" value={dist} onChange={(e) => setDist(e.target.value)} className="vv-input w-full p-2 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Load (Amps)</label>
            <input type="number" value={load} onChange={(e) => setLoad(e.target.value)} className="vv-input w-full p-2 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Voltage</label>
            <select value={voltage} onChange={(e) => setVoltage(e.target.value)} className="vv-input w-full p-2 rounded-lg">
              <option value="120">120V</option>
              <option value="240">240V</option>
              <option value="208">208V</option>
              <option value="277">277V</option>
              <option value="480">480V</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Wire Gauge (AWG)</label>
            <select value={gauge} onChange={(e) => setGauge(e.target.value)} className="vv-input w-full p-2 rounded-lg">
              {Object.keys(resistances).map(g => <option key={g} value={g}>{g} AWG</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={calculate} className="flex-1 vv-button-primary py-2 rounded-lg transition-colors">Calculate Drop</button>
          <button onClick={clear} className="px-4 py-2 vv-button-secondary rounded-lg transition-colors text-slate-300">Clear</button>
        </div>
        {result !== null && (
          <div className={`p-4 rounded-xl text-center font-bold ${result > 3 ? 'bg-red-950/40 text-red-300 border border-red-800/60' : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60'}`}>
            Voltage Drop: {result}%
            {result > 3 && <p className="text-xs mt-1 font-normal">Exceeds NEC 3% recommendation</p>}
          </div>
        )}
      </div>
    </div>
  );
};

const WORK_STATUSES: Array<WorkItem['status']> = ['requested', 'todo', 'done'];
const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'webp'];
const ACCEPTED_DOCUMENT_TYPES = '.pdf,.doc,.docx,.png,.jpg,.jpeg,.webp';

export default function App() {
  const { houses, addHouse, updateHouse, deleteHouse } = useLocalStorage();
  const storageKey = 'volt-vault-houses';
  const [view, setView] = useState<View>('dashboard');
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [isAddingHouse, setIsAddingHouse] = useState(false);
  const [newHouseData, setNewHouseData] = useState({ address: '', clientName: '', type: 'residential' as PropertyType });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedBreakerId, setSelectedBreakerId] = useState<string | null>(null);
  const [expandedPanelId, setExpandedPanelId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyFilter, setPropertyFilter] = useState<'all' | PropertyType>('all');
  const [waitlistContext, setWaitlistContext] = useState<string | null>(null);
  const [projectContactDraft, setProjectContactDraft] = useState('');
  const [panelLocationDrafts, setPanelLocationDrafts] = useState<Record<string, string>>({});
  const [workDraftByStatus, setWorkDraftByStatus] = useState<Record<WorkItem['status'], string>>({
    requested: '',
    todo: '',
    done: ''
  });
  const [documentError, setDocumentError] = useState<string | null>(null);

  // Keyboard navigation for breakers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedHouse || view !== 'house-detail' || !selectedBreakerId) return;
      
      // Find current breaker and its panel
      let currentPanel: Panel | null = null;
      let breakerIndex = -1;

      for (const p of selectedHouse.panels) {
        const idx = p.breakers.findIndex(b => b.id === selectedBreakerId);
        if (idx !== -1) {
          currentPanel = p;
          breakerIndex = idx;
          break;
        }
      }

      if (!currentPanel) return;

      let nextIndex = -1;
      if (e.key === 'ArrowDown') {
        nextIndex = breakerIndex + 2;
      } else if (e.key === 'ArrowUp') {
        nextIndex = breakerIndex - 2;
      } else if (e.key === 'ArrowLeft') {
        if (breakerIndex % 2 !== 0) nextIndex = breakerIndex - 1;
      } else if (e.key === 'ArrowRight') {
        if (breakerIndex % 2 === 0) nextIndex = breakerIndex + 1;
      }

      if (nextIndex >= 0 && nextIndex < currentPanel.breakers.length) {
        setSelectedBreakerId(currentPanel.breakers[nextIndex].id);
        // Scroll into view if needed
        const el = document.getElementById(`breaker-${currentPanel.breakers[nextIndex].id}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedHouse, view, selectedBreakerId]);

  useEffect(() => {
    if (!selectedHouse) return;
    setProjectContactDraft(
      selectedHouse.propertyType === 'commercial'
        ? selectedHouse.foremanName || ''
        : selectedHouse.homeownerContact || ''
    );
    const nextPanelDrafts: Record<string, string> = {};
    selectedHouse.panels.forEach((panel) => {
      nextPanelDrafts[panel.id] = panel.location || '';
    });
    setPanelLocationDrafts(nextPanelDrafts);
    setDocumentError(null);
  }, [selectedHouse?.id]);

  const [activeTab, setActiveTab] = useState<'panel' | 'work' | 'docs' | 'calc'>('panel');

  const handleCreateHouse = () => {
    if (!newHouseData.address || !newHouseData.clientName) return;
    const newHouse: House = {
      id: crypto.randomUUID(),
      address: newHouseData.address,
      clientName: newHouseData.clientName,
      propertyType: newHouseData.type,
      workItems: [],
      documents: [],
      panels: [{
        id: crypto.randomUUID(),
        name: newHouseData.type === 'commercial' ? 'Main Distribution Panel (MDP)' : 'Main Service Panel',
        location: newHouseData.type === 'commercial' ? 'Electrical Room' : 'Garage',
        voltage: newHouseData.type === 'commercial' ? '120/208' : '120/240',
        phase: newHouseData.type === 'commercial' ? 3 : 1,
        breakers: Array.from({ length: newHouseData.type === 'commercial' ? 42 : 20 }, (_, i) => ({
          id: crypto.randomUUID(),
          number: i + 1,
          label: 'Spare',
          amperage: 20,
          isDoublePole: false,
          items: []
        }))
      }],
      createdAt: Date.now()
    };
    addHouse(newHouse);
    setIsAddingHouse(false);
    setNewHouseData({ address: '', clientName: '', type: 'residential' });
  };

  const openHouse = (house: House) => {
    setSelectedHouse(house);
    setView('house-detail');
  };

  const saveSelectedHouse = (updatedHouse: House) => {
    setSelectedHouse(updatedHouse);
    updateHouse(updatedHouse);
  };

  const saveProjectContact = () => {
    if (!selectedHouse) return;
    const trimmedContact = projectContactDraft.trim();
    const updatedHouse: House =
      selectedHouse.propertyType === 'commercial'
        ? { ...selectedHouse, foremanName: trimmedContact }
        : { ...selectedHouse, homeownerContact: trimmedContact };
    saveSelectedHouse(updatedHouse);
  };

  const savePanelLocation = (panelId: string) => {
    if (!selectedHouse) return;
    const nextLocation = (panelLocationDrafts[panelId] || '').trim();
    const updatedPanels = selectedHouse.panels.map((panel) =>
      panel.id === panelId ? { ...panel, location: nextLocation || 'TBD' } : panel
    );
    saveSelectedHouse({ ...selectedHouse, panels: updatedPanels });
  };

  const addWorkItem = (status: WorkItem['status']) => {
    if (!selectedHouse) return;
    const description = (workDraftByStatus[status] || '').trim();
    if (!description) return;
    const newItem: WorkItem = {
      id: crypto.randomUUID(),
      description,
      status,
      createdAt: Date.now()
    };
    saveSelectedHouse({ ...selectedHouse, workItems: [...(selectedHouse.workItems || []), newItem] });
    setWorkDraftByStatus((current) => ({ ...current, [status]: '' }));
  };

  const moveWorkItemToNextStage = (itemId: string, status: WorkItem['status']) => {
    if (!selectedHouse || status === 'done') return;
    const nextStatus: WorkItem['status'] = status === 'requested' ? 'todo' : 'done';
    const updatedItems = (selectedHouse.workItems || []).map((item) =>
      item.id === itemId ? { ...item, status: nextStatus } : item
    );
    saveSelectedHouse({ ...selectedHouse, workItems: updatedItems });
  };

  const removeWorkItem = (itemId: string) => {
    if (!selectedHouse) return;
    const updatedItems = (selectedHouse.workItems || []).filter((item) => item.id !== itemId);
    saveSelectedHouse({ ...selectedHouse, workItems: updatedItems });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const addDocumentFromUpload = (
    event: ChangeEvent<HTMLInputElement>,
    type: Document['type']
  ) => {
    if (!selectedHouse) return;
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_DOCUMENT_EXTENSIONS.includes(extension)) {
      setDocumentError(`"${file.name}" is not supported. Upload: ${ALLOWED_DOCUMENT_EXTENSIONS.join(', ').toUpperCase()}.`);
      event.target.value = '';
      return;
    }

    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      setDocumentError(`"${file.name}" exceeds 10MB. Please upload a smaller file.`);
      event.target.value = '';
      return;
    }

    const newDoc: Document = {
      id: crypto.randomUUID(),
      name: file.name,
      type,
      date: Date.now(),
      extension,
      mimeType: file.type || undefined,
      sizeBytes: file.size
    };
    saveSelectedHouse({ ...selectedHouse, documents: [...(selectedHouse.documents || []), newDoc] });
    setDocumentError(null);
    event.target.value = '';
  };

  const removeDocument = (documentId: string) => {
    if (!selectedHouse) return;
    const updatedDocs = (selectedHouse.documents || []).filter((doc) => doc.id !== documentId);
    saveSelectedHouse({ ...selectedHouse, documents: updatedDocs });
  };

  const updatePanelBreakerCount = (panelId: string, count: number) => {
    if (!selectedHouse) return;
    const updatedPanels = selectedHouse.panels.map(p => {
      if (p.id === panelId) {
        let newBreakers = [...p.breakers];
        if (count > p.breakers.length) {
          // Add more
          const toAdd = count - p.breakers.length;
          const added = Array.from({ length: toAdd }, (_, i) => ({
            id: crypto.randomUUID(),
            number: p.breakers.length + i + 1,
            label: 'Spare',
            amperage: 20 as 15 | 20 | 30 | 40 | 50 | 60 | 100,
            isDoublePole: false,
            items: []
          }));
          newBreakers = [...newBreakers, ...added];
        } else if (count < p.breakers.length) {
          // Remove
          newBreakers = newBreakers.slice(0, count);
        }
        return { ...p, breakers: newBreakers };
      }
      return p;
    });
    const updatedHouse = { ...selectedHouse, panels: updatedPanels };
    setSelectedHouse(updatedHouse);
    updateHouse(updatedHouse);
  };

  const updateBreaker = (panelId: string, breakerId: string, updates: Partial<Breaker>) => {
    if (!selectedHouse) return;
    const updatedPanels = selectedHouse.panels.map(p => {
      if (p.id === panelId) {
        return {
          ...p,
          breakers: p.breakers.map(b => b.id === breakerId ? { ...b, ...updates } : b)
        };
      }
      return p;
    });
    const updatedHouse = { ...selectedHouse, panels: updatedPanels };
    setSelectedHouse(updatedHouse);
    updateHouse(updatedHouse);
  };

  const addItemToBreaker = (panelId: string, breakerId: string, item: Omit<MappedItem, 'id'>) => {
    if (!selectedHouse) return;
    const newItem: MappedItem = { ...item, id: crypto.randomUUID() };
    const updatedPanels = selectedHouse.panels.map(p => {
      if (p.id === panelId) {
        return {
          ...p,
          breakers: p.breakers.map(b => b.id === breakerId ? { ...b, items: [...b.items, newItem] } : b)
        };
      }
      return p;
    });
    const updatedHouse = { ...selectedHouse, panels: updatedPanels };
    setSelectedHouse(updatedHouse);
    updateHouse(updatedHouse);
  };

  const removeItemFromBreaker = (panelId: string, breakerId: string, itemId: string) => {
    if (!selectedHouse) return;
    const updatedPanels = selectedHouse.panels.map(p => {
      if (p.id === panelId) {
        return {
          ...p,
          breakers: p.breakers.map(b => b.id === breakerId ? { ...b, items: (b.items || []).filter(i => i.id !== itemId) } : b)
        };
      }
      return p;
    });
    const updatedHouse = { ...selectedHouse, panels: updatedPanels };
    setSelectedHouse(updatedHouse);
    updateHouse(updatedHouse);
  };

  const handleAddPanel = () => {
    if (!selectedHouse) return;
    const newPanel: Panel = {
      id: crypto.randomUUID(),
      name: `Sub Panel ${selectedHouse.panels.length + 1}`,
      location: 'TBD',
      voltage: selectedHouse.propertyType === 'commercial' ? '120/208' : '120/240',
      phase: selectedHouse.propertyType === 'commercial' ? 3 : 1,
      breakers: Array.from({ length: 20 }, (_, i) => ({
        id: crypto.randomUUID(),
        number: i + 1,
        label: 'Spare',
        amperage: 20,
        isDoublePole: false,
        items: []
      }))
    };
    const updatedHouse = { ...selectedHouse, panels: [...selectedHouse.panels, newPanel] };
    setSelectedHouse(updatedHouse);
    updateHouse(updatedHouse);
  };

  const updatePanelPhase = (panelId: string, phase: 1 | 3) => {
    if (!selectedHouse) return;
    const updatedPanels = selectedHouse.panels.map(p => {
      if (p.id === panelId) {
        return { ...p, phase };
      }
      return p;
    });
    const updatedHouse = { ...selectedHouse, panels: updatedPanels };
    setSelectedHouse(updatedHouse);
    updateHouse(updatedHouse);
  };

  const handleExportData = () => {
    const payload = JSON.stringify(houses, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `voltvault-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    if (!confirm('Delete all VoltVault project data from this browser?')) return;
    localStorage.removeItem(storageKey);
    window.location.reload();
  };

  const getProjectStatus = (house: House) => {
    const workItems = house.workItems || [];
    if (workItems.length === 0) return { label: 'Setup', className: 'bg-slate-700 text-slate-200' };
    if (workItems.some(item => item.status === 'requested')) return { label: 'Needs Review', className: 'bg-amber-400 text-slate-950' };
    if (workItems.some(item => item.status === 'todo')) return { label: 'In Progress', className: 'bg-sky-500 text-white' };
    return { label: 'Ready Invoice', className: 'bg-emerald-500 text-white' };
  };

  const filteredHouses = houses.filter((house) => {
    const matchesType = propertyFilter === 'all' || house.propertyType === propertyFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery = !query ||
      house.clientName.toLowerCase().includes(query) ||
      house.address.toLowerCase().includes(query);
    return matchesType && matchesQuery;
  });

  return (
    <div className="h-screen flex flex-col lg:flex-row font-sans text-slate-100 overflow-hidden">
      <Sidebar currentView={view} setView={setView} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <MobileHeader onOpenMenu={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
          <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-6xl mx-auto"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Client Projects</h2>
                  <p className="text-slate-300 mt-1">Manage digital panels and circuit maps for your properties.</p>
                </div>
                <button 
                  onClick={() => setIsAddingHouse(true)}
                  className="w-full md:w-auto vv-button-primary px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  <Plus size={20} /> New Project
                </button>
              </div>

              <div className="vv-card rounded-2xl p-4 mb-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by client or address..."
                  className="vv-input w-full rounded-xl px-4 py-2.5"
                  aria-label="Search projects"
                />
                <select
                  value={propertyFilter}
                  onChange={(e) => setPropertyFilter(e.target.value as 'all' | PropertyType)}
                  className="vv-input rounded-xl px-4 py-2.5 min-w-44"
                  aria-label="Filter by property type"
                >
                  <option value="all">All Types</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              {isAddingHouse && (
                <div className="vv-card p-6 rounded-3xl mb-8 max-w-md">
                  <h3 className="text-xl font-bold mb-4">Add New Property</h3>
                  <div className="space-y-4 text-slate-100">
                    <div className="flex bg-slate-800 p-1 rounded-xl mb-4">
                      <button 
                        onClick={() => setNewHouseData({...newHouseData, type: 'residential'})}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${newHouseData.type === 'residential' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-300'}`}
                      >
                        Residential
                      </button>
                      <button 
                        onClick={() => setNewHouseData({...newHouseData, type: 'commercial'})}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${newHouseData.type === 'commercial' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-300'}`}
                      >
                        Commercial
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Client Name</label>
                      <input 
                        type="text" 
                        value={newHouseData.clientName}
                        onChange={e => setNewHouseData({...newHouseData, clientName: e.target.value})}
                        className="vv-input w-full p-3 rounded-xl"
                        placeholder="e.g. John Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Address</label>
                      <input 
                        type="text" 
                        value={newHouseData.address}
                        onChange={e => setNewHouseData({...newHouseData, address: e.target.value})}
                        className="vv-input w-full p-3 rounded-xl"
                        placeholder="e.g. 123 Electric Ave"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button onClick={handleCreateHouse} className="flex-1 vv-button-primary py-3 rounded-xl">Create Project</button>
                      <button onClick={() => setIsAddingHouse(false)} className="px-6 py-3 vv-button-secondary rounded-xl text-slate-300">Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHouses.map((house) => {
                  const status = getProjectStatus(house);
                  return (
                  <motion.div
                    layoutId={house.id}
                    key={house.id}
                    onClick={() => openHouse(house)}
                    className="vv-card p-6 rounded-3xl hover:border-slate-500 transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-widest ${house.propertyType === 'commercial' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>
                      {house.propertyType}
                    </div>
                    <div className={`absolute top-0 left-0 px-3 py-1 rounded-br-xl text-[10px] font-black uppercase tracking-widest ${status.className}`}>
                      {status.label}
                    </div>
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteHouse(house.id); }}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="bg-slate-800 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-amber-400 transition-colors">
                      <HomeIcon className="text-slate-300 group-hover:text-slate-950" size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-100 truncate pr-8">{house.clientName}</h3>
                    <p className="text-slate-300 flex items-center gap-1 mt-1 truncate">
                      <MapPin size={14} /> {house.address}
                    </p>
                    <div className="mt-6 pt-6 border-t border-slate-700 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {house.panels.length} Panel{house.panels.length !== 1 ? 's' : ''}
                      </span>
                      <ChevronRight className="text-slate-500 group-hover:text-slate-100 transition-colors" size={20} />
                    </div>
                  </motion.div>
                )})}
                {filteredHouses.length === 0 && !isAddingHouse && (
                  <div className="col-span-full py-20 text-center bg-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <LayoutDashboard className="text-slate-300" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-400">{houses.length === 0 ? 'No projects yet' : 'No projects match this filter'}</h3>
                    <p className="text-slate-400 mt-1">{houses.length === 0 ? 'Click "New Project" to get started.' : 'Try a different search term or property type.'}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === 'house-detail' && selectedHouse && (
            <motion.div
              key="house-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto"
            >
              <button 
                onClick={() => setView('dashboard')}
                className="mb-6 flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors"
              >
                <ChevronRight className="rotate-180" size={20} /> Back to Dashboard
              </button>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${selectedHouse.propertyType === 'commercial' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>
                      {selectedHouse.propertyType}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{selectedHouse.clientName}</h2>
                  </div>
                  <p className="text-slate-500 flex items-center gap-1">
                    <MapPin size={16} /> {selectedHouse.address}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                  <div className="flex-1 md:flex-none vv-card px-4 py-3 rounded-xl min-w-[320px]">
                    <div className="flex items-center gap-2 mb-2 text-slate-300">
                      {selectedHouse.propertyType === 'commercial' ? <Layout size={18} /> : <HomeIcon size={18} />}
                      <span className="text-[11px] font-black uppercase tracking-widest">
                        {selectedHouse.propertyType === 'commercial' ? 'Foreman Contact' : 'Homeowner Contact'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={projectContactDraft}
                        onChange={(e) => setProjectContactDraft(e.target.value)}
                        className="vv-input flex-1 px-3 py-2 rounded-lg text-sm"
                        placeholder={selectedHouse.propertyType === 'commercial' ? 'Foreman name or phone' : 'Homeowner name or phone'}
                      />
                      <button
                        type="button"
                        onClick={saveProjectContact}
                        className="vv-button-primary px-4 rounded-lg text-sm whitespace-nowrap"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8 overflow-x-auto custom-scrollbar">
                <div className="inline-flex min-w-full md:min-w-0 bg-slate-900/80 border border-slate-700 p-1 rounded-2xl gap-1">
                <button 
                  onClick={() => setActiveTab('panel')}
                  className={`px-4 md:px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'panel' ? 'bg-amber-400 text-slate-900 shadow-sm' : 'text-slate-300 hover:text-slate-100'}`}
                >
                  <Layout size={18} /> Breaker Panel
                </button>
                <button 
                  onClick={() => setActiveTab('work')}
                  className={`px-4 md:px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'work' ? 'bg-amber-400 text-slate-900 shadow-sm' : 'text-slate-300 hover:text-slate-100'}`}
                >
                  <ClipboardList size={18} /> Work Management
                </button>
                <button 
                  onClick={() => setActiveTab('docs')}
                  className={`px-4 md:px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'docs' ? 'bg-amber-400 text-slate-900 shadow-sm' : 'text-slate-300 hover:text-slate-100'}`}
                >
                  <FolderOpen size={18} /> Documents
                </button>
                <button 
                  onClick={() => setActiveTab('calc')}
                  className={`px-4 md:px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'calc' ? 'bg-amber-400 text-slate-900 shadow-sm' : 'text-slate-300 hover:text-slate-100'}`}
                >
                  <Calculator size={18} /> AI Estimate
                </button>
              </div>
              </div>

              {activeTab === 'panel' && (
                <div className="space-y-12">
                  <div className="flex justify-end mb-4">
                    <button 
                      onClick={handleAddPanel}
                      className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                    >
                      <Plus size={18} /> Add Panel
                    </button>
                  </div>
                  {selectedHouse.panels.map((panel) => (
                  <div key={panel.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 md:p-8 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="w-full md:w-auto">
                        <h3 className="text-xl md:text-2xl font-bold">{panel.name}</h3>
                        <div className="mt-2 flex flex-col sm:flex-row gap-2 sm:items-center">
                          <input
                            type="text"
                            value={panelLocationDrafts[panel.id] ?? panel.location}
                            onChange={(event) =>
                              setPanelLocationDrafts((current) => ({
                                ...current,
                                [panel.id]: event.target.value
                              }))
                            }
                            className="bg-slate-800 text-white px-3 py-1.5 rounded-lg border border-slate-700 text-sm font-medium outline-none focus:ring-1 focus:ring-yellow-500 min-w-56"
                            placeholder="Panel location (garage, utility room, etc.)"
                            aria-label={`${panel.name} location`}
                          />
                          <button
                            type="button"
                            onClick={() => savePanelLocation(panel.id)}
                            className="vv-button-primary px-3 py-1.5 rounded-lg text-sm font-bold"
                          >
                            Save Location
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex flex-col">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Slots</label>
                          <select 
                            value={panel.breakers.length}
                            onChange={(e) => updatePanelBreakerCount(panel.id, parseInt(e.target.value))}
                            className="bg-slate-800 text-white px-3 py-1.5 rounded-lg border border-slate-700 text-sm font-bold outline-none focus:ring-1 focus:ring-yellow-500"
                          >
                            {[12, 20, 24, 30, 40, 42, 60, 84].map(n => (
                              <option key={n} value={n}>{n} Slots</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Phase</label>
                          <select 
                            value={panel.phase || 1}
                            onChange={(e) => updatePanelPhase(panel.id, parseInt(e.target.value) as 1 | 3)}
                            className="bg-slate-800 text-white px-3 py-1.5 rounded-lg border border-slate-700 text-sm font-bold outline-none focus:ring-1 focus:ring-yellow-500"
                          >
                            <option value={1}>1-Phase</option>
                            <option value={3}>3-Phase</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                      {/* Visual Panel Representation - Vertical Rectangle Split */}
                      <div className="lg:col-span-2 bg-slate-200 p-6 rounded-[2rem] border-8 border-slate-300 shadow-inner">
                        <div className="bg-slate-800 rounded-xl p-1 shadow-2xl relative">
                          {/* Bus Bar Visual */}
                          <div className="absolute left-1/2 top-4 bottom-4 w-4 bg-slate-700 -translate-x-1/2 rounded-full opacity-50 z-0" />
                          
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 relative z-10">
                            {panel.breakers.map((breaker) => (
                              <BreakerSlot 
                                key={breaker.id} 
                                breaker={breaker} 
                                propertyType={selectedHouse.propertyType}
                                isSelected={selectedBreakerId === breaker.id}
                                onSelect={() => setSelectedBreakerId(breaker.id)}
                                onUpdate={(updates) => updateBreaker(panel.id, breaker.id, updates)}
                                onAddItem={(item) => addItemToBreaker(panel.id, breaker.id, item)}
                                onRemoveItem={(itemId) => removeItemFromBreaker(panel.id, breaker.id, itemId)}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Circuit Directory List Dropdown */}
                      <div className="space-y-4">
                        <button 
                          onClick={() => setExpandedPanelId(expandedPanelId === panel.id ? null : panel.id)}
                          className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-slate-100 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <Layout size={20} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
                            <span className="font-bold text-slate-900">Circuit Directory</span>
                          </div>
                          <ChevronRight 
                            size={20} 
                            className={`text-slate-400 transition-transform duration-300 ${expandedPanelId === panel.id ? 'rotate-90' : ''}`} 
                          />
                        </button>

                        <AnimatePresence>
                          {expandedPanelId === panel.id && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar pt-2">
                                {panel.breakers.map(b => (
                                  <div 
                                    key={b.id} 
                                    onClick={() => {
                                      setSelectedBreakerId(b.id);
                                      const el = document.getElementById(`breaker-${b.id}`);
                                      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                    }}
                                    className={`flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer ${
                                      selectedBreakerId === b.id 
                                        ? 'bg-yellow-50 border-yellow-200 shadow-sm' 
                                        : 'hover:bg-slate-50 border-transparent hover:border-slate-100'
                                    }`}
                                  >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold flex-shrink-0 transition-colors ${
                                      selectedBreakerId === b.id ? 'bg-yellow-500 text-slate-900' : 'bg-slate-900 text-white'
                                    }`}>
                                      {b.number}
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-bold text-slate-900">{b.label}</p>
                                      <p className="text-xs text-slate-500">{b.amperage}A • {b.items.length} Items Mapped</p>
                                    </div>
                                    <div className="flex gap-1">
                                      {Array.from(new Set(b.items.map(i => i.type))).map(type => (
                                        <ItemIcon key={type} type={type as ItemType} size={16} className="text-slate-400" />
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

              {activeTab === 'work' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {WORK_STATUSES.map((status) => (
                      <div key={status} className="vv-card p-6 rounded-[2rem] border border-slate-700/70">
                        <h3 className="text-lg font-bold mb-4 capitalize flex items-center justify-between text-slate-100">
                          {status === 'todo' ? 'To Do' : status}
                          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg text-xs border border-slate-700">
                            {(selectedHouse.workItems || []).filter((item) => item.status === status).length}
                          </span>
                        </h3>
                        <div className="space-y-3">
                          {(selectedHouse.workItems || [])
                            .filter((item) => item.status === status)
                            .map((item) => (
                              <div key={item.id} className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700">
                                <p className="text-sm font-medium text-slate-100">{item.description}</p>
                                <div className="mt-3 flex flex-wrap justify-between items-center gap-2">
                                  <span className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                                  <div className="flex gap-2">
                                    {status !== 'done' && (
                                      <button
                                        type="button"
                                        onClick={() => moveWorkItemToNextStage(item.id, status)}
                                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-700/30 text-emerald-200 border border-emerald-500/40 hover:bg-emerald-700/50"
                                      >
                                        {status === 'requested' ? 'Move To To Do' : 'Mark Done'}
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => removeWorkItem(item.id)}
                                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-red-700/20 text-red-200 border border-red-500/40 hover:bg-red-700/40"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          <div className="pt-2 space-y-2">
                            <input
                              type="text"
                              value={workDraftByStatus[status]}
                              onChange={(event) =>
                                setWorkDraftByStatus((current) => ({
                                  ...current,
                                  [status]: event.target.value
                                }))
                              }
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                  event.preventDefault();
                                  addWorkItem(status);
                                }
                              }}
                              placeholder={status === 'requested' ? 'Add requested work item' : status === 'todo' ? 'Add in-progress item' : 'Add completed record'}
                              className="vv-input w-full px-3 py-2 rounded-xl text-sm"
                              aria-label={`Add ${status} work item`}
                            />
                            <button
                              type="button"
                              onClick={() => addWorkItem(status)}
                              className="w-full py-2.5 vv-button-secondary rounded-xl text-sm flex items-center justify-center gap-2"
                            >
                              <Plus size={16} /> Add Item
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'docs' && (
                <div className="space-y-5">
                  <div className="vv-card p-4 rounded-2xl border border-slate-700/70 text-sm text-slate-300 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <span>Accepted file types: <strong className="text-slate-100">PDF, DOC, DOCX, PNG, JPG, JPEG, WEBP</strong></span>
                    <span>Max upload size: <strong className="text-slate-100">10MB</strong></span>
                  </div>
                  {documentError && (
                    <div className="rounded-2xl border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-100 flex items-center gap-2">
                      <AlertCircle size={16} />
                      {documentError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {(['contract', 'invoice'] as const).map((docType) => (
                      <div key={docType} className="vv-card p-8 rounded-[2.5rem] border border-slate-700/70">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-100">
                          <FolderOpen className={docType === 'contract' ? 'text-blue-400' : 'text-emerald-400'} />
                          {docType === 'contract' ? 'Contracts' : 'Invoices'}
                        </h3>
                        <div className="space-y-4">
                          {(selectedHouse.documents || [])
                            .filter((doc) => doc.type === docType)
                            .map((doc) => (
                              <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-900/70 rounded-2xl border border-slate-700 gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className={`w-10 h-10 ${docType === 'contract' ? 'bg-blue-600/25 text-blue-300' : 'bg-emerald-600/25 text-emerald-300'} rounded-xl flex items-center justify-center`}>
                                    <FileText size={20} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-100 truncate">{doc.name}</p>
                                    <p className="text-xs text-slate-400">
                                      {new Date(doc.date).toLocaleDateString()} • {formatFileSize(doc.sizeBytes)}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeDocument(doc.id)}
                                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-red-700/20 text-red-200 border border-red-500/40 hover:bg-red-700/40"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}

                          <label className="w-full py-4 border-2 border-dashed border-slate-700 rounded-2xl text-slate-300 font-bold hover:border-slate-500 hover:text-slate-100 transition-all flex items-center justify-center gap-2 cursor-pointer">
                            <Upload size={18} /> Upload {docType === 'contract' ? 'Contract' : 'Invoice'}
                            <input
                              type="file"
                              className="sr-only"
                              accept={ACCEPTED_DOCUMENT_TYPES}
                              onChange={(event) => addDocumentFromUpload(event, docType)}
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'calc' && (
                <div className="max-w-4xl mx-auto">
                  <AIEstimateCalculator house={selectedHouse} onRequestWaitlist={setWaitlistContext} />
                </div>
              )}
            </motion.div>
          )}

          {view === 'calculator' && (
            <motion.div
              key="calculator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto"
            >
                <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight">Electrician Calculators</h2>
                <p className="text-slate-300 mt-1">Quick tools for field calculations and NEC compliance.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <OhmCalculator />
                <VoltageDropCalc />
                
                <button
                  type="button"
                  onClick={() => setWaitlistContext('Conduit Fill (Pro)')}
                  className="vv-card p-6 rounded-2xl text-left hover:border-amber-300 transition-all"
                >
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Layout size={20} className="text-amber-300" /> Conduit Fill (Pro)
                  </h3>
                  <p className="text-sm text-slate-300">Coming soon. Join the waitlist for early access.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setWaitlistContext('Load Calculation')}
                  className="vv-card p-6 rounded-2xl text-left hover:border-amber-300 transition-all"
                >
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Cpu size={20} className="text-green-500" /> Load Calculation
                  </h3>
                  <p className="text-sm text-slate-300">Coming soon. Join the waitlist for early access.</p>
                </button>
              </div>
            </motion.div>
          )}

          {view === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-2xl mx-auto text-center py-12 md:py-20"
            >
              <div className="vv-card p-8 md:p-12 rounded-[3rem]">
                <div className="bg-slate-800 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Settings className="text-slate-400 animate-spin-slow" size={40} />
                </div>
                <h2 className="text-2xl font-bold mb-2">App Settings</h2>
                <p className="text-slate-300 mb-8">Manage your profile, data exports, and preferences.</p>
                
                <div className="space-y-4 text-left">
                  <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 flex justify-between items-center gap-4">
                    <div>
                      <p className="font-bold">Export Data</p>
                      <p className="text-sm text-slate-300">Download all projects as JSON</p>
                    </div>
                    <button onClick={handleExportData} className="vv-button-primary px-4 py-2 rounded-xl text-sm">Export</button>
                  </div>
                  <div className="p-4 bg-red-950/30 border border-red-900/70 rounded-2xl flex justify-between items-center gap-4">
                    <div>
                      <p className="font-bold text-red-300">Clear App Data</p>
                      <p className="text-sm text-red-200/80">Deletes only VoltVault local browser data</p>
                    </div>
                    <button 
                      onClick={handleResetData}
                      className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold"
                    >
                      Reset App
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <WaitlistModal
        feature={waitlistContext}
        onClose={() => setWaitlistContext(null)}
      />
    </div>
  </div>
  );
}

// --- Sub-components ---

const AIEstimateCalculator = ({ house, onRequestWaitlist }: { house: House, onRequestWaitlist: (feature: string) => void }) => {
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [estimate, setEstimate] = useState<any>(null);

  const saveApiKey = (key: string) => {
    setApiKey(key);
  };

  const generateEstimate = async () => {
    if (!apiKey.trim()) {
      alert('Bring your own Gemini API key to run estimates. Hosted/shared keys are disabled.');
      return;
    }
    setIsCalculating(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a detailed electrical material and labor estimate for the following project in ${house.address}.
        
        Project Description: ${prompt}
        Property Type: ${house.propertyType}
        
        Please provide the response in JSON format with the following structure:
        {
          "materials": [{ "item": string, "quantity": number, "unit": string, "estimatedPrice": number }],
          "labor": { "hours": number, "rate": number, "description": string },
          "total": number,
          "notes": string
        }`,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const data = JSON.parse(response.text || '{}');
      setEstimate(data);
    } catch (error) {
      console.error('AI Error:', error);
      alert('Failed to generate estimate. Check your API key and connection.');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="vv-card p-8 rounded-[2.5rem]">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="text-yellow-500" /> AI Estimate Calculator
        </h3>
        <div className="flex items-center gap-2">
          <input 
            type="password" 
            value={apiKey}
            onChange={(e) => saveApiKey(e.target.value)}
            placeholder="Gemini API Key"
            className="vv-input px-4 py-2 rounded-xl text-sm w-48"
          />
          <Settings size={20} className="text-slate-400" />
        </div>
      </div>
      <p className="mb-6 text-xs text-slate-300">
        BYOK only: your own key stays in this tab session and is sent directly to Gemini. VoltVault does not provide shared API keys.
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-200 mb-2">Project Scope / Work Requested</label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Install 4 recessed lights in the kitchen, add a dedicated 20A circuit for the microwave, and replace the main panel with a 200A Square D panel."
            className="vv-input w-full h-32 p-4 rounded-2xl resize-none"
          />
        </div>

        <button 
          onClick={generateEstimate}
          disabled={isCalculating || !prompt || !apiKey.trim()}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isCalculating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing Local Material Prices...
            </>
          ) : (
            <>
              <Sparkles size={20} /> Generate AI Estimate
            </>
          )}
        </button>

        {estimate && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 pt-8 border-t border-slate-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
                  <Package size={18} className="text-slate-400" /> Materials
                </h4>
                <div className="space-y-2">
                  {estimate.materials?.map((m: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm p-2 bg-slate-800 rounded-lg border border-slate-700">
                      <span className="text-slate-200">{m.quantity}x {m.item}</span>
                      <span className="font-bold">${m.estimatedPrice}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-slate-400" /> Labor
                </h4>
                <div className="p-4 bg-slate-800 border border-slate-700 rounded-2xl">
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-300">Hours</span>
                    <span className="font-bold">{estimate.labor?.hours}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-300">Rate</span>
                    <span className="font-bold">${estimate.labor?.rate}/hr</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 italic">{estimate.labor?.description}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-3xl flex justify-between items-center">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Estimated Cost</p>
                <p className="text-3xl font-black">${estimate.total}</p>
              </div>
              <button
                type="button"
                onClick={() => onRequestWaitlist('Invoice Generation')}
                className="bg-yellow-500 text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-yellow-400 transition-colors"
              >
                Create Invoice
              </button>
            </div>

            {estimate.notes && (
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-300/40 rounded-2xl text-sm text-yellow-100">
                <p className="font-bold mb-1 flex items-center gap-1">
                  <Info size={16} /> AI Notes:
                </p>
                {estimate.notes}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

const WaitlistModal = ({ feature, onClose }: { feature: string | null, onClose: () => void }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!feature) return;
    setSubmitted(false);
    setError('');
    setEmail('');
    setName('');
  }, [feature]);

  if (!feature) return null;

  const submitWaitlist = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const payload = new URLSearchParams({
        'form-name': 'waitlist',
        feature,
        name: name.trim(),
        email: email.trim(),
        'bot-field': '',
      });

      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: payload.toString(),
      });

      if (!response.ok) throw new Error('Failed submit');
      setSubmitted(true);
    } catch {
      setError('Could not submit right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm px-4 py-8 flex items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          className="vv-card w-full max-w-md rounded-3xl p-6 md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Join waitlist"
        >
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Coming Soon</p>
              <h3 className="text-2xl font-black mt-1">Join the Waitlist</h3>
              <p className="text-slate-300 text-sm mt-2">"{feature}" is not live yet. We will notify you when it ships.</p>
            </div>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-100 p-1 rounded-lg">
              <X size={20} />
            </button>
          </div>

          {submitted ? (
            <div className="bg-emerald-900/40 border border-emerald-600/50 text-emerald-100 rounded-2xl p-4">
              You are on the waitlist. Thanks.
            </div>
          ) : (
            <form onSubmit={submitWaitlist} name="waitlist">
              <input type="hidden" name="form-name" value="waitlist" />
              <input type="hidden" name="feature" value={feature} />
              <input type="hidden" name="bot-field" value="" />

              <div className="space-y-3">
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Name (optional)"
                  className="vv-input w-full rounded-xl px-4 py-2.5"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email address"
                  className="vv-input w-full rounded-xl px-4 py-2.5"
                  required
                />
                {error && <p className="text-sm text-red-300">{error}</p>}
              </div>

              <div className="mt-5 flex gap-2">
                <button type="submit" disabled={isSubmitting} className="flex-1 vv-button-primary py-2.5 rounded-xl disabled:opacity-60">
                  {isSubmitting ? 'Submitting...' : 'Join Waitlist'}
                </button>
                <button type="button" onClick={onClose} className="vv-button-secondary px-4 rounded-xl">
                  Close
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const ItemIcon = ({ type, size = 16, className = "" }: { type: ItemType, size?: number, className?: string, key?: any }) => {
  switch (type) {
    case 'light': return <Lightbulb size={size} className={className} />;
    case 'outlet': return <Power size={size} className={className} />;
    case 'switch': return <ToggleLeft size={size} className={className} />;
    case 'appliance': return <Cpu size={size} className={className} />;
    default: return <Zap size={size} className={className} />;
  }
};

const BreakerSlot = ({ breaker, onUpdate, onAddItem, onRemoveItem, propertyType, isSelected, onSelect }: { 
  breaker: Breaker, 
  onUpdate: (u: Partial<Breaker>) => void,
  onAddItem: (i: Omit<MappedItem, 'id'>) => void,
  onRemoveItem: (id: string) => void,
  propertyType: PropertyType,
  isSelected: boolean,
  onSelect: () => void,
  key?: any
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', type: 'outlet' as ItemType, room: '' });

  // Phase color coding for commercial
  const getPhaseColor = (phase?: string) => {
    switch(phase) {
      case 'A': return 'bg-black';
      case 'B': return 'bg-red-600';
      case 'C': return 'bg-blue-600';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="relative" id={`breaker-${breaker.id}`}>
      <div 
        onClick={() => { onSelect(); setIsEditing(true); }}
        className={`h-14 flex items-center px-3 rounded-lg border-2 transition-all cursor-pointer group ${
          isSelected ? 'ring-2 ring-yellow-500 ring-offset-2 z-20' : ''
        } ${
          breaker.label === 'Spare' 
            ? 'bg-slate-100 border-slate-200 text-slate-400' 
            : 'bg-slate-900 border-slate-800 text-white shadow-lg'
        }`}
      >
        {/* Phase Indicator for Commercial */}
        {propertyType === 'commercial' && (
          <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg ${getPhaseColor(breaker.phase)}`} />
        )}

        <div className="w-8 h-8 rounded-lg bg-black/30 flex flex-col items-center justify-center mr-3 border border-white/10 flex-shrink-0">
          <span className="text-[8px] opacity-50 leading-none mb-0.5">#{breaker.number}</span>
          <span className="font-black text-xs leading-none">{breaker.amperage}</span>
        </div>

        <div className="flex-1 overflow-hidden">
          <p className="font-bold truncate text-xs tracking-tight">{breaker.label}</p>
          <div className="flex items-center gap-1">
            {breaker.isDoublePole && (
              <span className="text-[7px] font-black bg-yellow-500 text-slate-900 px-1 rounded uppercase">2P</span>
            )}
            <p className="text-[8px] font-bold truncate uppercase tracking-widest opacity-40">
              {breaker.label === 'Spare' ? 'Available' : `${breaker.items.length} Items`}
            </p>
          </div>
        </div>

        <div className="flex -space-x-1 ml-1">
          {breaker.items.slice(0, 1).map((item) => (
            <div key={item.id} className="w-6 h-6 rounded-full bg-slate-800 border border-slate-900 flex items-center justify-center shadow-lg">
              <ItemIcon type={item.type} size={10} className="text-yellow-500" />
            </div>
          ))}
        </div>
      </div>

      {/* Breaker Detail Modal/Popout */}
      <AnimatePresence>
        {isEditing && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] md:w-full md:max-w-lg bg-white rounded-[2rem] shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-6 md:p-8 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-500 text-slate-900 rounded-2xl flex items-center justify-center font-black text-lg md:text-xl">
                    {breaker.number}
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold">Circuit Details</h3>
                    <p className="text-slate-400 text-sm">{breaker.amperage} Amp Breaker</p>
                  </div>
                </div>
                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-6 md:space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-widest">Circuit Label</label>
                    <input 
                      type="text" 
                      value={breaker.label}
                      onChange={(e) => onUpdate({ label: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-widest">Amperage</label>
                    <select 
                      value={breaker.amperage}
                      onChange={(e) => onUpdate({ amperage: parseInt(e.target.value) as any })}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none font-bold bg-white"
                    >
                      {[15, 20, 30, 40, 50, 60, 100].map(a => <option key={a} value={a}>{a} Amps</option>)}
                    </select>
                  </div>
                </div>

                {/* Mapped Items */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-slate-900 uppercase text-xs tracking-widest">Mapped Outlets & Switches</h4>
                    <button 
                      onClick={() => setIsAddingItem(true)}
                      className="text-yellow-600 font-bold text-xs flex items-center gap-1 hover:text-yellow-700"
                    >
                      <Plus size={14} /> Add Item
                    </button>
                  </div>

                  {isAddingItem && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          placeholder="Item Name (e.g. Fridge)" 
                          className="p-2 rounded-lg border text-sm"
                          value={newItem.name}
                          onChange={e => setNewItem({...newItem, name: e.target.value})}
                        />
                        <input 
                          placeholder="Room (e.g. Kitchen)" 
                          className="p-2 rounded-lg border text-sm"
                          value={newItem.room}
                          onChange={e => setNewItem({...newItem, room: e.target.value})}
                        />
                      </div>
                      <div className="flex gap-2">
                        {(['outlet', 'switch', 'light', 'appliance'] as ItemType[]).map(type => (
                          <button
                            key={type}
                            onClick={() => setNewItem({...newItem, type})}
                            className={`p-2 rounded-lg border flex-1 flex flex-col items-center gap-1 transition-all ${
                              newItem.type === type ? 'bg-yellow-500 border-yellow-600 text-slate-900' : 'bg-white text-slate-400'
                            }`}
                          >
                            <ItemIcon type={type} size={16} />
                            <span className="text-[10px] font-bold uppercase">{type}</span>
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            if (newItem.name) {
                              onAddItem(newItem);
                              setNewItem({ name: '', type: 'outlet', room: '' });
                              setIsAddingItem(false);
                            }
                          }}
                          className="flex-1 bg-slate-900 text-white py-2 rounded-lg font-bold text-sm"
                        >
                          Save Item
                        </button>
                        <button onClick={() => setIsAddingItem(false)} className="px-4 py-2 border rounded-lg text-sm font-bold">Cancel</button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {breaker.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group/item">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <ItemIcon type={item.type} className="text-slate-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm">{item.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{item.room}</p>
                        </div>
                        <button 
                          onClick={() => onRemoveItem(item.id)}
                          className="opacity-0 group-hover/item:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {breaker.items.length === 0 && !isAddingItem && (
                      <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-2xl">
                        <p className="text-sm text-slate-400">No items mapped to this circuit yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all"
                >
                  <Save size={20} /> Done
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

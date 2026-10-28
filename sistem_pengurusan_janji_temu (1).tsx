import React, { useState, useMemo } from 'react';
import { 
  Calendar, Clock, User, Phone, MapPin, CheckCircle2, 
  XCircle, Clock3, Search, Filter, Trash2, Edit3, 
  Download, PieChart as PieIcon, BarChart3, ShieldCheck, 
  Check, ChevronRight, Building2, CalendarCheck2, Layers, 
  RefreshCw, BookmarkCheck, Store, CheckCircle, AlertCircle
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, 
  XAxis, YAxis, Tooltip, Legend, CartesianGrid 
} from 'recharts';

// Cawangan Perak
const PERAK_BRANCHES = [
  { id: 'ipoh', name: 'Ipoh', area: 'Greentown Business Centre' },
  { id: 'tjg_malim', name: 'Tanjung Malim', area: 'Bandar Universiti' },
  { id: 'bidor', name: 'Bidor', area: 'Jalan Main Street' },
  { id: 'tapah', name: 'Tapah', area: 'Pusat Bandar Tapah' },
  { id: 'batu_gajah', name: 'Batu Gajah', area: 'Kinta Heights' },
  { id: 'kampar', name: 'Kampar', area: 'Bandar Baru Kampar' },
  { id: 'teluk_intan', name: 'Teluk Intan', area: 'Pusat Bandar Teluk Intan' },
  { id: 'taiping', name: 'Taiping', area: 'Taman Tasik Taiping' },
  { id: 'manjung', name: 'Seri Manjung', area: 'Pusat Bandar Manjung' },
  { id: 'kkangsar', name: 'Kuala Kangsar', area: 'Bandar DiRaja' }
];

const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', 
  '02:00 PM', '03:00 PM', '04:00 PM'
];

const INITIAL_APPOINTMENTS = [
  {
    id: 'APT-1001',
    name: 'Nur Aisyah Humaira',
    phone: '011-2345678',
    branch: 'Ipoh',
    date: '2026-10-29',
    time: '09:00 AM',
    status: 'Disahkan',
    createdAt: '2026-10-25'
  },
  {
    id: 'APT-1002',
    name: 'Siti Sarah Sofea',
    phone: '019-8765432',
    branch: 'Tanjung Malim',
    date: '2026-10-29',
    time: '11:00 AM',
    status: 'Menunggu',
    createdAt: '2026-10-26'
  },
  {
    id: 'APT-1003',
    name: 'Anis Najwa',
    phone: '017-1122334',
    branch: 'Kampar',
    date: '2026-10-30',
    time: '02:00 PM',
    status: 'Disahkan',
    createdAt: '2026-10-26'
  },
  {
    id: 'APT-1004',
    name: 'Nurul Huda',
    phone: '016-5544332',
    branch: 'Taiping',
    date: '2026-10-28',
    time: '10:00 AM',
    status: 'Dibatalkan',
    createdAt: '2026-10-24'
  },
  {
    id: 'APT-1005',
    name: 'Farah Ain',
    phone: '013-9988776',
    branch: 'Teluk Intan',
    date: '2026-10-31',
    time: '03:00 PM',
    status: 'Menunggu',
    createdAt: '2026-10-27'
  }
];

export default function App() {
  const [role, setRole] = useState('user'); // 'user' | 'admin'
  const [adminTab, setAdminTab] = useState('switchboard'); // 'switchboard' | 'reports' | 'analytics'
  const [userTab, setUserTab] = useState('form'); // 'form' | 'my-appointments'

  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [toast, setToast] = useState(null);

  // User Form State
  const [formData, setFormData] = useState({
    branch: PERAK_BRANCHES[0].name,
    date: new Date().toISOString().split('T')[0],
    time: TIME_SLOTS[0],
    name: '',
    phone: ''
  });

  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Admin Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [branchFilter, setBranchFilter] = useState('Semua');

  // Reschedule Modal
  const [rescheduleModal, setRescheduleModal] = useState({ open: false, item: null, newDate: '', newTime: '' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const isSlotTaken = useMemo(() => {
    return (branch, date, time) => {
      return appointments.some(
        apt => apt.branch === branch && apt.date === date && apt.time === time && apt.status !== 'Dibatalkan'
      );
    };
  }, [appointments]);

  // Submit Booking
  const handleBookingSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim()) {
      showToast('Sila lengkapkan nama dan nombor telefon.', 'error');
      return;
    }

    if (isSlotTaken(formData.branch, formData.date, formData.time)) {
      showToast('Slot masa ini telah tempah. Sila pilih waktu lain.', 'error');
      return;
    }

    const newApt = {
      id: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
      ...formData,
      status: 'Menunggu',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setAppointments([newApt, ...appointments]);
    setConfirmedBooking(newApt);
    showToast('Tempahan janji temu berjaya dihantar.');
  };

  const updateStatus = (id, newStatus) => {
    setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status: newStatus } : apt));
    showToast(`Status tempahan ${id} dikemaskini kepada '${newStatus}'.`);
  };

  const deleteAppointment = (id) => {
    if (window.confirm(`Adakah anda pasti mahu memadam tempahan ${id}?`)) {
      setAppointments(prev => prev.filter(apt => apt.id !== id));
      showToast(`Tempahan ${id} telah dipadamkan.`, 'info');
    }
  };

  const saveReschedule = () => {
    if (!rescheduleModal.item) return;

    if (isSlotTaken(rescheduleModal.item.branch, rescheduleModal.newDate, rescheduleModal.newTime)) {
      showToast('Slot masa baru tidak tersedia.', 'error');
      return;
    }

    setAppointments(prev => prev.map(apt => {
      if (apt.id === rescheduleModal.item.id) {
        return { 
          ...apt, 
          date: rescheduleModal.newDate, 
          time: rescheduleModal.newTime,
          status: 'Menunggu' 
        };
      }
      return apt;
    }));

    showToast(`Tempahan ${rescheduleModal.item.id} berjaya dijadual semula.`);
    setRescheduleModal({ open: false, item: null, newDate: '', newTime: '' });
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = appointments.length;
    const confirmed = appointments.filter(a => a.status === 'Disahkan').length;
    const pending = appointments.filter(a => a.status === 'Menunggu').length;
    const cancelled = appointments.filter(a => a.status === 'Dibatalkan').length;
    
    const branchCounts = {};
    appointments.forEach(a => {
      branchCounts[a.branch] = (branchCounts[a.branch] || 0) + 1;
    });
    const topBranch = Object.keys(branchCounts).reduce((a, b) => branchCounts[a] > branchCounts[b] ? a : b, 'Tiada');

    return { total, confirmed, pending, cancelled, topBranch };
  }, [appointments]);

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const matchesSearch = apt.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            apt.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            apt.phone.includes(searchQuery);
      const matchesStatus = statusFilter === 'Semua' || apt.status === statusFilter;
      const matchesBranch = branchFilter === 'Semua' || apt.branch === branchFilter;
      return matchesSearch && matchesStatus && matchesBranch;
    });
  }, [appointments, searchQuery, statusFilter, branchFilter]);

  // Chart Data
  const branchChartData = useMemo(() => {
    const counts = {};
    PERAK_BRANCHES.forEach(b => counts[b.name] = 0);
    appointments.forEach(apt => {
      if (counts[apt.branch] !== undefined) counts[apt.branch]++;
    });
    return Object.keys(counts).map(name => ({ name, value: counts[name] }));
  }, [appointments]);

  const statusChartData = useMemo(() => [
    { name: 'Disahkan', value: stats.confirmed, color: '#f472b6' },
    { name: 'Menunggu', value: stats.pending, color: '#fbbf24' },
    { name: 'Dibatalkan', value: stats.cancelled, color: '#f43f5e' }
  ], [stats]);

  return (
    <div className="min-h-screen bg-[#FFF8FA] text-zinc-800 font-sans selection:bg-pink-200 selection:text-pink-900">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-semibold transition-all ${
          toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-white border-pink-200 text-pink-950'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={16} className="text-rose-500" /> : <CheckCircle size={16} className="text-pink-500" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-pink-400 to-rose-400 flex items-center justify-center text-white shadow-sm">
              <Calendar size={18} />
            </div>
            <div>
              <h1 className="font-bold text-sm sm:text-base text-zinc-900 tracking-tight">
                Janji Temu Perak
              </h1>
              <p className="text-[11px] text-zinc-400">Sistem Pengurusan Tempahan Cawangan Negeri Perak</p>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="bg-pink-50/80 p-1 rounded-xl border border-pink-100 flex items-center space-x-1">
            <button
              onClick={() => setRole('user')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                role === 'user'
                  ? 'bg-white text-pink-600 shadow-sm border border-pink-100'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <User size={14} />
              <span>Akaun Pengguna</span>
            </button>
            <button
              onClick={() => setRole('admin')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                role === 'admin'
                  ? 'bg-white text-pink-600 shadow-sm border border-pink-100'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <ShieldCheck size={14} />
              <span>Akaun Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* AKAUN PENGGUNA */}
        {role === 'user' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            
            {/* User Nav Toggle */}
            <div className="flex border-b border-pink-100 gap-6">
              <button
                onClick={() => { setUserTab('form'); setConfirmedBooking(null); }}
                className={`pb-3 text-xs font-semibold transition-all border-b-2 ${
                  userTab === 'form' 
                    ? 'border-pink-500 text-pink-600 font-bold' 
                    : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
              >
                Borang Tempahan
              </button>
              <button
                onClick={() => setUserTab('my-appointments')}
                className={`pb-3 text-xs font-semibold transition-all border-b-2 ${
                  userTab === 'my-appointments' 
                    ? 'border-pink-500 text-pink-600 font-bold' 
                    : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
              >
                Semakan Tempahan Saya ({appointments.length})
              </button>
            </div>

            {/* FORM TEMP AAN PENGGUNA */}
            {userTab === 'form' && (
              <div>
                {!confirmedBooking ? (
                  <div className="bg-white border border-pink-100 rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
                    <div>
                      <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Tempah Janji Temu</h2>
                      <p className="text-xs text-zinc-500 mt-1">Sila pilih cawangan Perak, tarikh, dan slot masa yang diingini.</p>
                    </div>

                    <form onSubmit={handleBookingSubmit} className="space-y-6">
                      
                      {/* 1. CAWANGAN PERAK */}
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                          <Store size={15} className="text-pink-500" />
                          1. Pilih Cawangan Perak
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                          {PERAK_BRANCHES.map((b) => {
                            const selected = formData.branch === b.name;
                            return (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, branch: b.name })}
                                className={`p-3 rounded-xl text-left border transition-all relative ${
                                  selected 
                                    ? 'bg-pink-50/60 border-pink-400 text-pink-950 font-semibold' 
                                    : 'bg-white border-zinc-200 text-zinc-600 hover:border-pink-200 hover:bg-pink-50/20'
                                }`}
                              >
                                {selected && (
                                  <div className="absolute top-2 right-2 text-pink-500">
                                    <Check size={12} />
                                  </div>
                                )}
                                <p className="text-xs font-bold leading-tight">{b.name}</p>
                                <p className="text-[10px] text-zinc-400 mt-1 truncate">{b.area}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 2 & 3. TARIKH & MASA */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* TARIKH */}
                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Calendar size={15} className="text-pink-500" />
                            2. Pilih Tarikh
                          </label>
                          <input
                            type="date"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            className="w-full p-3 bg-white border border-zinc-200 rounded-xl text-xs font-medium text-zinc-800 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition"
                          />
                        </div>

                        {/* MASA */}
                        <div>
                          <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Clock size={15} className="text-pink-500" />
                            3. Pilih Waktu / Masa
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {TIME_SLOTS.map((slot) => {
                              const taken = isSlotTaken(formData.branch, formData.date, slot);
                              const selected = formData.time === slot;
                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  disabled={taken}
                                  onClick={() => setFormData({ ...formData, time: slot })}
                                  className={`py-2.5 px-2 text-xs rounded-xl border font-semibold transition-all ${
                                    taken 
                                      ? 'bg-zinc-50 border-zinc-200 text-zinc-300 cursor-not-allowed line-through' 
                                      : selected 
                                      ? 'bg-pink-500 text-white border-pink-500 shadow-sm' 
                                      : 'bg-white border-zinc-200 text-zinc-700 hover:border-pink-300'
                                  }`}
                                >
                                  {slot}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* MAKLUMAT PEMOHON */}
                      <div className="pt-4 border-t border-pink-50 space-y-4">
                        <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                          Maklumat Pengesahan
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <input
                              type="text"
                              required
                              placeholder="Nama Penuh"
                              value={formData.name}
                              onChange={e => setFormData({ ...formData, name: e.target.value })}
                              className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:border-pink-400"
                            />
                          </div>
                          <div>
                            <input
                              type="tel"
                              required
                              placeholder="Nombor Telefon"
                              value={formData.phone}
                              onChange={e => setFormData({ ...formData, phone: e.target.value })}
                              className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:border-pink-400"
                            />
                          </div>
                        </div>
                      </div>

                      {/* SUBMIT BUTTON */}
                      <button
                        type="submit"
                        className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-6 rounded-xl shadow-sm transition-all text-xs tracking-wide"
                      >
                        Hantar Permohonan Tempahan
                      </button>
                    </form>
                  </div>
                ) : (
                  /* CONFIRMATION / RECEIPT CARD */
                  <div className="bg-white border border-pink-100 rounded-2xl p-6 sm:p-8 shadow-sm text-center max-w-md mx-auto space-y-6">
                    <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center mx-auto text-pink-500 border border-pink-100">
                      <CheckCircle size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-zinc-900">Permohonan Berjaya Dihantar</h3>
                      <p className="text-xs text-zinc-400 mt-1">Maklumat janji temu anda disimpan di bawah.</p>
                    </div>

                    <div className="bg-zinc-50/80 p-5 rounded-xl border border-zinc-100 text-left space-y-2.5 text-xs">
                      <div className="flex justify-between border-b border-zinc-200/60 pb-2">
                        <span className="text-zinc-500">No Rujukan:</span>
                        <span className="font-mono font-bold text-pink-600">{confirmedBooking.id}</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-200/60 pb-2">
                        <span className="text-zinc-500">Nama:</span>
                        <span className="font-semibold text-zinc-800">{confirmedBooking.name}</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-200/60 pb-2">
                        <span className="text-zinc-500">Cawangan Perak:</span>
                        <span className="font-semibold text-zinc-800">{confirmedBooking.branch}</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-200/60 pb-2">
                        <span className="text-zinc-500">Tarikh:</span>
                        <span className="font-semibold text-zinc-800">{confirmedBooking.date}</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-200/60 pb-2">
                        <span className="text-zinc-500">Masa:</span>
                        <span className="font-semibold text-zinc-800">{confirmedBooking.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Status:</span>
                        <span className="font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px]">
                          {confirmedBooking.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setConfirmedBooking(null)}
                        className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold transition"
                      >
                        Tempah Lagi
                      </button>
                      <button
                        onClick={() => setUserTab('my-appointments')}
                        className="flex-1 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-semibold transition shadow-sm"
                      >
                        Semak Senarai
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: SEMAKAN TEMPAHAN SAYA */}
            {userTab === 'my-appointments' && (
              <div className="bg-white border border-pink-100 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-zinc-900">Senarai Tempahan Janji Temu Saya</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="bg-zinc-50/50 border border-zinc-200 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded border border-pink-200">
                          {apt.id}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                          apt.status === 'Disahkan' ? 'bg-pink-100 text-pink-700 border border-pink-200' :
                          apt.status === 'Dibatalkan' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {apt.status}
                        </span>
                      </div>

                      <div>
                        <p className="font-bold text-zinc-800 text-xs">{apt.branch}</p>
                        <p className="text-[11px] text-zinc-500">{apt.name} • {apt.phone}</p>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-zinc-200 grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-zinc-400 block text-[9px] uppercase font-semibold">Tarikh</span>
                          <span className="font-semibold text-zinc-700">{apt.date}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block text-[9px] uppercase font-semibold">Masa</span>
                          <span className="font-semibold text-zinc-700">{apt.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AKAUN ADMIN */}
        {role === 'admin' && (
          <div className="space-y-6">

            {/* ADMIN HEADER & NAVIGATION */}
            <div className="bg-white border border-pink-100 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-base font-bold text-zinc-900">Papan Kawalan Admin</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Pengurusan janji temu dan laporan cawangan Perak.</p>
              </div>

              <div className="bg-pink-50/80 p-1 rounded-xl border border-pink-100 flex items-center w-full md:w-auto">
                <button
                  onClick={() => setAdminTab('switchboard')}
                  className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    adminTab === 'switchboard' ? 'bg-white text-pink-600 shadow-sm border border-pink-100' : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <Layers size={14} /> Switchboard
                </button>
                <button
                  onClick={() => setAdminTab('reports')}
                  className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    adminTab === 'reports' ? 'bg-white text-pink-600 shadow-sm border border-pink-100' : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <CalendarCheck2 size={14} /> Laporan Data
                </button>
                <button
                  onClick={() => setAdminTab('analytics')}
                  className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    adminTab === 'analytics' ? 'bg-white text-pink-600 shadow-sm border border-pink-100' : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <PieIcon size={14} /> Analitik
                </button>
              </div>
            </div>

            {/* EXECUTIVE METRICS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-pink-100 shadow-sm">
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Total Tempahan</p>
                <p className="text-2xl font-bold text-zinc-900 mt-1">{stats.total}</p>
                <span className="text-[10px] text-pink-600 bg-pink-50 font-semibold px-2 py-0.5 rounded mt-2 inline-block">Keseluruhan Perak</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-pink-100 shadow-sm">
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Menunggu Sah</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
                <span className="text-[10px] text-amber-700 bg-amber-50 font-semibold px-2 py-0.5 rounded mt-2 inline-block">Perlu Semakan</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-pink-100 shadow-sm">
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Disahkan</p>
                <p className="text-2xl font-bold text-pink-600 mt-1">{stats.confirmed}</p>
                <span className="text-[10px] text-pink-700 bg-pink-50 font-semibold px-2 py-0.5 rounded mt-2 inline-block">Diluluskan</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-pink-100 shadow-sm">
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Cawangan Utama</p>
                <p className="text-sm font-bold text-zinc-800 mt-2 truncate">{stats.topBranch}</p>
                <span className="text-[10px] text-zinc-500 bg-zinc-100 font-semibold px-2 py-0.5 rounded mt-1 inline-block">Permohonan Tertinggi</span>
              </div>
            </div>

            {/* TAB: SWITCHBOARD DASHBOARD */}
            {adminTab === 'switchboard' && (
              <div className="bg-white rounded-2xl p-6 border border-pink-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <Clock3 className="text-pink-500" size={16} />
                  Permohonan Menunggu Pengesahan
                </h3>

                {appointments.filter(a => a.status === 'Menunggu').length === 0 ? (
                  <div className="text-center py-10 text-zinc-400 text-xs">
                    Tiada permohonan menunggu pengesahan.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-zinc-100 text-zinc-400 uppercase font-semibold">
                          <th className="py-2.5 px-3">ID</th>
                          <th className="py-2.5 px-3">Pemohon</th>
                          <th className="py-2.5 px-3">Cawangan</th>
                          <th className="py-2.5 px-3">Tarikh & Masa</th>
                          <th className="py-2.5 px-3 text-right">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {appointments.filter(a => a.status === 'Menunggu').map(apt => (
                          <tr key={apt.id} className="hover:bg-pink-50/30 transition">
                            <td className="py-3 px-3 font-mono font-bold text-pink-600">{apt.id}</td>
                            <td className="py-3 px-3 font-semibold text-zinc-800">{apt.name} ({apt.phone})</td>
                            <td className="py-3 px-3 text-zinc-600">{apt.branch}</td>
                            <td className="py-3 px-3 text-zinc-600 font-mono">{apt.date} @ {apt.time}</td>
                            <td className="py-3 px-3 text-right space-x-2">
                              <button
                                onClick={() => updateStatus(apt.id, 'Disahkan')}
                                className="px-3 py-1 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-semibold transition"
                              >
                                Sahkan
                              </button>
                              <button
                                onClick={() => updateStatus(apt.id, 'Dibatalkan')}
                                className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg font-semibold transition"
                              >
                                Batalkan
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB: LAPORAN DATA */}
            {adminTab === 'reports' && (
              <div className="bg-white rounded-2xl p-6 border border-pink-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="text-sm font-bold text-zinc-900">Laporan Janji Temu</h3>
                  
                  <button
                    onClick={() => {
                      const csvContent = "data:text/csv;charset=utf-8," 
                        + ["ID,Nama,Telefon,Cawangan,Tarikh,Masa,Status"]
                        .concat(filteredAppointments.map(e => `${e.id},"${e.name}",${e.phone},"${e.branch}",${e.date},${e.time},${e.status}`))
                        .join("\n");
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", `Laporan_Janji_Temu.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      showToast('Muat turun laporan CSV berjaya.');
                    }}
                    className="px-3.5 py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition"
                  >
                    <Download size={14} /> Eksport CSV
                  </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-zinc-400" size={14} />
                    <input
                      type="text"
                      placeholder="Cari Nama / ID / Telefon..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-800 focus:outline-none focus:border-pink-400"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="w-full py-1.5 px-3 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-800 focus:outline-none focus:border-pink-400 font-medium"
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="Disahkan">Disahkan</option>
                    <option value="Menunggu">Menunggu</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>

                  <select
                    value={branchFilter}
                    onChange={e => setBranchFilter(e.target.value)}
                    className="w-full py-1.5 px-3 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-800 focus:outline-none focus:border-pink-400 font-medium"
                  >
                    <option value="Semua">Semua Cawangan Perak</option>
                    {PERAK_BRANCHES.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto rounded-xl border border-zinc-100">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-zinc-50 text-zinc-400 font-semibold uppercase">
                        <th className="p-3">ID</th>
                        <th className="p-3">Pemohon</th>
                        <th className="p-3">Cawangan</th>
                        <th className="p-3">Tarikh & Masa</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-center">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredAppointments.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-zinc-400">
                            Tiada rekod ditemui.
                          </td>
                        </tr>
                      ) : (
                        filteredAppointments.map(apt => (
                          <tr key={apt.id} className="hover:bg-pink-50/20 transition">
                            <td className="p-3 font-mono font-semibold text-pink-600">{apt.id}</td>
                            <td className="p-3">
                              <p className="font-semibold text-zinc-800">{apt.name}</p>
                              <p className="text-[10px] text-zinc-400">{apt.phone}</p>
                            </td>
                            <td className="p-3 text-zinc-700 font-medium">{apt.branch}</td>
                            <td className="p-3 text-zinc-600 font-mono">{apt.date} ({apt.time})</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                apt.status === 'Disahkan' ? 'bg-pink-50 text-pink-700 border border-pink-200' :
                                apt.status === 'Dibatalkan' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                                'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {apt.status}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex justify-center space-x-1">
                                <button
                                  onClick={() => setRescheduleModal({ open: true, item: apt, newDate: apt.date, newTime: apt.time })}
                                  className="p-1.5 hover:bg-zinc-100 text-zinc-600 rounded transition"
                                  title="Jadual Semula"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => deleteAppointment(apt.id)}
                                  className="p-1.5 hover:bg-rose-50 text-rose-600 rounded transition"
                                  title="Padam"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: ANALITIK */}
            {adminTab === 'analytics' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-pink-100 shadow-sm">
                  <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider mb-4">Taburan Permohonan Cawangan Perak</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={branchChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} allowDecimals={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#f1f5f9', borderRadius: '12px', fontSize: '12px' }} />
                        <Bar dataKey="value" fill="#f472b6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-pink-100 shadow-sm">
                  <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider mb-4">Status Tempahan Keseluruhan</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                          {statusChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#f1f5f9', borderRadius: '12px', fontSize: '12px' }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* MODAL JADUAL SEMULA */}
      {rescheduleModal.open && rescheduleModal.item && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-sm w-full p-6 shadow-xl">
            <h3 className="text-sm font-bold text-zinc-900 mb-1">Jadual Semula Tempahan</h3>
            <p className="text-xs text-zinc-500 mb-4">Pilih tarikh dan masa baharu untuk {rescheduleModal.item.name}.</p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Tarikh Baharu</label>
                <input
                  type="date"
                  value={rescheduleModal.newDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setRescheduleModal({ ...rescheduleModal, newDate: e.target.value })}
                  className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Masa Baharu</label>
                <select
                  value={rescheduleModal.newTime}
                  onChange={e => setRescheduleModal({ ...rescheduleModal, newTime: e.target.value })}
                  className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-800 font-medium"
                >
                  {TIME_SLOTS.map((slot, i) => (
                    <option key={i} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setRescheduleModal({ open: false, item: null, newDate: '', newTime: '' })}
                className="px-3.5 py-2 bg-zinc-100 text-zinc-700 rounded-xl text-xs font-semibold hover:bg-zinc-200 transition"
              >
                Batal
              </button>
              <button
                onClick={saveReschedule}
                className="px-3.5 py-2 bg-pink-500 text-white rounded-xl text-xs font-semibold hover:bg-pink-600 transition shadow-sm"
              >
                Simpan Kemaskini
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
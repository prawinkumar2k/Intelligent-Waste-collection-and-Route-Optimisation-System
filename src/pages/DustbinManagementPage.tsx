import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Dustbin, DustbinStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { FillLevelBar } from '../components/common/FillLevelBar';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import {
  Search,
  Plus,
  Download,
  RotateCcw,
  SlidersHorizontal,
  LayoutGrid,
  Table as TableIcon,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Battery,
  Wifi,
  Thermometer,
  Clock,
  X,
  ExternalLink,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const DustbinManagementPage: React.FC = () => {
  const {
    dustbins,
    addDustbin,
    updateDustbin,
    deleteDustbin,
    resetDustbins,
    addStopToPlan,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [areaFilter, setAreaFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'fillLevel' | 'id' | 'battery' | 'area'>('fillLevel');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Drawer / Modals
  const [activeDrawerBin, setActiveDrawerBin] = useState<Dustbin | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBin, setEditingBin] = useState<Dustbin | null>(null);
  const [binToDelete, setBinToDelete] = useState<Dustbin | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    area: 'Old Bus Stand',
    latitude: 11.275,
    longitude: 77.582,
    capacityKg: 150,
    fillLevel: 50,
    battery: 90,
    wasteType: 'General Municipal' as Dustbin['wasteType'],
    priority: 'Medium' as Dustbin['priority'],
    connectivity: 'Online' as Dustbin['connectivity'],
  });

  // Extract distinct areas
  const uniqueAreas = useMemo(() => {
    return Array.from(new Set(dustbins.map(b => b.area))).sort();
  }, [dustbins]);

  // Filtering & Sorting
  const filteredBins = useMemo(() => {
    return dustbins
      .filter(b => {
        const matchSearch =
          b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.area.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = statusFilter === 'ALL' || b.status.toUpperCase() === statusFilter.toUpperCase();
        const matchArea = areaFilter === 'ALL' || b.area === areaFilter;
        return matchSearch && matchStatus && matchArea;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'fillLevel') diff = a.fillLevel - b.fillLevel;
        else if (sortBy === 'battery') diff = a.battery - b.battery;
        else if (sortBy === 'id') diff = a.id.localeCompare(b.id);
        else if (sortBy === 'area') diff = a.area.localeCompare(b.area);
        return sortOrder === 'desc' ? -diff : diff;
      });
  }, [dustbins, searchQuery, statusFilter, areaFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredBins.length / itemsPerPage) || 1;
  const paginatedBins = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBins.slice(start, start + itemsPerPage);
  }, [filteredBins, currentPage]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Name',
      'Area',
      'Latitude',
      'Longitude',
      'Fill Level (%)',
      'Current Weight (kg)',
      'Capacity (kg)',
      'Status',
      'Battery (%)',
      'Connectivity',
      'RSSI (dBm)',
      'Distance (cm)',
      'Temperature (C)',
      'Waste Type',
      'Priority',
      'Last Updated',
    ];

    const rows = filteredBins.map(b => [
      b.id,
      `"${b.name}"`,
      `"${b.area}"`,
      b.latitude,
      b.longitude,
      b.fillLevel,
      b.currentKg,
      b.capacityKg,
      b.status,
      b.battery,
      b.connectivity,
      b.signalRssi,
      b.distanceCm,
      b.temperatureC,
      `"${b.wasteType}"`,
      b.priority,
      `"${b.lastUpdated}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `perundurai_dustbins_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('CSV Exported', `Generated export containing ${filteredBins.length} records.`, 'success');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDustbin({
      name: formData.name || `Perundurai ${formData.area} Node`,
      area: formData.area,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      fillLevel: Number(formData.fillLevel),
      capacityKg: Number(formData.capacityKg),
      currentKg: Math.round(Number(formData.capacityKg) * (Number(formData.fillLevel) / 100)),
      status: Number(formData.fillLevel) >= 90 ? 'Full' : Number(formData.fillLevel) >= 70 ? 'Nearly Full' : 'Normal',
      battery: Number(formData.battery),
      connectivity: formData.connectivity,
      signalRssi: -65,
      distanceCm: Math.round(100 * (1 - Number(formData.fillLevel) / 100)),
      totalDepthCm: 100,
      temperatureC: 28.5,
      priority: formData.priority,
      installDate: new Date().toISOString().split('T')[0],
      wasteType: formData.wasteType,
      simulated: true,
    });
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBin) return;
    updateDustbin(editingBin.id, {
      name: formData.name,
      area: formData.area,
      fillLevel: Number(formData.fillLevel),
      capacityKg: Number(formData.capacityKg),
      currentKg: Math.round(Number(formData.capacityKg) * (Number(formData.fillLevel) / 100)),
      battery: Number(formData.battery),
      connectivity: formData.connectivity,
      priority: formData.priority,
      wasteType: formData.wasteType,
      distanceCm: Math.round(100 * (1 - Number(formData.fillLevel) / 100)),
    });
    setEditingBin(null);
  };

  return (
    <div className="space-y-5">
      {/* Page Title & Actions Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Perundurai Dustbin Registry
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitoring {dustbins.length} sensor-equipped containers across pilot sectors
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFormData({
                name: '',
                area: 'Old Bus Stand',
                latitude: 11.275,
                longitude: 77.582,
                capacityKg: 150,
                fillLevel: 50,
                battery: 90,
                wasteType: 'General Municipal',
                priority: 'Medium',
                connectivity: 'Online',
              });
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Register Dustbin</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
            title="Download CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={resetDustbins}
            className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg transition-colors"
            title="Restore baseline 24 Perundurai bins"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Controls */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by ID, Area, or Landmark..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="FULL">Full (≥ 90%)</option>
              <option value="NEARLY FULL">Nearly Full (70–89%)</option>
              <option value="NORMAL">Normal (&lt; 70%)</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </div>

          {/* Area Filter */}
          <div>
            <select
              value={areaFilter}
              onChange={e => {
                setAreaFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
            >
              <option value="ALL">All Areas ({uniqueAreas.length})</option>
              {uniqueAreas.map(area => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
            >
              <option value="fillLevel">Sort by Fill %</option>
              <option value="battery">Sort by Battery</option>
              <option value="id">Sort by Bin ID</option>
              <option value="area">Sort by Area</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
              className="px-2.5 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
              title="Toggle sort direction"
            >
              {sortOrder.toUpperCase()}
            </button>
          </div>
        </div>

        {/* View mode toggle & item counter */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing <strong>{filteredBins.length}</strong> matching dustbins
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md ${
                viewMode === 'table'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Table View"
            >
              <TableIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${
                viewMode === 'grid'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main View: Table or Grid */}
      {viewMode === 'table' ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Bin ID</th>
                  <th className="py-3 px-4">Area & Landmark</th>
                  <th className="py-3 px-4 min-w-[140px]">Fill Level</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Battery</th>
                  <th className="py-3 px-4">Signal</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedBins.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      No dustbins found matching the current search & filters.
                    </td>
                  </tr>
                ) : (
                  paginatedBins.map(bin => (
                    <tr
                      key={bin.id}
                      onClick={() => setActiveDrawerBin(bin)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {bin.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {bin.name}
                        </div>
                        <div className="text-[11px] text-slate-400">{bin.area}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <FillLevelBar fillLevel={bin.fillLevel} status={bin.status} size="sm" />
                          <div className="text-[10px] text-slate-400">
                            {bin.currentKg} / {bin.capacityKg} kg
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={bin.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          <Battery className="h-3.5 w-3.5 text-slate-400" />
                          <span>{bin.battery}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-slate-600 dark:text-slate-400">
                          {bin.signalRssi} dBm
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {bin.lastUpdated}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[11px] font-semibold ${
                            bin.priority === 'Critical'
                              ? 'text-rose-600 dark:text-rose-400'
                              : bin.priority === 'High'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {bin.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            onClick={() => addStopToPlan(bin.id)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                            title="Add to collection itinerary"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingBin(bin);
                              setFormData({
                                name: bin.name,
                                area: bin.area,
                                latitude: bin.latitude,
                                longitude: bin.longitude,
                                capacityKg: bin.capacityKg,
                                fillLevel: bin.fillLevel,
                                battery: bin.battery,
                                wasteType: bin.wasteType,
                                priority: bin.priority,
                                connectivity: bin.connectivity,
                              });
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit Record"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setBinToDelete(bin)}
                            className="p-1.5 text-rose-500 hover:text-rose-600 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/50"
                            title="Delete Record"
                          >
                            <Trash2 className="h-4 w-4" />
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
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {paginatedBins.map(bin => (
            <div
              key={bin.id}
              onClick={() => setActiveDrawerBin(bin)}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                    {bin.id}
                  </span>
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">
                    {bin.name}
                  </h4>
                  <p className="text-[11px] text-slate-400">{bin.area}</p>
                </div>
                <StatusBadge status={bin.status} size="sm" />
              </div>

              <div className="space-y-1">
                <FillLevelBar fillLevel={bin.fillLevel} status={bin.status} size="sm" />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>{bin.currentKg} / {bin.capacityKg} kg</span>
                  <span>{bin.wasteType}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1">
                  <Battery className="h-3 w-3 text-slate-400" />
                  <span>{bin.battery}%</span>
                </div>
                <div className="flex items-center gap-1 font-mono">
                  <Wifi className="h-3 w-3 text-slate-400" />
                  <span>{bin.signalRssi} dBm</span>
                </div>
              </div>

              <div
                className="flex items-center justify-between pt-1"
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={() => addStopToPlan(bin.id)}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> + Route
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingBin(bin);
                      setFormData({
                        name: bin.name,
                        area: bin.area,
                        latitude: bin.latitude,
                        longitude: bin.longitude,
                        capacityKg: bin.capacityKg,
                        fillLevel: bin.fillLevel,
                        battery: bin.battery,
                        wasteType: bin.wasteType,
                        priority: bin.priority,
                        connectivity: bin.connectivity,
                      });
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setBinToDelete(bin)}
                    className="p-1 text-rose-500 hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500 dark:text-slate-400">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Previous
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Details Side Drawer */}
      {activeDrawerBin && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {activeDrawerBin.id}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {activeDrawerBin.name}
                  </h3>
                  <p className="text-xs text-slate-500">{activeDrawerBin.area}, Perundurai</p>
                </div>
                <button
                  onClick={() => setActiveDrawerBin(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Device Status</span>
                  <StatusBadge status={activeDrawerBin.status} />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Current Volume</span>
                    <span className="font-bold">{activeDrawerBin.fillLevel}%</span>
                  </div>
                  <FillLevelBar fillLevel={activeDrawerBin.fillLevel} status={activeDrawerBin.status} />
                </div>
              </div>

              {/* Detailed Specs */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Telemetry & Sensor Readings
                </h4>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">Ultrasonic Distance to Waste</span>
                    <span className="font-mono font-bold">{activeDrawerBin.distanceCm} cm</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">Total Bin Depth</span>
                    <span className="font-mono">{activeDrawerBin.totalDepthCm} cm</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">Current Waste Weight</span>
                    <span className="font-bold">{activeDrawerBin.currentKg} kg (Cap: {activeDrawerBin.capacityKg} kg)</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">Solar Battery Storage</span>
                    <span className="font-bold">{activeDrawerBin.battery}%</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">LoRaWAN/GSM Signal</span>
                    <span className="font-mono">{activeDrawerBin.signalRssi} dBm ({activeDrawerBin.connectivity})</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">Internal Temperature</span>
                    <span>{activeDrawerBin.temperatureC}°C</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">Waste Classification</span>
                    <span>{activeDrawerBin.wasteType}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">GPS Coordinates (Illustrative)</span>
                    <span className="font-mono text-[11px]">{activeDrawerBin.latitude.toFixed(4)}° N, {activeDrawerBin.longitude.toFixed(4)}° E</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">Deployment Date</span>
                    <span>{activeDrawerBin.installDate}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <button
                onClick={() => {
                  addStopToPlan(activeDrawerBin.id);
                  setActiveDrawerBin(null);
                }}
                className="flex-1 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Add to Route Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Dustbin Modal */}
      {(isAddModalOpen || editingBin) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingBin ? `Edit Dustbin ${editingBin.id}` : 'Register New Perundurai Dustbin'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingBin(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={editingBin ? handleEditSubmit : handleCreateSubmit}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Location / Landmark Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Perundurai New Bus Terminus Platform 2"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    Sector Area
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.area}
                    onChange={e => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    Waste Classification
                  </label>
                  <select
                    value={formData.wasteType}
                    onChange={e => setFormData({ ...formData, wasteType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="General Municipal">General Municipal</option>
                    <option value="Organic / Market">Organic / Market</option>
                    <option value="Recyclable">Recyclable</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    Fill Level (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={formData.fillLevel}
                    onChange={e => setFormData({ ...formData, fillLevel: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    Capacity (kg)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="500"
                    required
                    value={formData.capacityKg}
                    onChange={e => setFormData({ ...formData, capacityKg: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    Battery (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={formData.battery}
                    onChange={e => setFormData({ ...formData, battery: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    Connectivity
                  </label>
                  <select
                    value={formData.connectivity}
                    onChange={e => setFormData({ ...formData, connectivity: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Online">Online</option>
                    <option value="Weak">Weak Signal</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    Dispatch Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingBin(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-xs"
                >
                  {editingBin ? 'Save Changes' : 'Register Dustbin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!binToDelete}
        title="Deregister Dustbin?"
        message={`Are you sure you want to remove ${binToDelete?.id} (${binToDelete?.name})? All telemetry streams and scheduled stops will be severed.`}
        confirmLabel="Deregister"
        onConfirm={() => {
          if (binToDelete) {
            deleteDustbin(binToDelete.id);
            setBinToDelete(null);
          }
        }}
        onCancel={() => setBinToDelete(null)}
      />
    </div>
  );
};

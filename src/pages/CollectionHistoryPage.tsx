import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { CollectionHistoryRecord } from '../types';
import {
  History,
  Search,
  Download,
  Filter,
  Truck,
  CheckCircle2,
  Clock,
  Calendar,
  X,
  User,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';

export const CollectionHistoryPage: React.FC = () => {
  const { collectionHistory, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRecord, setSelectedRecord] = useState<CollectionHistoryRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Filter & sort
  const filteredRecords = useMemo(() => {
    return collectionHistory.filter(record => {
      const matchSearch =
        record.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.binId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.operator.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.vehicleId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === 'ALL' || record.status.toUpperCase() === statusFilter.toUpperCase();

      return matchSearch && matchStatus;
    });
  }, [collectionHistory, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage]);

  const totalWasteCollectedKg = useMemo(() => {
    return collectionHistory.reduce((acc, curr) => acc + curr.weightCollectedKg, 0);
  }, [collectionHistory]);

  const handleExportCSV = () => {
    const headers = [
      'Collection ID',
      'Bin ID',
      'Area',
      'Planned Time',
      'Completion Time',
      'Operator',
      'Vehicle ID',
      'Status',
      'Recorded Fill (%)',
      'Weight Collected (kg)',
    ];

    const rows = filteredRecords.map(r => [
      r.id,
      r.binId,
      `"${r.area}"`,
      `"${r.plannedTime}"`,
      `"${r.completionTime}"`,
      `"${r.operator}"`,
      `"${r.vehicleId}"`,
      r.status,
      r.recordedFill,
      r.weightCollectedKg,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `perundurai_collection_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Export Complete', 'Downloaded municipal collection audit logs.', 'success');
  };

  return (
    <div className="space-y-5">
      {/* Page Title & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Collection History & Audit Trail
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Verified municipal waste pickups across Perundurai pilot sectors
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
        >
          <Download className="h-4 w-4" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Logged Pickups
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {collectionHistory.length} Runs
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
            100% verified field timestamps
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Municipal Waste Cleared
          </span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {totalWasteCollectedKg.toLocaleString()} kg
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Weighed via certified depot scale</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Fleet Schedule Compliance
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">94.2%</div>
          <p className="text-xs text-slate-500 mt-0.5">Completed within ETA target window</p>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Collection ID, Bin, Operator, or Vehicle..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

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
              <option value="COMPLETED">Completed</option>
              <option value="DELAYED">Delayed</option>
              <option value="PARTIAL">Partial</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Run ID</th>
                <th className="py-3 px-4">Bin & Sector</th>
                <th className="py-3 px-4">Schedule ETA</th>
                <th className="py-3 px-4">Completed Time</th>
                <th className="py-3 px-4">Vehicle & Operator</th>
                <th className="py-3 px-4">Recorded Fill</th>
                <th className="py-3 px-4">Weight Cleared</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No collection history records found.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map(record => (
                  <tr
                    key={record.id}
                    onClick={() => setSelectedRecord(record)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {record.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {record.binId}
                      </span>
                      <span className="text-[11px] text-slate-400 block">{record.area}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {record.plannedTime}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {record.completionTime}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {record.operator}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{record.vehicleId}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {record.recordedFill}%
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {record.weightCollectedKg} kg
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={record.status} size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
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

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {selectedRecord.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  Collection Receipt Manifest
                </h3>
                <p className="text-xs text-slate-500">{selectedRecord.area}, Perundurai</p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Dustbin ID</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {selectedRecord.binId}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Weight Verified</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedRecord.weightCollectedKg} kg
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Recorded Fill Before Emptying</span>
                <span className="font-bold">{selectedRecord.recordedFill}%</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Dispatch Vehicle</span>
                <span className="font-mono">{selectedRecord.vehicleId}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Certified Operator</span>
                <span>{selectedRecord.operator}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Timestamp</span>
                <span>{selectedRecord.completionTime}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Execution Status</span>
                <StatusBadge status={selectedRecord.status} size="sm" />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-full py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-lg transition-colors"
              >
                Close Manifest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

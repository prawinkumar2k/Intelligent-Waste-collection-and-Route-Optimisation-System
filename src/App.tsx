/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/common/AppLayout';

import { OverviewPage } from './pages/OverviewPage';
import { LiveMapPage } from './pages/LiveMapPage';
import { DustbinManagementPage } from './pages/DustbinManagementPage';
import { CollectionPlanningPage } from './pages/CollectionPlanningPage';
import { RouteOptimisationPage } from './pages/RouteOptimisationPage';
import { AlgorithmLabPage } from './pages/AlgorithmLabPage';
import { SensorAnalyticsPage } from './pages/SensorAnalyticsPage';
import { AlertsPage } from './pages/AlertsPage';
import { CollectionHistoryPage } from './pages/CollectionHistoryPage';
import { ReportsAnalyticsPage } from './pages/ReportsAnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/map" element={<LiveMapPage />} />
            <Route path="/dustbins" element={<DustbinManagementPage />} />
            <Route path="/planning" element={<CollectionPlanningPage />} />
            <Route path="/optimisation" element={<RouteOptimisationPage />} />
            <Route path="/algorithm-lab" element={<AlgorithmLabPage />} />
            <Route path="/analytics" element={<SensorAnalyticsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/history" element={<CollectionHistoryPage />} />
            <Route path="/reports" element={<ReportsAnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

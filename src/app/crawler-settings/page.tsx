'use client';

import { useState } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import CrawlerSettings from '../../components/sidebar-pages/CrawlerSettings';

export default function CrawlerSettingsPage() {
  return (
    <DashboardLayout 
      title="Crawler Settings"
      description="Configure web crawler behavior and customize how your AI agents process website content."
    >
      <div className="p-6">
        <CrawlerSettings />
      </div>
    </DashboardLayout>
  );
}

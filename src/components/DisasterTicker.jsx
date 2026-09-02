import React, { useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { ACTIVE_DISASTER_ALERTS } from '../services/disasterAlerts';

export default function DisasterTicker({ onOpenDisasterHub, locationName = 'Kochi' }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const topAlert = ACTIVE_DISASTER_ALERTS[0] || {
    event: 'Severe cyclone warning',
    headline: 'High squally winds and torrential precipitation expected'
  };

  const alertText = `Severe cyclone warning at ${locationName.split(',')[0]} at 9:00 am`;

  return (
    <div className="w-full bg-[#8c0303] text-white px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between text-xs sm:text-sm font-semibold shadow-md">
      <div 
        className="flex items-center gap-2 cursor-pointer flex-1 truncate mr-2"
        onClick={onOpenDisasterHub}
      >
        <span className="truncate">{alertText}</span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenDisasterHub}
          className="px-3 py-1 rounded-md bg-black/20 hover:bg-black/30 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
        >
          <span>Get directions</span>
          <span className="font-bold">&gt;</span>
        </button>

        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-md hover:bg-black/20 text-white/80 hover:text-white transition-colors"
          title="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

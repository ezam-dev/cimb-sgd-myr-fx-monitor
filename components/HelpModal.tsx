import React from 'react';
import { X } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="bg-white dark:bg-ios-darkCard dark:text-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-white/10">
          <h2 className="text-xl font-bold">How it Works</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <div className="space-y-6">
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-ios-blue mb-2">Data Source</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Rates are retrieved in real-time via Google Gemini's Grounding capabilities, which proxies requests to the official CIMB Clicks Singapore Business Forex page. We prioritize the "Business" selling rate for the most relevant commercial conversions.
              </p>
            </section>

            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-ios-blue mb-2">Live Updates</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                The app automatically polls for new data every 10 minutes to preserve API quotas while ensuring timely updates. You can manually refresh using the button on the rate card.
              </p>
            </section>

            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-ios-blue mb-2">Alerts</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Set your target threshold in the settings card. When the live rate equals or exceeds your target, the app will visually highlight the rate and log an entry in the Activity Log.
              </p>
            </section>

             <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-ios-blue mb-2">Privacy</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                All history and settings are stored locally on your device (localStorage). No personal data is sent to any server.
              </p>
            </section>
          </div>
        </div>
        <div className="p-6 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/10">
           <p className="text-xs text-center text-slate-500">
             Disclaimer: For informational purposes only. Always verify rates on the official CIMB banking platform before transacting.
           </p>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
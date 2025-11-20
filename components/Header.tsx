import React from 'react';
import { Wallet, Moon, Sun, HelpCircle } from 'lucide-react';
import { Theme } from '../types';

interface HeaderProps {
  theme: Theme;
  toggleTheme: () => void;
  onOpenHelp: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, onOpenHelp }) => {
  return (
    <header className="px-4 py-4 sticky top-0 z-30 flex justify-center pointer-events-none">
      <div className="w-full max-w-md flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/40 dark:bg-black/30 backdrop-blur-lg border border-white/30 dark:border-white/10 shadow-sm transition-all duration-300 hover:bg-white/50 dark:hover:bg-black/40">
          <div className="p-1.5 bg-ios-blue rounded-full shadow-[0_0_10px_rgba(0,122,255,0.3)]">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 dark:text-white leading-none">FX Watch</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <button 
             onClick={toggleTheme}
             className="p-2.5 rounded-full bg-white/40 dark:bg-black/30 backdrop-blur-md border border-white/30 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-300 shadow-sm active:scale-95 group"
             aria-label="Toggle Dark Mode"
           >
             {theme === 'light' ? 
               <Moon className="w-4 h-4 text-slate-600 group-hover:text-slate-900" /> : 
               <Sun className="w-4 h-4 text-yellow-400 group-hover:text-yellow-300" />
             }
           </button>
           <button 
             onClick={onOpenHelp}
             className="p-2.5 rounded-full bg-white/40 dark:bg-black/30 backdrop-blur-md border border-white/30 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-300 shadow-sm active:scale-95 group"
             aria-label="Help"
           >
             <HelpCircle className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-ios-blue dark:group-hover:text-white" />
           </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
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
    <header className="flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-ios-darkCard/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200/50 dark:border-white/10 transition-colors duration-300">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-ios-blue/10 dark:bg-ios-blue/20 rounded-xl">
          <Wallet className="w-6 h-6 text-ios-blue" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">FX Monitor</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">CIMB SG • Business</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
         <button 
           onClick={toggleTheme}
           className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-slate-300"
           aria-label="Toggle Dark Mode"
         >
           {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
         </button>
         <button 
           onClick={onOpenHelp}
           className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-slate-300"
           aria-label="Help"
         >
           <HelpCircle className="w-5 h-5" />
         </button>
      </div>
    </header>
  );
};

export default Header;
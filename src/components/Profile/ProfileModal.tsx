import React, { useState } from 'react';
import { useTutor } from '../../context/TutorContext';
import { UserProfile, SupportedLanguage } from '../../types';
import { X, User, GraduationCap, Code2, Award, Sparkles, Check, Moon, Sun, Save, Download } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../data/languages';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, setUserProfile, islm, exportOfflinePack } = useTutor();

  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [degree, setDegree] = useState(userProfile.degree || 'B.Tech in Computer Science & Engineering');
  const [targetMajor, setTargetMajor] = useState(userProfile.targetMajor || 'Systems & Artificial Intelligence');
  const [preferredLanguages, setPreferredLanguages] = useState<SupportedLanguage[]>(userProfile.preferredLanguages);
  const [theme, setTheme] = useState<'dark' | 'light'>(userProfile.theme);

  if (!isOpen) return null;

  const toggleLanguage = (langId: SupportedLanguage) => {
    setPreferredLanguages(prev =>
      prev.includes(langId) ? prev.filter(l => l !== langId) : [...prev, langId]
    );
  };

  const handleSave = () => {
    setUserProfile(prev => ({
      ...prev,
      name,
      email,
      degree,
      targetMajor,
      preferredLanguages,
      theme,
    }));
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0c1421] border border-[#1a273b] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-[#1a273b]">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-lg">
            {name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Student Learning Profile</h2>
            <p className="text-xs text-slate-400">Configure your Individual Student Learning Model (ISLM)</p>
          </div>
        </div>

        {/* Content Form */}
        <div className="space-y-4 py-4 text-xs">
          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#070d18] border border-[#1a273b] rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Academic Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#070d18] border border-[#1a273b] rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Degree & Major */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Degree / College</label>
              <input
                type="text"
                value={degree}
                onChange={e => setDegree(e.target.value)}
                className="w-full bg-[#070d18] border border-[#1a273b] rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Specialization</label>
              <input
                type="text"
                value={targetMajor}
                onChange={e => setTargetMajor(e.target.value)}
                className="w-full bg-[#070d18] border border-[#1a273b] rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Preferred Programming Languages */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Preferred Programming Languages (Select in Sandbox)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SUPPORTED_LANGUAGES.map(lang => {
                const isSelected = preferredLanguages.includes(lang.id);
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => toggleLanguage(lang.id)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-medium transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-blue-600/30 border-blue-500 text-blue-200'
                        : 'bg-[#070d18] border-[#1a273b] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-blue-400" />}
                    <span>{lang.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="p-3 bg-[#070d18] rounded-xl border border-[#1a273b] grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Daily Streak</div>
              <div className="text-base font-bold text-amber-400 mt-0.5">{userProfile.streakDays} Days 🔥</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Mock Tests</div>
              <div className="text-base font-bold text-blue-400 mt-0.5">{userProfile.testsCompleted} Finished</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase">DKM Mastery</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">
                {(islm.overall_mastery * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center justify-between p-2.5 bg-[#070d18] rounded-xl border border-[#1a273b]">
            <span className="text-slate-300 font-medium">Visual Interface Theme</span>
            <div className="flex items-center gap-1 bg-[#0c1421] p-1 rounded-lg border border-[#1a273b]">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all ${
                  theme === 'dark' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="w-3 h-3" />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all ${
                  theme === 'light' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>Light</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#1a273b] flex items-center justify-between">
          <button
            type="button"
            onClick={exportOfflinePack}
            className="px-3 py-1.5 bg-[#070d18] hover:bg-[#111b2b] text-slate-300 rounded-xl text-xs font-medium border border-[#1a273b] flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Profile & Pack</span>
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  FileCode,
  Save,
  FolderOpen,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  FileQuestion,
} from 'lucide-react';
import { LabExercise } from './types';
import { DOCROOT_PATH, DESKTOP_PATH } from './virtualFileSystem';

interface WebDevEditorProps {
  currentExercise: LabExercise;
  onSaveFile: (directory: string, filename: string, content: string) => void;
  onSelectExercise: (ex: LabExercise) => void;
  exercises: LabExercise[];
}

export const WebDevEditor: React.FC<WebDevEditorProps> = ({
  currentExercise,
  onSaveFile,
  onSelectExercise,
  exercises,
}) => {
  const [targetDir, setTargetDir] = useState<string>(DOCROOT_PATH);
  const [filename, setFilename] = useState<string>(currentExercise.recommendedFile);
  const [code, setCode] = useState<string>(currentExercise.starterCode);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  const handleExerciseChange = (ex: LabExercise) => {
    onSelectExercise(ex);
    setFilename(ex.recommendedFile);
    setCode(ex.starterCode);
    setSavedSuccessMsg(null);
  };

  const handleSave = () => {
    onSaveFile(targetDir, filename, code);
    setSavedSuccessMsg(`File "${filename}" saved to ${targetDir}`);
    setTimeout(() => setSavedSuccessMsg(null), 3000);
  };

  return (
    <div className="bg-[#0a101a] border border-[#1a273b] rounded-2xl flex flex-col h-full overflow-hidden shadow-xl">
      {/* Exercise Picker Ribbon */}
      <div className="bg-[#0d1624] px-4 py-2 border-b border-[#1a273b] flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Web Dev Practical Lab Exercises:
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {exercises.map((ex, idx) => (
            <button
              key={ex.id}
              onClick={() => handleExerciseChange(ex)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                currentExercise.id === ex.id
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              Ex {idx + 1}: {ex.title}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Controls: File path, Target Directory & Save */}
      <div className="bg-[#070c14] px-4 py-2.5 border-b border-[#162438] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-slate-400 font-semibold flex items-center gap-1">
            <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Save Location:</span>
          </label>
          <select
            value={targetDir}
            onChange={e => setTargetDir(e.target.value)}
            className="bg-[#0d1726] border border-[#1e2f47] text-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-blue-500"
          >
            <option value={DOCROOT_PATH}>C:\xampp\htdocs (Apache DocumentRoot)</option>
            <option value={DESKTOP_PATH}>C:\Users\Student\Desktop (Desktop Folder)</option>
            <option value="C:\Users\Student\Documents">C:\Users\Student\Documents</option>
            <option value="C:\xampp\apache\conf">C:\xampp\apache\conf</option>
          </select>

          <span className="text-slate-500 font-mono">\</span>

          <input
            type="text"
            value={filename}
            onChange={e => setFilename(e.target.value)}
            className="bg-[#0d1726] border border-[#1e2f47] text-slate-200 rounded-lg px-2 py-1 text-xs font-mono w-32 focus:outline-none focus:border-blue-500"
            placeholder="filename.html"
          />
        </div>

        <div className="flex items-center gap-2">
          {savedSuccessMsg && (
            <span className="text-emerald-400 text-[11px] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {savedSuccessMsg}
            </span>
          )}

          <button
            onClick={handleSave}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save to Virtual Disk</span>
          </button>
        </div>
      </div>

      {/* Code Textarea */}
      <div className="flex-1 p-3 bg-[#060b13] flex flex-col font-mono text-xs">
        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          spellCheck={false}
          className="w-full flex-1 bg-transparent text-slate-200 resize-none focus:outline-none leading-relaxed font-mono"
        />
      </div>

      {/* Bottom Exercise Goal Guidance */}
      <div className="bg-[#09101c] px-4 py-2 border-t border-[#162438] text-[11px] text-slate-400 flex items-center justify-between">
        <div>
          <span className="text-blue-300 font-semibold">{currentExercise.title}:</span>{' '}
          {currentExercise.instruction}
        </div>
        <div className="text-slate-500 text-[10px] font-mono">
          Virtual Apache DocumentRoot: <strong className="text-slate-300">C:\xampp\htdocs</strong>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { Terminal, CornerDownLeft, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error';
  text: string;
}

interface VirtualTerminalProps {
  cwd: string;
  isMySQLMode: boolean;
  onExecute: (cmd: string) => void;
  outputLines: TerminalLine[];
  onClear: () => void;
}

export const VirtualTerminal: React.FC<VirtualTerminalProps> = ({
  cwd,
  isMySQLMode,
  onExecute,
  outputLines,
  onClear,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [outputLines]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) return;

    setHistory(prev => [...prev, cmd]);
    setHistoryIdx(-1);
    setInputVal('');
    onExecute(cmd);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setInputVal(history[nextIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      const nextIdx = historyIdx + 1;
      if (nextIdx >= history.length) {
        setHistoryIdx(-1);
        setInputVal('');
      } else {
        setHistoryIdx(nextIdx);
        setInputVal(history[nextIdx] || '');
      }
    }
  };

  const promptStr = isMySQLMode ? 'mysql> ' : `${cwd}> `;

  const quickCommands = isMySQLMode
    ? ['show databases;', 'show tables;', 'select * from students;', 'select * from courses;', 'exit']
    : ['dir', 'cd C:\\xampp\\htdocs', 'cd C:\\Users\\Student\\Desktop', 'php db.php', 'mysql -u root', 'help'];

  return (
    <div className="bg-[#050910] border border-[#1a273b] rounded-2xl flex flex-col h-[340px] overflow-hidden font-mono shadow-xl">
      {/* Terminal Title Bar */}
      <div className="bg-[#090f19] px-4 py-2 border-b border-[#1a273b] flex items-center justify-between text-xs text-slate-400 select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-200">
            {isMySQLMode ? 'MariaDB / MySQL Client Shell' : 'Windows Command Prompt (cmd.exe)'}
          </span>
          <span className="text-[10px] text-slate-500 font-normal hidden sm:inline">
            [{isMySQLMode ? 'Database Daemon' : 'Virtual Apache Shell'}]
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClear}
            className="p-1 hover:text-rose-400 text-slate-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
            title="Clear terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Stream */}
      <div
        className="flex-1 p-3 overflow-y-auto text-xs space-y-1 select-text scrollbar-thin"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="text-slate-500 text-[11px] pb-1 border-b border-slate-900">
          Microsoft Windows [Version 10.0.19045.3803] • CogniCSE Virtual Shell. Type &apos;help&apos; for list.
        </div>

        {outputLines.map(line => (
          <div
            key={line.id}
            className={`whitespace-pre-wrap leading-relaxed ${
              line.type === 'input'
                ? 'text-cyan-300 font-semibold'
                : line.type === 'error'
                ? 'text-rose-400 bg-rose-950/20 p-1.5 rounded border border-rose-900/40 my-1'
                : 'text-slate-300'
            }`}
          >
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick Command Bar */}
      <div className="bg-[#080d16] border-t border-[#141f30] px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="text-slate-500 text-[10px] uppercase font-bold shrink-0">Quick:</span>
        {quickCommands.map(cmd => (
          <button
            key={cmd}
            type="button"
            onClick={() => {
              setInputVal(cmd);
              inputRef.current?.focus();
            }}
            className="px-2 py-0.5 bg-[#0f1726] hover:bg-[#1a263d] text-slate-300 border border-[#1e2f47] rounded text-[11px] font-mono shrink-0 transition-colors cursor-pointer"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Terminal Input Form */}
      <form onSubmit={handleSubmit} className="bg-[#090f19] border-t border-[#1a273b] px-3 py-2 flex items-center gap-2">
        <span className="text-emerald-400 font-bold shrink-0 text-xs select-none">
          {promptStr}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter command (e.g. dir, cd C:\xampp\htdocs, php db.php)..."
          className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-600 focus:outline-none text-xs font-mono"
          autoFocus
        />
        <button
          type="submit"
          className="p-1 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
        >
          <CornerDownLeft className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

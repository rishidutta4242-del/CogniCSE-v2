import React, { useState } from 'react';
import {
  Globe,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { VirtualDirectory, VirtualFile } from './types';
import { findNodeByPath, DOCROOT_PATH } from './virtualFileSystem';
import { executePHPScript, INITIAL_MYSQL_DB } from './virtualEngine';

interface VirtualBrowserProps {
  fsRoot: VirtualDirectory;
  onBrowserRequest: (url: string, status: number, isFound: boolean) => void;
}

export const VirtualBrowser: React.FC<VirtualBrowserProps> = ({ fsRoot, onBrowserRequest }) => {
  const [url, setUrl] = useState('http://localhost/index.html');
  const [currentRender, setCurrentRender] = useState<{
    status: number;
    title: string;
    body: string;
    isPHP?: boolean;
    errorNote?: string;
  }>({
    status: 404,
    title: '404 Not Found',
    body: 'The requested URL was not found on this server. Apache DocumentRoot: C:\\xampp\\htdocs',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'headers'>('preview');

  const handleNavigate = (targetUrl?: string) => {
    const rawUrl = targetUrl || url;
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const parsed = rawUrl.replace(/^https?:\/\//i, '').replace(/^localhost:?80?\/?/i, '');
      const cleanPath = parsed ? parsed.split('?')[0] : 'index.html';

      // Map to DocumentRoot: C:\xampp\htdocs\<cleanPath>
      const targetFilePath = `${DOCROOT_PATH}\\${cleanPath.replace(/\//g, '\\')}`;
      const fileNode = findNodeByPath(fsRoot, targetFilePath);

      if (!fileNode || fileNode.isDirectory) {
        // Check if user saved it on Desktop by accident
        const desktopFile = findNodeByPath(fsRoot, `C:\\Users\\Student\\Desktop\\${cleanPath}`);
        const hintDesktop = desktopFile
          ? `Notice: A file named "${cleanPath}" exists at C:\\Users\\Student\\Desktop, but Apache's DocumentRoot is C:\\xampp\\htdocs!`
          : undefined;

        setCurrentRender({
          status: 404,
          title: '404 Not Found',
          body: `<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">\n<html><head>\n<title>404 Not Found</title>\n</head><body>\n<h1>Not Found</h1>\n<p>The requested URL /${cleanPath} was not found on this server.</p>\n<hr>\n<address>Apache/2.4.54 (Win64) Server at localhost Port 80</address>\n</body></html>`,
          errorNote: hintDesktop,
        });
        onBrowserRequest(rawUrl, 404, false);
      } else {
        const file = fileNode as VirtualFile;
        if (cleanPath.endsWith('.php')) {
          const phpExec = executePHPScript(file.content, file.path, INITIAL_MYSQL_DB, 1);
          setCurrentRender({
            status: 200,
            title: 'PHP Output - localhost',
            body: `<div style="font-family:sans-serif;padding:12px;"><h3>PHP 8.2 Execution Result</h3><pre style="background:#f1f5f9;padding:10px;border-radius:6px;border:1px solid #cbd5e1;color:#0f172a;">${escapeHtml(
              phpExec.output
            )}</pre></div>`,
            isPHP: true,
          });
        } else {
          setCurrentRender({
            status: 200,
            title: file.name,
            body: file.content,
          });
        }
        onBrowserRequest(rawUrl, 200, true);
      }
    }, 250);
  };

  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  return (
    <div className="bg-[#080e18] border border-[#1a273b] rounded-2xl flex flex-col h-[340px] overflow-hidden shadow-xl">
      {/* Browser Chrome Bar */}
      <div className="bg-[#0c1421] px-4 py-2 border-b border-[#1a273b] flex items-center gap-2 select-none">
        <div className="flex items-center gap-1.5 shrink-0 text-slate-500">
          <button className="p-1 hover:text-slate-200 rounded transition-colors cursor-pointer">
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 hover:text-slate-200 rounded transition-colors cursor-pointer">
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleNavigate()}
            className="p-1 hover:text-slate-200 rounded transition-colors cursor-pointer"
            title="Reload page"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>

        {/* URL Bar */}
        <div className="flex-1 flex items-center bg-[#050910] border border-[#1e2f47] rounded-lg px-2.5 py-1 text-xs font-mono text-slate-200">
          <Globe className="w-3.5 h-3.5 text-blue-400 mr-2 shrink-0" />
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleNavigate()}
            className="w-full bg-transparent focus:outline-none text-slate-100 text-xs"
            placeholder="http://localhost/index.html"
          />
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-bold ml-1 shrink-0 ${
              currentRender.status === 200
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-rose-950 text-rose-300 border border-rose-800'
            }`}
          >
            {currentRender.status}
          </span>
        </div>

        <button
          onClick={() => handleNavigate()}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer"
        >
          Go
        </button>
      </div>

      {/* Render Canvas & View Switcher */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10 text-slate-700 text-xs font-semibold">
            <RefreshCw className="w-4 h-4 animate-spin mr-2 text-blue-600" />
            Requesting HTTP resource from Apache daemon...
          </div>
        )}

        {/* Alert notification if saved to Desktop */}
        {currentRender.errorNote && (
          <div className="bg-amber-100 border-b border-amber-300 px-3 py-2 text-amber-900 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{currentRender.errorNote}</span>
          </div>
        )}

        {/* Render Viewport */}
        <div className="flex-1 p-4 overflow-y-auto text-slate-900">
          {currentRender.body.includes('<') ? (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: currentRender.body }}
            />
          ) : (
            <pre className="text-xs font-mono bg-slate-100 p-3 rounded border border-slate-300 whitespace-pre-wrap">
              {currentRender.body}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

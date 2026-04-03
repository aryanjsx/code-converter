import React, { useState, useMemo, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import AppLayout from './components/layout/AppLayout';
import type { AppView } from './components/layout/Sidebar';
import LeaderboardView from './components/leaderboard/LeaderboardView';
import ConversionWorkspace from './components/converter/ConversionWorkspace';
import ScorePanel from './components/benchmark/ScorePanel';
import LanguageSelector from './components/LanguageSelector';
import FileTree from './components/FileTree';
import CodeDisplay from './components/CodeDisplay';
import ComparisonPanel from './components/ComparisonPanel';
import Loader from './components/Loader';
import ToastContainer from './components/ToastContainer';
import { useToast } from './context/ToastContext';
import { SUPPORTED_LANGUAGES, PROVIDER_PRESETS } from './constants';
import { executeModels } from './core/modelExecutionManager';
import { runBenchmark } from './core/benchmark/benchmarkEngine';
import { addBenchmarkRun } from './core/benchmark/benchmarkDataset';
import { useProvider } from './context/ProviderContext';
import ProviderPicker from './components/ProviderPicker';
import { sanitizePath } from './utils/pathSanitizer';
import type { FileNode, ConvertedFile, ModelResult } from './types';
import type { BenchmarkResult } from './core/benchmark/types';

const getOriginalFilePath = (file: File): string => {
  return file.webkitRelativePath || file.name;
};

const MAX_FILE_COUNT = 500;
const MAX_TOTAL_SIZE = 50 * 1024 * 1024;

const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.webp', '.svg',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.zip', '.gz', '.tar', '.rar', '.7z',
  '.exe', '.dll', '.so', '.dylib', '.bin',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.mp3', '.mp4', '.wav', '.avi', '.mov',
  '.pyc', '.class', '.o', '.obj', '.wasm',
]);

function looksLikeBinary(fileName: string): boolean {
  const dotIdx = fileName.lastIndexOf('.');
  if (dotIdx === -1) return false;
  return BINARY_EXTENSIONS.has(fileName.slice(dotIdx).toLowerCase());
}

const buildFileTree = (files: (File | ConvertedFile)[]): FileNode => {
  const root: FileNode = { name: 'root', path: '', children: [], isFolder: true };

  files.forEach(file => {
    const path = 'path' in file ? file.path : getOriginalFilePath(file as File);
    const parts = path.split('/');
    let currentNode = root;

    parts.forEach((part, index) => {
      let childNode = currentNode.children.find(child => child.name === part);

      if (!childNode) {
        const isFolder = index < parts.length - 1;
        const newPath = parts.slice(0, index + 1).join('/');
        childNode = { name: part, path: newPath, children: [], isFolder };
        if (!isFolder) {
          childNode.content = 'content' in file ? file.content : undefined;
        }
        currentNode.children.push(childNode);
      }
      currentNode = childNode;
    });
  });

  return root;
};


const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>('converter');
  const [benchmarkVersion, setBenchmarkVersion] = useState(0);

  const [sourceLangId, setSourceLangId] = useState<string>('python');
  const [targetLangId, setTargetLangId] = useState<string>('rust');
  const [originalFiles, setOriginalFiles] = useState<File[]>([]);
  const [modelResults, setModelResults] = useState<ModelResult[]>([]);
  const [selectedOriginalPath, setSelectedOriginalPath] = useState<string | null>(null);
  const [selectedConvertedPath, setSelectedConvertedPath] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const [originalCodeContent, setOriginalCodeContent] = useState<string | null>(null);
  const [isLoadingOriginalCode, setIsLoadingOriginalCode] = useState<boolean>(false);
  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkResult[]>([]);

  const { addToast } = useToast();
  const { providerConfig, isConfigValid } = useProvider();

  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(
    () => { try { return sessionStorage.getItem('codex-convert-privacy-ack') === 'true'; } catch { return false; } }
  );

  const isMultiModel = providerConfig.models.length > 1;
  const hasAnyResults = modelResults.some(r => r.status === 'success' && r.files);

  const convertedFiles = useMemo<ConvertedFile[] | null>(() => {
    if (isMultiModel) return null;
    const result = modelResults.find(r => r.status === 'success');
    return result?.files ?? null;
  }, [modelResults, isMultiModel]);

  const convertedFileTree = useMemo<FileNode | null>(() => {
    if (!convertedFiles) return null;
    return buildFileTree(convertedFiles);
  }, [convertedFiles]);

  const resetConversionState = useCallback(() => {
    setModelResults([]);
    setBenchmarkResults([]);
    setSelectedOriginalPath(null);
    setSelectedConvertedPath(null);
    setOriginalCodeContent(null);
    setStatus('idle');
    setError(null);
  }, []);

  const handleFilesChange = (newFiles: File[]) => {
    if (newFiles.length > MAX_FILE_COUNT) {
      addToast(`Upload limit exceeded: ${newFiles.length} files (max ${MAX_FILE_COUNT}).`, 'error');
      return;
    }
    const totalSize = newFiles.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      addToast(`Upload limit exceeded: ${(totalSize / 1024 / 1024).toFixed(1)}MB (max 50MB).`, 'error');
      return;
    }

    if (originalFiles.length > 0 && newFiles.length > 0) {
      const handleConfirmReplace = () => {
        setOriginalFiles(newFiles);
        resetConversionState();
        addToast('Project replaced successfully.', 'success');
      };

      addToast(
        "Uploading a new project will clear the current one.",
        'warning',
        {
          duration: 10000,
          actions: [
            { label: 'Replace', onClick: handleConfirmReplace },
            { label: 'Cancel', onClick: () => { } }
          ]
        }
      );
    } else if (newFiles.length > 0) {
      const binaryCount = newFiles.filter(f => looksLikeBinary(f.name)).length;
      setOriginalFiles(newFiles);
      resetConversionState();
      if (binaryCount > 0) {
        addToast(
          `${newFiles.length} files uploaded (${binaryCount} binary file${binaryCount !== 1 ? 's' : ''} detected — these will be sent as text and may waste tokens).`,
          'warning',
        );
      } else {
        addToast(`${newFiles.length} files uploaded. Ready to convert.`, 'info');
      }
    }
  };

  const handleFolderUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFilesChange(Array.from(event.target.files));
    }
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleFilesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFilesChange(Array.from(event.target.files));
    }
    if (event.target) {
      event.target.value = '';
    }
  };


  const runConversion = async () => {
    setStatus('processing');
    setError(null);

    const sourceLanguage = SUPPORTED_LANGUAGES.find(l => l.id === sourceLangId)!;
    const targetLanguage = SUPPORTED_LANGUAGES.find(l => l.id === targetLangId)!;
    const preset = PROVIDER_PRESETS.find(p => p.id === providerConfig.provider);
    const models = providerConfig.models.filter(m => m.trim());

    setModelResults(models.map(model => ({
      model,
      status: 'pending' as const,
      files: null,
      error: null,
    })));

    const results = await executeModels(
      models,
      {
        providerId: providerConfig.provider,
        providerName: preset?.name ?? providerConfig.provider,
        baseUrl: providerConfig.baseURL,
        apiKey: providerConfig.apiKey,
        files: originalFiles,
        sourceLanguage,
        targetLanguage,
      },
      (model, update) => {
        setModelResults(prev =>
          prev.map(r => r.model === model ? update : r)
        );
      },
    );

    const anySuccess = results.some(r => r.status === 'success');
    if (anySuccess) {
      setStatus('success');
      try {
        const benchResults = await runBenchmark(results, originalFiles, sourceLanguage, targetLanguage);
        setBenchmarkResults(benchResults);
        if (benchResults.length > 0) {
          addBenchmarkRun({
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            sourceLanguage: sourceLanguage.id,
            targetLanguage: targetLanguage.id,
            results: benchResults,
          });
          setBenchmarkVersion(v => v + 1);
        }
      } catch (err) {
        console.error('Benchmark failed:', err instanceof Error ? err.message : 'Unknown error');
      }
    } else {
      setStatus('error');
      setError('All model conversions failed. Check individual model panels for details.');
    }
  };

  const handleConvert = () => {
    if (status === 'processing') return;
    if (!isConfigValid) {
      setError("Please configure your AI provider — API key, model(s), and base URL are required.");
      return;
    }
    if (originalFiles.length === 0) {
      addToast("Please upload a project folder or files first.", 'error');
      return;
    }
    if (!privacyAcknowledged) {
      setShowPrivacyNotice(true);
      return;
    }
    runConversion();
  };

  const handlePrivacyAccepted = () => {
    setPrivacyAcknowledged(true);
    try { sessionStorage.setItem('codex-convert-privacy-ack', 'true'); } catch { /* noop */ }
    setShowPrivacyNotice(false);
    runConversion();
  };

  const handleDownload = async () => {
    const successResults = modelResults.filter(r => r.status === 'success' && r.files);
    if (successResults.length === 0) return;

    const zip = new JSZip();

    if (successResults.length === 1) {
      successResults[0].files!.forEach(file => {
        zip.file(sanitizePath(file.path), file.content);
      });
    } else {
      successResults.forEach(result => {
        const folder = zip.folder(result.model)!;
        result.files!.forEach(file => {
          folder.file(sanitizePath(file.path), file.content);
        });
      });
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "converted-project.zip");
  };

  const findConvertedPartner = useCallback((originalPath: string): string | null => {
    if (!originalPath || !convertedFiles) return null;
    const sourceLang = SUPPORTED_LANGUAGES.find(l => l.id === sourceLangId)!;
    const targetLang = SUPPORTED_LANGUAGES.find(l => l.id === targetLangId)!;

    let potentialPath = originalPath;
    if (originalPath.endsWith(sourceLang.extension)) {
      potentialPath = originalPath.slice(0, -sourceLang.extension.length) + targetLang.extension;
    }
    let partner = convertedFiles.find(f => f.path === potentialPath);
    if (partner) return partner.path;

    partner = convertedFiles.find(f => f.path === originalPath);
    if (partner) return partner.path;

    const getBaseNameWithoutExt = (p: string) => {
      const name = p.substring(p.lastIndexOf('/') + 1);
      const dotIndex = name.lastIndexOf('.');
      return dotIndex > -1 ? name.substring(0, dotIndex) : name;
    };
    const originalBase = getBaseNameWithoutExt(originalPath);
    partner = convertedFiles.find(f => getBaseNameWithoutExt(f.path) === originalBase && f.path.endsWith(targetLang.extension));
    if (partner) return partner.path;

    return null;
  }, [convertedFiles, sourceLangId, targetLangId]);

  const findOriginalPartner = useCallback((convertedPath: string): string | null => {
    if (!convertedPath || !originalFiles) return null;
    const sourceLang = SUPPORTED_LANGUAGES.find(l => l.id === sourceLangId)!;
    const targetLang = SUPPORTED_LANGUAGES.find(l => l.id === targetLangId)!;

    let potentialPath = convertedPath;
    if (convertedPath.endsWith(targetLang.extension)) {
      potentialPath = convertedPath.slice(0, -targetLang.extension.length) + sourceLang.extension;
    }
    let partner = originalFiles.find(f => getOriginalFilePath(f) === potentialPath);
    if (partner) return getOriginalFilePath(partner);

    partner = originalFiles.find(f => getOriginalFilePath(f) === convertedPath);
    if (partner) return getOriginalFilePath(partner);

    const getBaseNameWithoutExt = (p: string) => {
      const name = p.substring(p.lastIndexOf('/') + 1);
      const dotIndex = name.lastIndexOf('.');
      return dotIndex > -1 ? name.substring(0, dotIndex) : name;
    };
    const convertedBase = getBaseNameWithoutExt(convertedPath);
    partner = originalFiles.find(f => getBaseNameWithoutExt(getOriginalFilePath(f)) === convertedBase && getOriginalFilePath(f).endsWith(sourceLang.extension));
    if (partner) return getOriginalFilePath(partner);

    return null;
  }, [originalFiles, sourceLangId, targetLangId]);

  const handleSelectOriginalFile = (path: string) => {
    setSelectedOriginalPath(path);
    if (!isMultiModel) {
      setSelectedConvertedPath(findConvertedPartner(path));
    }
  }

  const handleSelectConvertedFile = (path: string) => {
    setSelectedConvertedPath(path);
    setSelectedOriginalPath(findOriginalPartner(path));
  }

  useEffect(() => {
    if (!selectedOriginalPath) {
      setOriginalCodeContent(null);
      return;
    }

    const originalFile = originalFiles.find(f => getOriginalFilePath(f) === selectedOriginalPath);
    if (!originalFile) {
      setOriginalCodeContent(null);
      return;
    }

    setIsLoadingOriginalCode(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalCodeContent(e.target?.result as string);
      setIsLoadingOriginalCode(false);
    };
    reader.onerror = () => {
      setOriginalCodeContent('Error: Could not read file content.');
      setIsLoadingOriginalCode(false);
    };
    reader.readAsText(originalFile);
  }, [selectedOriginalPath, originalFiles]);

  const convertedCode = useMemo(() => {
    if (!selectedConvertedPath || !convertedFiles) return null;
    const convertedFile = convertedFiles.find(f => f.path === selectedConvertedPath);
    return convertedFile ? convertedFile.content : null;
  }, [selectedConvertedPath, convertedFiles]);

  const originalFileTree = useMemo(() => {
    if (originalFiles.length === 0) return null;
    return buildFileTree(originalFiles);
  }, [originalFiles]);

  const isConvertButtonDisabled = !isConfigValid || originalFiles.length === 0 || status === 'processing';

  const getConvertButtonTooltip = () => {
    if (!isConfigValid) {
      return 'Configure your AI provider — API key, model(s), and base URL are required.';
    }
    if (originalFiles.length === 0) {
      return 'Please upload a project folder or files before converting.';
    }
    if (status === 'processing') {
      return 'Conversion in progress...';
    }
    return 'Convert the uploaded code';
  };

  const getMissingConfigMessage = (): string | null => {
    const missing: string[] = [];
    if (!providerConfig.apiKey.trim()) missing.push('API key');
    if (!providerConfig.baseURL.trim()) missing.push('base URL');
    if (providerConfig.models.filter(m => m.trim()).length === 0) missing.push('model');
    if (missing.length === 0) return null;
    return `Enter ${missing.join(', ')} in the AI Provider section to enable conversion.`;
  };

  const UploadArea = () => (
    <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-700/50 rounded-2xl p-10 text-center bg-gray-900/30 backdrop-blur-sm hover:bg-gray-900/50 transition-all duration-300 group">
      <div className="p-4 bg-indigo-500/10 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m16 16-4-4-4 4"></path></svg>
      </div>
      <h2 className="text-2xl font-bold mb-3 text-white tracking-tight">Upload Your Codebase</h2>
      <p className="text-gray-400 mb-8 max-w-md leading-relaxed">Select a project folder or individual files to start the magical conversion process.</p>
      <div className="flex flex-wrap justify-center gap-4">
        <label
          htmlFor="folder-upload"
          className="cursor-pointer px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 focus:ring-indigo-500"
        >
          Select Project Folder
        </label>
        <label
          htmlFor="files-upload"
          className="cursor-pointer px-8 py-3.5 bg-gray-800/80 text-gray-200 font-semibold rounded-xl hover:bg-gray-700 hover:text-white border border-gray-700 hover:border-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 focus:ring-gray-500"
        >
          Select Files
        </label>
      </div>
    </div>
  );

  return (
    <>
      <ToastContainer />
      <input
        id="folder-upload"
        type="file"
        // @ts-ignore
        webkitdirectory="true"
        directory="true"
        multiple
        onChange={handleFolderUpload}
        className="hidden"
        aria-hidden="true"
      />
      <input
        id="files-upload"
        type="file"
        multiple
        onChange={handleFilesUpload}
        className="hidden"
        aria-hidden="true"
      />

      {status === 'processing' && !isMultiModel && <Loader message="Converting codebase..." />}

      {showPrivacyNotice && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="glass max-w-lg mx-4 p-6 rounded-2xl shadow-2xl border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Privacy Notice</h3>
            </div>
            <div className="space-y-3 text-sm text-gray-300 leading-relaxed mb-6">
              <p>
                Your code will be sent directly to{' '}
                <strong className="text-white">{PROVIDER_PRESETS.find(p => p.id === providerConfig.provider)?.name ?? providerConfig.provider}</strong>{' '}
                at <code className="text-xs bg-gray-800 px-1.5 py-0.5 rounded">{providerConfig.baseURL}</code>.
              </p>
              {isMultiModel && (
                <p>
                  You are converting with <strong className="text-white">{providerConfig.models.length} models</strong>:{' '}
                  <span className="text-indigo-300">{providerConfig.models.join(', ')}</span>.
                  Each model will receive a copy of your code.
                </p>
              )}
              <p>This application does <strong className="text-white">not</strong> store your code or API keys on any server. All processing happens directly between your browser and the AI provider.</p>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowPrivacyNotice(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg">
                Cancel
              </button>
              <button onClick={handlePrivacyAccepted} className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
                I Understand, Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <AppLayout
        activeView={activeView}
        onNavigate={setActiveView}
        topBarTitle={activeView === 'leaderboard' ? 'Benchmark Leaderboard' : 'Code Converter'}
        topBarSubtitle={
          activeView === 'converter' && originalFiles.length > 0
            ? `${originalFiles.length} file${originalFiles.length !== 1 ? 's' : ''} loaded`
            : undefined
        }
        topBarActions={activeView === 'converter' ? (
          <>
            {originalFiles.length > 0 && (
              <>
                <label htmlFor="folder-upload" title="Upload a different project folder" className="cursor-pointer p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors hidden sm:block">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                </label>
                <label htmlFor="files-upload" title="Upload different files" className="cursor-pointer p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors hidden sm:block">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
                </label>
              </>
            )}
            {status === 'success' && hasAnyResults && (
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-500 transition-all flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                ZIP
              </button>
            )}
            <button
              onClick={handleConvert}
              disabled={isConvertButtonDisabled}
              title={getConvertButtonTooltip()}
              className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'processing' ? 'Converting...' : isMultiModel ? `Compare ${providerConfig.models.length} Models` : 'Convert'}
            </button>
          </>
        ) : undefined}
      >
        {activeView === 'leaderboard' ? (
          <div className="h-full overflow-auto p-6">
            <LeaderboardView refreshKey={benchmarkVersion} />
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="shrink-0 p-4 space-y-3">
              <ProviderPicker />

              {getMissingConfigMessage() && (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-200 px-4 py-2.5 rounded-xl flex items-center gap-3 text-sm animate-fade-in">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                  <span>{getMissingConfigMessage()}</span>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-2.5 rounded-xl flex items-center gap-3 text-sm animate-fade-in">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div className="flex-1 min-h-0">
              {originalFiles.length > 0 ? (
                <ConversionWorkspace
                  leftPanel={
                    <>
                      <div className="p-4 border-b border-white/5 space-y-3 shrink-0">
                        <LanguageSelector id="source-lang" value={sourceLangId} onChange={setSourceLangId} title="Source Language" />
                        <div className="flex justify-center">
                          <div className="p-1 bg-gray-800/50 rounded-full text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>
                          </div>
                        </div>
                        <LanguageSelector id="target-lang" value={targetLangId} onChange={setTargetLangId} title="Target Language" />
                      </div>
                      <div className="flex-1 min-h-0 overflow-hidden">
                        <FileTree
                          fileTree={originalFileTree}
                          selectedFile={selectedOriginalPath}
                          onSelectFile={handleSelectOriginalFile}
                          title="Original Project"
                        />
                      </div>
                      {!isMultiModel && convertedFileTree && (
                        <div className="flex-1 min-h-0 overflow-hidden border-t border-white/5">
                          <FileTree
                            fileTree={convertedFileTree}
                            selectedFile={selectedConvertedPath}
                            onSelectFile={handleSelectConvertedFile}
                            title="Converted Project"
                          />
                        </div>
                      )}
                    </>
                  }
                  centerPanel={
                    <div className="h-full rounded-xl overflow-hidden glass-panel shadow-2xl m-4 ml-0 lg:ml-0 lg:m-0">
                      {isMultiModel ? (
                        <ComparisonPanel
                          modelResults={modelResults}
                          selectedOriginalPath={selectedOriginalPath}
                          sourceLangId={sourceLangId}
                          targetLangId={targetLangId}
                          benchmarkResults={benchmarkResults}
                        />
                      ) : (
                        <CodeDisplay
                          originalCode={isLoadingOriginalCode ? 'Loading...' : originalCodeContent}
                          convertedCode={convertedCode}
                          sourceLanguage={SUPPORTED_LANGUAGES.find(l => l.id === sourceLangId)?.name ?? ''}
                          targetLanguage={SUPPORTED_LANGUAGES.find(l => l.id === targetLangId)?.name ?? ''}
                        />
                      )}
                    </div>
                  }
                  rightPanel={
                    benchmarkResults.length > 0 ? <ScorePanel results={benchmarkResults} /> : undefined
                  }
                />
              ) : (
                <div className="h-full p-4">
                  <UploadArea />
                </div>
              )}
            </div>
          </div>
        )}
      </AppLayout>
    </>
  );
};

export default App;

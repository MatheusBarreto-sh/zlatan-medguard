'use client';

import { useState, useRef } from 'react';

export default function MedGuardInterface() {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle', 'selected', 'analyzing', 'success', 'fraud'
  const [file, setFile] = useState<File | null>(null);
  const [alertasPython, setAlertasPython] = useState<string[]>([]);
  
  // Ref para o input de arquivo oculto
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados do Dashboard (Simulação de banco de dados para a feira)
  const [metrics, setMetrics] = useState({ total: 142, fraudes: 12, economia: 1800 });
  const [history, setHistory] = useState([
    { id: 'AUD-992', data: '14/07/2026', arquivo: 'atestado_joao_silva.pdf', status: 'Aprovado' },
    { id: 'AUD-991', data: '13/07/2026', arquivo: 'atestado_maria_c.jpg', status: 'Fraude' },
    { id: 'AUD-990', data: '10/07/2026', arquivo: 'doc_medico_carlos.png', status: 'Aprovado' },
  ]);

  // Funções de Arrastar e Soltar
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      capturarArquivo(e.dataTransfer.files[0]);
    }
  };

  // Função do clique tradicional
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      capturarArquivo(e.target.files[0]);
    }
  };

  const capturarArquivo = (arquivoSelecionado: File) => {
    setFile(arquivoSelecionado);
    setStatus('selected');
    setAlertasPython([]); // Limpa mensagens de auditorias passadas
  };

  // Função central de comunicação com a IA em Python
  const iniciarAnalise = async () => {
    if (!file) return;
    setStatus('analyzing');
    
    // Prepara a imagem para envio HTTP
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Faz o POST para o motor Tesseract na porta 8000
      const response = await fetch('http://127.0.0.1:8000/api/analise', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      // Salva as mensagens (laudo) que o Python retornou
      if (data.alertas) setAlertasPython(data.alertas);

      // Atualiza a tela e o Dashboard de acordo com o laudo do Python
      if (data.status === 'fraud') {
        setStatus('fraud');
        setMetrics(prev => ({
          ...prev,
          total: prev.total + 1,
          fraudes: prev.fraudes + 1,
          economia: prev.economia + 150 // Aumenta o dinheiro economizado
        }));
      } else {
        setStatus('success');
        setMetrics(prev => ({
          ...prev,
          total: prev.total + 1,
        }));
      }

      // Adiciona o novo atestado ao Histórico ao vivo
      setHistory(prev => [
        { 
          id: `AUD-${Math.floor(Math.random() * 900) + 100}`, 
          data: new Date().toLocaleDateString('pt-BR'), 
          arquivo: file.name, 
          status: data.status === 'fraud' ? 'Fraude' : 'Aprovado' 
        },
        ...prev
      ]);

    } catch (error) {
      console.error("Erro de conexão com o Python:", error);
      alert("Erro ao conectar com o motor de IA. O terminal do backend está rodando?");
      setStatus('selected');
    }
  };

  const resetar = () => {
    setFile(null);
    setStatus('idle');
    setAlertasPython([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-mono">
      
      {/* Cabeçalho */}
      <div className="mb-12 text-center pt-8">
        <h1 className="text-4xl font-bold text-white tracking-widest uppercase">
          Zlatan<span className="text-red-600">.</span>MedGuard
        </h1>
        <p className="text-slate-400 mt-2 text-sm">Módulo de Auditoria Forense de Documentos Médicos</p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: O Scanner */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-2xl">
            <h2 className="text-lg text-slate-300 mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></span>
              Scanner de Documentos
            </h2>

            {/* Input oculto para clique */}
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".pdf,image/*" />

            <div 
              className={`w-full h-80 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden cursor-pointer select-none outline-none
                ${isDragging ? 'border-blue-500 bg-blue-900/20' : 'border-slate-700 border-dashed hover:border-slate-500 bg-slate-950/50'}
                ${status === 'fraud' ? 'border-red-600 bg-red-950/20 shadow-[0_0_30px_rgba(220,38,38,0.2)]' : ''}
                ${status === 'success' ? 'border-emerald-500 bg-emerald-950/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : ''}
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => status === 'idle' && fileInputRef.current?.click()}
            >
              
              {/* ESTADO 1: OCIOSO */}
              {status === 'idle' && (
                <div className="text-center">
                  <svg className="w-12 h-12 text-slate-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  <p className="text-lg text-slate-300">Arraste o atestado ou clique aqui</p>
                  <p className="text-sm text-slate-500 mt-1">Formatos suportados: PDF, JPG, PNG</p>
                </div>
              )}

              {/* ESTADO 2: ARQUIVO SELECIONADO */}
              {status === 'selected' && (
                <div className="text-center">
                  <svg className="w-16 h-16 text-blue-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <p className="text-lg text-white font-bold">{file?.name}</p>
                  <p className="text-sm text-slate-400 mt-1">{file ? (file.size / 1024).toFixed(2) : 0} KB</p>
                  <button onClick={(e) => { e.stopPropagation(); iniciarAnalise(); }} className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded transition-colors cursor-pointer z-10 relative">
                    Iniciar Perícia Forense
                  </button>
                </div>
              )}

              {/* ESTADO 3: PROCESSANDO NO PYTHON */}
              {status === 'analyzing' && (
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-blue-400 animate-pulse">Processando imagem no servidor OCR...</p>
                  <p className="text-xs text-slate-500 mt-2">Extraindo dados e validando metadados</p>
                </div>
              )}

              {/* ESTADO 4: FRAUDE DETECTADA (LAUDO REAL DO PYTHON) */}
              {status === 'fraud' && (
                <div className="text-center w-full p-8 flex flex-col items-center justify-center relative z-10">
                  <div className="text-red-500 text-6xl mb-2">⚠</div>
                  <h2 className="text-2xl font-bold text-red-500 mb-4 tracking-widest">FRAUDE DETECTADA</h2>
                  <div className="text-left w-full max-w-md bg-slate-900 p-4 rounded border border-red-900/50 mb-6 cursor-default">
                    {alertasPython.length > 0 ? (
                      alertasPython.map((alerta, index) => (
                        <p key={index} className="text-slate-300 text-sm mb-2">
                          <span className="text-red-500 font-bold">[!]</span> {alerta.replace('[!]', '').trim()}
                        </p>
                      ))
                    ) : (
                      <p className="text-slate-300 text-sm mb-2">
                        <span className="text-red-500 font-bold">[!]</span> Anomalia não especificada detectada.
                      </p>
                    )}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); resetar(); }} className="px-4 py-2 border border-slate-600 text-slate-400 hover:text-white hover:border-white rounded transition-colors text-sm cursor-pointer">
                    Escanear Novo Documento
                  </button>
                </div>
              )}

              {/* ESTADO 5: APROVADO (LAUDO REAL DO PYTHON) */}
              {status === 'success' && (
                <div className="text-center w-full p-8 flex flex-col items-center justify-center relative z-10">
                  <div className="text-emerald-500 text-6xl mb-2">✓</div>
                  <h2 className="text-2xl font-bold text-emerald-500 mb-4 tracking-widest">DOCUMENTO VÁLIDO</h2>
                  <div className="text-left w-full max-w-md bg-slate-900 p-4 rounded border border-emerald-900/50 mb-6 cursor-default">
                    {alertasPython.length > 0 ? (
                      alertasPython.map((alerta, index) => (
                        <p key={index} className="text-slate-300 text-sm mb-2">
                          <span className="text-emerald-500 font-bold">[✓]</span> {alerta.replace('[✓]', '').trim()}
                        </p>
                      ))
                    ) : (
                      <p className="text-slate-300 text-sm mb-2">
                        <span className="text-emerald-500 font-bold">[✓]</span> Estrutura e dados validados com sucesso.
                      </p>
                    )}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); resetar(); }} className="px-4 py-2 border border-slate-600 text-slate-400 hover:text-white hover:border-white rounded transition-colors text-sm cursor-pointer">
                    Escanear Novo Documento
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: O Dashboard */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Card de Economia */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
            <h3 className="text-slate-400 text-sm font-bold tracking-wider mb-2 uppercase">Prejuízo Evitado (Mês)</h3>
            <p className="text-4xl font-black text-emerald-400">R$ {metrics.economia},00</p>
            <p className="text-xs text-slate-500 mt-2">+ R$ 150,00 por fraude barrada</p>
          </div>

          {/* Cards Menores */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 shadow-xl">
              <h3 className="text-slate-500 text-xs font-bold tracking-wider mb-1 uppercase">Atestados</h3>
              <p className="text-2xl font-bold text-white">{metrics.total}</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 shadow-xl">
              <h3 className="text-slate-500 text-xs font-bold tracking-wider mb-1 uppercase">Fraudes</h3>
              <p className="text-2xl font-bold text-red-500">{metrics.fraudes}</p>
            </div>
          </div>

          {/* Tabela de Histórico */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-slate-300 text-sm font-bold tracking-wider mb-4 uppercase border-b border-slate-800 pb-2">Últimas Auditorias</h3>
            <div className="space-y-3">
              {history.slice(0, 4).map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div className="overflow-hidden">
                    <p className="text-slate-300 font-medium truncate w-32" title={item.arquivo}>{item.arquivo}</p>
                    <p className="text-slate-600 text-xs">{item.id} • {item.data}</p>
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'Fraude' ? 'bg-red-950 text-red-500' : 'bg-emerald-950 text-emerald-500'}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
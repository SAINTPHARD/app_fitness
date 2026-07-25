import { useState, useEffect, useRef } from 'react';
import { buscarAlimentos } from '../utils/tabelaAlimentos'; 
import { buscarAlimentosExternos } from '../../../../services/openFoodFactsApi';

export default function BuscaAlimento({ valor, aoDigitar, aoSelecionar }) {
  const [sugestoesVisiveis, setSugestoesVisiveis] = useState(false);
  const [sugestoes, setSugestoes] = useState([]);
  const [aCarregar, setACarregar] = useState(false);

  const timerBuscaRef = useRef(null);

  useEffect(() => {
    if (!valor || valor.trim().length < 2) {
      setSugestoes([]);
      return;
    }

    // ==========================================
    // 1. BUSCA LOCAL IMEDIATA (Velocidade da luz)
    // ==========================================
    const resultadosLocais = buscarAlimentos(valor).map(item => ({
      ...item,
      isLocal: true,
      idUnico: `local-${item.id}` 
    }));
    
    // Coloca logo a estrela na tela sem esperar pelo debounce ou pela internet!
    setSugestoes(resultadosLocais);

    // ==========================================
    // 2. BUSCA DA INTERNET (Espera o utilizador parar de digitar)
    // ==========================================
    if (timerBuscaRef.current) clearTimeout(timerBuscaRef.current);

    timerBuscaRef.current = setTimeout(async () => {
      setACarregar(true);
      try {
        const resultadosExternos = await buscarAlimentosExternos(valor);
        const resultadosExternosFormatados = resultadosExternos.map(item => ({
          ...item,
          isLocal: false
        }));

        // Quando a internet responder, nós JUNTAMOS os dados novos com os locais que já estão na tela!
        setSugestoes(prevLocais => [...prevLocais, ...resultadosExternosFormatados]);
        
      } catch (error) {
        console.error("Erro na busca externa:", error);
      } finally {
        setACarregar(false);
      }
    }, 600); // 600ms de debounce para não sobrecarregar a API

    return () => clearTimeout(timerBuscaRef.current);
  }, [valor]);

  return (
    <div className="relative col-span-2">
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Nome (ex: Arroz ou Feijão Camil)"
          value={valor}
          onChange={(e) => {
            aoDigitar(e.target.value);
            setSugestoesVisiveis(true);
          }}
          onFocus={() => setSugestoesVisiveis(true)}
          onBlur={() => setTimeout(() => setSugestoesVisiveis(false), 200)}
          required
          autoComplete="off"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-shadow focus:border-lime-400 focus:ring-4 focus:ring-lime-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 pr-10"
        />
        
        {aCarregar && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="flex h-4 w-4 animate-spin rounded-full border-2 border-lime-500 border-t-transparent"></span>
          </div>
        )}
      </div>

      {sugestoesVisiveis && sugestoes.length > 0 && (
        <ul className="absolute z-10 m-0 mt-1 flex max-h-48 w-full list-none flex-col gap-0.5 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          {sugestoes.map((alimento) => {
            const infoCalorias = alimento.isLocal 
              ? `≈${alimento.pesoReferenciaG}g/un` 
              : `≈${Math.round((alimento.protPorGrama * 400) + (alimento.carboPorGrama * 400) + (alimento.gordPorGrama * 900))} kcal/100g`;

            return (
              <li key={alimento.idUnico}>
                <button
                  type="button"
                  onClick={() => {
                    aoSelecionar(alimento);
                    setSugestoesVisiveis(false);
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm text-slate-700 hover:bg-lime-50 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  <span className="line-clamp-1 flex items-center gap-1.5">
                    {alimento.isLocal && <span title="Alimento Verificado" className="text-amber-400">⭐</span>}
                    {alimento.nome}
                  </span>
                  
                  <span className="shrink-0 text-xs text-slate-400 dark:text-zinc-500">
                    {infoCalorias}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
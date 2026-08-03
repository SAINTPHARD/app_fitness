import axios from 'axios';

const offApi = axios.create({
  baseURL: 'https://br.openfoodfacts.org/cgi',
  // CORREÇÃO ("Network Error"/spinner preso): sem timeout, uma falha de rede
  // silenciosa (DNS, CORS, servidor da Open Food Facts fora do ar) deixa a
  // requisição pendurada indefinidamente — o `aCarregar` do BuscaAlimento
  // nunca volta a `false`. 8s é generoso o bastante pra uma busca de texto
  // simples sem deixar o usuário esperando.
  timeout: 8000,
});

/**
 * Erro tipado para a UI conseguir distinguir "sem resultados" (lista vazia,
 * comportamento normal) de "a busca externa está indisponível" (timeout,
 * DNS, CORS, 5xx) — as duas causavam a mesma tela silenciosa antes desta
 * correção, então o usuário não tinha como saber que devia cadastrar o
 * alimento manualmente em vez de continuar tentando digitar.
 */
export class BuscaExternaIndisponivelError extends Error {
  constructor(causa) {
    super('Busca externa indisponível, cadastre manualmente.');
    this.name = 'BuscaExternaIndisponivelError';
    this.causa = causa;
  }
}

export const buscarAlimentosExternos = async (termoDeBusca) => {
  if (!termoDeBusca || termoDeBusca.trim().length < 2) return [];

  try {
    const resposta = await offApi.get('/search.pl', {
      params: {
        search_terms: termoDeBusca,
        search_simple: 1,
        action: 'process',
        json: 1,
        page_size: 24,
        fields: 'product_name,nutriments,brands',
        lc: 'pt',
        cc: 'br'
      }
    });

    const produtos = resposta.data.products || [];

    return produtos
      .filter(p => 
        p.product_name && 
        p.product_name.trim() !== '' && 
        p.nutriments && 
        p.nutriments['energy-kcal_100g'] > 0
      )
      .map(p => {
        const prot = (p.nutriments.proteins_100g || 0) / 100;
        const carbo = (p.nutriments.carbohydrates_100g || 0) / 100;
        const gord = (p.nutriments.fat_100g || 0) / 100;
        const nomeMarca = p.brands ? ` (${p.brands.split(',')[0].trim()})` : '';

        return {
          idUnico: Math.random().toString(36).substr(2, 9),
          nome: `${p.product_name}${nomeMarca}`,
          unidade: 'g',
          protPorGrama: prot,
          carboPorGrama: carbo,
          gordPorGrama: gord
        };
      });
      
  } catch (erro) {
    console.error('Erro ao contactar a Open Food Facts:', erro);
    // CORREÇÃO: antes devolvia `[]` aqui — indistinguível de "a busca não
    // encontrou nada". `BuscaAlimento` não tinha como saber a diferença e
    // ficava mudo. Agora relançamos como erro tipado para a UI mostrar a
    // mensagem certa, sem derrubar a busca local (que já é síncrona/local e
    // continua funcionando normalmente).
    throw new BuscaExternaIndisponivelError(erro);
  }
};
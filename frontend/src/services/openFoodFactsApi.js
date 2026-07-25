import axios from 'axios';

const offApi = axios.create({
  baseURL: 'https://br.openfoodfacts.org/cgi', 
});

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
    console.error("Erro ao contactar a Open Food Facts:", erro);
    return []; 
  }
};
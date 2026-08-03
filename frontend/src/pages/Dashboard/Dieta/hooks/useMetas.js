import { useState, useEffect } from 'react';
import api from '../../../../services/api'; // Ajuste o caminho se necessário para o seu api.js

export function useMetas() {
  const [metas, setMetas] = useState({
    calorias: 2000,
    proteinas: 150,
    carboidratos: 250,
    gorduras: 65,
  });
  const [loading, setLoading] = useState(true);

  // Busca as metas reais do utilizador autenticado na API
  const carregarMetas = async () => {
    try {
      const response = await api.get('/usuarios/me'); // Ou a rota que traz o perfil logado
      const usuario = response.data;

      // Se o backend já calcula as metas com base no TMB/Objetivo, use-as:
      setMetas({
        calorias: usuario.metaCalorias || usuario.calorias || 2000,
        proteinas: usuario.metaProteinas || usuario.proteinas || 150,
        carboidratos: usuario.metaCarboidratos || usuario.carboidratos || 250,
        gorduras: usuario.metaGorduras || usuario.gorduras || 65,
      });
    } catch (error) {
      console.error("Erro ao carregar metas do usuário", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarMetas();
  }, []);

  const atualizarMetas = async (novasMetas) => {
    try {
      // Envia as novas metas para o backend persistir
      await api.put('/usuarios/me/metas', novasMetas); // Ajuste para a sua rota real se houver
      setMetas(novasMetas);
    } catch (error) {
      console.error("Erro ao atualizar metas", error);
    }
  };

  return { metas, atualizarMetas, loading, recarregarMetas: carregarMetas };
}
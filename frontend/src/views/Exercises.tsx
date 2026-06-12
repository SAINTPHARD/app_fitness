import React, { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import type { Exercicio, Treino } from '../types/fitness';

const Exercises: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTreinoId = searchParams.get('treinoId') ? Number(searchParams.get('treinoId')) : '';

  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [novoExercicio, setNovoExercicio] = useState<Exercicio>({
    nome: '',
    series: 3,
    repeticoes: 12,
    duracao: 15,
    descricao: '',
    treinoId: initialTreinoId !== '' ? initialTreinoId : undefined
  });

  const [saving, setSaving] = useState<boolean>(false);
  const [selectedTreinoId, setSelectedTreinoId] = useState<number | ''>(initialTreinoId);

  useEffect(() => {
    fetchTreinos();
  }, []);

  useEffect(() => {
    if (selectedTreinoId !== '') {
      fetchExercicios(selectedTreinoId);
    } else {
      setExercicios([]);
      setLoading(false);
    }
  }, [selectedTreinoId]);

  const fetchTreinos = async () => {
    try {
      const response = await api.get<Treino[]>('/treinos');
      setTreinos(response.data);
      if (initialTreinoId === '' && response.data.length > 0 && response.data[0].id) {
        setSelectedTreinoId(response.data[0].id);
        setNovoExercicio(prev => ({ ...prev, treinoId: response.data[0].id }));
      }
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar os treinos.');
      setLoading(false);
    }
  };

  const fetchExercicios = async (treinoId: number) => {
    setLoading(true);
    try {
      // Assuming your backend has an endpoint to get exercises by workout id
      // like /treinos/{treinoId}/exercicios or /exercicios?treinoId={treinoId}
      // Depending on the Spring Boot implementation. Usually you have something like this:
      const response = await api.get<Exercicio[]>(`/exercicios?treinoId=${treinoId}`);
      setExercicios(response.data);
    } catch (err: any) {
      console.error(err);
      // Since it's an MVP, the endpoint might just be `/exercicios` or might not filter properly,
      // fallback to fetching all and filtering in frontend if needed:
      try {
          const fallbackResponse = await api.get<Exercicio[]>('/exercicios');
          const filtered = fallbackResponse.data.filter(e => e.treinoId === treinoId);
          setExercicios(filtered);
      } catch (fallbackErr) {
          setError('Erro ao carregar a lista de exercícios.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTreinoChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const tId = Number(e.target.value);
    setSelectedTreinoId(tId);
    setNovoExercicio(prev => ({ ...prev, treinoId: tId }));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNovoExercicio(prev => ({
      ...prev,
      [name]: name === 'series' || name === 'repeticoes' || name === 'duracao' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!novoExercicio.treinoId) {
      alert('Selecione um treino primeiro.');
      return;
    }

    setSaving(true);
    try {
      const response = await api.post<Exercicio>('/exercicios', novoExercicio);
      setExercicios([...exercicios, response.data]);
      setNovoExercicio({
        nome: '',
        series: 3,
        repeticoes: 12,
        duracao: 15,
        descricao: '',
        treinoId: selectedTreinoId !== '' ? selectedTreinoId : undefined
      });
    } catch (err: any) {
      console.error(err);
      alert('Erro ao criar exercício. Verifique se o backend suporta essa rota.');
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return <div className="container mt-5"><div className="alert alert-danger">{error}</div></div>;
  }

  return (
    <div className="container">
      <h2 className="mb-4">Exercícios</h2>

      <div className="mb-4">
        <label className="form-label fw-bold">Filtrar por Treino:</label>
        <select className="form-select w-auto" value={selectedTreinoId} onChange={handleTreinoChange}>
          <option value="">Selecione um treino</option>
          {treinos.map(t => (
            <option key={t.id} value={t.id}>{t.nomeTreino} - {t.tipoTreino}</option>
          ))}
        </select>
      </div>

      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Adicionar Exercício</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Nome (ex: Supino Reto)</label>
                  <input type="text" className="form-control" name="nome" value={novoExercicio.nome} onChange={handleChange} required />
                </div>
                <div className="row mb-3">
                  <div className="col-6">
                    <label className="form-label">Séries</label>
                    <input type="number" className="form-control" name="series" value={novoExercicio.series} onChange={handleChange} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Repetições</label>
                    <input type="number" className="form-control" name="repeticoes" value={novoExercicio.repeticoes} onChange={handleChange} required />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Duração Estimada (min)</label>
                  <input type="number" className="form-control" name="duracao" value={novoExercicio.duracao} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Descrição / Observações</label>
                  <textarea className="form-control" name="descricao" value={novoExercicio.descricao} onChange={handleChange} rows={2}></textarea>
                </div>
                <button type="submit" className="btn btn-success w-100" disabled={saving || selectedTreinoId === ''}>
                  {saving ? 'Adicionando...' : 'Adicionar Exercício'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          {loading ? (
            <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>
          ) : (
            <div className="row">
              {exercicios.length === 0 ? (
                <div className="col-12 text-center text-muted mt-5">
                  {selectedTreinoId === '' ? 'Selecione um treino para ver os exercícios.' : 'Nenhum exercício cadastrado para este treino.'}
                </div>
              ) : (
                exercicios.map(ex => (
                  <div className="col-md-6 mb-4" key={ex.id}>
                    <div className="card shadow-sm h-100 border-start border-primary border-4">
                      <div className="card-body">
                        <h5 className="card-title text-primary">{ex.nome}</h5>
                        <p className="card-text text-muted small">{ex.descricao}</p>
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <span className="badge bg-secondary">{ex.series} séries</span>
                          <span className="badge bg-secondary">{ex.repeticoes} reps</span>
                          <span className="badge bg-info text-dark">{ex.duracao} min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Exercises;

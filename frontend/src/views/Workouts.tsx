import React, { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { Treino } from '../types/fitness';

const Workouts: React.FC = () => {
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [novoTreino, setNovoTreino] = useState<Treino>({
    nomeTreino: '',
    tipoTreino: '',
    duracao: 60,
    intensidade: 'MEDIA',
    frequencia: 3,
    usuarioId: 1 // Defaulting to user 1 for the MVP
  });
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    fetchTreinos();
  }, []);

  const fetchTreinos = async () => {
    try {
      const response = await api.get<Treino[]>('/treinos');
      setTreinos(response.data);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar a lista de treinos.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNovoTreino(prev => ({
      ...prev,
      [name]: name === 'duracao' || name === 'frequencia' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await api.post<Treino>('/treinos', novoTreino);
      setTreinos([...treinos, response.data]);
      setNovoTreino({
        nomeTreino: '',
        tipoTreino: '',
        duracao: 60,
        intensidade: 'MEDIA',
        frequencia: 3,
        usuarioId: 1
      });
    } catch (err: any) {
      console.error(err);
      alert('Erro ao criar treino.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container mt-5 text-center"><div className="spinner-border text-primary" role="status"></div></div>;
  }

  if (error) {
    return <div className="container mt-5"><div className="alert alert-danger">{error}</div></div>;
  }

  return (
    <div className="container">
      <h2 className="mb-4">Ficha de Treinos</h2>

      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Novo Treino</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Nome do Treino</label>
                  <input type="text" className="form-control" name="nomeTreino" value={novoTreino.nomeTreino} onChange={handleChange} required placeholder="Ex: Treino A" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Tipo de Treino</label>
                  <input type="text" className="form-control" name="tipoTreino" value={novoTreino.tipoTreino} onChange={handleChange} required placeholder="Ex: Musculação" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Duração (min)</label>
                  <input type="number" className="form-control" name="duracao" value={novoTreino.duracao} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Intensidade</label>
                  <select className="form-select" name="intensidade" value={novoTreino.intensidade} onChange={handleChange}>
                    <option value="BAIXA">Baixa</option>
                    <option value="MEDIA">Média</option>
                    <option value="ALTA">Alta</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Frequência (dias/semana)</label>
                  <input type="number" className="form-control" name="frequencia" value={novoTreino.frequencia} onChange={handleChange} required />
                </div>
                <button type="submit" className="btn btn-success w-100" disabled={saving}>
                  {saving ? 'Criando...' : 'Criar Treino'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="row">
            {treinos.length === 0 ? (
              <div className="col-12 text-center text-muted mt-5">Nenhum treino cadastrado ainda.</div>
            ) : (
              treinos.map(treino => (
                <div className="col-md-6 mb-4" key={treino.id}>
                  <div className="card shadow-sm h-100">
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{treino.nomeTreino}</h5>
                      <h6 className="card-subtitle mb-2 text-muted">{treino.tipoTreino}</h6>
                      <ul className="list-unstyled flex-grow-1">
                        <li><strong>Duração:</strong> {treino.duracao} min</li>
                        <li><strong>Intensidade:</strong> {treino.intensidade}</li>
                        <li><strong>Frequência:</strong> {treino.frequencia}x por semana</li>
                      </ul>
                      <Link to={`/exercises?treinoId=${treino.id}`} className="btn btn-outline-primary mt-auto">
                        Ver Exercícios
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workouts;

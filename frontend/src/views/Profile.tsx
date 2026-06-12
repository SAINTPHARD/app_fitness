import React, { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import api from '../services/api';
import type { Usuario } from '../types/fitness';

const Profile: React.FC = () => {
  const [usuario, setUsuario] = useState<Usuario>({
    nome: '',
    email: '',
    senha: '',
    idade: 0,
    peso: 0,
    altura: 0,
    sexo: 'M',
    objetivo: 'HIPERTROFIA'
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // In a real app we might fetch the logged-in user. Let's assume user ID 1 for now or empty for creation
  const userId = 1;

  useEffect(() => {
    fetchUsuario();
  }, []);

  const fetchUsuario = async () => {
    setLoading(true);
    setError(null);
    try {
      // Trying to fetch the default user, if it fails we just keep the form empty
      const response = await api.get<Usuario>(`/usuarios/${userId}`);
      if (response.data) {
        setUsuario(response.data);
      }
    } catch (err: any) {
      // If 404 or other error, assume user needs to be created, so do not break
      console.log('User not found or error fetching user, starting with empty form', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUsuario(prev => ({
      ...prev,
      [name]: name === 'idade' || name === 'peso' || name === 'altura' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (usuario.id) {
        await api.put(`/usuarios/${usuario.id}`, usuario);
      } else {
        const response = await api.post<Usuario>('/usuarios', usuario);
        setUsuario(response.data); // Update form with new user including ID
      }
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao salvar os dados do atleta. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const calcularIMC = () => {
    if (usuario.peso > 0 && usuario.altura > 0) {
      return (usuario.peso / (usuario.altura * usuario.altura)).toFixed(2);
    }
    return '0.00';
  };

  return (
    <div className="container">
      <h2 className="mb-4">Perfil do Atleta</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">Dados salvos com sucesso!</div>}

      <div className="row">
        <div className="col-md-8">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title">Dados Pessoais</h5>
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Nome</label>
                    <input type="text" className="form-control" name="nome" value={usuario.nome} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">E-mail</label>
                    <input type="email" className="form-control" name="email" value={usuario.email} onChange={handleChange} required />
                  </div>
                </div>

                {!usuario.id && (
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Senha</label>
                      <input type="password" className="form-control" name="senha" value={usuario.senha} onChange={handleChange} required />
                    </div>
                  </div>
                )}

                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label">Idade</label>
                    <input type="number" className="form-control" name="idade" value={usuario.idade} onChange={handleChange} required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Peso (kg)</label>
                    <input type="number" step="0.1" className="form-control" name="peso" value={usuario.peso} onChange={handleChange} required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Altura (m)</label>
                    <input type="number" step="0.01" className="form-control" name="altura" value={usuario.altura} onChange={handleChange} required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Sexo</label>
                    <select className="form-select" name="sexo" value={usuario.sexo} onChange={handleChange}>
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                    </select>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Objetivo</label>
                    <select className="form-select" name="objetivo" value={usuario.objetivo} onChange={handleChange}>
                      <option value="EMAGRECER">Emagrecer</option>
                      <option value="MANTER">Manter Peso</option>
                      <option value="HIPERTROFIA">Hipertrofia</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Perfil'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm text-center">
            <div className="card-body">
              <h5 className="card-title">Diagnóstico Biológico</h5>
              <div className="display-4 mb-3">{calcularIMC()}</div>
              <p className="text-muted">Seu IMC (Índice de Massa Corporal)</p>

              <hr />

              <ul className="list-unstyled text-start">
                <li className="mb-2"><strong>Objetivo Atual:</strong> {usuario.objetivo}</li>
                <li className="mb-2"><strong>Peso:</strong> {usuario.peso} kg</li>
                <li className="mb-2"><strong>Altura:</strong> {usuario.altura} m</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

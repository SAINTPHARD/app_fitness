import { useState, useEffect } from 'react';
import { fitnessApi } from '../../../services/fitnessApi';
import './perfil.css';

export default function PerfilPage() {
  const [profile, setProfile] = useState({ nome: '', peso: '', altura: '', objetivo: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let canceled = false;

    async function loadProfile() {
      try {
        const response = await fitnessApi.getProfile();
        if (!canceled) {
          setProfile(response.data || {});
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!canceled) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      canceled = true;
    };
  }, []);

  return (
    <section className="perfilPage">
      <div className="profileCard">
        <h2>Seu Perfil</h2>
        <p>{loading ? 'Carregando seus dados...' : profile.nome || 'Atleta'}</p>
      </div>

      <div className="statsGrid">
        <article>
          <span>Peso</span>
          <strong>{profile.peso || '---'} kg</strong>
        </article>
        <article>
          <span>Altura</span>
          <strong>{profile.altura || '---'} cm</strong>
        </article>
        <article>
          <span>Objetivo</span>
          <strong>{profile.objetivo || '---'}</strong>
        </article>
      </div>
    </section>
  );
}

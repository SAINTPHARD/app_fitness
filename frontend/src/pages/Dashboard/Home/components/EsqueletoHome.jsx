import estilos from './EsqueletoHome.module.css';

/**
 * Esqueleto de carregamento da Home, exibido enquanto `usePerfilResumo`
 * ainda não terminou de buscar o perfil no backend — evita que a página
 * "pisque" com cartões vazios/zerados antes dos dados reais chegarem.
 */
export default function EsqueletoHome() {
  return (
    <section className={estilos.pagina} aria-busy="true" aria-label="Carregando painel inicial">
      <div className={`${estilos.bloco} ${estilos.hero}`} />

      <div className={estilos.gradeMetricas}>
        {Array.from({ length: 7 }).map((_, indice) => (
          <div key={indice} className={estilos.bloco} />
        ))}
      </div>

      <div className={estilos.gradeGraficos}>
        <div className={estilos.bloco} />
        <div className={estilos.bloco} />
      </div>
    </section>
  );
}

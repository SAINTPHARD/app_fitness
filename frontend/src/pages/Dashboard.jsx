/* eslint-disable react/prop-types */
import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const iconPaths = {
  home: 'M3 10.5 12 3l9 7.5M5 10v10h14V10M9 20v-6h6v6',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z',
  chart: 'M3 3v18h18M7 15l4-4 3 3 5-7',
  utensils: 'M4 3v7M8 3v7M6 3v18M19 3v18M15 3c2.2 2.8 2.2 6.2 0 9h4',
  apple: 'M12 6c1.8-2.4 4-2 5-1M12 6c-1.8-2.4-4-2-5-1M12 6c0-2 1-3 3-4M6 9c-1 4 1 10 4 11 1 .4 2-.5 2-.5s1 1 2 .5c3-1 5-7 4-11-1-4-5-4-6-2-1-2-5-2-6 2Z',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 15l2 1-2 4-2-1a7 7 0 0 1-2 1v2h-6v-2a7 7 0 0 1-2-1l-2 1-2-4 2-1a7 7 0 0 1 0-2L3 12l2-4 2 1a7 7 0 0 1 2-1V6h6v2a7 7 0 0 1 2 1l2-1 2 4-2 1a7 7 0 0 1 0 2Z',
  logout: 'M10 17l5-5-5-5M15 12H3M21 3v18h-8',
  pulse: 'M22 12h-4l-3 8L9 4l-3 8H2',
  user: 'M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  check: 'M5 12l4 4L19 6',
  plus: 'M12 5v14M5 12h14',
  search: 'M21 21l-4.3-4.3M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  close: 'M18 6 6 18M6 6l12 12',
  bookmark: 'M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z',
  copy: 'M8 8h12v12H8ZM4 16H2V2h14v2',
  upload: 'M21 15v4H3v-4M17 8l-5-5-5 5M12 3v12',
  trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5',
  edit: 'M12 20h9M16.5 3.5a2 2 0 0 1 3 3L7 19l-4 1 1-4Z',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 12h.01',
};

function Icon({ name, size = 18 }) {
  return (
    <svg aria-hidden="true" fill="none" height={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width={size}>
      <path d={iconPaths[name]} />
    </svg>
  );
}

const navItems = [
  { label: 'Home', icon: 'home' },
  { label: 'Calendario & Dias', icon: 'calendar' },
  { label: 'Metas & Graficos', icon: 'chart' },
  { label: 'Gerenciar Refeicoes', icon: 'utensils' },
  { label: 'Alimentos & Macros', icon: 'apple' },
  { label: 'Configuracoes', icon: 'settings' },
];

const weekDays = [
  { key: 'seg', label: 'Seg', full: 'Segunda-feira', done: true },
  { key: 'ter', label: 'Ter', full: 'Terca-feira', done: true },
  { key: 'qua', label: 'Qua', full: 'Quarta-feira', done: true },
  { key: 'qui', label: 'Qui', full: 'Quinta-feira', done: false },
  { key: 'sex', label: 'Sex', full: 'Sexta-feira', done: false },
  { key: 'sab', label: 'Sab', full: 'Sabado', done: true },
  { key: 'dom', label: 'Dom', full: 'Domingo', done: false },
];

const initialMeals = [
  {
    id: 1,
    title: 'Cafe da Manha',
    summary: '300g · 686 kcal',
    macros: 'Carb: 104g | Prot: 56g | Gord: 6g | Fib: 13g',
    foods: ['Ovos Mexidos (3 unidades) - 20g Prot, 15g Fat', 'Pao Integral (2 fatias) - 30g Carb'],
  },
  {
    id: 2,
    title: 'Lanche da Manha',
    summary: '380g · 526 kcal',
    macros: 'Carb: 81g | Prot: 42g | Gord: 6g | Fib: 12g',
    foods: ['Iogurte Grego (170g) - 18g Prot', 'Banana com Aveia (210g) - 52g Carb'],
  },
];

const macros = [
  { label: 'Proteinas', current: 150, target: 200, percent: 75, color: '#14b8a6' },
  { label: 'Carboidratos', current: 250, target: 300, percent: 83, color: '#3b82f6' },
  { label: 'Gorduras', current: 60, target: 75, percent: 80, color: '#f59e0b' },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeNav, setActiveNav] = useState('Home');
  const [selectedDay, setSelectedDay] = useState('qua');
  const [timeFilter, setTimeFilter] = useState('Diario');
  const [mealSearch, setMealSearch] = useState('');
  const [meals, setMeals] = useState(initialMeals);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [toast, setToast] = useState('');

  const selectedDayInfo = weekDays.find((day) => day.key === selectedDay) || weekDays[2];
  const filteredMeals = useMemo(
    () => meals.filter((meal) => meal.title.toLowerCase().includes(mealSearch.trim().toLowerCase())),
    [mealSearch, meals],
  );

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 2200);
  };

  const removeFood = (mealId, foodText) => {
    setMeals((currentMeals) =>
      currentMeals.map((meal) =>
        meal.id === mealId ? { ...meal, foods: meal.foods.filter((food) => food !== foodText) } : meal,
      ),
    );
  };

  const clearMeals = () => {
    setMeals((currentMeals) => currentMeals.map((meal) => ({ ...meal, foods: [] })));
    setIsActionsOpen(false);
    showToast('Refeicoes do dia limpas.');
  };

  return (
    <main className="dashboard-page">
      <style>{styles}</style>

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><Icon name="pulse" size={22} /></div>
          <div>
            <strong>🏋️‍♂️ System Fitness</strong>
            <span>Saude e evolucao</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="Menu principal">
          {navItems.map((item) => (
            <button
              className={`nav-item ${activeNav === item.label ? 'active' : ''}`}
              key={item.label}
              onClick={() => setActiveNav(item.label)}
              type="button"
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button className="logout-button" onClick={logout} type="button">
          <Icon name="logout" />
          <span>Sair / Log out</span>
        </button>
      </aside>

      <section className="main-panel">
        <header className="top-header">
          <div>
            <span className="eyebrow">Dashboard principal</span>
            <h1>{activeNav}</h1>
          </div>

          <div className="profile-card">
            <div className="avatar"><Icon name="user" /></div>
            <div>
              <strong>{user?.email || 'robedson@pucrio1.com'}</strong>
              <span>Plano Premium / Nivel Atleta</span>
            </div>
          </div>
        </header>

        <div className="dashboard-grid">
          <section className="card calendar-card">
            <SectionTitle eyebrow="Calendario e acompanhamento" title="Dias da Semana" extra={selectedDayInfo.full} />

            <div className="week-row">
              {weekDays.map((day) => (
                <button
                  className={`day-card ${selectedDay === day.key ? 'selected' : ''}`}
                  key={day.key}
                  onClick={() => setSelectedDay(day.key)}
                  type="button"
                >
                  <strong>{day.label}</strong>
                  <span className={`badge ${day.done ? 'success' : 'warning'}`}>
                    {day.done ? 'Refeicoes 100% em dia' : 'Refeicoes Pendentes'}
                  </span>
                </button>
              ))}
            </div>

            <div className="checklist">
              {['Cafe da Manha', 'Almoco', 'Jantar'].map((meal) => (
                <div className="check-row" key={meal}>
                  <span className="check-icon"><Icon name="check" size={15} /></span>
                  <div>
                    <strong>{meal}</strong>
                    <span>Concluido</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card metabolism-card">
            <SectionTitle eyebrow="Metabolismo" title="Consumo Geral" />

            <div className="filter-row">
              {['Diario', 'Semanal', 'Mensal'].map((filter) => (
                <button
                  className={timeFilter === filter ? 'active' : ''}
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  type="button"
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="area-chart" aria-hidden="true">
              {[48, 66, 54, 78, 72, 86, 62].map((height, index) => (
                <span key={`${height}-${index}`} style={{ height: `${height}%` }} />
              ))}
            </div>

            <div className="metric-line">
              <div>
                <strong>1.800 kcal consumidas</strong>
                <span>Objetivo diario de 2.500 kcal</span>
              </div>
              <b>72%</b>
            </div>
            <Progress percent={72} color="#0f766e" />
          </section>

          <section className="card macros-card">
            <SectionTitle eyebrow="Hipertrofia" title="Macronutrientes" />

            <div className="macro-list">
              {macros.map((macro) => (
                <div className="macro-item" key={macro.label}>
                  <div className="macro-head">
                    <strong>{macro.label}</strong>
                    <span>{macro.current}g / {macro.target}g ({macro.percent}%)</span>
                  </div>
                  <Progress percent={macro.percent} color={macro.color} />
                </div>
              ))}
            </div>

            <div className="action-row">
              <button onClick={() => setIsGoalModalOpen(true)} type="button">
                <Icon name="edit" size={16} /> Editar Calorias/Macros
              </button>
              <button onClick={() => setIsGoalModalOpen(true)} type="button">
                <Icon name="target" size={16} /> Definir Novas Metas
              </button>
            </div>
          </section>

          <section className="card meals-card">
            <div className="meals-header">
              <div>
                <span className="eyebrow">Gerenciamento alimentar</span>
                <h2>Refeicoes do Dia</h2>
              </div>
              <button className="icon-button" onClick={() => setIsActionsOpen(true)} type="button" aria-label="Abrir gerenciamento avancado">
                <Icon name="more" />
              </button>
            </div>

            <label className="search-box">
              <Icon name="search" size={16} />
              <input
                onChange={(event) => setMealSearch(event.target.value)}
                placeholder="Buscar refeicao"
                type="search"
                value={mealSearch}
              />
            </label>

            <div className="meal-list">
              {filteredMeals.map((meal) => (
                <article className="meal-card" key={meal.id}>
                  <div className="meal-content">
                    <h3>{meal.title}</h3>
                    <p>{meal.summary}</p>
                    <span>{meal.macros}</span>
                    {meal.foods.length > 0 && (
                      <ul>
                        {meal.foods.map((food) => (
                          <li key={food}>
                            <button onClick={() => removeFood(meal.id, food)} type="button" aria-label={`Excluir ${food}`}>
                              <Icon name="close" size={13} />
                            </button>
                            <span>{food}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <button className="add-button" onClick={() => showToast(`Insercao rapida em ${meal.title}.`)} type="button" aria-label={`Adicionar alimento em ${meal.title}`}>
                    <Icon name="plus" size={20} />
                  </button>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>

      {isActionsOpen && (
        <div className="modal-backdrop" onClick={() => setIsActionsOpen(false)} role="presentation">
          <section className="diet-drawer" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Acoes da dieta">
            <div className="drawer-header">
              <div>
                <span>Acoes da dieta</span>
                <h2>Gerenciamento avancado</h2>
              </div>
              <button onClick={() => setIsActionsOpen(false)} type="button" aria-label="Fechar">
                <Icon name="close" />
              </button>
            </div>
            <button className="drawer-primary" onClick={() => showToast('Dieta salva como modelo.')} type="button"><Icon name="bookmark" />Salvar dieta como modelo</button>
            <button className="drawer-outline" onClick={() => showToast('Gerenciamento de refeicoes aberto.')} type="button"><Icon name="settings" />Gerenciar refeicoes</button>
            <button className="drawer-outline" onClick={() => showToast('Refeicoes repetidas em outros dias.')} type="button"><Icon name="copy" />Repetir refeicoes em outros dias</button>
            <button className="drawer-outline" onClick={() => showToast('Dieta exportada.')} type="button"><Icon name="upload" />Exportar dieta</button>
            <button className="drawer-outline danger" onClick={clearMeals} type="button"><Icon name="trash" />Limpar refeicoes do dia</button>
          </section>
        </div>
      )}

      {isGoalModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsGoalModalOpen(false)} role="presentation">
          <section className="goal-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Redefinir metas">
            <div className="goal-header">
              <div>
                <span className="eyebrow">Metas de hipertrofia</span>
                <h2>Redefinir calorias e macros</h2>
              </div>
              <button onClick={() => setIsGoalModalOpen(false)} type="button" aria-label="Fechar">
                <Icon name="close" />
              </button>
            </div>
            <div className="goal-grid">
              {['Calorias', 'Proteinas', 'Carboidratos', 'Gorduras'].map((label) => (
                <label key={label}>
                  {label}
                  <input placeholder={label === 'Calorias' ? '2500 kcal' : 'Meta em gramas'} />
                </label>
              ))}
            </div>
            <button className="save-goal" onClick={() => { setIsGoalModalOpen(false); showToast('Metas atualizadas.'); }} type="button">
              Salvar novas metas
            </button>
          </section>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}

function SectionTitle({ eyebrow, title, extra }) {
  return (
    <div className="section-title">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {extra && <span className="badge neutral">{extra}</span>}
    </div>
  );
}

function Progress({ percent, color }) {
  return (
    <div className="progress">
      <span style={{ background: color, width: `${percent}%` }} />
    </div>
  );
}

const styles = `
.dashboard-page{min-height:100vh;background:#F8F9FA;color:#111827;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
button,input{font:inherit}button{cursor:pointer}.sidebar{position:fixed;inset:0 auto 0 0;width:280px;background:#fff;border-right:1px solid #e5e7eb;display:flex;flex-direction:column;padding:24px 18px;z-index:20}.brand{display:flex;align-items:center;gap:12px;padding:4px 8px 26px}.brand-icon{display:grid;place-items:center;width:42px;height:42px;border-radius:8px;background:#ecfdf5;color:#0f766e}.brand strong{display:block;font-size:18px;letter-spacing:.01em}.brand span{display:block;color:#64748b;font-size:12px;font-weight:800;text-transform:uppercase}.nav-list{display:grid;gap:8px}.nav-item,.logout-button{display:flex;align-items:center;gap:12px;width:100%;border:0;border-radius:8px;background:transparent;color:#64748b;font-weight:800;padding:12px 14px;text-align:left}.nav-item:hover,.logout-button:hover{background:#f1f5f9;color:#0f172a}.nav-item.active{background:#0f766e;color:#fff;box-shadow:0 10px 22px rgba(15,118,110,.2)}.logout-button{margin-top:auto;color:#b91c1c}
.main-panel{margin-left:280px;min-height:100vh}.top-header{position:sticky;top:0;z-index:10;display:flex;align-items:center;justify-content:space-between;gap:16px;background:rgba(248,249,250,.92);backdrop-filter:blur(14px);border-bottom:1px solid #e5e7eb;padding:20px 32px}.eyebrow{display:block;color:#0f766e;font-size:12px;font-weight:900;text-transform:uppercase}.top-header h1{margin:4px 0 0;font-size:30px;line-height:1.1}.profile-card{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:10px 12px;box-shadow:0 1px 2px rgba(15,23,42,.06)}.avatar{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:#111827;color:#fff}.profile-card strong{display:block;font-size:14px}.profile-card span{display:block;color:#64748b;font-size:12px;font-weight:700}
.dashboard-grid{display:grid;grid-template-columns:1fr 1fr 1.1fr;gap:20px;padding:24px 32px 40px}.card{background:#fff;border:1px solid #eef2f7;border-radius:8px;box-shadow:0 1px 2px rgba(15,23,42,.06);padding:22px}.section-title,.meals-header,.metric-line,.macro-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.section-title h2,.meals-header h2{margin:4px 0 0;font-size:20px}.calendar-card{grid-column:1 / -1}.week-row{display:grid;grid-template-columns:repeat(7,minmax(120px,1fr));gap:10px;margin-top:18px;overflow-x:auto}.day-card{display:grid;gap:10px;min-height:104px;border:1px solid #e5e7eb;border-radius:8px;background:#fff;padding:14px;text-align:left}.day-card strong{font-size:18px}.day-card.selected{border-color:#0f766e;background:#f0fdfa;box-shadow:inset 0 0 0 1px #0f766e}.badge{width:max-content;border-radius:999px;font-size:11px;font-weight:900;padding:6px 8px}.success{background:#dcfce7;color:#166534}.warning{background:#fef3c7;color:#92400e}.neutral{background:#f1f5f9;color:#334155}.checklist{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:18px}.check-row{display:flex;align-items:center;gap:10px;border:1px solid #e5e7eb;border-radius:8px;padding:12px}.check-icon{display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:#dcfce7;color:#16a34a}.check-row strong,.check-row span{display:block}.check-row span{color:#64748b;font-size:13px}
.filter-row{display:flex;width:max-content;gap:4px;background:#f1f5f9;border-radius:8px;padding:4px;margin-top:16px}.filter-row button{border:0;border-radius:6px;background:transparent;color:#64748b;font-size:12px;font-weight:900;padding:8px 10px}.filter-row .active{background:#111827;color:#fff}.area-chart{height:150px;margin-top:18px;border-radius:8px;background:linear-gradient(180deg,#f0fdfa,#f8fafc);display:flex;align-items:end;gap:10px;padding:18px}.area-chart span{flex:1;border-radius:8px 8px 0 0;background:linear-gradient(180deg,#14b8a6,#0f766e)}.metric-line{margin-top:16px}.metric-line strong{font-size:20px}.metric-line span{display:block;color:#64748b;font-size:13px;margin-top:3px}.metric-line b{color:#0f766e;font-size:20px}.progress{height:10px;background:#e5e7eb;border-radius:999px;overflow:hidden;margin-top:12px}.progress span{display:block;height:100%;border-radius:999px}.macro-list{display:grid;gap:18px;margin-top:18px}.macro-head strong{font-size:15px}.macro-head span{color:#475569;font-size:13px;font-weight:800}.action-row{display:grid;grid-template-columns:1fr;gap:10px;margin-top:22px}.action-row button{display:flex;align-items:center;justify-content:center;gap:8px;border:1px solid #d1d5db;border-radius:8px;background:#fff;color:#111827;font-weight:900;padding:12px}.action-row button:hover{background:#f8fafc}
.search-box{display:flex;align-items:center;gap:8px;border:1px solid #d1d5db;border-radius:8px;background:#fff;padding:10px 12px;color:#64748b;margin-top:16px}.search-box input{border:0;outline:0;width:100%;color:#111827}.icon-button{display:grid;place-items:center;width:42px;height:42px;border:1px solid #d1d5db;border-radius:8px;background:#fff;color:#111827}.meal-list{display:grid;gap:14px;margin-top:16px}.meal-card{display:grid;grid-template-columns:1fr auto;gap:16px;border:1px solid #e5e7eb;border-radius:8px;padding:18px;background:#fff}.meal-content h3{margin:0;font-size:19px}.meal-content p{margin:4px 0;color:#111827;font-weight:900}.meal-content>span{display:block;color:#64748b;font-size:13px}.meal-content ul{display:grid;gap:8px;list-style:none;margin:14px 0 0;padding:0}.meal-content li{display:flex;align-items:center;gap:8px;color:#475569;font-size:14px}.meal-content li button{display:grid;place-items:center;width:22px;height:22px;border:0;border-radius:50%;background:#fee2e2;color:#dc2626}.add-button{display:grid;place-items:center;width:42px;height:42px;border:0;border-radius:50%;background:#0f766e;color:#fff;align-self:center}
.modal-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.55);display:grid;place-items:center;padding:20px;z-index:50}.diet-drawer,.goal-modal{width:min(430px,100%);border-radius:12px;background:#1F2937;color:#fff;padding:22px;box-shadow:0 30px 70px rgba(0,0,0,.35)}.drawer-header,.goal-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px}.drawer-header span{color:#99f6e4;font-size:12px;font-weight:900;text-transform:uppercase}.drawer-header h2,.goal-header h2{margin:4px 0 0;font-size:22px}.drawer-header button,.goal-header button{display:grid;place-items:center;width:34px;height:34px;border:1px solid rgba(255,255,255,.2);border-radius:8px;background:transparent;color:#fff}.drawer-primary,.drawer-outline{display:flex;align-items:center;gap:10px;width:100%;border-radius:8px;font-weight:900;padding:13px 14px;margin-top:10px}.drawer-primary{border:0;background:#14b8a6;color:#062c2a}.drawer-outline{border:1px solid rgba(255,255,255,.24);background:transparent;color:#fff}.drawer-outline.danger{color:#fecaca;border-color:rgba(248,113,113,.36)}.goal-modal{background:#fff;color:#111827}.goal-header button{border-color:#e5e7eb;color:#111827}.goal-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.goal-grid label{display:grid;gap:7px;color:#334155;font-weight:800}.goal-grid input{border:1px solid #d1d5db;border-radius:8px;padding:12px}.save-goal{width:100%;border:0;border-radius:8px;background:#0f766e;color:#fff;font-weight:900;padding:13px 16px;margin-top:16px}.toast{position:fixed;right:24px;bottom:24px;background:#111827;color:#fff;border-radius:8px;box-shadow:0 18px 46px rgba(15,23,42,.22);padding:13px 16px;font-weight:900;z-index:60}
@media(max-width:1180px){.dashboard-grid{grid-template-columns:1fr}.week-row{grid-template-columns:repeat(7,150px)}}@media(max-width:860px){.sidebar{position:static;width:auto;border-right:0;border-bottom:1px solid #e5e7eb}.main-panel{margin-left:0}.top-header{position:static;align-items:flex-start;flex-direction:column;padding:18px}.dashboard-grid{padding:18px}.checklist,.goal-grid{grid-template-columns:1fr}.profile-card{width:100%}.nav-list{grid-template-columns:repeat(2,1fr)}}
`;

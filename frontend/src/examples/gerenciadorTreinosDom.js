import './gerenciadorTreinosDom.css';

/**
 * EXEMPLO DE MARCAÇÃO HTML ESPERADA
 * ------------------------------------
 *
 * <section class="gerenciador-itens">
 *   <h2>Exercícios do treino</h2>
 *   <p id="item-selecionado" aria-live="polite">Nenhum item selecionado.</p>
 *   <ul id="lista-itens"></ul>
 *   <button id="simular-fim-temporizador" type="button">
 *     Simular fim do temporizador
 *   </button>
 * </section>
 *
 * Depois de inserir essa marcação na página, basta importar e chamar:
 *
 * import { inicializarGerenciadorTreinos } from './gerenciadorTreinosDom.js';
 * inicializarGerenciadorTreinos();
 */

// Uma chave exclusiva evita colisão com os demais dados do System Fitness.
const CHAVE_LOCAL_STORAGE = 'system-fitness:itens-treino-dom';

// Seletores centralizados tornam o exemplo mais fácil de adaptar a outro HTML.
const SELETORES = {
  lista: '#lista-itens',
  statusSelecao: '#item-selecionado',
  botaoFinalizar: '#simular-fim-temporizador',
  itensRenderizados: '#lista-itens li',
};

// Dados iniciais utilizados somente quando ainda não existe estado persistido.
const ITENS_INICIAIS = [
  { id: 1, nome: 'Agachamento livre', concluido: false },
  { id: 2, nome: 'Supino reto', concluido: false },
  { id: 3, nome: 'Remada baixa', concluido: false },
];

/*
 * Variáveis com `let` representam o estado mutável do módulo.
 *
 * `itemSelecionado` guarda o objeto de dados. `liItemSelecionado` guarda a
 * referência ao elemento visual correspondente. Manter as duas referências
 * permite atualizar os dados e a interface quando o temporizador terminar.
 */
let itens = [];
let itemSelecionado = null;
let liItemSelecionado = null;
let elementosDaTela = null;

/**
 * Cria uma nova cópia dos itens iniciais.
 * Assim, o array constante nunca é alterado acidentalmente.
 */
function obterItensIniciais() {
  return ITENS_INICIAIS.map((item) => ({ ...item }));
}

/**
 * Lê a string armazenada pelo navegador e a converte novamente em objetos.
 * JSON.parse() é necessário porque o localStorage armazena apenas strings.
 */
function carregarItens() {
  try {
    const itensEmJson = localStorage.getItem(CHAVE_LOCAL_STORAGE);

    // Early Return: se ainda não há dados salvos, usa os dados iniciais.
    if (!itensEmJson) return obterItensIniciais();

    const itensSalvos = JSON.parse(itensEmJson);

    // Protege a renderização contra um valor inesperado salvo na mesma chave.
    if (!Array.isArray(itensSalvos)) return obterItensIniciais();

    return itensSalvos;
  } catch (erro) {
    // Um JSON inválido não deve impedir o restante da página de funcionar.
    console.warn('Não foi possível ler os itens salvos.', erro);
    return obterItensIniciais();
  }
}

/**
 * Converte o array de objetos em string com JSON.stringify() e o persiste.
 */
function salvarItens() {
  try {
    localStorage.setItem(CHAVE_LOCAL_STORAGE, JSON.stringify(itens));
  } catch (erro) {
    // Pode ocorrer, por exemplo, se o armazenamento estiver cheio ou bloqueado.
    console.warn('Não foi possível salvar os itens.', erro);
  }
}

/**
 * Mantém o texto auxiliar e o botão do temporizador sincronizados com o
 * item selecionado no momento.
 */
function atualizarInterfaceDeSelecao() {
  if (!elementosDaTela) return;

  elementosDaTela.statusSelecao.textContent = itemSelecionado
    ? `Selecionado: ${itemSelecionado.nome}`
    : 'Nenhum item selecionado.';

  elementosDaTela.botaoFinalizar.disabled = itemSelecionado === null;
}

/**
 * Trata o clique em um <li> criado dinamicamente.
 */
function selecionarItem(item, liItem) {
  /*
   * Seleção única:
   * 1. querySelectorAll() encontra todos os <li> da lista;
   * 2. forEach() percorre cada elemento;
   * 3. classList.remove() remove SOMENTE a classe CSS.
   *
   * Não use `element.remove()` aqui: esse método apagaria o elemento HTML.
   */
  document.querySelectorAll(SELETORES.itensRenderizados).forEach((element) => {
    element.classList.remove('ativo');
  });

  /*
   * Early Return: um segundo clique no mesmo item funciona como desseleção.
   * O estado é limpo e a função termina antes de adicionar `ativo` novamente.
   */
  if (itemSelecionado?.id === item.id) {
    itemSelecionado = null;
    liItemSelecionado = null;
    atualizarInterfaceDeSelecao();
    return;
  }

  // Um item diferente foi clicado: atualiza primeiro o estado global...
  itemSelecionado = item;
  liItemSelecionado = liItem;

  // ...e depois reflete o novo estado na interface.
  atualizarInterfaceDeSelecao();
  liItem.classList.add('ativo');
}

/**
 * Ponto de extensão para a edição real do System Fitness.
 * O `stopPropagation()` usado na renderização impede que clicar neste botão
 * também selecione ou desselecione o <li> que o contém.
 */
function editarItem(item) {
  console.info(`Editar item: ${item.nome}`);
}

/**
 * Cria os elementos da lista sem usar HTML vindo dos dados, evitando injeção
 * acidental de marcação. Cada <li> recebe seu próprio evento `onclick`.
 */
function renderizarItens() {
  elementosDaTela.lista.textContent = '';

  itens.forEach((item) => {
    const liItem = document.createElement('li');
    liItem.classList.add('item-lista');
    liItem.dataset.itemId = String(item.id);

    const nomeItem = document.createElement('span');
    nomeItem.classList.add('nome-item');
    nomeItem.textContent = item.nome;

    const indicadorConclusao = document.createElement('span');
    indicadorConclusao.classList.add('indicador-conclusao');
    indicadorConclusao.textContent = '✓ Concluído';

    const botaoEditar = document.createElement('button');
    botaoEditar.type = 'button';
    botaoEditar.textContent = 'Editar';
    botaoEditar.onclick = (eventoDeClique) => {
      eventoDeClique.stopPropagation();
      editarItem(item);
    };

    liItem.append(nomeItem, indicadorConclusao, botaoEditar);

    // Regra solicitada: o evento onclick pertence ao <li> criado dinamicamente.
    liItem.onclick = () => selecionarItem(item, liItem);

    /*
     * Restauração após recarregar a página:
     * se `concluido` veio como true do localStorage, o verde e o bloqueio do
     * botão são aplicados imediatamente na nova renderização.
     */
    if (item.concluido) {
      liItem.classList.add('completo');
      botaoEditar.setAttribute('disabled', 'disabled');
    }

    elementosDaTela.lista.append(liItem);
  });
}

/**
 * Este trecho representa o script do temporizador. Quando a contagem chega a
 * zero, ele não precisa conhecer a lista: apenas publica um evento no document.
 */
export function simularTerminoDoTemporizador() {
  const evento = new CustomEvent('TemporizadorFinalizado');
  document.dispatchEvent(evento);
}

/*
 * Este listener representa outro script/módulo da aplicação. Como o evento é
 * escutado no `document`, temporizador e lista permanecem desacoplados.
 */
document.addEventListener('TemporizadorFinalizado', () => {
  // Sem seleção não há item a concluir. O Early Return evita erros de null.
  if (!itemSelecionado || !liItemSelecionado) return;

  // Atualização visual imediata do <li> atualmente selecionado.
  liItemSelecionado.classList.remove('ativo');
  liItemSelecionado.classList.add('completo');

  // A estrutura renderizada sempre possui um botão, portanto ele pode ser
  // localizado a partir do próprio <li> e desabilitado com setAttribute().
  liItemSelecionado.querySelector('button').setAttribute('disabled', 'disabled');

  // Atualiza o objeto em memória e persiste a nova propriedade booleana.
  itemSelecionado.concluido = true;
  salvarItens();

  // Após a conclusão, nenhuma referência permanece selecionada.
  itemSelecionado = null;
  liItemSelecionado = null;
  atualizarInterfaceDeSelecao();
});

/**
 * Inicializa o exemplo somente depois que a marcação HTML estiver no DOM.
 */
export function inicializarGerenciadorTreinos() {
  elementosDaTela = {
    lista: document.querySelector(SELETORES.lista),
    statusSelecao: document.querySelector(SELETORES.statusSelecao),
    botaoFinalizar: document.querySelector(SELETORES.botaoFinalizar),
  };

  const algumElementoAusente = Object.values(elementosDaTela).some(
    (elemento) => elemento === null,
  );

  if (algumElementoAusente) {
    throw new Error(
      'Não foi possível inicializar: confira os IDs do HTML descritos no início do arquivo.',
    );
  }

  itens = carregarItens();
  renderizarItens();
  atualizarInterfaceDeSelecao();

  // Este botão representa o instante em que a contagem chegaria a zero.
  elementosDaTela.botaoFinalizar.onclick = simularTerminoDoTemporizador;
}

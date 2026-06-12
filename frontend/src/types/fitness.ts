export interface Usuario {
  id?: number;
  nome: string;
  email: string;
  senha?: string;
  idade: number;
  peso: number;
  altura: number;
  sexo: string;
  objetivo: "EMAGRECER" | "MANTER" | "HIPERTROFIA";
}

export interface Treino {
  id?: number;
  nomeTreino: string;
  tipoTreino: string;
  duracao: number; // in minutes
  intensidade: string;
  frequencia: number; // days per week
  usuarioId?: number; // useful to link back
}

export interface Exercicio {
  id?: number;
  nome: string;
  series: number;
  repeticoes: number;
  duracao: number; // in minutes
  descricao: string;
  treinoId?: number; // useful to link back
}

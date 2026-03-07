// TypeScript types for DB tables (V2 ADJUSTED)
export type RiscLevel = "CRÍTICA" | "ALTA" | "MODERADA" | "BAIXA";
export type UserProfile =
    | "SECRETARIO_MUNICIPAL"
    | "GESTOR_OPERACIONAL"
    | "COORDENADOR_UNIDADE"
    | "TECNICO_REFERENCIA"
    | "AUDITOR_LGPD"
    | "ADMIN_SISTEMA"
    | "Gestor" | "Coordenador" | "Tecnico" | "Admin" | "Tecnico_CRAS" | "Tecnico_UBS";

export interface Municipio {
    id: string; nome: string; estado: string; cnpj?: string; email?: string; ativo: boolean;
}
export interface Territorio {
    id: string; municipio_id: string; nome: string; tipo: string; ativo: boolean;
}
export interface Familia {
    id: string; territorio_id: string; nis_responsavel?: string; cpf_responsavel?: string;
    nome_responsavel: string; endereco?: string; lat?: number; lng?: number;
    data_cadastro: string; ativo: boolean;
}
export interface Cidadao {
    id: string; familia_id: string; cpf?: string; cns?: string; nome: string;
    data_nascimento?: string; sexo?: string; relacao_parentesco?: string; ativo: boolean;
}
export interface IndicadoresSociais {
    id: string; familia_id: string; renda_per_capita?: number; situacao_rua?: boolean;
    moradia_precaria?: boolean; moradia_precaria_barraco?: boolean; sem_saneamento?: boolean;
    tem_crianca_0a6?: boolean; tem_idoso_60plus?: boolean; tem_mae_solo?: boolean;
    tem_deficiente?: boolean; responsavel_desempregado?: boolean; baixa_escolaridade?: boolean;
    data_atualizacao?: string;
}
export interface IndicadoresSaude {
    id: string; cidadao_id: string; familia_id: string;
    gestante_faltosa?: boolean; gestante_regular?: boolean;
    crianca_desnutrida?: boolean; diabetes_descontrolada?: boolean;
    hipertensao_descontrolada?: boolean; cancer_ou_doenca_renal?: boolean;
    doenca_cardiaca?: boolean; doenca_respiratoria?: boolean;
    situacao_rua?: boolean; dependencia_quimica?: boolean;
    acamado_domiciliado?: boolean; internacao_recente?: boolean;
    data_atualizacao?: string;
}
export interface ScoreRisco {
    id: string; familia_id: string; score_social: number; score_saude: number;
    score_familiar: number; classificacao_risco: RiscLevel; acao_recomendada: string;
    data_recalculo: string; versao: number; is_atual: boolean;
}
export interface GatilhoPriorizacao {
    id: string; familia_id: string; tipo_gatilho: string; descricao?: string;
    data_identificacao: string; resolvido: boolean;
}
export interface BuscaAtiva {
    id: string; territorio_id: string; data_inicio: string; data_fim?: string;
    equipes_cras?: string[]; equipes_saude?: string[]; status: string; resultado?: string;
    score_risco_lista_usada: string;
}
export interface RegistroAcao {
    id: string; busca_ativa_id?: string; familia_id: string;
    tipo_acao: "Atendido" | "Recusado" | "NaoLocalizado";
    tecnico_id?: string; data_acao: string; observacoes?: string;
}
export interface Encaminhamento {
    id: string; familia_id: string; origem_cras: string; destino_ubs: string;
    data_encaminhamento: string; data_resposta?: string; status: string; sla: string;
}
export interface Usuario {
    id: string; nome: string; email: string; perfil: UserProfile;
    municipio_id?: string; territorio_id?: string;
    scope_territorio?: string[]; scope_unidade?: string[]; scope_equipe?: string[];
    must_change_password: boolean; ativo: boolean;
}

// Helper types for Views
export interface FamiliaScore {
    familia_id: string;
    nome_responsavel: string;
    nis_responsavel?: string;
    cpf_responsavel?: string;
    endereco?: string;
    territorio: string;
    territorio_id: string;
    score_social?: number;
    score_saude?: number;
    score_familiar?: number;
    classificacao_risco?: RiscLevel;
    acao_recomendada?: string;
    data_recalculo?: string;
    gatilhos_ativos?: string;
}

export interface KpiDashboard {
    territorio: string;
    total_familias: number;
    criticas: number;
    altas: number;
    moderadas: number;
    baixas: number;
    sem_score: number;
}

export type Database = {
    public: {
        Tables: {
            familias: { Row: Familia; Insert: Partial<Familia>; Update: Partial<Familia> };
            indicadores_sociais: { Row: IndicadoresSociais; Insert: Partial<IndicadoresSociais>; Update: Partial<IndicadoresSociais> };
            indicadores_saude: { Row: IndicadoresSaude; Insert: Partial<IndicadoresSaude>; Update: Partial<IndicadoresSaude> };
            scores_risco: { Row: ScoreRisco; Insert: Partial<ScoreRisco>; Update: Partial<ScoreRisco> };
            gatilhos_priorizacao: { Row: GatilhoPriorizacao; Insert: Partial<GatilhoPriorizacao>; Update: Partial<GatilhoPriorizacao> };
            buscas_ativas: { Row: BuscaAtiva; Insert: Partial<BuscaAtiva>; Update: Partial<BuscaAtiva> };
            encaminhamentos: { Row: Encaminhamento; Insert: Partial<Encaminhamento>; Update: Partial<Encaminhamento> };
            usuarios: { Row: Usuario; Insert: Partial<Usuario>; Update: Partial<Usuario> };
            municipios: { Row: Municipio; Insert: Partial<Municipio>; Update: Partial<Municipio> };
            territorios: { Row: Territorio; Insert: Partial<Territorio>; Update: Partial<Territorio> };
        };
    };
};

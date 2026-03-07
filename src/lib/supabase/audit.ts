import { createClient } from './client';

export interface AuditLogParams {
    usuario_id?: string;
    acao: string;
    recurso: string;
    tabela?: string;
    registro_id?: string;
    case_id?: string;
    dados_antes?: any;
    dados_depois?: any;
    resultado?: string;
    justificativa?: string;
    ticket_id?: string;
}

export async function recordAuditLog(params: AuditLogParams) {
    const supabase = createClient();

    // Get current user if not provided
    let userId = params.usuario_id;
    let userProfile = '';

    if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;

        if (userId) {
            const { data: profile } = await supabase
                .from('usuarios')
                .select('perfil')
                .eq('id', userId)
                .single();
            userProfile = profile?.perfil || '';
        }
    }

    const { error } = await supabase.from('auditoria_logs').insert([{
        usuario_id: userId,
        perfil: userProfile,
        acao: params.acao,
        recurso: params.recurso,
        tabela: params.tabela,
        registro_id: params.registro_id,
        case_id: params.case_id,
        dados_antes: params.dados_antes,
        dados_depois: params.dados_depois,
        resultado: params.resultado || 'Sucesso',
        justificativa: params.justificativa,
        ticket_id: params.ticket_id,
        ip: null, // Let Postgres handle or capture from request if possible
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server'
    }]);

    if (error) {
        console.error('Failed to record audit log:', error);
    }
}

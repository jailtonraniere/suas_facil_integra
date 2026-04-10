"use client";
import { useState, useMemo } from "react";
import {
    BookOpen, Target, Info, ShieldCheck, Cpu,
    Layout, Layers, Map as MapIcon, Link as LinkIcon,
    BarChart, PlayCircle, Star, Lock, Lightbulb,
    MessageCircle, HelpCircle, PhoneCall, Search, X, TrendingUp,
    CheckCircle2, AlertCircle, Users, Activity, FileText, Settings, Menu
} from "lucide-react";

const chapters = [
    { id: "apresentacao", title: "1. Apresentação", icon: BookOpen },
    { id: "objetivos", title: "2. Objetivos Estratégicos", icon: Target },
    { id: "conceito", title: "3. Conceito e Integração", icon: Info },
    { id: "perfis", title: "4. Perfis e Governança", icon: ShieldCheck },
    { id: "arquitetura", title: "5. Segurança de Dados", icon: Cpu },
    { id: "dashboard", title: "6. Painéis Gerenciais", icon: Layout },
    { id: "modulos", title: "7. Módulos Operacionais", icon: Layers },
    { id: "usar", title: "8. Guia de Operação", icon: PlayCircle },
    { id: "boas-praticas", title: "9. Ética e Boas Práticas", icon: Star },
    { id: "lgpd", title: "10. Conformidade LGPD", icon: Lock },
    { id: "exemplos", title: "11. Casos de Sucesso", icon: Lightbulb },
    { id: "relatorios", title: "12. Inteligência e Apoio", icon: BarChart },
    { id: "faq", title: "13. FAQ Detalhado", icon: MessageCircle },
    { id: "glossario", title: "14. Glossário Técnico", icon: HelpCircle },
    { id: "suporte", title: "15. Suporte e Ouvidoria", icon: PhoneCall },
];

export default function AjudaPage() {
    const [activeTab, setActiveTab] = useState("apresentacao");
    const [searchTerm, setSearchTerm] = useState("");

    const renderContent = (tabId: string) => {
        switch (tabId) {
            case "apresentacao":
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <section>
                            <h2 className="text-3xl font-black text-blue-900 mb-4 tracking-tight">Apresentação Institucional</h2>
                            <p className="text-gray-700 leading-relaxed text-lg">
                                O <strong>SUAS Fácil Integra</strong> representa o estado da arte na convergência entre tecnologia e políticas públicas. Desenvolvido para servir como o "sistema nervoso central" da integração intersetorial, a plataforma elimina os silos de informação que historicamente fragmentam o atendimento ao cidadão em vulnerabilidade.
                            </p>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-3xl text-white shadow-xl">
                                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                                    <Activity size={24} /> O Propósito
                                </h3>
                                <p className="text-blue-100 text-sm leading-relaxed">
                                    Garantir que a trajetória do cidadão entre a rede socioassistencial e a rede de saúde seja monitorada, protegida e, acima de tudo, resolutiva. A integração não é apenas de dados, mas de vidas e territórios.
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                                <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
                                    <ShieldCheck size={24} className="text-blue-600" /> Segurança Jurídica
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Total conformidade com a LGPD e o Marco Civil da Internet, assegurando que o compartilhamento de informações ocorra estritamente dentro da finalidade pública e do dever legal.
                                </p>
                            </div>
                        </div>

                        <section className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                            <h4 className="font-black text-blue-900 uppercase text-xs tracking-widest mb-4">Contextualização em Mauá</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Em Mauá, o sistema conecta os CRAS, CREAS e as Unidades Básicas de Saúde (UBS), permitindo que a vigilância socioassistencial identifique situações de risco que, isoladamente, poderiam passar despercebidas por uma única secretaria.
                            </p>
                        </section>
                    </div>
                );
            case "objetivos":
                return (
                    <div className="space-y-8">
                        <h2 className="text-3xl font-black text-blue-900 tracking-tight">Objetivos Estratégicos</h2>
                        <div className="grid grid-cols-1 gap-6">
                            {[
                                { t: "Interoperabilidade", d: "Criar um fluxo contínuo de dados entre o CadÚnico e o e-SUS, otimizando o tempo de resposta das equipes de referência." },
                                { t: "Vigilância Preditiva", d: "Utilizar algoritmos para prever vulnerabilidades familiares baseadas em indicadores de saúde e renda." },
                                { t: "Contrarreferência Ativa", d: "Monitorar se o cidadão encaminhado pelo CRAS realmente chegou à UBS e vice-versa, fechando o ciclo do atendimento." },
                                { t: "Otimização de Recursos", d: "Reduzir o retrabalho de cadastro e focar as horas-técnicas onde o risco é comprovadamente maior." }
                            ].map((obj, i) => (
                                <div key={i} className="flex gap-6 p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:border-blue-300 transition-all group">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-blue-900 mb-1">{obj.t}</h4>
                                        <p className="text-gray-600 text-sm leading-relaxed">{obj.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case "conceito":
                return (
                    <div className="space-y-8">
                        <h2 className="text-3xl font-black text-blue-900 tracking-tight">Conceito e Integração</h2>
                        <p className="text-gray-700 leading-relaxed text-lg">O ecossistema Integra baseia-se na <strong>Inteleligência Coletiva dos Territórios</strong>. Para que o conceito funcione, o sistema opera em três dimensões:</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 border border-gray-100 rounded-3xl bg-blue-50/50">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm"><Layers size={24} /></div>
                                <h4 className="font-bold text-blue-900 mb-2">Visão 360º</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">Cruzamento automático de bases de dados (SUS/SUAS) para gerar um score de risco familiar unificado.</p>
                            </div>
                            <div className="p-6 border border-gray-100 rounded-3xl bg-green-50/50">
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm"><MapIcon size={24} /></div>
                                <h4 className="font-bold text-green-900 mb-2">Territorialização</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">Organização geográfica baseada na área de abrangência das unidades de Mauá para gestão localizada.</p>
                            </div>
                            <div className="p-6 border border-gray-100 rounded-3xl bg-orange-50/50">
                                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm"><TrendingUp size={24} /></div>
                                <h4 className="font-bold text-orange-900 mb-2">Priorização</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">O sistema "eleva" sozinhos os casos críticos, garantindo que o gestor saiba onde agir primeiro.</p>
                            </div>
                        </div>

                        <div className="bg-yellow-50 p-6 rounded-3xl border border-yellow-100">
                            <h4 className="flex items-center gap-2 text-yellow-800 font-bold mb-2">
                                <Lightbulb size={20} /> Exemplo Conceitual:
                            </h4>
                            <p className="text-sm text-yellow-900/80 italic leading-relaxed">
                                Imagine uma família que recebe Bolsa Família (SUAS), mas cuja gestante não realiza o pré-natal há 2 meses (SUS). O sistema cruza essas faltas e gera um alerta de <strong>Prioridade Crítica</strong> para o técnico do CRAS realizar uma visita de busca ativa.
                            </p>
                        </div>
                    </div>
                );
            case "perfis":
                return (
                    <div className="space-y-8">
                        <h2 className="text-3xl font-black text-blue-900 tracking-tight">Perfis e Governança</h2>
                        <div className="space-y-6">
                            {[
                                { p: "Secretário Municipal", v: "Nível Estratégico. Monitora KPIs agregados, metas por território e dados orçamentários/populacionais. Acesso a dados nominais é tecnicamente bloqueado.", color: "bg-blue-600" },
                                { p: "Gestor Operacional", v: "Nível Tático. Coordenadores de Vigilância. Podem ver tendências territoriais e dados pseudonimizados para planejamento de campanhas.", color: "bg-purple-600" },
                                { p: "Coordenador de Unidade", v: "Nível Gerencial Local. Acesso total aos nomes de seu território para distribuir tarefas à equipe técnica.", color: "bg-teal-600" },
                                { p: "Técnico de Referência", v: "Nível Executivo. Assistentes Sociais, Psicólogos e Médicos. Acesso total ao prontuário dos casos para intervenção direta.", color: "bg-indigo-600" }
                            ].map((row, i) => (
                                <div key={i} className="flex gap-6 items-start p-6 border border-gray-100 rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
                                    <div className={`w-3 h-12 rounded-full ${row.color} grow-0 shrink-0`} />
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-2">{row.p}</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">{row.v}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case "dashboard":
                return (
                    <div className="space-y-8">
                        <h2 className="text-3xl font-black text-blue-900 tracking-tight">Painéis Gerenciais (Dashboard)</h2>
                        <p className="text-gray-600 leading-relaxed">A tela inicial é a cabine de comando do sistema. Ela serve para:</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                                <CheckCircle2 className="text-blue-600 mb-3" size={32} />
                                <h4 className="font-bold text-blue-900 mb-2">Visão de Topo</h4>
                                <ul className="text-xs text-gray-600 space-y-2 list-disc ml-4">
                                    <li>Contagem total de famílias monitoradas.</li>
                                    <li>Alertas de novos casos críticos em tempo real.</li>
                                    <li>Status da última atualização de dados de Mauá.</li>
                                </ul>
                            </div>
                            <div className="p-6 bg-red-50 rounded-3xl border border-red-100">
                                <AlertCircle className="text-red-600 mb-3" size={32} />
                                <h4 className="font-bold text-red-900 mb-2">Painel de Ação</h4>
                                <ul className="text-xs text-gray-600 space-y-2 list-disc ml-4">
                                    <li>Top 10 Famílias com maior risco social.</li>
                                    <li>Gráfico de pizza com níveis de prioridade.</li>
                                    <li>Filtros rápidos para territórios específicos.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );
            case "modulos":
                return (
                    <div className="space-y-8">
                        <h2 className="text-3xl font-black text-blue-900 tracking-tight">Módulos Operacionais</h2>
                        <div className="space-y-10">
                            <section className="border-l-4 border-blue-600 pl-8 space-y-3">
                                <h3 className="text-xl font-extrabold text-blue-900">1. Listas Inteligentes</h3>
                                <p className="text-gray-600 text-sm">Organiza sua demanda diária. Permite filtrar famílias por vulnerabilidades específicas (ex: moradia precária + desemprego).</p>
                                <div className="flex gap-2">
                                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded">Exportação Excel</span>
                                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded">Filtro Avançado</span>
                                </div>
                            </section>

                            <section className="border-l-4 border-green-600 pl-8 space-y-3">
                                <h3 className="text-xl font-extrabold text-green-900">2. Busca Ativa</h3>
                                <p className="text-gray-600 text-sm">Ferramenta para planejar visitas. Selecione um território e veja no mapa onde estão os focos de maior risco social da região.</p>
                                <div className="flex gap-2">
                                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded">Mapa de Calor</span>
                                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded">Roteirização</span>
                                </div>
                            </section>

                            <section className="border-l-4 border-purple-600 pl-8 space-y-3">
                                <h3 className="text-xl font-extrabold text-purple-900">3. Relatórios / Ouvidoria</h3>
                                <p className="text-gray-600 text-sm">Geração de documentos para o MDS ou Secretaria de Saúde. Registro de ações para fins de prestação de contas (auditoria).</p>
                                <div className="flex gap-2">
                                    <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded">Logs Imutáveis</span>
                                    <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded">Gráficos para Gestão</span>
                                </div>
                            </section>
                        </div>
                    </div>
                );
            case "usar":
                return (
                    <div className="space-y-8">
                        <h2 className="text-3xl font-black text-blue-900 tracking-tight">Guia de Operação Passo-a-Passo</h2>
                        <div className="space-y-6">
                            {[
                                { t: "Passo 1: Autenticação", d: "Acesse com seu e-mail institucional. O sistema utiliza Auth multifatorial. No primeiro acesso, troque sua senha imediatamente em 'Perfil'." },
                                { t: "Passo 2: Diagnóstico no Dashboard", d: "Observe o KPI de 'Prioridade Crítica'. Clique no número para abrir a lista detalhada dessas famílias." },
                                { t: "Passo 3: Busca Ativa", d: "No menu lateral, selecione 'Busca Ativa'. Filtre pelo seu território de Mauá para ver os endereços prioritários." },
                                { t: "Passo 4: Registro de Ações", d: "Após a visita social ou contato UBS, registre a evolução no sistema para que o indicador de risco seja recalculado." }
                            ].map((step, i) => (
                                <div key={i} className="flex gap-6 items-center p-5 bg-gray-50 rounded-3xl border border-gray-100">
                                    <div className="text-4xl font-black text-blue-100 italic">{i + 1}</div>
                                    <div>
                                        <h5 className="font-bold text-blue-900">{step.t}</h5>
                                        <p className="text-sm text-gray-500">{step.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case "lgpd":
                return (
                    <div className="space-y-8">
                        <h2 className="text-3xl font-black text-blue-900 tracking-tight">Conformidade LGPD</h2>
                        <div className="bg-green-600 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
                            <ShieldCheck size={120} className="absolute -right-8 -bottom-8 opacity-10" />
                            <h3 className="text-2xl font-black mb-4">Privacidade por Design</h3>
                            <p className="text-green-50 leading-relaxed text-sm">
                                O dado social e de saúde é **extremamente sensível**. Nosso sistema isola essas informações através de camadas criptográficas. O acesso é limitado estritamente à "Finalidade" e "Necessidade" do seu cargo público.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm">
                                <h5 className="font-bold text-gray-900 flex items-center gap-2 mb-2"><Lock size={16} className="text-blue-600" /> Audit Log</h5>
                                <p className="text-xs text-gray-500 leading-relaxed">Cada vez que você visualiza um CPF ou endereço, o sistema registra data, hora e seu ID de usuário para fins de transparência e auditoria.</p>
                            </div>
                            <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm">
                                <h5 className="font-bold text-gray-900 flex items-center gap-2 mb-2"><Cpu size={16} className="text-blue-600" /> Higienização</h5>
                                <p className="text-xs text-gray-500 leading-relaxed">Dados de usuários inativos ou fora do serviço público são anonimizados automaticamente após 5 anos de inatividade.</p>
                            </div>
                        </div>
                    </div>
                );
            case "faq":
                return (
                    <div className="space-y-8">
                        <h2 className="text-3xl font-black text-blue-900 tracking-tight">FAQ Detalhado</h2>
                        <div className="grid gap-4">
                            {[
                                { q: "O Secretário ou Prefeito pode ver nomes específicos?", a: "Não. A legislação veda o acesso de cargos puramente políticos a prontuários nominais. Eles visualizam apenas estatísticas e mapas agregados (Inteligência Estratégica)." },
                                { q: "Como o sistema calcula o Score de Risco?", a: "O cálculo é paramétrico. Ele atribui pesos a indicadores como: renda zero, gestante sem pré-natal, idoso sozinho, e situações de violência. A somatória gera a classificação (Crítica a Baixa)." },
                                { q: "Meus dados pessoais de servidor estão seguros?", a: "Sim. Seus logs e senhas são criptografados com o padrão AES-256 no Supabase, inacessíveis até mesmo para os desenvolvedores." },
                                { q: "Posso exportar os dados para o Excel?", a: "Sim, porém apenas usuários com perfil de Coordenador ou Gestor possuem essa permissão, devendo assinar um termo de compromisso digital ao baixar a planilha." },
                                { q: "O sistema funciona sem internet?", a: "Não. Por segurança de dados e sincronização em tempo real (Realtime), o acesso requer conexão estável com os servidores de Mauá." }
                            ].map((item, i) => (
                                <details key={i} className="group p-6 bg-white border border-gray-100 rounded-3xl shadow-sm transition-all hover:border-blue-300">
                                    <summary className="flex items-center justify-between cursor-pointer list-none font-bold text-gray-900 pr-4">
                                        <span>{item.q}</span>
                                        <X className="group-open:rotate-45 transition-transform text-gray-400" size={16} />
                                    </summary>
                                    <p className="mt-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-4">{item.a}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                );
            case "suporte":
                return (
                    <div className="space-y-10">
                        <h2 className="text-3xl font-black text-blue-900 tracking-tight">Suporte e Ouvidoria</h2>
                        <div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-10 rounded-[2.5rem] text-white shadow-2xl">
                            <div className="flex flex-col md:flex-row gap-12 items-center">
                                <div className="w-28 h-28 rounded-[2rem] bg-white text-blue-800 flex items-center justify-center shadow-lg animate-pulse">
                                    <PhoneCall size={52} />
                                </div>
                                <div className="space-y-6 text-center md:text-left">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-1">Central de Atendimento Mauá</p>
                                        <p className="text-4xl font-black">0800-SUAS-FACIL</p>
                                    </div>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-6">
                                        <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
                                            <MessageCircle size={20} className="text-green-400" />
                                            <span className="font-bold text-sm">(11) 99999-9999</span>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
                                            <Settings size={20} className="text-blue-300" />
                                            <span className="font-bold text-sm">suporte.tecnico@maua.sp.gov.br</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 text-center">
                            <h4 className="font-bold text-gray-900 mb-2">Treinamentos Presenciais</h4>
                            <p className="text-sm text-gray-500 leading-relaxed italic">
                                Para capacitações de equipes de novos CRAS ou UBS, favor abrir chamado com 15 dias de antecedência para agendamento com a consultoria técnica.
                            </p>
                        </div>
                    </div>
                );
            case "glossario":
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black text-blue-900 tracking-tight">Glossário Técnico Local</h2>
                        <div className="grid gap-4">
                            {[
                                { t: "SUAS", d: "Sistema Único de Assistência Social: Política pública de proteção social para quem dela necessitar." },
                                { t: "SUS", d: "Sistema Único de Saúde: Rede pública de saúde brasileira." },
                                { t: "Contrarreferência", d: "Ato de o profissional de saúde dar retorno ao profissional social sobre o caso encaminhado (fundamental para o Integra)." },
                                { t: "Vulnerabilidade", d: "Situação de risco pessoal ou social por fragilidade de vínculos ou falta de recursos." },
                                { t: "NIS", d: "Número de Identificação Social: A chave primária que conecta o cidadão às bases do Governo Federal." },
                                { t: "Território de Mauá", d: "Divisões geográficas administrativas que englobam a área de atuação de um determinado centro (ex: CRAS Macuco)." }
                            ].map(item => (
                                <div key={item.t} className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                                    <h4 className="font-black text-blue-600 uppercase text-xs tracking-widest mb-1">{item.t}</h4>
                                    <p className="text-gray-700 text-sm leading-relaxed">{item.d}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-300">
                        <Info size={64} className="mb-6 opacity-20" />
                        <h3 className="text-xl font-bold">Capítulo em Digitalização</h3>
                        <p className="text-sm mt-2">Clique em outro capítulo na barra lateral para continuar.</p>
                    </div>
                );
        }
    };

    const filteredChapters = useMemo(() => {
        if (!searchTerm) return chapters;
        return chapters.filter(ch =>
            ch.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ch.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] lg:h-[calc(100vh-2rem)] overflow-hidden bg-white lg:rounded-[2.5rem] shadow-2xl lg:m-4 border border-gray-100 ring-1 ring-black/5">
            {/* Mobile Chapter Selector */}
            <div className="lg:hidden p-3 border-b border-gray-200 bg-[#f8fafc]">
                <select
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                    {chapters.map(ch => (
                        <option key={ch.id} value={ch.id}>{ch.title}</option>
                    ))}
                </select>
            </div>

            {/* Left Sidebar - Chapters (desktop only) */}
            <div className="hidden lg:flex w-80 bg-[#f8fafc] border-r border-gray-200/50 flex-col">
                <div className="p-8 border-b border-gray-200/50 space-y-6">
                    <div>
                        <h1 className="text-2xl font-black text-[#0f172a] tracking-tight">Cento de Ajuda</h1>
                        <p className="text-[10px] uppercase font-bold text-blue-600 tracking-[0.2em] mt-2">Manual Oficial — Mauá / SP</p>
                    </div>

                    {/* Search Field */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Pesquisar manual..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors">
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {filteredChapters.map((ch) => {
                        const Icon = ch.icon;
                        const active = activeTab === ch.id;
                        return (
                            <button
                                key={ch.id}
                                onClick={() => setActiveTab(ch.id)}
                                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all relative overflow-hidden group ${active
                                        ? "bg-white text-blue-700 shadow-md ring-1 ring-blue-100"
                                        : "text-gray-500 hover:bg-gray-100/80 hover:text-gray-900"
                                    }`}
                            >
                                {active && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600" />}
                                <Icon size={20} className={active ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500 transition-colors"} />
                                <span className={`text-sm font-bold tracking-tight ${active ? "" : "opacity-80"}`}>{ch.title}</span>
                            </button>
                        );
                    })}
                    {filteredChapters.length === 0 && (
                        <div className="text-center py-12 px-6">
                            <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle size={24} className="text-gray-400" />
                            </div>
                            <p className="text-sm font-bold text-gray-900">Nenhum resultado</p>
                            <p className="text-xs text-gray-500 mt-1">Tente palavras-chave como 'LGPD', 'Busca' ou 'Suporte'.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-16 custom-scrollbar bg-white">
                <div className="max-w-3xl mx-auto">
                    {renderContent(activeTab)}
                </div>

                <div className="max-w-3xl mx-auto mt-32 pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                    <div className="flex items-center gap-2">
                        <img src="/logo_full.png" alt="Logo" className="h-4 w-auto object-contain" />
                    </div>
                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">
                        <span>Mauá / SP — Gestão 2024-2028</span>
                        <span>•</span>
                        <span>Documentação de Nível 1</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

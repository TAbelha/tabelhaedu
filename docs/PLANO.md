# PLANO: tabelhaedu v0

Plataforma de ensino white-label, básica e aberta. Uma organização (cursinho, escola, professor) monta o currículo como árvore, planeja o curso semana a semana até a data da prova, mantém um banco de questões com fórmulas e imagens e monta simulados. Os alunos entram por link, fazem o simulado online com tempo controlado pelo servidor e veem o resultado por área e tópico. Primeiro uso real: um cursinho pré-ENEM. Hospedado em Cloudflare Workers, multi-tenant por hostname. AGPL-3.0.

## Stack

| Camada     | Escolha                                                                  |
| ---------- | ------------------------------------------------------------------------ |
| Framework  | SvelteKit 3 + Svelte 5 (runes) + `@sveltejs/adapter-cloudflare` (Workers) |
| UI         | Tailwind CSS 4 + shadcn-svelte (style `nova`, base `mist`, lucide)       |
| DB         | Drizzle ORM 0.45 + D1 (um banco, `organization_id` nas linhas)           |
| Auth       | Better Auth + plugin `organization` + access control                     |
| Arquivos   | R2 (imagens de questões, logos), servido por rota do Worker              |
| Texto rico | Markdown + LaTeX (`markdown-it` + KaTeX), renderizado no save            |
| Validação  | zod 4                                                                    |
| Testes     | Vitest (lógica pura + SQLite em memória com as migrações reais)          |
| Runtime    | bun (Node >= 22.17 no CI)                                                |
| Datas      | `YYYY-MM-DD` pra calendário; inteiro ms UTC pra instantes; fuso da org   |

## Decisões (log)

| #   | Decisão                                                                                   | Razão                                                    |
| --- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| D1  | App único SvelteKit (staff, aluno, plataforma), sem monorepo                              | a tentativa com 5 apps travou                            |
| D2  | SvelteKit 3                                                                               | major atual; o adapter da Cloudflare exige               |
| D3  | Um D1 com `organization_id` nas linhas; tenant pelo hostname                              | 1 tenant real hoje; D1 por tenant tem caminho documentado |
| D4  | Tenant = `organization` do Better Auth + `org_settings`/`org_domain` próprios             | membros, convites e papéis prontos                       |
| D5  | Aluno não é membro da org; acesso vem da matrícula                                        | separa staff de aluno; sem limite de membros             |
| D6  | Permissões `recurso:ação`; papéis `owner`/`admin`/`teacher`                               | PBAC enxuto; escopo por matéria fica pra depois          |
| D7  | Identidade global (mesma conta em várias orgs; cookie por hostname)                       | consequência do D3                                       |
| D8  | Currículo = árvore genérica (`parent_id`, `path`, `depth`, `position`), até 6 níveis      | substitui assunto em texto solto                         |
| D9  | Currículo e banco de questões são da org; o curso aponta pro currículo                    | reaproveitar de uma turma pra outra                      |
| D10 | Questão em Markdown + `$…$`/`$$…$$`; HTML gerado no save e guardado                       | leitura sem custo; sem HTML cru (XSS)                    |
| D11 | Imagens no R2 via `/media/...`, cache imutável; sem SVG                                   | simples; SVG executa script                              |
| D12 | Simulado referencia a questão viva; mudar gabarito, peso ou anulação recalcula            | sem cópia duplicada; correção determinística             |
| D13 | Prazo da tentativa imposto no servidor; tentativa vencida fecha na próxima leitura        | não confiar no cronômetro do navegador; sem cron         |
| D14 | Nota clássica (não TRI), penalização opcional, piso zero por seção e no total             | regra conhecida e explicável                             |
| D15 | Cronograma do curso: carga semanal por matéria + tópicos na ordem da árvore               | é como cursinho planeja; algoritmo pequeno e testável    |
| D16 | Datas de calendário em texto; instantes em ms UTC; fuso da org (`America/Sao_Paulo`)      | sem bug de fuso na data da prova                         |
| D17 | Sem e-mail no v0: convites e links copiáveis na tela                                      | menos infra                                              |
| D18 | Nunca `db.transaction` (o D1 não tem); `db.batch` + inserts fatiados (<= 100 parâmetros)   | limites do D1                                            |
| D19 | Schema do Better Auth gerado pela CLI (`bun run auth:schema`), nunca à mão                | evita schema divergente                                  |
| D20 | Testes de domínio em SQLite em memória (libsql) com as migrações reais; sem Playwright    | mesmo dialeto, rápido                                    |
| D21 | Rotas de página em PT-BR; `/api/*` em inglês; código e comentários em inglês              | white-label brasileiro                                   |

## Infra Cloudflare

- Worker `tabelhaedu`
- D1 `tabelhaedu-db` (binding `DB`, `migrations_dir: "drizzle"`)
- R2 `tabelhaedu-media` (binding `MEDIA`)
- Vars: `APP_HOSTS` (hosts aceitos pelo auth, vírgula), `DEFAULT_ORG_SLUG` (org usada quando o host não está em `org_domain`)
- Secrets: `BETTER_AUTH_SECRET`, `PLATFORM_ADMINS` (e-mails, vírgula)
- Local: `.dev.vars` (fora do git) sobrescreve as vars; D1/R2 locais do wrangler
- Sem crons no v0

## Schema D1

```sql
-- Better Auth (gerado: bun run auth:schema)
user (id, name, email UNIQUE, emailVerified, image, createdAt, updatedAt)
session (id, userId, token UNIQUE, expiresAt, ipAddress, userAgent, activeOrganizationId, createdAt, updatedAt)
account (id, userId, accountId, providerId, password, ...)
verification (id, identifier, value, expiresAt)
organization (id, name, slug UNIQUE, logo, metadata, createdAt)          -- o tenant; logo = /media/<key>
member (id, organizationId, userId, role, createdAt)                     -- só staff
invitation (id, organizationId, email, role, status, expiresAt, inviterId)
rateLimit (id, key, count, lastRequest)

-- Tenant / white-label
org_domain (hostname PK, organization_id, is_primary, created_at)
org_settings (organization_id PK, primary_color, accent_color, radius, timezone DEFAULT 'America/Sao_Paulo', updated_at)
media (id, organization_id, key UNIQUE, content_type, size_bytes, uploaded_by, created_at)

-- Currículo
curriculum (id, organization_id, name, level_labels_json, created_at)
curriculum_node (id, organization_id, curriculum_id, parent_id NULL, name, depth, path, position,
                 default_minutes NULL, created_at)
  Índices: (curriculum_id, parent_id, position), (curriculum_id, path)

-- Curso + cronograma
course (id, organization_id, curriculum_id, name, slug, target_exam, starts_on, exam_date,
        join_code UNIQUE NULL, status, created_at, updated_at)            UNIQUE(organization_id, slug)
course_subject_load (course_id, node_id, weekly_minutes)                  PK(course_id, node_id)
schedule_entry (id, course_id, node_id NULL, week_start, minutes, title NULL, kind, source, position, created_at)
  Índice: (course_id, week_start)                                         kind: aula|revisao|outro; source: auto|manual
schedule_break (id, course_id, week_start, label)                         UNIQUE(course_id, week_start)

-- Banco de questões
question (id, organization_id, statement_md, statement_html, alternatives_json, answer_key,
          solution_md, solution_html, source NULL, year NULL, difficulty NULL, status,
          created_by, created_at, updated_at, deleted_at NULL)
  Índice: (organization_id, deleted_at, created_at)
question_node (question_id, node_id)                                      PK composto; índice (node_id)

-- Simulados
exam (id, organization_id, course_id, title, instructions_md, instructions_html, status,
      opens_at NULL, closes_at NULL, duration_minutes NULL, negative_marking, allow_late, allow_retake,
      results_release, results_released_at NULL, show_ranking, created_by, published_at NULL,
      created_at, updated_at)                                             results_release: on_submit|after_close|manual
exam_item (id, exam_id, question_id RESTRICT, position, weight, section_node_id NULL, voided)
  UNIQUE(exam_id, question_id)

-- Aluno
enrollment (id, organization_id, course_id, email, user_id NULL, origin, status, created_at, activated_at NULL)
  UNIQUE(course_id, email); índice (user_id)                              origin: join_link|roster|staff
exam_attempt (id, organization_id, exam_id, user_id, number, started_at, deadline_at NULL, submitted_at NULL,
              status, is_official, score_points NULL, max_points NULL, result_json NULL, graded_at NULL)
  UNIQUE(exam_id, user_id, number)
exam_answer (attempt_id, exam_item_id, choice NULL, answered_at)          PK composto
```

## Papéis e permissões

| Permissão                                   | owner | admin | teacher |
| ------------------------------------------- | :---: | :---: | :-----: |
| `organization:update` (marca, domínios)     |   x   |   x   |         |
| `member:*`, `invitation:*`                  |   x   |   x   |         |
| `course:*`, `enrollment:*`                  |   x   |   x   |         |
| `curriculum:*`, `schedule:update`           |   x   |   x   |    x    |
| `question:*`                                |   x   |   x   |    x    |
| `exam:create/update/publish`                |   x   |   x   |    x    |
| `exam:delete`                               |   x   |   x   |         |
| `results:read/release`                      |   x   |   x   |    x    |

Aluno não tem papel: o acesso vem de matrícula ativa no curso.

## Fases

### Fase 0: Fundação

- [ ] Scaffold: `sv create` (Kit 3, TS, Tailwind 4 + typography, ESLint, Prettier, Vitest, adapter Cloudflare Workers) + `shadcn-svelte init` (nova, mist, lucide)
- [ ] ESLint barra APIs do Kit 2 (`$lib`, `$app/environment`, `$app/stores`), `cloudflare:workers` fora de `platform.ts` e `db.transaction`
- [ ] `wrangler.jsonc` com `DB` e `MEDIA`; `wrangler types` no check e no build
- [ ] Drizzle: schema por domínio, `db:generate`, migração local/remota via wrangler, helper de teste com SQLite em memória, `chunkRows`
- [ ] Better Auth (e-mail + senha, sessão e rate limit no D1) + plugin `organization` (owner/admin/teacher); schema gerado pela CLI
- [ ] Tenant pelo hostname (`org_domain`, fallback `DEFAULT_ORG_SLUG`) no `hooks.server.ts`
- [ ] White-label: nome, logo, cor primária e de acento, raio, fuso; tema injetado no SSR (sem flash)
- [ ] Upload pro R2 (png, jpeg, webp, gif até 5 MB) + leitura pública `/media/...` com cache imutável
- [ ] Shell: `/login`, `/cadastro`, landing da org, sidebar do admin, `/admin/organizacao`, `/admin/equipe` (convite por link), `/convite/[id]`, `/plataforma` (criar organização)
- [ ] Headers de segurança + CSP
- [ ] CI: check, lint, test, build (Node 24 + bun)
- [ ] README EN/PT-BR (padrão TAbelha), LICENSE AGPL-3.0, CHANGELOG
- [ ] Deploy em `*.workers.dev`

Pronto quando: o Ian cria a org do cursinho em `/plataforma`, troca logo e cor, convida um professor por link e o app abre com a cara do cursinho em produção.

### Fase 1: Cursos e currículo

- [ ] `curriculum` + `curriculum_node` com rótulos de nível por currículo
- [ ] Editor de árvore: adicionar filho, renomear, subir/descer, mover pra outro pai (bloqueia ciclo), excluir (bloqueia se o nó ou um descendente estiver em uso)
- [ ] Template ENEM (4 áreas, matérias e tópicos tirados da Matriz de Referência do INEP), aplicado como cópia editável
- [ ] `course`: nome, slug, prova-alvo, início, data da prova, currículo, status
- [ ] Telas `/admin/curriculos`, `/admin/curriculos/[id]`, `/admin/cursos`, `/admin/cursos/[slug]`

Pronto quando: existe o curso "ENEM 2027", com data da prova, ligado a um currículo ENEM editado pelo Ian.

### Fase 2: Cronograma

- [ ] Semanas do curso (começam na segunda; do início até a semana da prova) + semanas bloqueadas (férias, feriados)
- [ ] Grade horária: minutos por semana por matéria
- [ ] Carga por tópico (`default_minutes`, padrão 100 min)
- [ ] Geração determinística por matéria: folhas em ordem da árvore, enchendo a carga semanal, quebrando um tópico entre semanas quando precisar; lista o que não coube
- [ ] Edição manual: mover entrada de semana, excluir, adicionar entrada livre (revisão, aulão); regenerar só troca as entradas automáticas da matéria
- [ ] `/admin/cursos/[slug]/cronograma` com visão por semana e por matéria

Pronto quando: o cronograma cobre todas as semanas até a prova, avisa o que não coube e o Ian ajusta à mão.

### Fase 3: Banco de questões

- [ ] Pipeline de texto rico: Markdown + `$…$`/`$$…$$` (KaTeX), HTML cru escapado, render no save
- [ ] Editor: textarea + barra (negrito, itálico, fórmula, imagem) + prévia ao vivo; colar imagem sobe pro R2
- [ ] Questão objetiva: enunciado, 2 a 5 alternativas (A a E), gabarito, resolução, fonte, ano, dificuldade, status (rascunho ou pronta)
- [ ] Marcação em nós do currículo (N:N), com busca por nome mostrando o caminho
- [ ] Lista com filtros (nó com descendentes, dificuldade, fonte, ano, texto, status) e paginação
- [ ] Exclusão lógica; questão usada em simulado não pode ser excluída

Pronto quando: o Ian cadastra questões com fórmula e imagem, marca nos tópicos e acha elas filtrando pela árvore.

### Fase 4: Simulados (montagem)

- [ ] `exam` ligado a um curso: título, instruções, abertura e fechamento (no fuso da org), duração opcional, penalização por erro, início atrasado, refação, política de divulgação, ranking visível
- [ ] Montagem manual: busca no banco (mesmos filtros), adicionar, ordenar, peso por questão, seção (padrão: a área da questão)
- [ ] Validação de publicação, com a lista de problemas
- [ ] Depois de publicado, os itens travam (adicionar, remover, reordenar); peso, seção e anulação continuam editáveis
- [ ] Prévia como aluno (sem gabarito)
- [ ] Simulados aparecem no cronograma na semana da abertura

Pronto quando: o primeiro simulado do curso está publicado, com janela e duração.

### Fase 5: Lado do aluno

- [ ] Matrícula pelo link do curso (`/matricula/[código]`), colando uma lista (nome;email) ou pelo staff; remover aluno; gerar novo código
- [ ] Matrícula pendente por e-mail ativa quando alguém entra com aquele e-mail na org
- [ ] Home do aluno: cursos, cronograma da semana, simulados abertos, futuros e feitos
- [ ] Fazer simulado: iniciar, navegar, resposta salva a cada clique, cronômetro pelo prazo do servidor, entregar com confirmação
- [ ] Prazo imposto no servidor (30 s de folga de rede); tentativa vencida fecha na próxima leitura
- [ ] Correção automática na entrega; tentativa oficial vs refação ou atraso
- [ ] Gabarito e resolução nunca vão pro navegador antes da divulgação
- [ ] Recalcular resultados quando muda gabarito, peso, seção ou anulação

Pronto quando: um aluno de teste entra pelo link, faz o simulado no celular e vê a nota quando a política deixa.

### Fase 6: Resultados

- [ ] Aluno: nota, acertos, por seção, por tópico (em profundidade escolhida), revisão questão a questão com resolução, posição no ranking (se ligado)
- [ ] Organizador: tabela de tentativas, % de acerto e distribuição A–E por questão, desempenho da turma por tópico
- [ ] Divulgação manual
- [ ] Exportar CSV (separador `;`, UTF-8 com BOM, sem injeção de fórmula)

Pronto quando: depois do simulado, o Ian vê por tópico onde a turma errou e exporta a planilha.

## Depois (fora do básico)

- Redação e correção com IA; questões discursivas
- TRI (nota no estilo ENEM)
- Vídeos, materiais em PDF, flashcards, trilha gamificada
- Pagamentos e checkout, assinatura do tenant, assentos
- Plano de estudos adaptativo por aluno
- Chat e atendimento, fórum, MCP, apps nativos, PWA e prova offline
- E-mail transacional (convite, reset de senha, verificação)
- Permissão com escopo por matéria, papéis custom por org, responsável com acesso de leitura
- Turmas dentro do curso; feature flags por tenant
- Domínio próprio de cliente (Cloudflare for SaaS); D1 por tenant
- Busca full-text (FTS5), importação de questões em lote, editor WYSIWYG (Tiptap lendo Markdown)
- Arrastar e soltar na árvore e no cronograma; comparação entre simulados; login social

## Ideias emprestadas (regras que já funcionaram em plataformas de ensino)

- Currículo como espinha: questão, cronograma e simulado apontam pra nós de uma árvore real, nunca pra "assunto" em texto solto.
- Matrícula é a primitiva de acesso do aluno e tem origem (link, lista, staff); aluno não ganha papel de staff.
- Permissões atômicas `recurso:ação`; papel é só um pacote de permissões.
- Simulado montado à mão: questões escolhidas e numeradas, com peso e seção por item.
- Publicar valida: tem questões, todas com gabarito, janela coerente, duração positiva.
- Pontuação: acerto soma o peso; erro subtrai o peso só com penalização ligada; branco vale zero. Piso zero por seção e no total, calculados de forma independente.
- Questão anulada conta como acerto pra todo mundo.
- Tentativa oficial = a primeira, entregue até o fechamento + 10 min de tolerância. Refação e entrega atrasada geram resultado só pro aluno, fora do ranking.
- Ranking com empate dividindo a posição (1, 1, 3).
- Estatística da turma por questão: % de acerto e distribuição das alternativas.
- Gabarito fica no servidor; o cliente só recebe depois da divulgação.
- Questão usada em simulado não é apagada; mudar o gabarito recalcula os resultados.
- Cronograma parte de data final + tópicos com carga + orçamento de tempo, com alocação determinística e edição manual por cima, não um otimizador opaco.

## Riscos

1. **SvelteKit 3 é recente (out/2026)**: libs atrasadas (PWA) e código gerado com API do Kit 2. Mitigação: ESLint barra os imports antigos.
2. **Workers Free (10 ms de CPU)**: o hash de senha (scrypt) pode estourar. Confirmar o plano pago ou trocar por hash PBKDF2 nativo.
3. **Sem e-mail no v0**: não há reset de senha, e a matrícula por lista ativa por e-mail sem verificação.
4. **Identidade global entre orgs**: o mesmo e-mail é a mesma conta em todas as marcas.
5. **Nota clássica não é TRI**: aluno de ENEM pode esperar TRI.

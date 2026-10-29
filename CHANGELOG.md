# Changelog

Todas as mudanças relevantes deste projeto ficam registradas aqui.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

### Adicionado

- Fase 0 da plataforma: SvelteKit 3 em Cloudflare Workers com D1 e R2, shadcn-svelte e Tailwind 4.
- Login e cadastro por e-mail e senha (Better Auth), com organizações, papéis (dono, administrador, professor) e permissões `recurso:ação`.
- Instituição resolvida pelo endereço, com nome, logo, cores, cantos arredondados e fuso horário próprios, aplicados no servidor.
- Upload de imagens para o R2 (PNG, JPEG, WebP e GIF até 5 MB).
- Telas de administração (organização e equipe), convite por link e criação de instituições pela plataforma.

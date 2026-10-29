<div align="center">

# TAbelhaEdu

**Plataforma de ensino white-label: currículo, cronograma, banco de questões e simulados para qualquer escola ou cursinho.**

[English](README.md) · **Português**

[![TypeScript](https://img.shields.io/badge/language-TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)](tsconfig.json)
[![Built with Bun](https://img.shields.io/badge/built%20with-Bun-fbf0df?style=flat-square&logo=bun&logoColor=black)](https://bun.sh)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-Svelte-ff3e00?style=flat-square&logo=svelte&logoColor=white)](https://kit.svelte.dev)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-orange?style=flat-square&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)
[![License: AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-blue?style=flat-square)](LICENSE)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/ianptkcs)

</div>

---

## O que é

O TAbelhaEdu é uma plataforma aberta e white-label para quem ensina: escola, cursinho, departamento de universidade ou professor sozinho. Cada instituição tem nome, logo, cores e domínio próprios, e monta o curso em cima de uma árvore de currículo de verdade, para a qual todo conteúdo aponta.

O primeiro uso real é um cursinho pré-ENEM: planejar o curso semana a semana até a data da prova, manter um banco de questões com fórmulas e imagens e montar simulados que os alunos fazem online. A Fase 0 (instituições, marca, equipe e login) está pronta; o plano das próximas fases fica em [docs/PLANO.md](docs/PLANO.md).

## Como funciona

1. O endereço (hostname) decide qual instituição a pessoa vê, com título e tema renderizados no servidor (sem piscar o tema padrão).
2. A equipe (dono, administrador, professor) entra por link de convite; permissões são pares `recurso:ação` e papéis são pacotes delas.
3. Aluno nunca vira membro da equipe: o acesso dele vem da matrícula no curso (chega numa fase seguinte).
4. Tudo roda em Cloudflare Workers, com um banco D1 particionado por instituição e imagens no R2.

## Rodando localmente

```sh
bun install
cp .dev.vars.example .dev.vars   # defina BETTER_AUTH_SECRET (openssl rand -hex 32) e PLATFORM_ADMINS (seu e-mail)
bun run db:migrate:local
bun run dev
```

Cadastre-se com o e-mail listado em `PLATFORM_ADMINS`, abra `/plataforma` e crie uma instituição com o domínio `localhost`. Recarregue e o app mostra o nome e as cores dessa instituição.

## Desenvolvimento

Stack e comandos: ver _Rodando localmente_ acima. Testes:

```sh
bun run check
bun run lint
bun run test
```

## Changelog

Veja [CHANGELOG.md](CHANGELOG.md) para o histórico de versões.

## Apoie o projeto

- **Global**: [ko-fi.com/ianptkcs](https://ko-fi.com/ianptkcs)
- **Brasil (Pix)**: escaneie o QR abaixo ou copie o código

  <img src="pix-qr.png" alt="Pix QR" width="200" />

  <details><summary>Código Pix (copiar)</summary>

  ```
  00020126580014BR.GOV.BCB.PIX01365ad933b0-dcdc-4525-a736-0759902aeec65204000053039865802BR5925Ian Patrick da Costa Soar6009SAO PAULO62140510tQA85x6Dov63041FB6
  ```

  </details>

## Licença

[AGPL-3.0](LICENSE) — copyleft forte: você pode usar, modificar e até
hospedar o TAbelhaEdu comercialmente, mas qualquer versão modificada,
incluindo uma rodando como serviço de rede (SaaS), tem que continuar open
source sob a mesma licença.

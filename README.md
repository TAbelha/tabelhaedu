<div align="center">

# TAbelhaEdu

**A white-label teaching platform: curriculum, schedule, question bank and mock exams for any school or prep course.**

**English** · [Português](README.pt-BR.md)

[![TypeScript](https://img.shields.io/badge/language-TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)](tsconfig.json)
[![Built with Bun](https://img.shields.io/badge/built%20with-Bun-fbf0df?style=flat-square&logo=bun&logoColor=black)](https://bun.sh)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-Svelte-ff3e00?style=flat-square&logo=svelte&logoColor=white)](https://kit.svelte.dev)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-orange?style=flat-square&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)
[![License: AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-blue?style=flat-square)](LICENSE)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/ianptkcs)

</div>

---

## What it is

TAbelhaEdu is an open, white-label platform for anyone who teaches: a school, a prep course, a university department or a single teacher. Each organization gets its own name, logo, colors and domain, and builds its course on top of a real curriculum tree that every piece of content points to.

The first real use is an ENEM prep course: plan the course week by week until the exam date, keep a question bank with math formulas and images, and assemble mock exams that students take online. Phase 0 (organizations, branding, team and sign-in) is done; the plan for the next phases lives in [docs/PLANO.md](docs/PLANO.md).

## How it works

1. The hostname decides which organization a visitor sees, with its title and theme rendered on the server (no flash of the default theme).
2. Staff (owner, admin, teacher) join through invitation links; permissions are atomic `resource:action` pairs and roles are bundles of them.
3. Students never become staff: their access comes from course enrollment (coming in a later phase).
4. Everything runs on Cloudflare Workers, with one D1 database partitioned by organization and images stored in R2.

## Running locally

```sh
bun install
cp .dev.vars.example .dev.vars   # set BETTER_AUTH_SECRET (openssl rand -hex 32) and PLATFORM_ADMINS (your e-mail)
bun run db:migrate:local
bun run dev
```

Sign up with the e-mail listed in `PLATFORM_ADMINS`, open `/plataforma` and create an organization with the domain `localhost`. Reload and the app shows that organization's name and colors.

## Development

Stack and commands: see _Running locally_ above. Tests:

```sh
bun run check
bun run lint
bun run test
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for the version history.

## Support the project

- **Global**: [ko-fi.com/ianptkcs](https://ko-fi.com/ianptkcs)
- **Brazil (Pix)**: scan the QR below or copy the code

  <img src="pix-qr.png" alt="Pix QR" width="200" />

  <details><summary>Pix code (copy)</summary>

  ```
  00020126580014BR.GOV.BCB.PIX01365ad933b0-dcdc-4525-a736-0759902aeec65204000053039865802BR5925Ian Patrick da Costa Soar6009SAO PAULO62140510tQA85x6Dov63041FB6
  ```

  </details>

## License

[AGPL-3.0](LICENSE) — strong copyleft: you may use, modify and even host
TAbelhaEdu commercially, but any modified version, including one running
as a network service (SaaS), has to stay open source under the same license.

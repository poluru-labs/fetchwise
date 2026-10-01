# Security Policy

## Supported versions

Security fixes go to the latest published release line.

| Version | Supported |
| --- | --- |
| 0.1.x | Yes |
| older | No |

## Reporting a vulnerability

**Do not** open a public GitHub issue, discussion, or pull request for a security report.

Report privately through GitHub Security Advisories:

[Report a vulnerability](https://github.com/poluru-labs/fetchwise/security/advisories/new)

Include as much of the following as you can:

- Affected package version (`@poluru-labs/fetchwise`)
- Runtime (Node, browser, Deno, Bun, Worker) and version
- A clear description of the issue and its impact
- Steps to reproduce, or a minimal proof of concept
- Any known workarounds

## What to expect

We follow [coordinated vulnerability disclosure](https://github.blog/changelog/2019-10-03-github-security-advisories-now-with-cve-id-requests/).

| Step | Target |
| --- | --- |
| Acknowledge the report | within 48 hours |
| Initial assessment | within 7 days |
| Fix or mitigation, when confirmed | as soon as practical; we aim for 90 days or an agreed date |

If the report is accepted, we will:

1. Work on a fix in private
2. Publish a patched release
3. Credit you in the advisory if you want to be named
4. Request a CVE when the issue meets that bar

If the report is declined, we will say why (for example: not a vulnerability, already fixed, or outside this project's scope).

## Scope

In scope:

- Vulnerabilities in the `@poluru-labs/fetchwise` source and published package
- Secrets or unsafe defaults in this repository that could harm consumers

Out of scope:

- Bugs that are not security issues (use a [bug report](https://github.com/poluru-labs/fetchwise/issues/new/choose))
- Issues only in applications that use this library
- Denial of service against third-party APIs
- Reports that need physical access, stolen credentials, or social engineering

## Preferred languages

English.

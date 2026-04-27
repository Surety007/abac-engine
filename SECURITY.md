# Security Policy

`@surety007/abac-engine` is an authorization library. Vulnerabilities here can
lead to access-control bypass in any application that depends on it, so we take
security reports seriously and treat them as a priority.

## Supported versions

We provide security fixes for the latest minor release line on npm.

| Version | Supported |
| ------- | --------- |
| Latest `1.x` published to `@surety007/abac-engine` | ✅ |
| Older `1.x` minor releases | ⚠️ Best effort, upgrade recommended |
| `0.x` and pre-fork (`abac-engine`) versions | ❌ |

## Reporting a vulnerability

**Please do not open a public GitHub issue, discussion, or pull request for
suspected vulnerabilities.**

Use one of the following private channels:

1. **Preferred — GitHub private vulnerability reporting:**
   <https://github.com/Surety007/abac-engine/security/advisories/new>
2. **Email:** security@surety007.com

Include as much of the following as you can:

- A description of the issue and the impact (e.g. policy bypass, privilege
  escalation, denial of service, prototype pollution).
- The affected version(s) of `@surety007/abac-engine`.
- A minimal reproduction: policy JSON, request/context, and the expected vs.
  actual decision.
- Any known mitigations or workarounds.

## What to expect

- **Acknowledgement:** within 3 business days.
- **Triage and severity assessment:** within 7 business days, using CVSS 3.1.
- **Fix target:**
  - Critical / High: patch release as soon as a fix is validated.
  - Medium: rolled into the next scheduled patch release.
  - Low: addressed in the next minor release.
- **Disclosure:** coordinated with the reporter. We will request a CVE through
  GitHub's advisory workflow and credit the reporter unless they prefer to
  remain anonymous.

## Scope

In scope:

- Source code under `src/` published as `@surety007/abac-engine` on npm.
- Build and release tooling under `.github/workflows/` that affects the
  integrity of published artifacts.

Out of scope:

- Vulnerabilities in example code under `examples/` that is not published.
- Issues that require an attacker who already has the ability to author or load
  arbitrary policies (policy authoring is a trusted operation by design — see
  [docs/POLICY_GUIDE.md](docs/POLICY_GUIDE.md)).
- Vulnerabilities solely in third-party dependencies; please report those
  upstream. We will, however, ship updated dependency versions in a patch
  release once a fix is available.

## Supply-chain integrity

Releases are published from GitHub Actions with [npm provenance][provenance]
enabled. Verify a published version with:

```sh
npm view @surety007/abac-engine@<version> --json | jq '.dist'
```

The `attestations` and `signatures` fields should be present for every release
cut after the move to `@surety007/abac-engine`.

[provenance]: https://docs.npmjs.com/generating-provenance-statements

# Maintainers

`@surety007/abac-engine` is an open-source fork of
[`astralstriker/abac-engine`](https://github.com/astralstriker/abac-engine),
maintained by Surety007 for use across our products (notably
[`s7-for-insurers`](https://github.com/Surety007/s7-for-insurers)) and the
broader community.

This document describes who maintains the project, how decisions are made, and
what is expected of contributors who take on a maintainer role.

## Governance model

We follow an **open source, controlled-merge** model:

- Anyone may open issues, start discussions, and submit pull requests.
- Only members of the `@Surety007/abac-engine-maintainers` team can approve and
  merge changes to `main`.
- The branch ruleset on `main` enforces:
  - 1 approving review,
  - Code Owner review (see [.github/CODEOWNERS](.github/CODEOWNERS)),
  - Linear history (squash-only merges),
  - Signed commits,
  - No force-pushes,
  - No bypass — rules apply to maintainers and admins alike.

Releases are cut from `main` by a maintainer and published by the
[`publish.yml`](.github/workflows/publish.yml) workflow.

## Current maintainers

| Role     | GitHub handle | GitHub permission | Responsibilities |
| -------- | ------------- | ----------------- | ---------------- |
| Lead     | anil@suretyseven.com         | Admin             | Release approval, npm token rotation, governance |
| Maintainer | anil@suretyseven.com       | Maintain          | PR review, triage, releases |

> Update this table whenever the maintainer set changes. The list must always
> contain at least two people: one with `Admin` and one with `Maintain`
> permission, per our adoption plan.

The `@Surety007/abac-engine-maintainers` GitHub team is the source of truth for
permissions and Code Owner review; this file mirrors it for human readers.

## Maintainer responsibilities

Maintainers are expected to:

- Triage new issues and discussions within roughly one week.
- Review pull requests fairly, focusing on correctness, security, API stability,
  and test coverage.
- Keep the `main` branch green (CI passing) at all times.
- Cut releases following [Releases](#releases) below.
- Respond to security reports per [SECURITY.md](SECURITY.md).
- Avoid self-merging non-trivial changes; request review from another
  maintainer.

## Becoming a maintainer

We add maintainers based on sustained, high-quality contributions, not on
employer or affiliation. Typical path:

1. Contribute several merged PRs (features, fixes, docs, or reviews).
2. Demonstrate good judgement on issue triage and PR review.
3. An existing maintainer nominates you in a private discussion among
   maintainers.
4. Lazy consensus among current maintainers (no objections within 7 days)
   approves the addition.
5. The lead maintainer adds you to the `@Surety007/abac-engine-maintainers`
   team with `Maintain` permission and updates this file.

Maintainers may step down at any time by opening a PR removing themselves from
this file. Inactive maintainers (no review, triage, or release activity for
6 months) may be moved to an "Emeritus" section by lazy consensus.

## Decision making

- **Routine changes** (bug fixes, dependency bumps, docs): handled via standard
  PR review.
- **API changes, new public surface, breaking changes**: require an issue or
  discussion first, and review from at least two maintainers.
- **Governance changes** (this file, [CODEOWNERS](.github/CODEOWNERS),
  [SECURITY.md](SECURITY.md), branch ruleset, npm publishing setup): require
  approval from the lead maintainer.

Disagreements are resolved by discussion. If consensus cannot be reached, the
lead maintainer makes the final call and documents the rationale in the PR or
issue.

## Releases

We publish to npm as `@surety007/abac-engine` with public access.

To cut a release:

1. Ensure `main` is green and `CHANGELOG.md` is up to date.
2. Bump the version in `package.json` following [Semantic Versioning][semver]
   on a short-lived branch and open a PR.
3. After merge, tag the commit on `main` as `v<version>` and create a GitHub
   Release with the changelog notes.
4. The [`publish.yml`](.github/workflows/publish.yml) workflow runs in the
   `npm-publish` environment and publishes the package with provenance.
5. Verify the release with `npm view @surety007/abac-engine@<version>`.

The `NPM_TOKEN` secret used by the publish workflow is an automation token
scoped to `@surety007/abac-engine` and is rotated by the lead maintainer at
least annually or whenever a maintainer with access leaves the team.

## Relationship to the upstream project

We track the upstream `astralstriker/abac-engine` repository for ideas and
fixes, but we do not promise to stay in lockstep. Notable upstream-derived
changes are credited in [CHANGELOG.md](CHANGELOG.md).

[semver]: https://semver.org/

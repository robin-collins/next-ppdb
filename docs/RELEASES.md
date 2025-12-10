# Release Process

This document outlines the steps required to release a new version of the `ppdb-app` and automatically publish the Docker image to the GitHub Container Registry (GHCR).

## Prerequisites

- Access to the GitHub repository with permission to create releases.
- A clean working directory on the `main` branch.

## Versioning Strategy

We follow [Semantic Versioning](https://semver.org/) (SemVer): `MAJOR.MINOR.PATCH`.

- **MAJOR**: Incompatible API changes.
- **MINOR**: Backward-compatible functionality.
- **PATCH**: Backward-compatible bug fixes.

## Release Steps

### 1. Prepare the Release

1.  **Update CHANGELOG.md**:
    - Move `[Unreleased]` changes to a new version section (e.g., `## [1.0.0] - 2025-12-02`).
    - Ensure all changes are correctly categorized (Added, Changed, Fixed, etc.).

2.  **Update package.json**:
    - Bump the `version` field in `package.json` to match the new release version.
    - Example: `"version": "1.0.0"`

3.  **Commit Changes**:
    ```bash
    git add CHANGELOG.md package.json
    git commit -m "chore: release v1.0.0"
    git push origin main
    ```

### 2. Create GitHub Release

1.  Go to the **Releases** section of the repository on GitHub.
2.  Click **Draft a new release**.
3.  **Choose a tag**:
    - Create a new tag matching your version (e.g., `v1.0.0`).
    - _Note: The `v` prefix is standard for tags._
4.  **Target**: `main` (or the specific commit you just pushed).
5.  **Release title**: `v1.0.0` (or a descriptive title).
6.  **Describe this release**:
    - Paste the content from your `CHANGELOG.md` for this version.
    - You can use the "Generate release notes" button to get a starting point, but ensure it aligns with the changelog.
7.  **Publish release**:
    - Click **Publish release**.

### 3. Automated Build & Publish

Once the release is published, the **GitHub Actions** workflow (`.github/workflows/docker-publish.yml`) will automatically trigger.

1.  **Monitor Progress**:
    - Go to the **Actions** tab in the repository.
    - You should see a workflow run named "Docker" or similar running.
2.  **Verify Artifact**:
    - Once the workflow completes successfully (green checkmark), go to the main repository page.
    - Look for the **Packages** section (usually in the right sidebar).
    - You should see the `next-ppdb` (or repository name) package updated with the new tag (`v1.0.0`) and `latest`.
    - to pull the image you will need to first authenticate to the ghcr with docker using `echo "${GITHUB_TOKEN}" | docker login ghcr.io -u robin-collins --password-stdin`
    - then you can pull the image using `docker pull ghcr.io/robin-collins/next-ppdb:latest`

## Troubleshooting

- **Workflow Failed**: Check the logs in the **Actions** tab. Common issues include:
  - Missing secrets (though `GITHUB_TOKEN` is automatic).
  - Docker build failures (check Dockerfile).
  - Permissions issues (ensure the workflow has `packages: write` permission).
- **Image Not Visible**: Ensure your package visibility settings allow you to see it (Packages -> Package Settings).

## Rollback

If a release is broken:

1.  **Do not delete the tag** immediately if it breaks history, but you can mark the release as "Pre-release" to discourage use.
2.  Fix the issue in `main`.
3.  Release a new patch version (e.g., `v1.0.1`).

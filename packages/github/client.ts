import type { Octokit } from '@octokit/rest';
import { createOctokit } from './index';

export class GitHubClient {
  private octokit: Octokit;

  constructor(private installationId: string) {
    this.octokit = createOctokit(installationId);
  }

  /**
   * list all repositories accessible to the installation
   */
  async listRepositories() {
    const { data } = await this.octokit.apps.listReposAccessibleToInstallation({
      per_page: 100,
    });
    return data.repositories;
  }

  /**
   * get a specific repository
   */
  async getRepository(owner: string, repo: string) {
    const { data } = await this.octokit.repos.get({ owner, repo });
    return data;
  }

  /**
   * get clone url with installation token
   */
  async getAuthenticatedCloneUrl(owner: string, repo: string) {
    // create installation access token
    const { data } = await this.octokit.apps.createInstallationAccessToken({
      installation_id: Number.parseInt(this.installationId),
    });

    return {
      url: `https://x-access-token:${data.token}@github.com/${owner}/${repo}.git`,
      expiresAt: new Date(data.expires_at),
    };
  }

  /**
   * create a branch
   */
  async createBranch(
    owner: string,
    repo: string,
    branchName: string,
    baseBranch = 'main'
  ) {
    // get the base branch reference
    const { data: ref } = await this.octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${baseBranch}`,
    });

    // create new branch
    await this.octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: ref.object.sha,
    });
  }

  /**
   * create a pull request
   */
  async createPullRequest(params: {
    owner: string;
    repo: string;
    title: string;
    body: string;
    head: string;
    base?: string;
  }) {
    const { data } = await this.octokit.pulls.create({
      ...params,
      base: params.base || 'main',
    });
    return data;
  }

  /**
   * get file contents
   */
  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ) {
    const { data } = await this.octokit.repos.getContent({
      owner,
      repo,
      path,
      ref,
    });

    if ('content' in data && data.type === 'file') {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    throw new Error('not a file');
  }

  /**
   * list commits on a branch
   */
  async listCommits(owner: string, repo: string, branch: string, since?: Date) {
    const { data } = await this.octokit.repos.listCommits({
      owner,
      repo,
      sha: branch,
      since: since?.toISOString(),
      per_page: 100,
    });
    return data;
  }
}

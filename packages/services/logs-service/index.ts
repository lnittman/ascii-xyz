import { Octokit } from '@octokit/rest';
import { db, eq, schema } from '@repo/database';

export interface GitHubRepo {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  private: boolean;
  defaultBranch: string;
  pushedAt: string | null;
  analysisEnabled?: boolean;
}

export class LogsService {
  // Helper to get or create logs settings in AI settings enabledModels field
  private static async getLogsMetadata(userId: string) {
    const [settings] = await db
      .select()
      .from(schema.aiSettings)
      .where(eq(schema.aiSettings.userId, userId))
      .limit(1);

    const enabledModels = (settings?.enabledModels as any) || {};
    return {
      settings,
      logsData: enabledModels.logs || {
        globalLogsEnabled: true,
        githubToken: null,
        githubUser: null,
        repositories: [],
      },
    };
  }

  // Helper to update logs metadata
  private static async updateLogsMetadata(userId: string, logsData: any) {
    const { settings } = await this.getLogsMetadata(userId);
    
    if (settings) {
      const currentEnabledModels = (settings.enabledModels as any) || {};
      await db
        .update(schema.aiSettings)
        .set({
          enabledModels: {
            ...currentEnabledModels,
            logs: logsData,
          },
          updatedAt: new Date(),
        })
        .where(eq(schema.aiSettings.id, settings.id));
    } else {
      await db.insert(schema.aiSettings).values({
        id: `aisettings_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        userId,
        enabledModels: { logs: logsData },
      });
    }
  }

  static async connectGitHub(userId: string, accessToken: string) {
    const octokit = new Octokit({ auth: accessToken });
    
    const { data: user } = await octokit.users.getAuthenticated();
    
    const { logsData } = await this.getLogsMetadata(userId);
    
    await this.updateLogsMetadata(userId, {
      ...logsData,
      githubToken: accessToken,
      githubUser: user.login,
    });

    return { success: true, username: user.login };
  }

  static async fetchGitHubRepos(userId: string) {
    const { logsData } = await this.getLogsMetadata(userId);
    
    const githubToken = logsData.githubToken;
    if (!githubToken) {
      return { success: false, error: 'GitHub not connected', repos: [] };
    }

    const octokit = new Octokit({ auth: githubToken });

    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      per_page: 100,
      sort: 'pushed',
      direction: 'desc',
    });

    const githubRepos: GitHubRepo[] = repos.map((repo) => ({
      id: repo.id.toString(),
      owner: repo.owner.login,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      language: repo.language,
      private: repo.private,
      defaultBranch: repo.default_branch || 'main',
      pushedAt: repo.pushed_at,
      analysisEnabled: false,
    }));

    // Store repos in metadata
    const existingRepos = logsData.repositories || [];
    const repoMap = new Map(existingRepos.map((r: any) => [r.id, r]));
    
    // Merge with existing analysis settings
    githubRepos.forEach(repo => {
      const existing = repoMap.get(repo.id) as any;
      if (existing && existing.analysisEnabled !== undefined) {
        repo.analysisEnabled = existing.analysisEnabled;
      }
    });

    await this.updateLogsMetadata(userId, {
      ...logsData,
      repositories: githubRepos,
    });

    return { success: true, repos: githubRepos };
  }

  static async toggleRepository(userId: string, repoId: string, enabled: boolean) {
    const { logsData } = await this.getLogsMetadata(userId);
    
    const repositories = (logsData.repositories || []).map((repo: any) =>
      repo.id === repoId ? { ...repo, analysisEnabled: enabled } : repo
    );

    await this.updateLogsMetadata(userId, {
      ...logsData,
      repositories,
    });

    return { success: true };
  }

  static async toggleGlobalLogs(userId: string, enabled: boolean) {
    const { logsData } = await this.getLogsMetadata(userId);
    
    await this.updateLogsMetadata(userId, {
      ...logsData,
      globalLogsEnabled: enabled,
    });

    return { success: true };
  }

  static async getSettings(userId: string) {
    const { logsData } = await this.getLogsMetadata(userId);
    
    return {
      globalLogsEnabled: logsData.globalLogsEnabled ?? true,
      githubConnected: !!logsData.githubToken,
      githubUser: logsData.githubUser,
      repositories: logsData.repositories || [],
    };
  }
}

export const logsService = LogsService;
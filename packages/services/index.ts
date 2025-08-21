// Export all services
export { attachmentService } from './attachmentService';
export { chatService } from './chat';
// daemonService excluded - not compatible with Cloudflare Workers
// export { daemonService } from './daemon';
export { FeedbackService } from './feedback';
export { llmProviderService } from './llm';
export { modelsService } from './models';
export { outputService } from './output';
export { projectService } from './project';
export { shareService } from './share';
export { sshService } from './ssh';
export { taskService } from './task';
export { userService } from './user';
export { workspaceService } from './workspace';
export { logsService, type GitHubRepo } from './logs-service';

// Export settings services
export { aiSettingsService } from './settings/ai';
export { appearanceSettingsService } from './settings/appearance';
export { dataSettingsService } from './settings/data';
export { notificationSettingsService } from './settings/notification';
export { profileSettingsService } from './settings/profile';

// Export error utilities
export {
  ServiceError,
  notFound,
  unauthorized,
  badRequest,
  conflict,
  internalError,
} from './lib/errors';

// Export types
export { ResourceType } from './lib/types';

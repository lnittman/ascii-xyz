import actionCache from '@convex-dev/action-cache/convex.config';
import agent from '@convex-dev/agent/convex.config';
import aggregate from '@convex-dev/aggregate/convex.config';
import presence from '@convex-dev/presence/convex.config';
import rateLimiter from '@convex-dev/rate-limiter/convex.config';
import workflow from '@convex-dev/workflow/convex.config';
import { defineApp } from 'convex/server';

const app = defineApp();
app.use(actionCache);
app.use(agent);
// Aggregate instances for social features
app.use(aggregate, { name: 'aggregateLikes' }); // Artwork likes leaderboard
app.use(aggregate, { name: 'aggregateUserStats' }); // User-level stats
app.use(presence);
app.use(rateLimiter);
app.use(workflow);

export default app;

import {
  type Task,
  db,
  desc,
  eq,
  schema,
  selectTaskSchema,
} from '@repo/database';

// Define CreateTask type locally since it's not just NewTask
type CreateTask = {
  workspaceId: string;
  title?: string;
  description?: string;
  prompt: string;
};

export const taskService = {
  async getTasks(userId: string): Promise<Task[]> {
    const tasks = await db
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.userId, userId))
      .orderBy(desc(schema.tasks.createdAt));
    return tasks.map((task) => selectTaskSchema.parse(task));
  },

  async getById(taskId: string): Promise<Task | null> {
    const [task] = await db
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.id, taskId))
      .limit(1);
    return task ? selectTaskSchema.parse(task) : null;
  },

  async getWorkspaceTasks(workspaceId: string): Promise<Task[]> {
    const tasks = await db
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.workspaceId, workspaceId))
      .orderBy(desc(schema.tasks.createdAt));
    return tasks.map((task) => selectTaskSchema.parse(task));
  },

  async createTask(userId: string, data: CreateTask): Promise<Task> {
    // Let the consuming app handle validation
    const validated = data;

    const [task] = await db
      .insert(schema.tasks)
      .values({
        id: crypto.randomUUID(),
        userId,
        workspaceId: validated.workspaceId,
        title: validated.title || validated.prompt.substring(0, 50),
        description: validated.description,
        prompt: validated.prompt,
        status: 'pending',
        updatedAt: new Date(),
      })
      .returning();
    return selectTaskSchema.parse(task);
  },

  async updateTask(
    taskId: string,
    data: {
      status?: 'pending' | 'running' | 'completed' | 'failed';
      output?: string;
      error?: string;
      startedAt?: Date;
      completedAt?: Date;
    }
  ): Promise<Task> {
    const [task] = await db
      .update(schema.tasks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.tasks.id, taskId))
      .returning();
    return selectTaskSchema.parse(task);
  },

  async deleteTask(taskId: string): Promise<void> {
    await db.delete(schema.tasks).where(eq(schema.tasks.id, taskId));
  },
};

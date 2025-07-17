import { z } from 'zod';

// Agent validation schemas
export const createAgentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  systemPrompt: z.string().min(1, 'System prompt is required').max(2000, 'System prompt must be less than 2000 characters'),
  greetingMessage: z.string().min(1, 'Greeting message is required').max(500, 'Greeting message must be less than 500 characters'),
  model: z.enum(['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'], {
    message: 'Invalid model selection'
  }),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().min(1).max(4000),
});

export const updateAgentSchema = createAgentSchema.partial();

// Knowledge source validation schemas
export const createKnowledgeSourceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  url: z.string().url('Must be a valid URL'),
  agentId: z.string().uuid('Invalid agent ID'),
});

export const updateKnowledgeSourceSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'failed'], {
    message: 'Invalid status'
  }),
});

// Chat validation schemas
export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(1000, 'Message must be less than 1000 characters'),
  agentId: z.string().uuid('Invalid agent ID'),
  conversationId: z.string().uuid('Invalid conversation ID').optional(),
});

// User validation schemas
export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
});

export const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Generic validation helper
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation error: ${result.error.issues.map((e: any) => e.message).join(', ')}`);
  }
  return result.data;
}

// Rate limiting schemas
export const rateLimitSchema = z.object({
  windowMs: z.number().min(1000), // minimum 1 second
  max: z.number().min(1), // minimum 1 request
  message: z.string().optional(),
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
export type CreateKnowledgeSourceInput = z.infer<typeof createKnowledgeSourceSchema>;
export type UpdateKnowledgeSourceInput = z.infer<typeof updateKnowledgeSourceSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;

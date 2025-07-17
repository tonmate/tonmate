-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "openaiApiKey" TEXT,
    "openaiModel" TEXT DEFAULT 'gpt-3.5-turbo',
    "defaultTemperature" DOUBLE PRECISION DEFAULT 0.7,
    "defaultMaxTokens" INTEGER DEFAULT 1000,
    "anthropicApiKey" TEXT,
    "anthropicModel" TEXT DEFAULT 'claude-3-sonnet-20240229',
    "cohereApiKey" TEXT,
    "huggingFaceApiKey" TEXT,
    "webhookUrl" TEXT,
    "webhookSecret" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "prompt" TEXT NOT NULL DEFAULT 'You are a helpful customer support agent.',
    "greeting" TEXT NOT NULL DEFAULT 'Hello! How can I help you today?',
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "llmProvider" TEXT NOT NULL DEFAULT 'openai',
    "model" TEXT NOT NULL DEFAULT 'gpt-4',
    "maxTokens" INTEGER NOT NULL DEFAULT 2000,
    "settings" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeSource" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "content" TEXT,
    "metadata" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "url" TEXT,
    "wordCount" INTEGER,
    "embedding" TEXT DEFAULT 'null',
    "htmlContent" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "messages" JSONB NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessingLog" (
    "id" TEXT NOT NULL,
    "knowledgeSourceId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "details" JSONB,
    "url" TEXT,
    "step" TEXT,
    "progress" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessingLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastUsed" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrawlRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPages" INTEGER NOT NULL DEFAULT 0,
    "completedPages" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "maxDepth" INTEGER NOT NULL DEFAULT 2,
    "pageLimit" INTEGER NOT NULL DEFAULT 50,
    "allowedDomains" TEXT NOT NULL DEFAULT '[]',
    "excludePaths" TEXT NOT NULL DEFAULT '[]',
    "includePaths" TEXT NOT NULL DEFAULT '[]',
    "respectRobotsTxt" BOOLEAN NOT NULL DEFAULT true,
    "delayBetweenRequests" INTEGER NOT NULL DEFAULT 1000,
    "excludeTags" TEXT NOT NULL DEFAULT '[]',
    "includeTags" TEXT NOT NULL DEFAULT '[]',
    "waitTime" INTEGER NOT NULL DEFAULT 0,
    "includeHtml" BOOLEAN NOT NULL DEFAULT false,
    "onlyMainContent" BOOLEAN NOT NULL DEFAULT true,
    "includeLinks" BOOLEAN NOT NULL DEFAULT false,
    "timeout" INTEGER NOT NULL DEFAULT 15000,
    "extraHeaders" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CrawlRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrawledPage" (
    "id" TEXT NOT NULL,
    "crawlRequestId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "htmlContent" TEXT,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "links" TEXT NOT NULL DEFAULT '[]',
    "depth" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'success',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrawledPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeBase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "crawlRequestId" TEXT NOT NULL,
    "vectorized" BOOLEAN NOT NULL DEFAULT false,
    "totalChunks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeBase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeChunk" (
    "id" TEXT NOT NULL,
    "knowledgeBaseId" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "embedding" TEXT,
    "chunkIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelConfiguration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "defaultModel" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "maxTokens" INTEGER NOT NULL DEFAULT 2000,
    "topP" DOUBLE PRECISION NOT NULL DEFAULT 0.9,
    "frequencyPenalty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "presencePenalty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrawlerConfiguration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "maxPages" INTEGER NOT NULL DEFAULT 10,
    "maxDepth" INTEGER NOT NULL DEFAULT 3,
    "crawlDelay" INTEGER NOT NULL DEFAULT 1000,
    "userAgent" TEXT NOT NULL DEFAULT 'AI-Support-Agent/1.0',
    "concurrency" INTEGER NOT NULL DEFAULT 3,
    "timeout" INTEGER NOT NULL DEFAULT 30000,
    "retryAttempts" INTEGER NOT NULL DEFAULT 3,
    "maxFileSize" INTEGER NOT NULL DEFAULT 10485760,
    "respectRobotsTxt" BOOLEAN NOT NULL DEFAULT true,
    "followRedirects" BOOLEAN NOT NULL DEFAULT true,
    "includePatterns" TEXT NOT NULL DEFAULT '["*"]',
    "excludePatterns" TEXT NOT NULL DEFAULT '["/admin/*", "/login/*", "/private/*"]',
    "allowedFileTypes" TEXT NOT NULL DEFAULT '["html", "htm", "php", "asp", "aspx", "jsp"]',
    "customHeaders" TEXT NOT NULL DEFAULT '{}',
    "enableJavaScript" BOOLEAN NOT NULL DEFAULT false,
    "waitForSelector" TEXT NOT NULL DEFAULT '',
    "maxConcurrentRequests" INTEGER NOT NULL DEFAULT 5,
    "requestInterval" INTEGER NOT NULL DEFAULT 2000,
    "skipDuplicates" BOOLEAN NOT NULL DEFAULT true,
    "extractImages" BOOLEAN NOT NULL DEFAULT false,
    "extractLinks" BOOLEAN NOT NULL DEFAULT true,
    "extractText" BOOLEAN NOT NULL DEFAULT true,
    "extractMetadata" BOOLEAN NOT NULL DEFAULT true,
    "extractFullContent" BOOLEAN NOT NULL DEFAULT true,
    "preserveFormatting" BOOLEAN NOT NULL DEFAULT true,
    "extractTables" BOOLEAN NOT NULL DEFAULT true,
    "extractCodeBlocks" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrawlerConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_sessionId_key" ON "Conversation"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ModelConfiguration_userId_providerId_key" ON "ModelConfiguration"("userId", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "CrawlerConfiguration_userId_key" ON "CrawlerConfiguration"("userId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeSource" ADD CONSTRAINT "KnowledgeSource_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "KnowledgeSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessingLog" ADD CONSTRAINT "ProcessingLog_knowledgeSourceId_fkey" FOREIGN KEY ("knowledgeSourceId") REFERENCES "KnowledgeSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrawlRequest" ADD CONSTRAINT "CrawlRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrawledPage" ADD CONSTRAINT "CrawledPage_crawlRequestId_fkey" FOREIGN KEY ("crawlRequestId") REFERENCES "CrawlRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeBase" ADD CONSTRAINT "KnowledgeBase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeBase" ADD CONSTRAINT "KnowledgeBase_crawlRequestId_fkey" FOREIGN KEY ("crawlRequestId") REFERENCES "CrawlRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeChunk" ADD CONSTRAINT "KnowledgeChunk_knowledgeBaseId_fkey" FOREIGN KEY ("knowledgeBaseId") REFERENCES "KnowledgeBase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeChunk" ADD CONSTRAINT "KnowledgeChunk_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "CrawledPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelConfiguration" ADD CONSTRAINT "ModelConfiguration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrawlerConfiguration" ADD CONSTRAINT "CrawlerConfiguration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

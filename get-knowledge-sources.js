const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function getKnowledgeSourceIds() {
  try {
    const knowledgeSources = await prisma.knowledgeSource.findMany({
      select: {
        id: true,
        name: true,
        url: true,
        status: true,
        agentId: true
      }
    });
    
    console.log('📊 Knowledge Sources:');
    for (const source of knowledgeSources) {
      console.log(`ID: ${source.id}`);
      console.log(`Name: ${source.name}`);
      console.log(`URL: ${source.url}`);
      console.log(`Status: ${source.status}`);
      console.log(`Agent ID: ${source.agentId}`);
      console.log('---');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getKnowledgeSourceIds();

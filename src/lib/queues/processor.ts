import { aiResponseWorker } from './ai-response-queue';

console.log('🚀 Starting AI Response Queue Worker...');

process.on('SIGINT', async () => {
  console.log('🛑 Shutting down AI Response Worker...');
  await aiResponseWorker.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down AI Response Worker...');
  await aiResponseWorker.close();
  process.exit(0);
});

console.log('✅ AI Response Queue Worker is running and ready to process jobs!');

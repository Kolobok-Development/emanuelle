import { AICompanionService } from '../src/lib/ai-companions';

async function main() {
  try {
    console.log('🌱 Seeding default AI companions...');
    
    await AICompanionService.seedDefaultCompanions();
    
    console.log('✅ Default companions seeded successfully!');
    
    // List all companions
    const companions = await AICompanionService.getAllCompanions();
    console.log('\n📋 Available companions:');
    companions.forEach(companion => {
      console.log(`  ${companion.avatar} ${companion.name} - ${companion.description}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding companions:', error);
    process.exit(1);
  }
}

main();

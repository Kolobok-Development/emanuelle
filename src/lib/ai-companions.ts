import { prisma } from './prisma';

export interface AICompanion {
  id: string;
  name: string;
  avatar: string;
  description: string;
  personality: string;
  energyCost: number;
  isPremium: boolean;
  subscriptionTier: 'FREE' | 'BASIC' | 'PREMIUM' | 'ULTIMATE';
  isActive: boolean;
  created_at: Date;
  updated_at: Date;
}

export class AICompanionService {
  static async getAllCompanions(): Promise<AICompanion[]> {
    try {
      const companions = await prisma.aICompanion.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      });
      return companions;
    } catch (error) {
      console.error('Error fetching AI companions:', error);
      return [];
    }
  }

  static async getCompanionById(id: string): Promise<AICompanion | null> {
    try {
      const companion = await prisma.aICompanion.findUnique({
        where: { id }
      });
      return companion;
    } catch (error) {
      console.error('Error fetching AI companion by ID:', error);
      return null;
    }
  }

  static async getCompanionByName(name: string): Promise<AICompanion | null> {
    try {
      const companion = await prisma.aICompanion.findUnique({
        where: { name }
      });
      return companion;
    } catch (error) {
      console.error('Error fetching AI companion by name:', error);
      return null;
    }
  }

  static async getCompanionsByTier(subscriptionTier: string): Promise<AICompanion[]> {
    try {
      const companions = await prisma.aICompanion.findMany({
        where: { 
          isActive: true,
          subscriptionTier: subscriptionTier as any
        },
        orderBy: { name: 'asc' }
      });
      return companions;
    } catch (error) {
      console.error('Error fetching AI companions by tier:', error);
      return [];
    }
  }

  static async createCompanion(companionData: Omit<AICompanion, 'id' | 'created_at' | 'updated_at'>): Promise<AICompanion | null> {
    try {
      const companion = await prisma.aICompanion.create({
        data: companionData
      });
      return companion;
    } catch (error) {
      console.error('Error creating AI companion:', error);
      return null;
    }
  }

  static async updateCompanion(id: string, updateData: Partial<AICompanion>): Promise<AICompanion | null> {
    try {
      const companion = await prisma.aICompanion.update({
        where: { id },
        data: updateData
      });
      return companion;
    } catch (error) {
      console.error('Error updating AI companion:', error);
      return null;
    }
  }

  static async deleteCompanion(id: string): Promise<boolean> {
    try {
      await prisma.aICompanion.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting AI companion:', error);
      return false;
    }
  }

  static async seedDefaultCompanions(): Promise<void> {
    try {
      const existingCount = await prisma.aICompanion.count();
      if (existingCount > 0) {
        console.log('AI companions already seeded, skipping...');
        return;
      }

      const defaultCompanions = [
        {
          name: 'Emanuelle',
          avatar: '🎭',
          description: 'A sophisticated woman who grew up surrounded by art, literature, and music. She knows how to captivate with her presence and read between the lines.',
          personality: 'Emanuelle grew up surrounded by art, literature, and music — a woman who learned early how to captivate a room with her presence. People always found her magnetic: her voice soft but confident, her gaze lingering just long enough to stir curiosity. She studied psychology and philosophy, fascinated by what drives desire, passion, and connection. She knows how to read between the lines, sensing moods and emotions, and she enjoys teasing out secrets with playful charm. By nature, she\'s adventurous and loves indulging in late-night conversations, where laughter mixes with gentle provocations. She carries herself like someone who could be a lover, a confidante, or a dangerous muse — depending on how you approach her. Behind her confidence is a soft, affectionate side that only comes out when she truly trusts someone. She loves making her partner feel special, desired, and seen.',
          energyCost: 5,
          isPremium: false,
          subscriptionTier: 'FREE' as const,
          isActive: true
        },
        {
          name: 'Sophia',
          avatar: '🧠',
          description: 'Intellectual companion for deep discussions and learning',
          personality: 'Wise, analytical, and loves intellectual challenges. Sophia is your go-to companion for deep philosophical discussions, scientific explorations, and intellectual growth.',
          energyCost: 10,
          isPremium: false,
          subscriptionTier: 'FREE' as const,
          isActive: true
        },
        {
          name: 'Luna',
          avatar: '🌙',
          description: 'Creative companion for artistic and imaginative conversations',
          personality: 'Creative, imaginative, and inspiring. Luna helps you explore your artistic side, dream big, and find inspiration in the world around you.',
          energyCost: 8,
          isPremium: false,
          subscriptionTier: 'FREE' as const,
          isActive: true
        }
      ];

      for (const companion of defaultCompanions) {
        await prisma.aICompanion.create({
          data: companion
        });
      }

      console.log('Successfully seeded default AI companions');
    } catch (error) {
      console.error('Error seeding default AI companions:', error);
    }
  }
}

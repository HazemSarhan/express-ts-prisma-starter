export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  provider: 'LOCAL' | 'GOOGLE' | 'GITHUB';
  providerId?: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const PARENT_PIN = process.env.PARENT_OVERRIDE_PIN || '1234';

// Simulated database for MVP (replace with real database later)
const USERS_DB: Map<string, User & { passwordHash?: string; picturePassword?: string[] }> = new Map();

// Initialize with demo users
USERS_DB.set('max', {
  id: 'user-1',
  username: 'max',
  name: 'Max',
  role: 'child',
  grade: 4,
  avatar: '🦸',
  createdAt: new Date(),
  updatedAt: new Date(),
  picturePassword: ['🌟', '🚀', '🌈', '🎮'], // Picture password for child
});

USERS_DB.set('parent', {
  id: 'user-2',
  username: 'parent',
  name: 'Parent',
  role: 'parent',
  createdAt: new Date(),
  updatedAt: new Date(),
  passwordHash: bcrypt.hashSync('parent123', 10),
});

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: Date;
}

// Picture password options for kids
export const PICTURE_OPTIONS = [
  { id: '🌟', name: 'Star' },
  { id: '🚀', name: 'Rocket' },
  { id: '🌈', name: 'Rainbow' },
  { id: '🎮', name: 'Game' },
  { id: '🦄', name: 'Unicorn' },
  { id: '🐶', name: 'Dog' },
  { id: '🐱', name: 'Cat' },
  { id: '🦖', name: 'Dinosaur' },
  { id: '⚽', name: 'Soccer' },
  { id: '🎨', name: 'Art' },
  { id: '🎵', name: 'Music' },
  { id: '🍕', name: 'Pizza' },
  { id: '🍦', name: 'Ice Cream' },
  { id: '🚗', name: 'Car' },
  { id: '✈️', name: 'Airplane' },
  { id: '🏰', name: 'Castle' },
];

export async function authenticateChild(
  username: string,
  picturePassword: string[]
): Promise<AuthSession | null> {
  const user = USERS_DB.get(username.toLowerCase());
  
  if (!user || user.role !== 'child') {
    return null;
  }

  // Check picture password from database
  if (user.picturePassword && 
      JSON.stringify(user.picturePassword) === JSON.stringify(picturePassword)) {
    return createSession(user);
  }

  return null;
}

// New function to authenticate child using localStorage data
export async function authenticateChildFromLocalStorage(
  username: string,
  picturePassword: string[]
): Promise<AuthSession | null> {
  // This function will be called from the client side
  // The actual localStorage check happens on the client
  // We just need to create a session for any valid child user
  
  // Create a temporary user object for the session
  const tempUser: User = {
    id: `user-${Date.now()}`,
    username: username.toLowerCase(),
    name: username.charAt(0).toUpperCase() + username.slice(1),
    role: 'child',
    grade: 4,
    avatar: '🦸',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return createSession(tempUser);
}

export async function authenticateParent(
  username: string,
  password: string
): Promise<AuthSession | null> {
  const user = USERS_DB.get(username.toLowerCase());
  
  if (!user || user.role !== 'parent') {
    return null;
  }

  // Check password or override PIN
  if (user.passwordHash && 
      (bcrypt.compareSync(password, user.passwordHash) || password === PARENT_PIN)) {
    return createSession(user);
  }

  return null;
}

function createSession(user: User): AuthSession {
  const token = jwt.sign(
    { 
      userId: user.id, 
      username: user.username, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  // Remove sensitive data
  const { ...safeUser } = user;
  delete (safeUser as any).passwordHash;
  delete (safeUser as any).picturePassword;

  return {
    user: safeUser as User,
    token,
    expiresAt,
  };
}

export function verifyToken(token: string): { userId: string; username: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

export async function createChildAccount(
  username: string,
  name: string,
  picturePassword: string[],
  grade: number,
  avatar: string
): Promise<User | null> {
  if (USERS_DB.has(username.toLowerCase())) {
    return null; // Username already exists
  }

  const newUser: User & { picturePassword: string[] } = {
    id: `user-${Date.now()}`,
    username: username.toLowerCase(),
    name,
    role: 'child',
    grade,
    avatar,
    picturePassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  USERS_DB.set(username.toLowerCase(), newUser);
  
  const { picturePassword: _, ...safeUser } = newUser;
  return safeUser;
}

export async function createParentAccount(
  username: string,
  name: string,
  password: string
): Promise<User | null> {
  if (USERS_DB.has(username.toLowerCase())) {
    return null; // Username already exists
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  
  const newUser: User & { passwordHash: string } = {
    id: `user-${Date.now()}`,
    username: username.toLowerCase(),
    name,
    role: 'parent',
    passwordHash,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  USERS_DB.set(username.toLowerCase(), newUser);
  
  const { passwordHash: _, ...safeUser } = newUser;
  return safeUser;
}
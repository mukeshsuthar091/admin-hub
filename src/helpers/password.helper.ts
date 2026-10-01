import { hash } from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = Number(process.env.SALT_ROUNDS ?? 10);

  if (!Number.isInteger(saltRounds) || saltRounds < 4 || saltRounds > 31) {
    throw new Error('SALT_ROUNDS must be an integer between 4 and 31');
  }

  return hash(password, saltRounds);
}

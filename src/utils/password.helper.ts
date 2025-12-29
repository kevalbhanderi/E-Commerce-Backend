import * as crypto from 'crypto';

/**
 * To generate MD5 hash of password
 * @param password to generate hash for
 */
export const generateMD5Hash = async (password: string): Promise<string> => {
  const hash = crypto.createHash('md5').update(password).digest('hex');
  return hash;
};

/**
 * Compare password with hashed password
 * @param password 
 * @param hashedPassword 
 * @returns
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  const hashedInput = await generateMD5Hash(password);
  return hashedInput === hashedPassword;
};

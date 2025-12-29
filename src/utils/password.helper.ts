import * as crypto from 'crypto';

/**
 * To generate MD5 hash of password
 * @param password to generate hash for
 */
export const generateMD5Hash = async (password: string) => {
  const hash = crypto
    .createHash('md5')
    .update(password)
    .digest('hex');
  return hash;
};

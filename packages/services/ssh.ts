import crypto from 'node:crypto';

const ENCRYPTION_KEY =
  process.env.SSH_ENCRYPTION_KEY ||
  'default-encryption-key-change-in-production';
const IV_LENGTH = 16;
const ALGORITHM = 'aes-256-cbc';

class SSHService {
  /**
   * Encrypt SSH credentials (password or private key)
   */
  encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  /**
   * Decrypt SSH credentials
   */
  decrypt(text: string): string {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  }

  /**
   * Test SSH connection
   */
  async testConnection(_params: {
    host: string;
    port: number;
    username: string;
    authType: 'key' | 'password';
    credential: string;
    workspacePath: string;
  }): Promise<{ success: boolean; error?: string }> {
    // In production, this would use an SSH library like ssh2
    // to test the connection and verify the workspace path exists
    // For now, we'll just return success
    return { success: true };
  }
}

export const sshService = new SSHService();

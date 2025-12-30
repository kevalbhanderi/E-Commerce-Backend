import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { EncryptionService } from '../utils/encryption.service';

@Injectable()
export class DecryptionInterceptor implements NestInterceptor {
  constructor(private readonly encryptionService: EncryptionService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Check if encryption is enabled
    if (!this.encryptionService.isEncryptionEnabled()) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();

    // Only process POST, PUT, PATCH requests with body
    const method = request.method as string;
    if (
      !['POST', 'PUT', 'PATCH'].includes(method) ||
      !request.body ||
      Object.keys(request.body as Record<string, unknown>).length === 0
    ) {
      return next.handle();
    }

    // Check if body is in encrypted format
    if (this.encryptionService.isEncrypted(request.body)) {
      try {
        // Decrypt the body
        const encryptedPayload = request.body as {
          encrypted: string;
          iv: string;
          tag: string;
        };
        const decryptedData =
          this.encryptionService.decryptAndParse(encryptedPayload);

        // Replace request body with decrypted data
        request.body = decryptedData as Record<string, unknown>;
      } catch {
        throw new BadRequestException(
          'Failed to decrypt request data. Please ensure the data is properly encrypted.',
        );
      }
    }

    return next.handle();
  }
}

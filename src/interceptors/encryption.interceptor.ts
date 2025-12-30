import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EncryptionService } from '../utils/encryption.service';

@Injectable()
export class EncryptionInterceptor implements NestInterceptor {
  constructor(private readonly encryptionService: EncryptionService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Check if encryption is enabled
    if (!this.encryptionService.isEncryptionEnabled()) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        // Don't encrypt if data is already in encrypted format
        if (this.encryptionService.isEncrypted(data)) {
          return data;
        }

        // Don't encrypt error responses
        if (
          data &&
          typeof data === 'object' &&
          'isError' in data &&
          data.isError
        ) {
          return data;
        }

        // Encrypt the response data
        try {
          return this.encryptionService.encrypt(data as string | object);
        } catch {
          return data;
        }
      }),
    );
  }
}

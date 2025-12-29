import { Injectable } from '@nestjs/common';

@Injectable()
export class MongoService {

    async findSessionTokenByEmail(token: string): Promise<{}> {
        return {}
    }
}

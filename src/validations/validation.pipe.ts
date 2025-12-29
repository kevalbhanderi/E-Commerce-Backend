import {
    ArgumentMetadata,
    BadRequestException,
    Injectable,
    PipeTransform,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
    async transform(value: any, { metatype }: ArgumentMetadata) {
        if (!metatype || !this.toValidate(metatype)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return value;
        }

        const object = plainToClass(metatype, value);
        let errors = await validate(object, {
            whitelist: true,
            forbidNonWhitelisted: true,
            validationError: {
                target: false,
                value: false,
            },
        });

        if (errors.length > 0) {
            let constraints = errors[0].constraints;
            // checks if error occured in sub dto
            if (!constraints) {
                // Safely drill down into nested children using optional chaining
                constraints =
                    errors[0].children?.[0]?.constraints ||
                    errors[0].children?.[0]?.children?.[0]?.constraints;

                // Update errors reference safely
                errors = errors[0].children ?? [];
            }
            const firstErrorMessage = constraints?.[Object.keys(constraints)[0]];
            throw new BadRequestException({
                message: firstErrorMessage,
                data: this.buildError(errors),
            });
        }
        return object;
    }

    private buildError(errors: ValidationError[]) {
        const result: { [key: string]: string } = {};
        errors.forEach(el => {
            if (!el.constraints) {
                this.buildError(el.children ?? []);
            } else {
                const prop = el.property;
                Object.entries(el.constraints).forEach(constraint => {
                    result[prop + constraint[0]] = `${constraint[1]}`;
                });
            }
        });
        return result;
    }

    private toValidate(metatype: Function): boolean {
        const types: Function[] = [String, Boolean, Number, Array, Object];
        return !types.includes(metatype);
    }
}

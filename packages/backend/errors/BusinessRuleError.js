import { AppError } from './AppError.js';

export class BusinessRuleError extends AppError {
    constructor(message) {
        super(message, 409, 'BUSINESS_RULE_ERROR');
    }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = void 0;
const STATUS_CODE_MESSAGES = {
    400: {
        hint: 'Check your request parameters or body. You might have sent invalid data.',
        learnMore: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400',
    },
    401: {
        hint: 'You are not authorized to access this resource. Please check your credentials.',
        learnMore: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401',
    },
    403: {
        hint: 'You do not have permission to access this resource. Contact the administrator if you believe this is a mistake.',
        learnMore: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/403',
    },
    404: {
        hint: 'The resource you are looking for does not exist. Double-check the URL or resource ID.',
        learnMore: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404',
    },
    500: {
        hint: 'Something went wrong on the server. Please try again later or contact support.',
        learnMore: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500',
    },
};
function createError(status, error) {
    const defaultMessage = {
        hint: 'An unexpected error occurred. Please try again later.',
        learnMore: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status',
    };
    const { hint, learnMore } = STATUS_CODE_MESSAGES[status] || defaultMessage;
    return {
        error,
        hint,
        learnMore,
    };
}
exports.createError = createError;

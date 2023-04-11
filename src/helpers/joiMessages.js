exports.joiMessageHandler = (name, errors, pattern) => {
    errors.forEach(err => {
        switch (err.code) {
            case "any.empty":
                err.message = `${name} is required`;
                break;
            case "string.min":
                err.message = `${name} should have at least ${err.local.limit} characters!`;
                break;
            case "string.max":
                err.message = `${name} have at most ${err.local.limit} characters!`;
                break;
            case "string.email":
                err.message = `${name} should be valid email address`;
                break;
            case "string.pattern.base":
                err.message = `${name} should be valid as ${pattern}`;
                break;
            default:
                break;
        }
    });
    return errors;
}
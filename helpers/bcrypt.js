import bcrypt from "bcryptjs";

export function hashPassword(password) {
    return bcrypt.hashSync(password);
}

export function validatePassword(passwordInput, passwordDB) {
    return bcrypt.compareSync(passwordInput, passwordDB);
};
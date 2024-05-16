const bcrypt = require("bcryptjs");

function hashPassword(password) {
    return bcrypt.hashSync(password);
}

function validatePassword(passwordInput, passwordDB) {
    console.log(passwordInput, passwordDB)
    return bcrypt.compareSync(passwordInput, passwordDB);
};

module.exports = { hashPassword, validatePassword }
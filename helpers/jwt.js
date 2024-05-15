import jwt from "jsonwebtoken";

const secret = process.env.SECRET_JWT_CODE;

export const createToken = (payload) => {
    const token = jwt.sign(payload, secret);

    return token;
};

export const verifyToken = (token) => {
    const payload  = jwt.verify(token, secret);

    return payload;
};
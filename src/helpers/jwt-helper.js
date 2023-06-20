import jwt from "jsonwebtoken";

export const sign = payload => jwt.sign(payload, process.env.SECRET_KEY_VALUE, {
    expiresIn: 60
})
export const verify = payload => jwt.verify(payload, process.env.SECRET_KEY_VALUE)
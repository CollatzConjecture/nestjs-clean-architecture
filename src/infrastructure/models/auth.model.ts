import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { EMAIL_BLIND_INDEX_SECRET, EMAIL_ENCRYPTION_KEY } from '@constants';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

const encrypt = (text: string): string => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(EMAIL_ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decrypt = (text: string): string => {
    try {
        const textParts = text.split(':');
        if (textParts.length !== 2) {
            // Not an encrypted value, return as is.
            // This can happen for data that existed before encryption was implemented
            return text;
        }
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(EMAIL_ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        return text;
    }
};

export const createBlindIndex = (text: string): string => {
    return crypto.createHmac('sha256', EMAIL_BLIND_INDEX_SECRET).update(text).digest('hex');
};

export const AuthSchema = new mongoose.Schema({
    id: { type: String, required: true },
    email: {
        type: String,
        required: true,
        get: decrypt,
    },
    emailHash: { type: String, unique: true, index: true, sparse: true },
    password: { type: String, required: true, select: false },
    currentHashedRefreshToken: { type: String, select: false },
}, {
    toJSON: { getters: true },
    toObject: { getters: true },
});

AuthSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }

    if (this.isModified('email')) {
        const plainEmail = this.email;
        if (plainEmail) {
            this.emailHash = createBlindIndex(plainEmail);
            this.email = encrypt(plainEmail);
        }
    }

    next();
});

export interface Auth extends mongoose.Document {
    readonly id: string;
    readonly email: string;
    readonly emailHash?: string;
    readonly password?: string;
    readonly currentHashedRefreshToken?: string;
} 
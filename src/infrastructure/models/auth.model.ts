import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

export const AuthSchema = new mongoose.Schema({
    id: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true, select: false },
    currentHashedRefreshToken: { type: String, select: false },
});

AuthSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

export interface Auth extends mongoose.Document {
    readonly id: string;
    readonly email: string;
    readonly password?: string;
    readonly currentHashedRefreshToken?: string;
} 
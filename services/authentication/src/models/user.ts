import mongoose, { Schema } from 'mongoose';
import { hashString, compareHash } from '../utilities/crypto-service';

function validateEmailPattern(val: string) {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/gi.test(val);
}

function validatePasswordPattern(val: string) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\.\*!@_\-\(\)\[\]\=\?\'\"\\\/\#\$\%\|\^\&\+\:\;\!\<\>])[a-zA-Z\d\.\*!@_\-\(\)\[\]\=\?\'\"\\\/\#\$\%\|\^\&\+\:\;\!\<\>]{8,}$/.test(val);
}

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validateEmailPattern, "{PATH} does not match acceptable email pattern"],
    },
    password: {
        type: String,
    },
    googleId: {
        type: String,
    },
    role: {
        type: String,
        enum: ['customer', 'employee'],
        required: true,
        default: 'customer',
    },
    emailVerified: {
        type: Boolean,
        required: true,
        default: false,
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (_, ret) {
            delete ret.password;
            delete ret.__v
            return ret;
        }
    },
});

userSchema.pre("save", async function (next) {
    // 'this' is the user document
    if (this.isNew) {
        if (!this.password && !this.googleId) {
            return next(new Error("Either password or googleId must be provided"));
        }
    }
    if (!this.isModified('password')) return next();
    // Replace the password with the computed hash
    try {
        if (!validatePasswordPattern(this.password!))
            throw new Error("Password must have at least 1 lower-case, 1 upper-case letter, 1 digit and 1 special character");
        this.password = await hashString(this.password!);
        return next();
    } catch (error: any) {
        return next(error);
    }
});

userSchema.methods.checkPassword = function (password: string) {
    return compareHash(password, this.password);
}

export interface IUserMethods {
    checkPassword(password:string): Promise<boolean>;
}

export interface IUserDocument extends mongoose.Document, IUserMethods{
    email: string;
    password: string;
    googleId: string;
    role: string;
    emailVerified: boolean;
}

export default mongoose.model<IUserDocument>('User', userSchema);
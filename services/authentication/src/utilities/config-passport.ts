import passport from 'passport';
import { OAuth2Strategy } from 'passport-google-oauth';
import User from '../models/user';
import mongoose from 'mongoose';

const { AUTH_GOOGLE_CLIENT_ID, AUTH_GOOGLE_SECRET, AUTH_GOOGLE_CALLBACK } = process.env;

passport.use(new OAuth2Strategy({
    clientID: AUTH_GOOGLE_CLIENT_ID!,
    clientSecret: AUTH_GOOGLE_SECRET!,
    callbackURL: AUTH_GOOGLE_CALLBACK!,
},
    async (_, __, profile, cb) => {
        try {
            let user = await User.findOne({ googleId: profile.id });
            if (user) return cb(null, user);
            user = await User.create({
                googleId: profile.id,
                email: profile.emails![0].value,
                emailVerified: true,
            });
            return cb(null, user);
        } catch (err) {
            return cb(err);
        }
    }));

export interface IUser extends Express.User {
    _id: mongoose.Types.ObjectId | string;
}

passport.serializeUser((user, cb) => cb(null, (user as IUser)._id));
passport.deserializeUser(async (userId, cb) => cb(null, await User.findById(userId)));
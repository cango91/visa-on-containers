import { Router } from "express";
import * as authCtrl from '../controllers/auth-controller';
import requireLogin from "../middleware/require-login";

const router = Router();

router.post('/', authCtrl.signup);
router.post('/login', authCtrl.login);
router.post('/logout', requireLogin, authCtrl.logout);
router.get('/verify', requireLogin, authCtrl.verify);
router.get('/verify/resend', requireLogin, authCtrl.resendVerification);

export default router;
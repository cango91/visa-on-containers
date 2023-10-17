import { Router } from "express";
import * as authCtrl from '../controllers/auth-controller';
import bearer from "../middleware/bearer";

const router = Router();

router.post('/', authCtrl.signup);
router.post('/login', authCtrl.login);
router.post('/logout', bearer, authCtrl.logout);
router.get('/verify', bearer, authCtrl.verify);
router.get('/verify/resend', bearer, authCtrl.resendVerification);

export default router;
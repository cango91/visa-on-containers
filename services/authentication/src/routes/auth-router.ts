import { Router } from "express";
import { loginLocal, logout, refresh, resend, signup, verify } from "../controllers/auth-controller";
const router = Router();

router.post("/login", loginLocal);
router.post("/signup", signup)
router.post("/verify", verify);
router.post("/resend", resend);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
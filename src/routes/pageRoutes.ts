import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { requireAuth } from "../middleware/auth";

const router = Router();

function getAuth(req: Request) {
  const token = req.cookies?.token as string | undefined;
  if (!token) return { loggedIn: false as const };

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
    };
    return { loggedIn: true as const, user: payload };
  } catch {
    return { loggedIn: false as const };
  }
}

router.get("/", (req: Request, res: Response) => {
  res.render("home", { auth: getAuth(req) });
});

router.get("/login", (req: Request, res: Response) => {
  const err = typeof req.query.err === "string" ? req.query.err : "";
  const retry = typeof req.query.retry === "string" ? req.query.retry : "";
  res.render("login", { err, retry, auth: getAuth(req) });
});

router.get("/profile", requireAuth, (req: Request, res: Response) => {
  res.render("profile", { user: (req as any).user, auth: getAuth(req) });
});

export default router;

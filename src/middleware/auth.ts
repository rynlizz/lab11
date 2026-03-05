import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

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

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token as string | undefined;

  if (!token) {
    return res
      .status(401)
      .render("not-logged", { message: "Not logged in", auth: getAuth(req) });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
    };

    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).render("not-logged", {
      message: "Invalid/expired token",
      auth: getAuth(req),
    });
  }
}

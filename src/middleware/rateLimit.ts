import { Request, Response, NextFunction } from "express";

type Entry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, Entry>();

export function rateLimitLogin(options?: {
  windowMs?: number;
  max?: number;
}) {
  const windowMs = options?.windowMs ?? 60_000; // 1 minute
  const max = options?.max ?? 5; // 5 attempts / minute / IP

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || "unknown";
    console.log("rateLimit ip =", ip);
    const now = Date.now();

    const current = store.get(ip);
    if (!current || now > current.resetAt) {
      store.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    current.count += 1;
    store.set(ip, current);

    if (current.count > max) {
      const retryAfterSec = Math.ceil((current.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfterSec));
      // friendly UI message
      return res.redirect(`/login?err=ratelimit&retry=${retryAfterSec}`);
    }

    next();
  };
}
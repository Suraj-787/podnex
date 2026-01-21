import type { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth.js";
import { prisma } from "@repo/database";
import crypto from "crypto";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check for API key in Authorization header first
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const apiKey = authHeader.substring(7); // Remove "Bearer " prefix

      // Check if it's an API key (starts with pk_live_ or pk_test_)
      if (apiKey.startsWith("pk_live_") || apiKey.startsWith("pk_test_")) {
        // Hash the API key to compare with stored hash
        const hashedKey = crypto.createHash("sha256").update(apiKey).digest("hex");

        // Find API key in database
        const apiKeyRecord = await prisma.apiKey.findFirst({
          where: {
            key: hashedKey,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } }
            ]
          },
          include: {
            user: true,
          },
        });

        if (apiKeyRecord) {
          // Update last used timestamp (async, don't wait)
          prisma.apiKey.update({
            where: { id: apiKeyRecord.id },
            data: { lastUsedAt: new Date() },
          }).catch(() => { }); // Ignore errors

          // Set user from API key
          req.user = {
            id: apiKeyRecord.user.id,
            email: apiKeyRecord.user.email,
            name: apiKeyRecord.user.name,
          };

          return next();
        }

        // Invalid API key
        return res.status(401).json({
          success: false,
          error: "Invalid or expired API key",
        });
      }
    }

    // Fall back to session-based authentication
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired session",
      });
    }

    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (session?.user) {
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      };
    }

    next();
  } catch (error) {
    next();
  }
};

export const requireApiKey = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKey = req.headers["x-api-key"] as string;

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: "API key required",
      });
    }

    // Hash the API key to compare with stored hash
    const hashedKey = crypto.createHash("sha256").update(apiKey).digest("hex");

    // Find API key in database (using 'key' field which stores the hash)
    const apiKeyRecord = await prisma.apiKey.findFirst({
      where: {
        key: hashedKey,
        // Note: isActive field doesn't exist in schema, so we check expiresAt only
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        user: true,
      },
    });

    if (!apiKeyRecord) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired API key",
      });
    }

    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: {
        lastUsedAt: new Date(),
      },
    });

    // Set user from API key
    req.user = {
      id: apiKeyRecord.user.id,
      email: apiKeyRecord.user.email,
      name: apiKeyRecord.user.name,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "API key authentication failed",
    });
  }
};

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }

  // Check if user email is admin (simple check for now)
  // TODO: Add role field to User model for proper role-based access
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",");

  if (!adminEmails.includes(req.user.email)) {
    return res.status(403).json({
      success: false,
      error: "Admin access required",
    });
  }

  next();
};

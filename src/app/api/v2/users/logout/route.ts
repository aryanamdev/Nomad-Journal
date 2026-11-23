import { logoutController } from "@/controllers/authController";

// POST is preferred; GET is kept for older clients.
export const POST = logoutController;
export const GET = logoutController;

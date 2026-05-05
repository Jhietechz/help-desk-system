import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = "kabianga-ict-secret-key-2024";

// --- Email Configuration ---
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT),
        secure: parseInt(SMTP_PORT) === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });
    }
  }
  return transporter;
}

async function sendEmailNotification(to: string, subject: string, text: string) {
  const mailTransporter = getTransporter();
  if (!mailTransporter) {
    console.warn(`[Mail] SMTP variables missing. Notification to ${to} skipped: ${subject}`);
    return;
  }

  try {
    await mailTransporter.sendMail({
      from: process.env.SMTP_FROM || "UoK Helpdesk <noreply@kabianga.ac.ke>",
      to,
      subject,
      text,
      html: `<div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">UoK ICT Helpdesk</h2>
        <p style="font-size: 16px; line-height: 1.5;">${text}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #777;">This is an automated message from the University of Kabianga ICT Portal. Please do not reply directly to this email.</p>
      </div>`,
    });
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}

// In-memory database (simulating MySQL tables)
const users: any[] = [
  {
    id: "admin-1",
    name: "System Admin",
    email: "admin@kabianga.ac.ke",
    password: bcrypt.hashSync("admin123", 10),
    role: "admin",
    isApproved: true,
  },
  {
    id: "tech-1",
    name: "ICT Technician One",
    email: "tech1@kabianga.ac.ke",
    password: bcrypt.hashSync("tech123", 10),
    role: "technician",
    isApproved: true,
  },
  {
    id: "mgr-1",
    name: "ICT Manager",
    email: "manager@kabianga.ac.ke",
    password: bcrypt.hashSync("manager123", 10),
    role: "manager",
    isApproved: true,
  }
];

const tickets: any[] = [];
const ticketLogs: any[] = [];
const notifications: any[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log('No token provided');
      return res.sendStatus(401);
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        console.error('JWT verify error:', err.message);
        return res.sendStatus(403);
      }
      
      // Check if user still exists and is approved
      const dbUser = users.find(u => u.id === user.id);
      if (!dbUser || !dbUser.isApproved) {
        return res.status(403).json({ message: "Account not approved or suspended" });
      }

      req.user = user;
      next();
    });
  };

  // Helper to create notification
  const addNotification = (userId: string, message: string, ticketId?: string) => {
    notifications.push({
      id: uuidv4(),
      userId,
      message,
      ticketId,
      read: false,
      createdAt: new Date().toISOString()
    });
  };

  // --- API Routes ---

  // Forgot Password
  app.post("/api/auth/forgot-password", async (req, res) => {
    const { email } = req.body;
    console.log(`[Auth] Password reset request received for: ${email}`);
    const user = users.find((u) => u.email === email);
    
    if (user) {
      const resetToken = uuidv4();
      user.resetToken = resetToken;
      user.resetTokenExpiry = Date.now() + 3600000; // 1 hour

      const resetLink = `${req.headers.origin || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      await sendEmailNotification(
        user.email,
        "Password Reset Request",
        `Hello ${user.name},\n\nYou requested a password reset for your ICT Helpdesk account. Click the link below to set a new password:\n\n${resetLink}\n\nThis link will expire in 1 hour. If you didn't request this, you can safely ignore this email.`
      );
    }
    
    res.json({ message: "If an account with that email exists, a reset link has been sent." });
  });

  // Reset Password
  app.post("/api/auth/reset-password", (req, res) => {
    const { token, password } = req.body;
    console.log(`[Auth] Attempting password reset with token: ${token ? 'present' : 'missing'}`);
    const user = users.find(u => u.resetToken === token && u.resetTokenExpiry > Date.now());

    if (!user) return res.status(400).json({ message: "Invalid or expired reset token." });

    user.password = bcrypt.hashSync(password, 10);
    delete user.resetToken;
    delete user.resetTokenExpiry;

    res.json({ message: "Password updated successfully." });
  });

  // Login
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = users.find((u) => u.email === email);

    if (user && bcrypt.compareSync(password, user.password)) {
      if (!user.isApproved) {
        return res.status(403).json({ message: "Your account is pending admin approval." });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved } });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });

  // Register
  app.post("/api/auth/register", (req, res) => {
    const { name, email, password, role = "student" } = req.body;
    
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = {
      id: uuidv4(),
      name,
      email,
      password: bcrypt.hashSync(password, 10),
      role,
      isApproved: role !== 'technician', // Technicians need manual approval
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    
    if (role === 'technician') {
      // Notify admins about new technician registration
      const admins = users.filter(u => u.role === 'admin');
      admins.forEach(admin => {
        addNotification(admin.id, `New Technician registered: ${name}. Approval required.`);
        sendEmailNotification(admin.email, "Action Required: New Technician Registration", `A new technician account (${name}) has been created and requires your approval before they can access the portal.`);
      });
    }

    res.status(201).json({ message: role === 'technician' ? "Registration successful. Please wait for admin approval." : "Registration successful." });
  });

  // User Management
  app.get("/api/users", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') {
      console.log(`Access Denied: User ${req.user.email} (role: ${req.user.role}) attempted to GET /api/users`);
      return res.sendStatus(403);
    }
    res.json(users.map(({ password, ...u }) => u));
  });

  app.patch("/api/users/:id", authenticateToken, (req: any, res) => {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') return res.sendStatus(403);
    
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.password) user.password = bcrypt.hashSync(req.body.password, 10);
    
    // Admin only updates
    if (req.user.role === 'admin') {
      if (req.body.role) user.role = req.body.role;
      if (typeof req.body.isApproved === 'boolean') {
        // SAFETY: Prevent an admin from revoking their own approval
        if (req.user.id === user.id && req.body.isApproved === false) {
          return res.status(400).json({ message: "You cannot revoke your own access." });
        }
        
        const wasApproved = user.isApproved;
        user.isApproved = req.body.isApproved;
        
        if (!wasApproved && user.isApproved) {
          addNotification(user.id, "Your account has been approved by an administrator.");
          sendEmailNotification(user.email, "Account Approved", `Hello ${user.name},\n\nYour account on the UoK ICT Helpdesk has been approved. You can now log in using your credentials.`);
        }
      }
    }
    
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved });
  });

  app.delete("/api/users/:id", authenticateToken, (req: any, res) => {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') return res.sendStatus(403);
    const index = users.findIndex(u => u.id === req.params.id);
    if (index !== -1) users.splice(index, 1);
    res.sendStatus(204);
  });

  // Notifications
  app.get("/api/notifications", authenticateToken, (req: any, res) => {
    res.json(notifications.filter(n => n.userId === req.user.id).reverse());
  });

  // Tickets
  app.get("/api/tickets", authenticateToken, (req: any, res) => {
    const user = req.user;
    let filteredTickets = tickets;

    if (user.role === "student" || user.role === "staff") {
      filteredTickets = tickets.filter(t => t.created_by === user.id);
    } else if (user.role === "technician") {
      filteredTickets = tickets.filter(t => t.assigned_to === user.id || t.status === "Approved" || t.status === "In Progress" || t.status === "Resolved");
    }

    res.json(filteredTickets);
  });

  app.post("/api/tickets", authenticateToken, (req: any, res) => {
    const { title, description, category, location, image } = req.body;
    const newTicket = {
      id: uuidv4(),
      title,
      description,
      category,
      location,
      image, // Base64 string
      status: "New",
      created_by: req.user.id,
      created_by_name: req.user.name,
      assigned_to: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    tickets.push(newTicket);
    
    ticketLogs.push({
      id: uuidv4(),
      ticket_id: newTicket.id,
      status: "New",
      updated_by: req.user.id,
      updated_at: new Date().toISOString(),
    });

    addNotification(req.user.id, `Your ticket "${title}" has been submitted successfully.`, newTicket.id);

    // Send email to the reporter
    sendEmailNotification(
      req.user.email,
      `Ticket Received: ${title}`,
      `Hello ${req.user.name},\n\nYour support ticket regarding "${title}" has been successfully logged at the ICT Helpdesk.\n\nStatus: New\nLocation: ${location}\n\nWe will notify you once it has been reviewed.`
    );

    // Notify managers about the new ticket
    const managers = users.filter(u => u.role === 'manager' || u.role === 'admin');
    managers.forEach(m => {
      sendEmailNotification(
        m.email,
        `New Ticket Alert: ${title}`,
        `A new support ticket has been submitted by ${req.user.name}.\n\nCategory: ${category}\nLocation: ${location}\n\nPlease log in to the portal to review and triage.`
      );
    });

    res.status(201).json(newTicket);
  });

  app.patch("/api/tickets/:id", authenticateToken, (req: any, res) => {
    const { id } = req.params;
    const { status, assigned_to } = req.body;
    const ticketIdx = tickets.findIndex(t => t.id === id);

    if (ticketIdx === -1) return res.status(404).json({ message: "Ticket not found" });

    const ticket = tickets[ticketIdx];
    const oldStatus = ticket.status;

    if (status) ticket.status = status;
    if (assigned_to) ticket.assigned_to = assigned_to;
    ticket.updated_at = new Date().toISOString();

    ticketLogs.push({
      id: uuidv4(),
      ticket_id: id,
      status: status || ticket.status,
      updated_by: req.user.id,
      updated_at: new Date().toISOString(),
    });

    if (status && status !== oldStatus) {
      addNotification(ticket.created_by, `Update: Your ticket "${ticket.title}" status changed to ${status}.`, ticket.id);
      
      const creator = users.find(u => u.id === ticket.created_by);
      if (creator) {
        sendEmailNotification(
          creator.email,
          `Ticket Update: ${ticket.title}`,
          `Hello ${creator.name},\n\nThe status of your support ticket "${ticket.title}" has been updated.\n\nNew Status: ${status}\n\nYou can track further progress in your dashboard.`
        );
      }

      // NOVEL FEATURE: Notify technicians when a ticket is approved
      if (status === 'Approved') {
        const approvedTechs = users.filter(u => u.role === 'technician' && u.isApproved);
        approvedTechs.forEach(tech => {
          addNotification(tech.id, `Service Alert: New approved ticket "${ticket.title}" is ready for attention.`, ticket.id);
          sendEmailNotification(
            tech.email,
            `Work Request: ${ticket.title}`,
            `Hello ${tech.name},\n\nA new incident has been approved for resolution.\n\nTitle: ${ticket.title}\nLocation: ${ticket.location}\nCategory: ${ticket.category}\n\nPlease log in to the technician dashboard to claim this task.`
          );
        });
      }
    }

    res.json(ticket);
  });

  // Stats for Admin/Manager
  app.get("/api/stats", authenticateToken, (req: any, res) => {
    if (req.user.role !== "admin" && req.user.role !== "manager") {
      console.log(`Access Denied: User ${req.user.email} (role: ${req.user.role}) attempted to GET /api/stats`);
      return res.status(403).json({ message: "Access denied" });
    }

    const stats = {
      total: tickets.length,
      new: tickets.filter(t => t.status === "New").length,
      approved: tickets.filter(t => t.status === "Approved").length,
      inProgress: tickets.filter(t => t.status === "In Progress").length,
      resolved: tickets.filter(t => t.status === "Resolved").length,
    };

    res.json(stats);
  });

  // --- Vite Middleware ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

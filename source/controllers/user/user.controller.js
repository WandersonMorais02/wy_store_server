import "dotenv/config";
import mongoose from "mongoose";
import pkg from "jsonwebtoken";
import User from "../../models/user/user.js";
import bcrypt from "bcryptjs";

const { sign } = pkg;

/**
 * Centralized access control
 */
function canAccessUser(authUser, targetUser)
{
    if (authUser.role === "ADMIN") return true;

    if (authUser.role === "CLIENT") {
        return authUser.id === String(targetUser._id);
    }

    if (authUser.role === "DEALER") {
        return (
            authUser.id === String(targetUser._id) ||
            targetUser.role === "CLIENT"
        );
    }

    return false;
}

export default new class UserController
{
    /**
     * List users
     * GET /users
     */
    async index(req, res)
    {
        try {
            const authUser = req.user;

            let users;

            if (authUser.role === "ADMIN") {
                users = await User.find();

            } else if (authUser.role === "DEALER") {
                users = await User.find({
                    $or: [
                        { _id: authUser.id },
                        { role: "CLIENT" },
                    ],
                });

            } else {
                users = await User.find({ _id: authUser.id });
            }

            const usersSafe = users.map(u => {
                const { password, ...rest } = u.toObject();
                return rest;
            });

            return res.json(usersSafe);

        } catch (error) {
            return res.status(500).json({
                message: "Failed to list users",
                error: error.message,
            });
        }
    }

    /**
     * Create user
     * POST /users
     */
    async create(req, res)
    {
        try {
            const { name, email, password, role } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({
                    message: "Name, email and password are required",
                });
            }

            const exists = await User.findOne({ email });
            if (exists) {
                return res.status(409).json({
                    message: "User already exists",
                });
            }

            const passwordHash = await bcrypt.hash(password, 10);

            const user = await User.create({
                name,
                email,
                password: passwordHash,
                role: role ?? "CLIENT",
            });

            const { password: _, ...userSafe } = user.toObject();

            return res.status(201).json(userSafe);

        } catch (error) {
            return res.status(500).json({
                message: "Failed to create user",
                error: error.message,
            });
        }
    }

    /**
     * Show user
     * GET /users/:id
     */
    async show(req, res)
    {
        try {
            const { id } = req.params;

            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({ message: "Invalid user id" });
            }

            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (!canAccessUser(req.user, user)) {
                return res.status(403).json({
                    message: "Access denied",
                });
            }

            const { password, ...userSafe } = user.toObject();
            return res.json(userSafe);

        } catch (error) {
            return res.status(500).json({
                message: "Failed to fetch user",
                error: error.message,
            });
        }
    }

    /**
     * Authenticate
     * POST /users/auth
     */
    async auth(req, res)
    {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email }).select("+password");
            if (!user) {
                return res.status(401).json({
                    message: "Email or password invalid",
                });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.status(401).json({
                    message: "Email or password invalid",
                });
            }

            const token = sign(
                {
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                String(process.env.JWT_SECRET),
                {
                    subject: user.id,
                    expiresIn: "7d",
                }
            );

            const { password: _, ...userSafe } = user.toObject();

            return res.json({
                user: userSafe,
                token,
            });

        } catch (error) {
            return res.status(500).json({
                message: "Authentication failed",
                error: error.message,
            });
        }
    }

    /**
     * Update user
     * PUT /users/:id
     */
    async update(req, res)
    {
        try {
            const { id } = req.params;

            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({ message: "Invalid user id" });
            }

            const { name, email, role, active } = req.body;

            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (!canAccessUser(req.user, user)) {
                return res.status(403).json({
                    message: "Access denied",
                });
            }

            if (req.user.role !== "ADMIN" && (role !== undefined || active !== undefined)) {
                return res.status(403).json({
                    message: "Only ADMIN can change role or status",
                });
            }

            if (name !== undefined) user.name = name;
            if (email !== undefined) user.email = email;
            if (role !== undefined) user.role = role;
            if (active !== undefined) user.active = active;

            await user.save();

            const { password, ...userSafe } = user.toObject();
            return res.json(userSafe);

        } catch (error) {
            return res.status(500).json({
                message: "Failed to update user",
                error: error.message,
            });
        }
    }

    /**
     * Update password
     * PATCH /users/:id/password
     */
    async updatePassword(req, res)
    {
        try {
            const { id } = req.params;
            const { password } = req.body;

            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({ message: "Invalid user id" });
            }

            if (!password || password.length < 6) {
                return res.status(400).json({
                    message: "Password must be at least 6 characters",
                });
            }

            const user = await User.findById(id).select("+password");
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (!canAccessUser(req.user, user)) {
                return res.status(403).json({
                    message: "Access denied",
                });
            }

            user.password = await bcrypt.hash(password, 10);
            await user.save();

            return res.json({
                message: "Password updated successfully",
            });

        } catch (error) {
            return res.status(500).json({
                message: "Failed to update password",
                error: error.message,
            });
        }
    }

    /**
     * Delete user
     * DELETE /users/:id
     */
    async delete(req, res)
    {
        try {
            const { id } = req.params;

            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({ message: "Invalid user id" });
            }

            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Prevent self delete
            if (req.user.id === String(user._id)) {
                return res.status(403).json({
                    message: "You cannot delete your own account",
                });
            }

            if (req.user.role === "CLIENT") {
                return res.status(403).json({
                    message: "Access denied",
                });
            }

            if (req.user.role === "DEALER" && user.role !== "CLIENT") {
                return res.status(403).json({
                    message: "Access denied",
                });
            }

            await user.deleteOne();

            return res.status(204).send();

        } catch (error) {
            return res.status(500).json({
                message: "Failed to delete user",
                error: error.message,
            });
        }
    }
};

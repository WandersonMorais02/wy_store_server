import mongoose from "mongoose";
import User from "../../models/user/user.js";
import bcrypt from "bcryptjs";
import pkg from "jsonwebtoken";

const { sign } = pkg;

/**
 * Centralized access control
 */
export function canAccessUser(authUser, targetUser) {
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

class UserService {
async list(authUser, { role, search = "", page = 1, limit = 10 }) {
  if (!authUser) throw new Error("UNAUTHORIZED");

  let query = {};

  if (authUser.role === "ADMIN" && role) {
    query.role = role;
  } else if (authUser.role === "DEALER") {
    query = {
      $or: [{ _id: authUser.id }, { role: "CLIENT" }],
    };
  } else if (authUser.role === "CLIENT") {
    query = { _id: authUser.id };
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const pageInt = Number(page);
  const limitInt = Number(limit);

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select("-password")
    .skip((pageInt - 1) * limitInt)
    .limit(limitInt)
    .lean();

  return {
    users,
    total,
    page: pageInt,
    pages: Math.ceil(total / limitInt),
  };
}


  async create({ name, email, password, role }) {
    if (!name || !email || !password) {
      throw new Error("MISSING_FIELDS");
    }

    const exists = await User.findOne({ email });
    if (exists) {
      throw new Error("USER_EXISTS");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: passwordHash,
      role: role ?? "CLIENT",
    });

    const { password: _, ...userSafe } = user.toObject();
    return userSafe;
  }

  async getById(authUser, id) {
    if (!mongoose.isValidObjectId(id)) {
      throw new Error("INVALID_ID");
    }

    const user = await User.findById(id);
    if (!user) throw new Error("NOT_FOUND");

    if (!canAccessUser(authUser, user)) {
      throw new Error("ACCESS_DENIED");
    }

    const { password, ...userSafe } = user.toObject();
    return userSafe;
  }

  async me(id) {
    const user = await User.findById(id);
    if (!user) throw new Error("NOT_FOUND");

    const { password, ...userSafe } = user.toObject();
    return userSafe;
  }

  async auth({ email, password }) {
    const user = await User.findOne({ email }).select("+password");
    if (!user) throw new Error("INVALID_CREDENTIALS");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("INVALID_CREDENTIALS");

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

    return { user: userSafe, token };
  }

  async update(authUser, id, data) {
    if (!mongoose.isValidObjectId(id)) {
      throw new Error("INVALID_ID");
    }

    const user = await User.findById(id);
    if (!user) throw new Error("NOT_FOUND");

    if (!canAccessUser(authUser, user)) {
      throw new Error("ACCESS_DENIED");
    }

    if (
      authUser.role !== "ADMIN" &&
      (data.role !== undefined || data.active !== undefined)
    ) {
      throw new Error("ADMIN_ONLY");
    }

    Object.assign(user, data);
    await user.save();

    const { password, ...userSafe } = user.toObject();
    return userSafe;
  }

  async updatePassword(authUser, id, password) {
    if (!mongoose.isValidObjectId(id)) {
      throw new Error("INVALID_ID");
    }

    if (!password || password.length < 6) {
      throw new Error("INVALID_PASSWORD");
    }

    const user = await User.findById(id).select("+password");
    if (!user) throw new Error("NOT_FOUND");

    if (!canAccessUser(authUser, user)) {
      throw new Error("ACCESS_DENIED");
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();
  }

  async delete(authUser, id) {
    if (!mongoose.isValidObjectId(id)) {
      throw new Error("INVALID_ID");
    }

    const user = await User.findById(id);
    if (!user) throw new Error("NOT_FOUND");

    if (authUser.id === String(user._id)) {
      throw new Error("SELF_DELETE");
    }

    if (
      authUser.role === "CLIENT" ||
      (authUser.role === "DEALER" && user.role !== "CLIENT")
    ) {
      throw new Error("ACCESS_DENIED");
    }

    await user.deleteOne();
  }
}

export default new UserService();

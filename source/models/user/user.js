import { Schema, model } from "mongoose";

export const UserRoles = {
  ADMIN: "ADMIN",
  DEALER: "DEALER",
  CLIENT: "CLIENT",
};

const UserSchema = new Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    select: false,
  },
  role: {
    type: String,
    enum: Object.values(UserRoles),
    default: UserRoles.CLIENT,
  },
  active: {
    type: Boolean,
    default: false, // 👈 agora começa INATIVO
  },

  emailVerificationToken: {
    type: String,
    select: false,
  },
  emailVerificationExpires: {
    type: Date,
    select: false,
  },
}, { timestamps: true });

export default model("User", UserSchema);

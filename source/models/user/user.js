import { Schema, model } from "mongoose";

export const UserRoles = {
  ADMIN: "ADMIN",
  DEALER: "DEALER",
  CLIENT: "CLIENT",
};

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false, // não retorna a senha por padrão
    },

    role: {
      type: String,
      enum: Object.values(UserRoles),
      default: UserRoles.CLIENT,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt e updatedAt
  }
);

export default model("User", UserSchema);

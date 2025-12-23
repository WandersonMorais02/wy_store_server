import { Schema, model } from "mongoose";
import slugify from "slugify";
import crypto from "crypto";

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      index: true,
    },

    // SKU interno (controle / estoque)
    sku: {
      type: String,
      unique: true,
      index: true,
      immutable: true,
    },

    // Código comercial (exibição / ERP)
    code: {
      type: String,
      unique: true,
      index: true,
      immutable: true,
    },

    banner: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    stock: {
      type: Number,
      default: 0,
    },

    hasVariation: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * 🔥 Hooks automáticos (Mongoose-safe)
 * NÃO usa next()
 */
ProductSchema.pre("validate", function () {
  // 🔹 SLUG único e estável
  if (!this.slug && this.name) {
    const baseSlug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });

    const suffix = crypto.randomBytes(2).toString("hex");
    this.slug = `${baseSlug}-${suffix}`;
  }

  // 🔹 SKU interno (controle)
  if (!this.sku) {
    this.sku = `SKU-${crypto.randomInt(100000, 999999)}`;
  }

  // 🔹 Código comercial
  if (!this.code) {
    this.code = `PRD-${crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()}`;
  }
});

export default model("Product", ProductSchema);

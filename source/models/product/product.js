import { Schema, model } from "mongoose";
import slugify from "slugify";
import crypto from "crypto";

const ProductSchema = new Schema(
  {
    /* =========================
       DADOS BÁSICOS
    ========================== */
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

    sku: {
      type: String,
      unique: true,
      index: true,
      immutable: true,
    },

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

    /* =========================
       📦 DADOS PARA FRETE
    ========================== */

    shipping: {
      enabled: {
        type: Boolean,
        default: true,
      },

      weightKg: {
        type: Number,
        required: true,
        min: 0.01,
      },

      dimensionsCm: {
        height: {
          type: Number,
          required: true,
          min: 1,
        },
        width: {
          type: Number,
          required: true,
          min: 1,
        },
        length: {
          type: Number,
          required: true,
          min: 1,
        },
      },

      freeShipping: {
        type: Boolean,
        default: false,
      },

      allowedStates: {
        type: [String],
        default: ["PA"], // começa só no Pará
      },
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   🔥 HOOKS AUTOMÁTICOS
========================= */
ProductSchema.pre("validate", function () {
  if (!this.slug && this.name) {
    const baseSlug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });

    const suffix = crypto.randomBytes(2).toString("hex");
    this.slug = `${baseSlug}-${suffix}`;
  }

  if (!this.sku) {
    this.sku = `SKU-${crypto.randomInt(100000, 999999)}`;
  }

  if (!this.code) {
    this.code = `PRD-${crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()}`;
  }
});

export default model("Product", ProductSchema);

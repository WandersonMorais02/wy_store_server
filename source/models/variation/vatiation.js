import { Schema, model } from "mongoose";

const VariationSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    color: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      min: 0,
    },

    images: [
      {
        type: String,
        trim: true,
      },
    ],

    stock: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default model("Variation", VariationSchema);

import { Router } from "express";
import multer from "multer";

import homeController from "./controllers/home/home.controller.js";
import userController from "./controllers/user/user.controller.js";
import productController from "./controllers/product/product.controller.js";
import categoryController from "./controllers/category/category.controller.js";
import variationController from "./controllers/variation/variation.controller.js";
import cartController from "./controllers/Cart/cart.controller.js";
import favoriteController from "./controllers/favorite/favorite.controller.js";

import { isAuthenticated } from "./middlewares/isAuthenticated.js";
import uploadConfig from "./config/multer.js";
import { calculate } from "./controllers/shipping/shipping.controller.js";

export default class AppRouter {
  constructor() {
    this.router = Router();

    this.productUpload = multer(uploadConfig.upload("product_banner"));
    this.variationUpload = multer(uploadConfig.upload("variations"));

    this.setRoutes();
  }

  /* ===========================
   * 🏠 HOME
   * =========================== */
  home() {
    this.router.get("/", homeController.index);
  }

  /* ===========================
   * 👤 USERS
   * =========================== */
  user() {
    this.router.get("/users", isAuthenticated, userController.index);
    this.router.get("/users/me", isAuthenticated, userController.me);
    this.router.get("/users/:id", isAuthenticated, userController.show);
    this.router.post("/users", userController.create);
      // ✅ VERIFICAÇÃO DE EMAIL (PÚBLICA)
    this.router.get("/verify-email", userController.verifyEmail);
    this.router.post("/users/auth", userController.auth);
    this.router.put("/users/:id", isAuthenticated, userController.update);
    this.router.patch(
      "/users/:id/password",
      isAuthenticated,
      userController.updatePassword
    );
    this.router.delete("/users/:id", isAuthenticated, userController.delete);
  }

  /* ===========================
   * 📂 CATEGORIES
   * =========================== */
  category() {
    this.router.get("/categories", categoryController.index);
    this.router.get("/categories/name/:name", categoryController.findByName);
    this.router.get("/categories/:id", categoryController.show);
    this.router.post("/categories", isAuthenticated, categoryController.store);
    this.router.put("/categories/:id", isAuthenticated, categoryController.update);
    this.router.delete("/categories/:id", isAuthenticated, categoryController.delete);
  }

  /* ===========================
   * 📦 PRODUCTS
   * =========================== */
  product() {
    this.router.get("/products", productController.index);
    this.router.get("/products/:id", productController.show);

    this.router.post(
      "/products",
      isAuthenticated,
      (req, res, next) => {
        req.uploadFolder = "product_banner";
        next();
      },
      this.variationUpload.single("file"),
      uploadConfig.processImage,
      productController.store
    );

    this.router.put(
      "/products/:id",
      isAuthenticated,
      (req, res, next) => {
        req.uploadFolder = "product_banner";
        next();
      },
      this.variationUpload.single("file"),
      uploadConfig.processImage,
      productController.update
    );

    this.router.patch(
      "/products/:id/stock",
      isAuthenticated,
      productController.updateStock
    );

    this.router.get(
      "/products/category/:categoryId",
      productController.findByCategory
    );

    this.router.delete("/products/:id", isAuthenticated, productController.delete);
  }

  /* ===========================
   * 🎨 VARIATIONS
   * =========================== */
  variation() {
    this.router.get(
      "/products/:productId/variations",
      variationController.indexByProduct
    );

    this.router.post(
      "/products/:productId/variations",
      isAuthenticated,
      (req, res, next) => {
        req.uploadFolder = "variations";
        next();
      },
      this.variationUpload.single("file"),
      uploadConfig.processImage,
      variationController.store
    );

    this.router.put(
      "/variations/:id",
      isAuthenticated,
      (req, res, next) => {
        req.uploadFolder = "variations";
        next();
      },
      this.variationUpload.single("file"),
      uploadConfig.processImage,
      variationController.update
    );

    this.router.delete(
      "/variations/:id",
      isAuthenticated,
      variationController.delete
    );
  }

  /* ===========================
   * 🛒 CART
   * =========================== */
  cart() {
    this.router.get("/cart", isAuthenticated, cartController.show);
    this.router.post("/cart/items", isAuthenticated, cartController.add);
    this.router.put("/cart/items/:itemId", isAuthenticated, cartController.update);
    this.router.delete("/cart/items/:itemId", isAuthenticated, cartController.remove);
    this.router.delete("/cart", isAuthenticated, cartController.clear);
  }

  /* ===========================
   * ❤️ FAVORITES
   * =========================== */
  favorite() {
    // 🔎 checar se produto está favoritado
    this.router.get(
      "/favorites/:productId",
      isAuthenticated,
      favoriteController.check
    );

    // 📃 listar favoritos do usuário
    this.router.get(
      "/favorites",
      isAuthenticated,
      favoriteController.show
    );

    // 🔁 toggle (add/remove)
    this.router.post(
      "/favorites/:productId",
      isAuthenticated,
      favoriteController.toggle
    );

    // ❌ remover direto
    this.router.delete(
      "/favorites/:productId",
      isAuthenticated,
      favoriteController.remove
    );
  }


  /* ===========================
   * 🚚 SHIPPING
   * =========================== */
  shipping() {
    this.router.post("/shipping/calculate", calculate);
  }

  /* ===========================
   * 🔗 SET ROUTES
   * =========================== */
  setRoutes() {
    this.home();
    this.user();
    this.category();
    this.product();
    this.variation();
    this.cart();
    this.favorite();
    this.shipping();
  }

  getRoutes() {
    return this.router;
  }
}

import { Router } from "express";
import homeController from "./controllers/home/home.controller.js";
import userController from "./controllers/user/user.controller.js";
import { isAuthenticated } from "./middlewares/isAuthenticated.js";

export default class AppRouter
{
    constructor()
    {
        this.router = Router();

        this.setRoutes();
    }

    home()
    {
        return this.router.get("/", homeController.index);
    }

    /**
     * @private
     */
    user()
    {
        this.router.get("/users", isAuthenticated, userController.index);
        this.router.get("/users/:id", isAuthenticated, userController.show);
        this.router.post("/users", userController.create);
        this.router.post("/users/auth", userController.auth);
        this.router.put("/users/:id", isAuthenticated, userController.update);
        this.router.patch("/users/:id/password", isAuthenticated, userController.updatePassword);
        this.router.delete("/users/:id", isAuthenticated, userController.delete);
    }

    /**
     * @private
     */
    setRoutes()
    {
        this.home();
        this.user();
    }

    /**
     * @public
     */
    getRoutes()
    {
        return this.router;
    }
}
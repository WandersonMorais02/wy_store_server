import "dotenv/config";
import express from "express";
import cors from "cors";
import AppRouter from "./routes.js";
import mongoose from "mongoose";

export default class App
{
    constructor()
    {
        this.port = String(process.env.PORT);
        this.app = express();
        this.rts = new AppRouter();
        mongoose.connect(process.env.CONNECTION_STRING);

        this.middlewares();
        this.routes();
    }

    /**
     * @param { string | number } prt
     */
    set port(prt)
    {
        typeof prt === "number" ? this.__port = prt : this.__port = Number(prt);
    }

    /**
     * @returns { number }
     */
    get port()
    {
        return this.__port;
    }

    /**
     * @private
     */
    middlewares()
    {
        this.app.use(express.json());
        this.app.use(cors());
    }

    /**
     * @private
     */
    routes()
    {
        this.app.use(this.rts.getRoutes());
    }

    /**
     * @private
     */
    listen()
    {
        this.app.listen(this.port, ()=>{
            console.log(`
                    Server online!
                Go to: http://localhost:${this.port}
            `);
        });
    }

    /**
     * @public
     */
    run()
    {
        this.listen();
    }
}
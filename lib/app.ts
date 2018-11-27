import * as express from "express";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import { TeamRoutes } from "./routes/teamRoutes";
import { TripRoutes } from "./routes/tripRoutes";
import { PhotoRoutes } from "./routes/photoRoutes";
import * as mongoose from "mongoose";

require('dotenv').config();

class App {
    public app: express.Application;
    public teamRoutes: TeamRoutes = new TeamRoutes();
    public tripRoutes: TripRoutes = new TripRoutes();
    public photoRoutes: PhotoRoutes = new PhotoRoutes();
    public mongoUrl: string = process.env.MONGO_URL;

    constructor() {
        this.app = express();
        this.app.use(cors())
        this.config();        
        this.teamRoutes.routes(this.app);
        this.tripRoutes.routes(this.app);
        this.photoRoutes.routes(this.app);
        this.mongoSetup();
    }

    private config(): void{
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        // serving static files 
        this.app.use(express.static('public'));
    }

    private mongoSetup(): void{
        mongoose.Promise = global.Promise;
        mongoose.connect(this.mongoUrl);        
    }
}

export default new App().app;
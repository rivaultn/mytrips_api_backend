/**
 * Manage the trip routes
 */
import { TripController } from "../controllers/tripController";

export class TripRoutes {

    public tripController: TripController = new TripController();

    public routes(app): void {
        // route to get saved trips & add a new one
        app.route('/trip')
            .get(this.tripController.getTrips)
            .post(this.tripController.addNewTrip);

        // route to get a trip, update a trip or delete
        app.route('/trip/:tripId')
            .get(this.tripController.getTripByID)
            .put(this.tripController.updateTrip)
            .delete(this.tripController.deleteTrip)

    }
}
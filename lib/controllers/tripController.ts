/**
 * Controller to manage trip data
 */

import * as mongoose from 'mongoose';
import { TripSchema } from '../models/tripModel';
import { Request, Response } from 'express';

const Trip = mongoose.model('Trip', TripSchema);

export class TripController{
    /**
     * Save a new trip
     *
     * @param req: the request object containing a trip object in the body
     * @param res: the response object containing the saved trip or the error
     */
    public addNewTrip (req: Request, res: Response) {
        Trip.create(req.body.trip, function(err, trip) {
            if(err){
                res.send(err);
            }
            res.json(trip);
        });
    }

    /**
     * Get every trip in the database
     *
     * @param req: the request object
     * @param res: the response objet containing an array of the trips or the error
     */
    public getTrips (req: Request, res: Response) {
        Trip.find({}, (err, trip) => {
            if(err){
                res.send(err);
            }
            res.json(trip);
        });
    }

    /**
     * Get a trip by its Id
     *
     * @param req: the request object containing the Id
     * @param res: the response object containing the trip if Id existing or the error
     */
    public getTripByID (req: Request, res: Response) {
        Trip.findById(req.params.tripId, (err, trip) => {
            if(err){
                res.send(err);
            }
            res.json(trip);
        });
    }

    /**
     * Update a trip
     *
     * @param req: the request object containing the trip to update
     * @param res: the response object containing the trip updated or the error
     */
    public updateTrip (req: Request, res: Response) {
        Trip.findOneAndUpdate({ _id: req.params.tripId },
            req.body.trip, { new: true }, (err, trip) => {
                if(err){
                    res.send(err);
                }
                res.json(trip);
            });
    }

    /**
     * Delete a trip
     *
     * @param req: the request object containing the trip Id to delete
     * @param res: the response object containing the success message or the error
     */
    public deleteTrip (req: Request, res: Response) {
        Trip.remove({ _id: req.params.tripId }, (err, trip) => {
            if(err){
                res.send(err);
            }
            res.json('Successfully deleted trip!');
        });
    }
}
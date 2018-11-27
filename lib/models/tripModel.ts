/**
 * Mongoose schema for trip object
 */

import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const TripSchema = new Schema({
    photoInOne: String,
    name: String,
    from: Date,
    to:  Date,
    steps: [{
        id: Number,
        name: String,
        from:  Date,
        to: Date,
        transportations: [{
            transportType: String,
            comment: String
        }],
        substeps: [{
            name: String,
            comment: String,
            uuid: String,
            photo: String,
            photoMin: String,
            date: Date,
            team: {type: mongoose.Schema.Types.ObjectId, ref: 'TeamSchema'},
            place: String,
            lat: Number,
            long: Number,
        }]
    }],
});
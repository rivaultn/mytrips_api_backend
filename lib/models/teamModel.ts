/**
 * Mongoose schema for team object
 */

import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const TeamSchema = new Schema({
    color: {
        type: String,
    },
    name: {
        type: String,
    },
    member: {
        type: [String]
    }
});
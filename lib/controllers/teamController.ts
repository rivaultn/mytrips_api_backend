/**
 * Controller to manage team data
 */
import * as mongoose from 'mongoose';
import { TeamSchema } from '../models/teamModel';
import { Request, Response } from 'express';

const Team = mongoose.model('Team', TeamSchema);

export class TeamController{
    /**
     * Save a new team
     *
     * @param req: the request object containing a team object in the body
     * @param res: the response object containing the saved team or the error
     */
    public addNewTeam (req: Request, res: Response) {
        Team.create(req.body.team, function(err, team) {
            if(err){
                res.send(err);
            }
            res.json(team);
        });
    }

    /**
     * Get every team in the database
     *
     * @param req: the request object
     * @param res: the response objet containing an array of the team or the error
     */
    public getTeams (req: Request, res: Response) {
        Team.find({}, (err, team) => {
            if(err){
                res.send(err);
            }
            res.json(team);
        });
    }

    /**
     * Get a team by its Id
     *
     * @param req: the request object containing the Id
     * @param res: the response object containing the team if Id existing or the error
     */
    public getTeamByID (req: Request, res: Response) {
        Team.findById(req.params.teamId, (err, team) => {
            if(err){
                res.send(err);
            }
            res.json(team);
        });
    }

    /**
     * Update a team
     *
     * @param req: the request object containing the team to update
     * @param res: the response object containing the team updated or the error
     */
    public updateTeam (req: Request, res: Response) {
        Team.findOneAndUpdate({ _id: req.params.teamId },
            req.body.team, { new: true }, (err, team) => {
                if(err){
                    res.send(err);
                }
                res.json(team);
            });
    }

    /**
     * Delete a team
     *
     * @param req: the request object containing the team Id to delete
     * @param res: the response object containing the success message or the error
     */
    public deleteTeam (req: Request, res: Response) {
        Team.remove({ _id: req.params.teamId }, (err, team) => {
            if(err){
                res.send(err);
            }
            res.json({ message: 'Successfully deleted team!'});
        });
    }
}
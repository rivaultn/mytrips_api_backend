/**
 * Manage the team routes
 */
import { TeamController } from "../controllers/teamController";

export class TeamRoutes {

    public teamController: TeamController = new TeamController();

    public routes(app): void {
        // route to get saved teams & add a new one
        app.route('/team')
            .get(this.teamController.getTeams)
            .post(this.teamController.addNewTeam);

        // route to get a team, update a team or delete
        app.route('/team/:teamId')
            .get(this.teamController.getTeamByID)
            .put(this.teamController.updateTeam)
            .delete(this.teamController.deleteTeam)

    }
}
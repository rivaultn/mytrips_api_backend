/**
 * Manage the photo routes
 */

import { PhotoController } from "../controllers/photoController";

export class PhotoRoutes {

    public photoController: PhotoController = new PhotoController();

    public routes(app): void {
        // upload photo route
        app.route('/photo/uploads').post(this.photoController.onUpload);

        // delete a photo route by its step Id & its uuid route
        app.route('/photo/uploads/:stepId/:uuid').delete(this.photoController.onDeleteFile);

        // delete substeps photo of a step by the step Id route
        app.route('/photo/delete/:stepId').delete(this.photoController.onDeleteStep);

        // get a photo by its step Id, photo uuid & name photo route
        app.route('/photo/:stepId/:photouuid/:name').get(this.photoController.getPhotoByPath);

        // get the no found image route route
        app.route('/photo/notFound').get(this.photoController.getImagePhotoNotFound);
    }
}
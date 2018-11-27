/**
 * Controller to manage photo data
 */
import { Request, Response } from 'express';
import * as fs from "fs";
import * as mkdirp from 'mkdirp';
import * as rimraf from 'rimraf';
import * as multiparty from 'multiparty';
import * as sharp from 'sharp';
import * as path from 'path';
import * as exif from 'exif-parser';

require('dotenv').config();

// paths/constants
const fileInputName = process.env.FILE_INPUT_NAME || "qqfile";
const uploadedFilesPath = process.env.UPLOADED_FILES_PATH;
const pathNoImageFound = process.env.NO_IMAGE_FOUND_PATH;
const chunkDirName = process.env.CHUNK_DIR_NAME || "chunks";
const maxFileSize = process.env.MAX_FILE_SIZE || 0; // in bytes, 0 for unlimited

export class PhotoController{
    /**
     * Get a photo
     *
     * @param req: the request object containing the step Id, the photo uuid, the photo name
     * @param res: the response object containing the photo or the error
     */
    public getPhotoByPath (req: Request, res: Response) {
        const path = uploadedFilesPath + req.params.stepId + '/' + req.params.photouuid + '/' + req.params.name;

        try {
            // if file exists -> send the photo
            if(fs.existsSync(path)){
                res.sendFile(path, function (err) {
                    if (err) {
                        res.json(err);
                    }
                });
            }else{ //if file doesn't exists -> send the default no found image
                res.sendFile(pathNoImageFound, function (err) {
                    if (err) {
                        res.json(err);
                    }
                });
            }
        }catch(err){
            console.log(err);
        }
    }

    /**
     * Get the default photo not found
     *
     * @param req: the request object
     * @param res: the response object containing the 'no found image' or the error
     */
    public getImagePhotoNotFound(req: Request, res: Response){
        res.sendFile(pathNoImageFound, function (err) {
            if (err) {
                res.json(err);
            }
        });
    }

    /**
     * Upload a new photo
     *
     * @param req: the request object
     * @param res: the response object
     */
    public onUpload(req, res) {
        var form = new multiparty.Form();

        form.parse(req, function(err, fields, files) {
            var partIndex = fields.qqpartindex;

            // text/plain is required to ensure support for IE9 and older
            res.set("Content-Type", "text/plain");

            // if it's a simple upload
            if (partIndex == null) {
                PhotoController.onSimpleUpload(fields, files[fileInputName][0], res);
            }
            else { // if it's a chunked upload
                PhotoController.onChunkedUpload(fields, files[fileInputName][0], res);
            }
        });
    }

    /**
     * Upload a simple photo
     *
     * @param fields: the photo fields (qquuid, qqfilename, stepId)
     * @param file: the file to upload
     * @param res: the response object containing success, uuid, date & GPS coordinates if upload has succeeded
     */
    public static onSimpleUpload(fields, file, res) {
        var uuid = fields.qquuid,
            responseData = {
                success: false,
                uuid: false,
                date: false,
                GPSLatitude: false,
                GPSLongitude: false,
            };

        file.name = fields.qqfilename;
        file.stepId = fields.stepId;

        if (PhotoController.isValid(file.size)) {
            PhotoController.moveUploadedFile(file, uuid, function(pathFile, pathFileMiniature) {
                // generates the miniature
                PhotoController.generateMiniature(pathFile, pathFileMiniature, 350);

                // gets the exif data (date & GPS coordinates)
                const exifData = PhotoController.getExifData(pathFile);

                responseData.date = exifData.date;
                responseData.GPSLatitude = exifData.GPSLatitude;
                responseData.GPSLongitude = exifData.GPSLongitude;
                responseData.success = true;
                responseData.uuid = uuid;
                res.send(responseData);
            },
            function() {
                // @ts-ignore
                responseData.error = "Problem copying the file!";
                res.send(responseData);
            });
        }
        else {
            PhotoController.failWithTooBigFile(responseData, res);
        }
    }

    /**
     * Get the photo exif data
     *
     * @param pathFile: the photo path
     */
    public static getExifData(pathFile) {
        let responseData = {
            date: false,
            GPSLatitude: false,
            GPSLongitude: false,
        };

        try {
            // get the 128 first kb of the file
            const buffer = fs.readFileSync(pathFile.slice(0, 128 * 1024));
            // parse
            const parser = exif.create(buffer);
            const result = parser.parse();

            // get the data
            responseData.date = result.tags['DateTimeOriginal'];
            responseData.GPSLatitude = result.tags['GPSLatitude'];
            responseData.GPSLongitude = result.tags['GPSLongitude'];
        }catch(err) {
            console.log(err);
        }

        return responseData;
    }

    /**
     * Upload a chunked file
     *
     * @param fields: the photo fields (qqtotalfilesize, qqpartindex, qqtotalparts, qquuid, qqfilename, stepId)
     * @param file: the file to upload
     * @param res: the response object containing success, uuid, date & GPS coordinates if upload has succeeded
     */
    public static onChunkedUpload(fields, file, res) {
        var size = parseInt(fields.qqtotalfilesize),
            uuid = fields.qquuid,
            index = fields.qqpartindex,
            totalParts = parseInt(fields.qqtotalparts),
            responseData = {
                success: false,
                uuid: false,
                date: false,
                GPSLatitude: false,
                GPSLongitude: false,
            };

        file.name = fields.qqfilename;
        file.stepId = fields.stepId;

        if (PhotoController.isValid(size)) {
            PhotoController.storeChunk(file, uuid, index, totalParts, function(pathFile) {
                    // if it's not the last part of the file
                    if (index < totalParts - 1) {
                        // get the exif data
                        const exifData = PhotoController.getExifData(pathFile);

                        responseData.date = exifData.date;
                        responseData.GPSLatitude = exifData.GPSLatitude;
                        responseData.GPSLongitude = exifData.GPSLongitude;
                        responseData.success = true;
                        responseData.uuid = uuid;
                        responseData.success = true;

                        res.send(responseData);
                    }
                    else {
                        PhotoController.combineChunks(file, uuid, function(pathFile, pathFileMiniature) {
                                PhotoController.generateMiniature(pathFile, pathFileMiniature, 350);
                                const exifData = PhotoController.getExifData(pathFile);

                                responseData.date = exifData.date;
                                responseData.GPSLatitude = exifData.GPSLatitude;
                                responseData.GPSLongitude = exifData.GPSLongitude;
                                responseData.success = true;
                                responseData.uuid = uuid;
                                responseData.success = true;

                                res.send(responseData);
                            },
                            function() {
                                // @ts-ignore
                                responseData.error = "Problem conbining the chunks!";
                                res.send(responseData);
                            });
                    }
                },
                function(reset) {
                    // @ts-ignore
                    responseData.error = "Problem storing the chunk!";
                    res.send(responseData);
                });
        }
        else {
            PhotoController.failWithTooBigFile(responseData, res);
        }
    }

    /**
     * Send a failed response if file is too big
     *
     * @param responseData: the responseData object
     * @param res: the response objet containing the responseData updated
     */
    public static failWithTooBigFile(responseData, res) {
        responseData.error = "Too big!";
        responseData.preventRetry = true;
        res.send(responseData);
    }

    /**
     * Delete file
     *
     * @param req: the request object containing the step Id & the photo Id
     * @param res: the response object containing the uuid or the error
     */
    public onDeleteFile(req, res) {
        var stepId = req.params.stepId;
        var uuid = req.params.uuid,
            dirToDelete = uploadedFilesPath + '/' + stepId + '/' + uuid;

        // delete the folder parent
        rimraf(dirToDelete, function(error) {
            if (error) {
                console.error("Problem deleting file! " + error);
                res.status(500);
            }

            res.status(200);
            res.send(uuid);
        });
    }

    /**
     * Delete step folder containing the substep photos
     *
     * @param req: the request object containing the step Id
     * @param res: the response object containing the success code or the error
     */
    public onDeleteStep(req, res) {
        var stepId = req.params.stepId;
        var dirToDelete = uploadedFilesPath + '/' + stepId;

        // delete the step folder
        rimraf(dirToDelete, function(error) {
            if (error) {
                console.error("Problem deleting file! " + error);
                res.status(500);
            }

            res.status(204).end();
        });
    }

    /**
     * Check if the size is valide
     *
     * @param size: the file size
     */
    public static isValid(size) {
        return maxFileSize === 0 || size < maxFileSize;
    }

    /**
     * Move a photo
     *
     * @param destinationDir: the destination directory path
     * @param sourceFile: the source photo path
     * @param destinationFile: the destination photo path
     * @param destinationMiniatureFile: the destination of the photo miniature path
     * @param success: the function to execute in case of success
     * @param failure: the function to execute in case of failure
     */
    public static moveFile(destinationDir, sourceFile, destinationFile, destinationMiniatureFile, success, failure) {
        mkdirp(destinationDir, function(error) {
            var sourceStream, destStream;

            if (error) {
                console.error("Problem creating directory " + destinationDir + ": " + error);
                failure();
            }
            else {
                // open stream between source & destination
                sourceStream = fs.createReadStream(sourceFile);
                destStream = fs.createWriteStream(destinationFile);

                sourceStream
                    .on("error", function(error) {
                        console.error("Problem copying file: " + error.stack);
                        destStream.end();
                        failure();
                    })
                    .on("end", function(){
                        destStream.end();
                        success(destinationFile, destinationMiniatureFile);
                    })
                    .pipe(destStream);
                return true;
            }
        });
    }

    /**
     * Move an uploaded photo
     *
     * @param file: the photo to move
     * @param uuid: the photo uuid
     * @param success: the function to execute in case of success
     * @param failure: the function to execute in case of failure
     */
    public static moveUploadedFile(file, uuid, success, failure) {
        var destinationDir = uploadedFilesPath + file.stepId + '/' + uuid,
            fileDestination = destinationDir + '/' + file.name,
            miniatureDestination = destinationDir + '/' + path.parse(file.name.toString()).name + '-min' + path.parse(file.name.toString()).ext;

        PhotoController.moveFile(destinationDir, file.path, fileDestination, miniatureDestination, success, failure);
    }

    /**
     * Generate a miniature
     *
     * @param imagePath: the photo path
     * @param dest: the destination path
     * @param width: the miniature width
     */
    public static generateMiniature(imagePath, dest, width){
        sharp(imagePath)
            .resize (width)
            .toBuffer ()
            .then (data => {
                fs.writeFileSync (dest, data)
            })
            .catch ((err) => {
                console.error("Problem generate file miniature: " + err);
            })
    }

    /**
     * Store the photo chunk if it's a chunked photo
     *
     * @param file: the photo to store
     * @param uuid: the photo uuid
     * @param index: the photo chunk index
     * @param numChunks: the chunk number
     * @param success: the function to execute in case of success
     * @param failure: the function to execute in case of failure
     */
    public static storeChunk(file, uuid, index, numChunks, success, failure) {
        var destinationDir = uploadedFilesPath + file.stepId + '/' + uuid + '/' + chunkDirName + "/",
            chunkFilename = PhotoController.getChunkFilename(index, numChunks),
            fileDestination = destinationDir + chunkFilename;

        PhotoController.moveFile(destinationDir, file.path, fileDestination, false, success, failure);
    }

    /**
     * Combine chunks to reform the file (if it's a chunked photo)
     *
     * @param file: the chunk part of the photo
     * @param uuid: the photo uuid
     * @param success: the function to execute in case of success
     * @param failure: the function to execute in case of failure
     */
    public static combineChunks(file, uuid, success, failure) {
        var chunksDir = uploadedFilesPath + file.stepId + '/' + uuid + "/" + chunkDirName + "/",
            destinationDir = uploadedFilesPath + file.stepId + '/' + uuid + "/",
            fileDestination = destinationDir + file.name,
            miniatureDestination = destinationDir + '/' + path.parse(file.name.toString()).name + '-min' + path.parse(file.name.toString()).ext;

        fs.readdir(chunksDir, function(err, fileNames) {
            var destFileStream;

            if (err) {
                console.error("Problem listing chunks! " + err);
                failure();
            }
            else {
                fileNames.sort();
                destFileStream = fs.createWriteStream(fileDestination, {flags: "a"});

                PhotoController.appendToStream(destFileStream, chunksDir, fileNames, 0, function() {
                        // delete the chunk directory
                        rimraf(chunksDir, function(rimrafError) {
                            if (rimrafError) {
                                console.log("Problem deleting chunks dir! " + rimrafError);
                            }
                        });
                        success(fileDestination, miniatureDestination);
                    },
                    failure);
            }
        });
    }

    /**
     * Append the chunk part to the stream
     *
     * @param destStream: the destination stream
     * @param srcDir: the source directory
     * @param srcFilesnames: the source filenames
     * @param index: the chunk index
     * @param success: the function to execute in case of success
     * @param failure: the function to execute in case of failure
     */
    public static appendToStream(destStream, srcDir, srcFilesnames, index, success, failure) {
        // if the chunk part to append is not the last one
        if (index < srcFilesnames.length) {
            fs.createReadStream(srcDir + srcFilesnames[index])
                .on("end", function() {
                    PhotoController.appendToStream(destStream, srcDir, srcFilesnames, index + 1, success, failure);
                })
                .on("error", function(error) {
                    console.error("Problem appending chunk! " + error);
                    destStream.end();
                    failure();
                })
                .pipe(destStream, {end: false});
        }
        else {
            destStream.end();
            success();
        }
    }

    /**
     * Get the chunk file name
     *
     * @param index: the chunk index
     * @param count
     */
    public static getChunkFilename(index, count) {
        var digits = new String(count).length,
            zeros = new Array(digits + 1).join("0");

        return (zeros + index).slice(-digits);
    }
}
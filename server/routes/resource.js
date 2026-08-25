import express from 'express'
import { auth } from '../middleware/authorisation.js'
import { verifyResourceData } from '../middleware/data-verification.js'

const router = express.Router()

/**
 * The endpoint at which a new resource can be added
 */
router.post('/addResource', auth, verifyResourceData,(req, res, next) => {
    const { title, type, uploaderID, fileRef, parentID, accessLevel } = req.body;

    let currentDate = new Date();

    if (req.role !== 'admin' && req.role !== 'ranger') {
        res.status(403).json({
            error: true,
            message: "Current user is not authorised to add a resource. Only admins and rangers can add resources."
        });
        return;
    }

    req.db.from("resource").insert({
        resource_id: null,
        title,
        type,
        uploader_id: uploaderID,
        file_ref: fileRef,
        parent_id: parentID,
        access_level: accessLevel,
        created: currentDate.toISOString().slice(0, 19).replace('T', ' '), // Convert time to MySQL DATETIME format
    })
    .then(() => {
        res.status(201).json({ message: "Resource added successfully" })
    })
    .catch(e => {
        console.log(e.message)
        res.status(500).json({ error: true })
    })
})

/**
 * The endpoint at which a resource's information can be retrieved
 */
router.get('/:resourceID', auth, (req, res, next) => {
    const { resourceID } = req.params;
    let fields = ['type', 'title', 'uploader_id', 'file_ref', 'parent_id', 'access_level', 'created']

    req.db("resource")
    .select(fields)
    .where('resource_id', resourceID)
    .first() // There should only ever be one resource with a given resourceID
    .then(resource => {
        if (!resource) {
            res.status(404).json({ error: true, message: "Resource not found" });
            return;
        }

        const data = {
            id: resourceID,
            type: resource.type,
            title: resource.title,
            uploaderID: resource.uploader_id,
            fileRef: resource.file_ref,
            parentID: resource.parent_id,
            accessLevel: resource.access_level,
            created: resource.created
        }
        res.json(data)
    })
    .catch((e) => {
      console.log(e.message)
      res.status(500).json({ error: true })
    })
})

export default router
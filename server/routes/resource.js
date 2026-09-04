import express from 'express'
import { auth, getAccessLevel } from '../middleware/authorisation.js'
import { verifyResourceData } from '../middleware/data-verification.js'

const router = express.Router()

/**
 * The endpoint at which a new resource can be added
 */
router.post('/create', auth, verifyResourceData, async (req, res, next) => {
    const { type, title, fileRef, parentID, accessLevel } = req.body;



    let currentDate = new Date();

    if (req.role !== 'admin' && req.role !== 'ranger') {
        res.status(403).json({
            error: true,
            message: "Current user is not authorised to add a resource. Only admins and rangers can add resources."
        });
        return;
    }

    const currentUser = await req.db.from("user").select('user_id').where('email', req.email).first();
    const uploaderID = currentUser.user_id;

    
    req.db.from("resource").insert({
        resource_id: null,
        type: type.toLowerCase(), // Ensure type is stored in lowercase for consistency
        title,
        uploader_id: uploaderID, // TODO: Modify JWT call to include userID and add it to req.userID in the auth process.
        file_ref: fileRef,
        parent_id: parentID,
        access_level: accessLevel.toLowerCase(), // Ensure access level is stored in lowercase for consistency
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
router.get('/:resourceID', auth, getAccessLevel, (req, res, next) => {
    const resourceID = Number.parseInt(req.params.resourceID, 10);
    if (Number.isNaN(resourceID))
    {
        res.status(400).json({
            error: true,
            message: "Resource ID is invalid"
        });
        return;
    }

    let fields = ['type', 'title', 'uploader_id', 'file_ref', 'parent_id', 'access_level', 'created']

    let accessTo = req.accessTo;

    req.db.from("resource")
    .select(fields)
    .where('resource_id', resourceID)
    .first() // There should only ever be one resource with a given resourceID
    .then(resource => {
        if (!resource) {
            res.status(404).json({ error: true, message: "Resource not found" });
            return;
        }
        if (!accessTo.includes(resource.access_level)) {
            res.status(403).json({ error: true, message: "User does not have access to view this resource"});
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
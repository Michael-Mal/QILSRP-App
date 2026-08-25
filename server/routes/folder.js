import express from 'express'
import { auth } from '../middleware/authorisation.js'

const router = express.Router();

/**
 * The endpoint at which a new folder can be added
 */
router.post('/addFolder', auth, (req, res, next) => {
    const { name, parentID, accessLevel } = req.body;

    let currentDate = new Date();

    if (req.role !== 'admin' && req.role !== 'ranger') {
        res.status(403).json({
            error: true,
            message: "Current user is not authorised to add a folder. Only admins and rangers can add folders."
        });
        return;
    }

    req.db.from("folders").insert({
        folder_id: null,
        name,
        parent_id: parentID,
        access_level: accessLevel,
        created: currentDate.toISOString().slice(0, 19).replace('T', ' '), // Convert time to MySQL DATETIME format
    })
    .then(() => {
        res.status(201).json({ message: "Folder added successfully" })
    })
    .catch(e => {
        console.log(e.message)
        res.status(500).json({ error: true })
    })
})

/**
 * The endpoint at which a folder's contents can be retrieved
 */
router.get('/:folderId/contents', auth, (req, res, next) => {
    const { folderId } = req.params;

    let accessTo = [];

    // TODO: Make this a more robust system. This is definitely patchwork atm. Add exclusions for folder access level too (else user could potential guess a folder ID)
    switch (req.role) {
        case 'admin':
            accessTo = ['admin', 'ranger', 'student'];
            break;
        case 'ranger':
            accessTo = ['ranger', 'student'];
            break;
        case 'student':
            accessTo = ['student'];
            break;
        default:
            res.status(403).json({
                error: true,
                message: "Current user does not have a role recognised as being able to view resources. Accepted roles: 'admin', 'ranger', 'student'"
            });
            return;
    }


    //TODO: Figure out handling for situations where folder is NULL, root folder, and a recycle bin?
    req.db.from("resources").select("*").where("parent_id", "=", folderId).whereIn("access_level", accessTo)
    .then(function (resources) {
        req.db.from("folders").select("*").where("parent_id", "=", folderId).whereIn("access_level", accessTo).then(function (folders) {
            res.status(200).json({ resources, folders })
        })
    })
    .catch(e => {
        console.log(e.message)
        res.status(500).json({ error: true })
    })
})

export default router
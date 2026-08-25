import express from 'express'
import { auth, getAccessLevel } from '../middleware/authorisation.js'
import { verifyFolderData } from '../middleware/data-verification.js'

const router = express.Router();

/**
 * The endpoint at which a new folder can be added
 */
router.post('/create', auth, (req, res, next) => {
    const { name, parentID, accessLevel } = req.body;

    let currentDate = new Date();

    if (req.role !== 'admin' && req.role !== 'ranger') {
        res.status(403).json({
            error: true,
            message: "Current user is not authorised to add a folder. Only admins and rangers can add folders."
        });
        return;
    }

    req.db.from("folder").insert({
        folder_id: null,
        name: name,
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
 * The endpoint at which a folder's information can be gathered
 */
router.get('/:folderID', auth, getAccessLevel, async (req, res, next) => {
    const folderID = Number.parseInt(req.params.folderID, 10);
    if (Number.isNaN(folderID))
    {
        res.status(400).json({
            error: true,
            message: "Folder ID is invalid"
        });
        return;
    }

    const accessTo = req.accessTo;

    const fields = ['folder_id', 'name', 'parent_id', 'access_level', 'created'];

    try {
        const folder = await req.db.from("folder").select(fields).where('folder_id', folderID).first()
        
        if (!folder) {
            res.status(404).json({ error: true, message: "Folder not found" });
            return;
        }
        if (!accessTo.includes(folder.access_level)) {
            res.status(403).json({ error: true, message: "User does not have access to view this folder"});
            return;
        }

        let path = [];
        let currentFolder = folder;

        // TODO: Investigate a less intensive method of finding paths, this method involves several db calls.
        while(currentFolder) {
            path.push({
                id: currentFolder.folder_id,
                name: currentFolder.name
            });

            if (currentFolder.parent_id === null) {
                break; // Break after root folder is in path
            }

            currentFolder = await req.db.from("folder").select(fields).where('folder_id', currentFolder.parent_id).first();

            if (!currentFolder) {
                throw new Error("The folder path is invalid."); // Throw error if there was a valid parent_id that doesn't lead to a folder.
            }
        }
        path.reverse();

        const data = {
            id: folderID,
            name: folder.name,
            parentID: folder.parent_id,
            accessLevel: folder.access_level,
            created: folder.created,
            path
        }
        res.json(data)
    }
    catch(e) {
        console.log(e.message)
        res.status(500).json({ error: true })
    }
})


/**
 * The endpoint at which a folder's contents can be retrieved. Does not include paths for subfolders within the called folder.
 */
router.get('/:folderID/contents', auth, getAccessLevel, async (req, res, next) => {
    const folderID = Number.parseInt(req.params.folderID, 10);
    if (Number.isNaN(folderID))
    {
        res.status(400).json({
            error: true,
            message: "Folder ID is invalid"
        });
        return;
    }


    const accessTo = req.accessTo;

    try {
        const folder = await req.db.from("folder").select("access_level").where("folder_id", folderID).first()
        if (!folder) {
            res.status(404).json({ error: true, message: "Folder not found" });
            return;
        }
        if (!accessTo.includes(folder.access_level)) {
            res.status(403).json({ error: true, message: "User does not have access to view this folder"});
            return;
        }
    
        const resourceRows = await req.db.from("resource").select("*").where("parent_id", folderID).whereIn("access_level", accessTo);

        const resources = resourceRows.map(resource => ({
            id: resource.resource_id,
            type: resource.type,
            title: resource.title,
            uploaderID: resource.uploader_id,
            fileRef: resource.file_ref,
            parentID: resource.parent_id,
            accessLevel: resource.access_level,
            created: resource.created
        }))

        const folderRows = await req.db.from("folder").select("*").where("parent_id", folderID).whereIn("access_level", accessTo);

        const folders = folderRows.map(folder => ({
            id: folder.folder_id,
            name: folder.name,
            parentID: folder.parent_id,
            accessLevel: folder.access_level,
            created: folder.created
        }));

        res.status(200).json({ folders, resources });
    }
    catch(e) {
        console.log(e.message)
        res.status(500).json({ error: true })
    }
})


export default router
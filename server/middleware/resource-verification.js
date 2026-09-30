const roles = ['student', 'ranger', 'admin']

// ---------------------------------------------- RESOURCE VERIFICATION ---------------------------------------------

/**
 * Validates the format of a resource title, enforcing character restrictions and other rules
 */
const verifyResourceTitle = (title) => {
  if (title.length > 255) {
    throw new Error("Resource title must not exceed 255 characters")
  }

  if (title.trim() === "") {
    throw new Error("Resource title must not be empty")
  }

  if (/[<>:"/|\\?*]/.test(title)) {
    throw new Error('Resource title contains invalid characters. Restricted characters: < > : " / | \\ ? *')
  }
}

/**
 * Validates a provided access level, throwing an error if it is not one of the recognised roles
 * @param {*} accessLevel - Provided access level to check 
 */
const verifyValidAccessLevel = (accessLevel) => {
  if (!roles.includes(accessLevel)) {
    const errorMessage = "Access level must be one of: " + roles.map(role => `'${role}'`).join(", ")
    throw new Error(errorMessage)
  }
}

/**
 * Validates that a list of cohorts are all valid cohorts. Requires a database connection to be passed to obtain existing cohorts.
 * @param {} cohorts - list of cohorts to validate
 * @param {*} db  - database connection to find existing cohorts
 */
const verifyValidCohorts = async (cohorts, db) => {
  if (!Array.isArray(cohorts)) {
    throw new Error("Cohorts must be an array")
  }

  // Get all cohorts mentioned in the list of cohorts
  const rows = await db.from("cohort").select("name").whereIn("name", cohorts)

  // If rows are a different length, one or more cohorts were not found.
  if (rows.length !== cohorts.length) {
    throw new Error("One or more cohorts specified does not exist")
  }
}
/**
 * Verifies the information provided for a resource being added to the database, throwing an error if some information is invalid.
 * @returns 
 */
const verifyResourceData = (req, res, next) => {
  const { title, type, extension, mimeType, parentID, cohorts, accessLevel } = req.body ?? {}

  if (!title || !type || !extension || !mimeType || !parentID || !accessLevel) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete, some required fields are missing. Required fields: title, type, extension, mimeType, parentID, accessLevel"
    })
    return
  }

  try {
    verifyResourceTitle(title)
  }
  catch (e) {
    res.status(400).json({
      error: true,
      message: e.message
    })
    return
  }

  const types = ['video', 'audio', 'image', 'pdf', 'document', 'spreadsheet', 'presentation'];

  if (!types.includes(type.toLowerCase())) {
    res.status(400).json({
      error: true,
      message: "Resource type must be one of 'video', 'audio', 'image', 'pdf', 'document', 'spreadsheet' or 'presentation'"
    })
    return
  }

  // Check if cohorts exist in the db
  try {
    verifyValidCohorts(cohorts, req.db)
  }
  catch (e) {
    res.status(400).json({
      error: true,
      message: e.message
    })
    return
  }


  // Check if accessLevel is a valid value, currently must be one of the roles
  try {
    verifyValidAccessLevel(accessLevel.toLowerCase())
  }
  catch (e) {
    res.status(400).json({
      error: true,
      message: e.message
    })
    return
  }

  // TODO: Check mimeType and extension match the type of resource being uploaded

  next()
}

const verifyResourceEditData = (req, res, next) => {
  const { title, cohorts, accessLevel } = req.body ?? {}

  if (!title && !cohorts && !accessLevel) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete, at least one of title or accessLevel must be provided"
    })
    return
  }

  // Check if title is valid, if it is provided
  if (title) {
    try {
      verifyResourceTitle(title)
    }
    catch (e) {
      res.status(400).json({
        error: true,
        message: e.message
      })
      return
    }
  }

  // Check if accessLevel is a valid value, if it is provided. Currently must be one of the roles
  if (accessLevel) {
    try {
      verifyValidAccessLevel(accessLevel.toLowerCase())
    }
    catch (e) {
      res.status(400).json({
        error: true,
        message: e.message
      })
      return
    }
  }

  // Check if provided cohorts are valid, if provided
  if (cohorts) {
    try {
      verifyValidCohorts(cohorts, req.db)
    }
    catch (e) {
      res.status(400).json({
        error: true,
        message: e.message
      })
      return
    }
  }

  next()
}


// ------------------------------ FOLDER VERIFICATION ---------------------------

/**
 * Validates the format and length of a folders name.
 * @param {string} name - the name of the folder
 */
const verifyFolderName = (name) => {
  if (name.length > 128) {
    throw new Error("Folder name must not exceed 128 characters")
  }

  if (name.trim() === "") {
    throw new Error("Folder name must not be empty")
  }

  if (/[<>:"/|\\?*]/.test(name)) {
    throw new Error('Folder name contains invalid characters. Restricted characters: < > : " / | \\ ? *')
  }
}

/**
 * Validates the information provided for a folder being added to the database, throwing an error if some information is invalid.
 * @returns an erorr if some information is invalid
 */
const verifyFolderData = (req, res, next) => {
  const { name, parentID, cohorts, accessLevel } = req.body ?? {}

  // parentID cannot be null for any folder but the root, which has been pre-established in the table.
  if (!name || !parentID || !accessLevel) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete, some required fields are missing. Required fields: name, parentID, accessLevel"
    })
  }

  try {
    verifyFolderName(name)
  }
  catch (e) {
    res.status(400).json({
      error: true,
      message: e.message
    })
    return
  }

  // Check if cohorts exist in the db
  try {
    verifyValidCohorts(cohorts, req.db)
  }
  catch (e) {
    res.status(400).json({
      error: true,
      message: e.message
    })
    return
  }

  // Check if accessLevel is a valid value, currently must be one of the roles
  if (!roles.includes(accessLevel)) {
    res.status(400).json({
      error: true,
      message: "Access level must be one of 'student', 'ranger', or 'admin'"
    })
    return
  }

  next()
}

export {verifyResourceData, verifyResourceEditData, verifyFolderData}
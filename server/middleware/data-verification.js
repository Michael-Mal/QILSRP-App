/**
 * Validates that the user data in the body of the request
 * is in the correct format
 * @returns An error if either field is null
 */
const verifyUserLoginData = (req, res, next) => {
  const { email, password } = req.body ?? {}

  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete, both email and password are required"
    })
    return
  }

  next()
}

/**
 * Enforces strong password requirements on the given password
 */
const verifyPassword = (password) => {
  if (password.length < 8) {
    throw new Error("Password must contain at least 8 characters")

  }

  if (!/[A-Z]/.test(password)) {
    throw new Error("Password must contain a capital letter")

  }

  if (!/[0-9]/.test(password)) {
    throw new Error("Password must contain a number")

  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    throw new Error("Password must contain a special character")

  }
}

const roles = ['student', 'ranger', 'admin']

/**
 * Validates that the user data in the body of the request
 * is in the correct format
 * @returns An error if any field is null
 */
const verifyUserData = (req, res, next) => {
  const { name, email, cohort, role } = req.body ?? {}
  
  if (req.url == '/register') {
    // Registration has an additional password field
    const password = req.body.password ?? null

    if (!name || !email || !password || !cohort || !role) {
      res.status(400).json({
        error: true,
        message: "Request body incomplete: name, email, password, cohort, and role are required."
      })
      return

    }

    try {
      verifyPassword(password)

    }
    catch (e) {
      res.status(400).json({
        error: true,
        message: e.message
      })
      return

    }
  }
  else {
    
    if (!name || !email || !cohort || !role) {
      res.status(400).json({
        error: true,
        message: "Request body incomplete: name, email, cohort, and role are required."
      })
      return

    }
  }

  if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email)) {
    res.status(400).json({
      error: true,
      message: "Email must be a valid email"
    })
    return

  }

  if (!roles.includes(role)) {
    res.status(400).json({
      error: true,
      message: "Role must be one of 'student', 'ranger', or 'admin'"
    })
    return

  }

  next()
}

/**
 * Validates that the password data in the body of the request
 * is in the correct format and fits password requirements
 * @returns An error if either field is null or if newPassword is weak
 */
const verifyUserPasswordData = (req, res, next) => {
  const { currentPassword, newPassword } = req.body ?? {}

  if (!currentPassword || !newPassword) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete, both currentPassword and newPassword are required"
    })
    return

  }

  try {
    verifyPassword(newPassword)

  }
  catch (e) {
    res.status(400).json({
      error: true,
      message: e.message
    })
    return

  }

  next()
}

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
 * Verifies the information provided for a resource being added to the database, throwing an error if some information is invalid.
 * @returns 
 */
const verifyResourceData = (req, res, next) => {
  const { title, type, fileRef, parentID, accessLevel } = req.body ?? {}

  if (!title || !type || !fileRef || !parentID || !accessLevel) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete, some required fields are missing. Required fields: title, type, fileRef, folderID, accessLevel"
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

const verifyFolderData = (req, res, next) => {
  const { name, parentID, accessLevel} = req.body ?? {}

  // parentID cannot be null for any folder but the root, which has been pre-established in the table.
  if (!name || !parentID || !accessLevel) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete, some required fields are missing. Required fields: name, parentID, accessLevel"
    })
  }

  try {
    verifyFolderTitle(name)
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

export { verifyUserLoginData, verifyUserData, verifyUserPasswordData, verifyResourceData, verifyFolderData }
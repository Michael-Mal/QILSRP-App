/**
 * Validates that the user data in the body of the request
 * is in the correct format
 * @returns An error if either field is null
 */
const verifyUserLoginData = (req, res, next) => {
  const { email, password } = req.body ?? {}

  if (!email || !password) {
    let e = Error("Request body incomplete, both email and password are required")
    e.status = 400
    throw e

  }

  next()
}

/**
 * Enforces strong password requirements on the given password
 */
const verifyPassword = (password) => {
  if (password.length < 8) {
    let e = Error("Password must contain at least 8 characters")
    e.status = 400
    throw e

  }

  if (!/[A-Z]/.test(password)) {
    let e = Error("Password must contain a capital letter")
    e.status = 400
    throw e

  }

  if (!/[0-9]/.test(password)) {
    let e = Error("Password must contain a number")
    e.status = 400
    throw e

  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    let e = Error("Password must contain a special character")
    e.status = 400
    throw e

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
      let e = Error("Request body incomplete: name, email, password, cohort, and role are required.")
      e.status = 400
      throw e

    }

    verifyPassword(password)

  }
  else {

    if (!name || !email || !cohort || !role) {
      let e = Error("Request body incomplete: name, email, cohort, and role are required.")
      e.status = 400
      throw e

    }
  }

  if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email)) {
    let e = Error("Email must be a valid email")
    e.status = 400
    throw e

  }

  if (!roles.includes(role)) {
    let e = Error("Role must be one of 'student', 'ranger', or 'admin'")
    e.status = 400
    throw e

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
    let e = Error("Request body incomplete, both currentPassword and newPassword are required")
    e.status = 400
    throw e

  }

  try {
    verifyPassword(newPassword)

  }
  catch (e) {
    e.status = 400
    throw e

  }

  next()
}

export { verifyUserLoginData, verifyUserData, verifyUserPasswordData }
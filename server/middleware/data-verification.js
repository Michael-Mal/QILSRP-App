const roles = ['student', 'ranger', 'admin']

/**
 * Validates that the user data in the body of the request
 * is in the correct format
 * @returns An error if any field is null
 */
const verifyUserData = (req, res, next) => {
  const { name, email, password, cohort, role } = req.body ?? {}

  if (!name || !email || !password || !cohort || !role ) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete: name, email, password, cohort, and role are required."
    })
    return

  }

  if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email)) {
    res.status(400).json({
      error: true,
      message: "Email must be a valid email"
    })
    return

  }

  if (password.length < 8) {
    res.status(400).json({
      error: true,
      message: "Password must contain at least 8 characters"
    })
    return

  }

  if (!/[A-Z]/.test(password)) {
    res.status(400).json({
      error: true,
      message: "Password must contain a capital letter"
    })
    return

  }

  if (!/[0-9]/.test(password)) {
    res.status(400).json({
      error: true,
      message: "Password must contain a number"
    })
    return

  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    res.status(400).json({
      error: true,
      message: "Password must contain a special character"
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

export { verifyUserData, verifyUserLoginData }
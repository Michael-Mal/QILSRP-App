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

/**
 * Normalises phone numbers to be domestic format with no whitepsaces
 */
const normaliseMobile = (mobile) => {
  // Remove all whitespace
  mobile = mobile.replace(/\s/g, '')

  // Make the number domestic format if it isn't already
  if (mobile.startsWith("+614")) {
    mobile = "0" + mobile.substring(3)
  }

  return mobile;
}

/**
 * Verifies an input mobile number to ensure it is a valid australian number. Assumes the mobile number is domestic and contains no whitespace.
 * @param {} mobile 
 */
const verifyMobile = (mobile) => {
  // Ensure the mobile number begins with 04 (domestic Australian mobile number) and contains 8 additional numbers
  if (!/^04\d{8}$/.test(mobile)) {
    let e = Error("Mobile number must be a valid Australian mobile number")
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
  const { name, email, mobile, cohort, role } = req.body ?? {}

  if (req.url == '/register') {
    // Registration has an additional password field
    const password = req.body.password ?? null

    if (!name || !password || !cohort || !role) {
      let e = Error("Request body incomplete: name, password, cohort, and role are required.")
      e.status = 400
      throw e

    }

    verifyPassword(password)

  }
  else {

    if (!name || !cohort || !role) {
      let e = Error("Request body incomplete: name, cohort, and role are required.")
      e.status = 400
      throw e

    }
  }

  if (email) {
    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email)) {
      let e = Error("Email must be a valid email")
      e.status = 400
      throw e

    }
  }

  if (mobile) {
    const normalisedMobile = normaliseMobile(mobile);
    verifyMobile(normalisedMobile)
    // Update body with the normalised mobile that definitely contains no whitespace and is in domestic format
    req.body.mobile = normalisedMobile;

  }
  else if (!email) {
    let e = Error("Request body incomplete: one of email address or mobile number is required.")
    e.status = 400
    throw e

  }

  if (!roles.includes(role)) {
    let e = Error("Role must be one of 'student', 'ranger', or 'admin'")
    e.status = 400
    throw e

  }

  if (role != "admin") {
    // Check if cohort exists
    req.db('cohort')
      .count('*')
      .where('name', cohort)
      .then(count => {
        if (count[0]['count(*)'] != 1) {
          let e = Error("Cohort does not exist")
          e.status = 400
          throw e

        }

        next()

      })
      .catch(e => next(e))

  }
  else {
    next()

  }

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


/* Validates that the cohort in the body of the request is in the correct format
* @returns An error if the name field is invalid
*/
const verifyCohortData = (req, res, next) => {
  const { name } = req.body ?? {}

  if (!name) {
    let e = Error("Request body incomplete: name is required.")
    e.status = 400
    throw e

  }

  next()
}


/** Validates that the event in the body of the request is in the correct format
 * @returns An error if any field is null or if the date is invalid
 */
const verifyEventData = (req, res, next) => {
  const { name, datetime, location, description } = req.body ?? {}

  if (!name || !datetime || !location || !description) {
    let e = Error("Request body incomplete: name, datetime, location, and description are required.")
    e.status = 400
    throw e

  }

  // Determine if datetime is valid
  const format = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/
  const datetimeDate = new Date(Date.parse(datetime) + 36000000) // Local time
  const datetimeTimestamp = datetimeDate.getTime()
  try {
    const invalidDatetime = datetimeDate.toISOString() != datetime.slice(0, 10) + "T" + datetime.slice(11, 17) + ":00.000Z" // This in itself can also throw an error
    if (!datetime.match(format) || isNaN(datetimeTimestamp) || invalidDatetime) { throw Error() }

  }
  catch (e) {
    e = Error("Invalid input: datetime must be a real time in format YYYY-MM-DD HH:MM.")
    e.status = 400
    throw e

  }

  if (datetimeTimestamp < Date.now() + 36000000) {
    let e = Error("Invalid input: datetime must be a time in the future.")
    e.status = 400
    throw e

  }

  next()
}

/**
 * Validates that the user ids in the body of the request is in the correct format
 * @returns An error if the format is incorrect or any value is not an integer
 */
const verifyEventMemberData = (req, res, next) => {
  const user_ids = req.body
  const error_message = "Request body invalid: the array of user IDs must be integers"
  try {
    if (typeof user_ids[0] != "number") {
      throw Error(error_message)

    }
    user_ids.forEach(id => {
      if (typeof id != "number") {
        throw Error(error_message)

      }
    });
    next()

  }
  catch (e) {
    e.status = 400
    next(e)

  }
}

export { verifyUserLoginData, verifyUserData, verifyUserPasswordData, verifyCohortData, verifyEventData, verifyEventMemberData }

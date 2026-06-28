import jwt from 'jsonwebtoken'

/**
 * Attempts to authenticate the user
 * @returns An error if the provided token is invalid or not found
 */
const auth = (req, res, next) => {
  if (!('authorization' in req.headers) || !req.headers.authorization.match(/^Bearer /)) {
    res.status(401).json({ error: true, message: "Authorization header ('Bearer token') not found" })
    return
  }
  const token = req.headers.authorization.replace(/^Bearer /, "")
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    req.email = decodedToken.email;
    req.role = decodedToken.role;
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      res.status(401).json({ error: true, message: 'JWT token has expired' })
    } else {
      res.status(401).json({ error: true, message: 'Invalid JWT token' })
    }
    return
  }

  next()
}

/**
 * Attempts to authenticate the user if an authorization header is present
 * Useful when you want to give additional functionality for admins
 * @returns An error if the provided token is invalid
 */
const optionalAuth = (req, res, next) => {
  if ('authorization' in req.headers) {
    if (!req.headers.authorization.match(/^Bearer /)) {
      res.status(401).json({ error: true, message: "Authorization header is malformed" })
      return
    }
    const token = req.headers.authorization.replace(/^Bearer /, "")
    try {
      req.email = jwt.verify(token, process.env.JWT_SECRET).email
    } catch (e) {
      console.log(e.name)
      if (e.name === 'TokenExpiredError') {
        res.status(401).json({ error: true, message: 'JWT token has expired' })
      } else {
        res.status(401).json({ error: true, message: 'Invalid JWT token' })
      }
      return
    }
  }

  next()
}

export { auth, optionalAuth }
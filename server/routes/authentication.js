import express from 'express'
import { verifyUserLoginData, verifyUserPasswordData } from '../middleware/data-verification.js'
import jwt from 'jsonwebtoken'
import argon2 from 'argon2'
import { auth } from '../middleware/authorisation.js'


/**
 * Retrieves the secret used when validating JWT tokens from .env
 */
const JWT_SECRET = process.env.JWT_SECRET

const router = express.Router()

/**
 * The endpoint at which users can log in and retrieve a JWT token
 */
router.post('/login', verifyUserLoginData, (req, res, next) => {
  const { email, password } = req.body
  let name, role, status, cohort

  // Determine if user already exists in table
  req.db.from("user").select("*").where("email", "=", email)
    .then(users => {
      if (users.length === 0) {
        throw new Error("Incorrect email or password")
      }
      // If user does exist, verify if passwords match
      const hash = users[0].password_hash
      name = users[0].name
      role = users[0].role
      status = users[0].status
      cohort = users[0].cohort
      return argon2.verify(hash, password)

    })
    .then(match => {
      if (match) {
        // Passwords match, check if user status is active
        return status

      } else {
        // If passwords do not match, return error response
        throw new Error("Incorrect email or password")

      }
    })
    .then(status => {
      if (status == "Active") {
        // Return JWT
        const expiresIn = 86400
        const exp = Math.floor(Date.now() / 1000) + expiresIn
        const token = jwt.sign({ exp, email, role, cohort }, process.env.JWT_SECRET)
        res.json({
          token,
          tokenType: "Bearer",
          expiresIn,
          name,
          email: email,
          role,
          cohort
        })

      }
      else if (status == "Pending") {
        throw new Error("User has not yet been verified by an administrator")

      }
      else {
        throw new Error("User status is not active")

      }
    })
    .catch(e => {
      if (e.message == "Incorrect email or password") {
        res.status(401).json({ error: true, message: e.message })

      }
      else if (e.message == "User has not yet been verified by an administrator"
        || e.message == "User status is not active") {
        res.status(403).json({ error: true, message: e.message })

      }
      else {
        console.log(e.message)
        res.status(500).json({ error: true })

      }
    })
})

/**
 * The endpoint at which the current user can change their password
 */
router.put('/password', auth, verifyUserPasswordData, (req, res, next) => {
  const { currentPassword, newPassword } = req.body

  req.db.from("user")
    .select("password_hash")
    .where("email", "=", req.email)
    .then(users => {
      // Verify if passwords match
      const hash = users[0].password_hash
      return argon2.verify(hash, currentPassword)

    })
    .then(match => {
      if (match) {
        // Passwords match, update password
        return argon2.hash(newPassword)

      } else {
        // If passwords do not match, return error response
        throw new Error("Incorrect password")

      }
    })
    .then(password_hash => {
      return req.db.from("user").where("email", "=", req.email).update('password_hash', password_hash)

    })
    .then(() => {
      res.json({ message: "User password updated" })

    })
    .catch(e => {
      if (e.message == "Incorrect password") {
        res.status(401).json({ error: true, message: e.message })

      }
      else {
        console.log(e.message)
        res.status(500).json({ error: true })

      }
    })
})

export default router

import express from 'express'
import { verifyUserLoginData } from '../middleware/data-verification.js'
import jwt from 'jsonwebtoken'
import argon2 from 'argon2'

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
  let name, role
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
      return argon2.verify(hash, password)
    })
    .then(match => {
      if (match) {
        // If passwords match, return JWT
        const expiresIn = 86400
        const exp = Math.floor(Date.now() / 1000) + expiresIn
        const token = jwt.sign({ exp, email, role }, process.env.JWT_SECRET)
        res.json({
          token,
          tokenType: "Bearer",
          expiresIn,
          name,
          email: email,
          role
        })

      } else {
        // If passwords do not match, return error response
        throw new Error("Incorrect email or password")
      }
    })
    .catch(e => {
      if (e.message == "Incorrect email or password") {
        res.status(401).json({ error: true, message: e.message })
      }
      else {
        console.log(e.message)
        res.status(500).json({ error: true })
      }
    })
})

export default router

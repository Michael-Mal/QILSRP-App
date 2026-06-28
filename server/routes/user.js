import express from 'express'
import { verifyUserData, verifyUserLoginData } from '../middleware/data-verification.js'
import jwt from 'jsonwebtoken'
import argon2 from 'argon2'
import { auth } from '../middleware/authorisation.js'

/**
 * Retrieves the secret used when validating JWT tokens from .env
 */
const JWT_SECRET = process.env.JWT_SECRET

const router = express.Router()

/**
 * The endpoint at which a new user can be registered
 */
router.post('/register', auth, verifyUserData, (req, res, next) => {
  const { name, email, password } = req.body

  // Determine if user already exists in table
  req.db.from("user").select("*").where("email", "=", email)
    .then(users => {
      if (users.length > 0) {
        // If user does exist, return error response
        throw new Error("User already exists")

      } else {
        // If user does not exist, insert into table
        return argon2.hash(password)

      }
    })
    .then(password_hash => {
      let currentDate = new Date()
      return req.db.from("user").insert({
        user_id: null,
        name,
        email,
        password_hash,
        status: 'Active',
        created: currentDate.toISOString().slice(0, 19).replace('T', ' '),
        role: 'Ranger',
        cohort: 'Cohort A - Brisbane North'
      })

    })
    .then(() => {
      res.status(201).json({ message: "User created" })

    })
    .catch(e => {
      if (e.message == "User already exists") {
        res.status(409).json({ error: true, message: e.message })
      }
      else {
        console.log(e.message)
        res.status(500).json({ error: true })
      }
    })
})

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

/**
 * The endpoint at which (an admin) can retrieve select user info
 */
router.get('/', auth, (req, res, next) => {
  let fields = ['name', 'email', 'status', 'created']

  req.db('user')
    .select(fields)
    //.where('cohort', req.params.cohort)
    .then(cohort_members => {
      cohort_members.forEach(member => {
        // Convert created time to local timezone by adding 10 hours
        const createdLocal = new Date(Date.parse(member.created) + 72000000).toISOString()
        member.created = createdLocal.slice(0, 10) + " " + createdLocal.slice(11, 19)
      });

      res.json(cohort_members)

    })
    .catch((e) => {
      console.log(e.message)
      res.status(500).json({ error: true })
    })
})

/**
 * The endpoint at which the user or an admin can edit their details
 * (not implemented on the client-side yet)
 */
router.put('/:email', auth, verifyUserData, (req, res, next) => {
  const { name, email, password } = req.body

  // Check if such a user exists
  req.db('user')
    .count('*')
    .where({ "email": req.params.email })
    .then(count => {
      if (count[0]['count(*)'] != 1) {
        throw Error("User not found")
      }

      if (req.email != req.params.email && req.role != "admin") {
        throw Error("Forbidden")
      }

      return argon2.hash(password)

    })
    .then((password_hash) => {
      return req.db('user')
        .where('email', req.params.email)
        .update({ name, email, password_hash })

    })
    .then(() => {
      res.json({ message: `User ${name} has been updated` })

    })
    .catch((e) => {
      if (e.message == "User not found") {
        res.status(404).json({ error: true, message: e.message })
      }
      else if (e.message == "Forbidden") {
        res.status(403).json({ error: true, message: e.message })
      }
      else {
        console.log(e.message)
        res.status(500).json({ error: true })
      }
    })
})

router.delete('/:email', auth, (req, res, next) => {
  if (req.email != req.params.email && req.role != "admin") {
    res.status(403).json({ error: true, message: "Forbidden" })
    return
  }

  req.db('user')
    .where('email', req.params.email)
    .del()
    .then(count => {
      // Check if such a user exists
      if (count != 1) {
        throw Error("User not found")
      }

      res.json({ message: `User with email ${req.params.email} has been deleted` })

    })
    .catch(e => {
      if (e.message == "User not found") {
        res.status(404).json({ error: true, message: e.message })
      }
      else {
        console.log(e.message)
        res.status(500).json({ error: true })
      }

    })
})

export default router

import express from 'express'
import { verifyUserData, verifyUserLoginData } from '../middleware/data-verification.js'
import argon2 from 'argon2'
import { auth, optionalAuth, verifyAdmin } from '../middleware/authorisation.js'

const router = express.Router()

/**
 * The endpoint at which a new user can be registered
 */
router.post('/register', optionalAuth, verifyUserData, (req, res, next) => {
  const { name, email, password, cohort, role } = req.body

  // Check if the user is an administrator
  let status = "Pending"
  if (req.email != undefined && req.role == 'admin') {
    status = "Active"
  }

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
        status,
        created: currentDate.toISOString().slice(0, 19).replace('T', ' '),
        role,
        cohort
      })

    })
    .then(() => {
      res.status(201).json({ message: "User created. If you are not an admin please wait to be verified." })

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
 * The endpoint at which a pending user can be verified by an admin
 */
router.put('/verify/:email', auth, verifyAdmin, (req, res, next) => {

  req.db.from("user")
    .select("status")
    .where({ email: req.params.email, status: "Pending" })
    .update('status', 'Active')
    .then(result => {

      if (result != 1) {
        throw new Error("User not found or is not pending verification")

      }

      res.json({ message: `User with email ${req.params.email} has been verified` })
    
    })
    .catch(e => {
      if (e.message == "User not found or is not pending verification") {
        res.status(404).json({ error: true, message: e.message })

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
router.get('/', auth, verifyAdmin, (req, res, next) => {
  let fields = ['name', 'email', 'status', 'created', 'role', 'cohort']

  req.db('user')
    .select(fields)

    // Filters
    .where(function () {
      if (req.query.name != undefined) {
        this.where('name', req.query.name)

      }
    })
    .andWhere(function () {
      if (req.query.email != undefined) {
        this.where('email', req.query.email)

      }
    })
    .andWhere(function () {
      if (req.query.status != undefined) {
        this.where('status', req.query.status)

      }
    })
    .andWhere(function () {
      if (req.query.cohort != undefined) {
        this.where('cohort', req.query.cohort)

      }
    })
    .andWhere(function () {
      if (req.query.role != undefined) {
        this.where('role', req.query.role)

      }
    })

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
 */
router.put('/:email', auth, verifyUserData, (req, res, next) => {
  const { name, email, password, cohort, role } = req.body

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
        .update({ name, email, password_hash, cohort, role })

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

/**
 * The endpoint at which the user or an admin can delete their account
 */
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

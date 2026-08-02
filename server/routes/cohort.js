import express from 'express'
import { auth } from '../middleware/authorisation.js'

const router = express.Router()

router.get('/', auth, (req, res, next) => {
  req.db('user')
    .whereNot({
      role: 'admin'
    })
    .distinct('cohort')
    .then(cohorts => {
      res.json(cohorts)

    })
    .catch((e) => {
      console.log(e.message)
      res.status(500).json({ error: true })
    })
})

export default router

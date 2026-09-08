import express from 'express'
import { auth } from '../middleware/authorisation.js'

const router = express.Router()

router.get('/', auth, (req, res, next) => {
  req.db('user')
    .select('cohort')
    .count('user_id', { as: 'userCount' })
    .whereNot({
      role: 'admin'
    })
    .groupBy('cohort')
    .then(cohorts => {
      res.json(cohorts)

    })
    .catch(e => next(e))
})

export default router

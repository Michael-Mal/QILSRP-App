import express from 'express'
import { verifyEventData } from '../middleware/data-verification.js'
import { auth, optionalAuth } from '../middleware/authorisation.js'

const router = express.Router()

/**
 * The endpoint at which a new event can be posted
 */
router.post('/', auth, verifyEventData, (req, res, next) => {
  const { name, datetime, location, description } = req.body
  let eventId
  req.db.from("event")
    .insert({
      event_id: null,
      user_id: req.user_id,
      name,
      datetime,
      location,
      description,

    })
    .then(dbRes => {
      eventId = dbRes[0]
      return req.db.from("event_member").insert({
        event_id: eventId,
        user_id: req.user_id,
        confirmed: 1
      })

    })
    .then(() => {
      res.status(201).json({ message: "Event with ID " + eventId + " successfully created" })

    })
    .catch(e => next(e))
})

/**------------- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! --------------------
---------------- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! --------------------
---------------- None of the below have been tested yet --------------------
---------------- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! --------------------
---------------- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ------------------*/

// /**
//  * The endpoint at which users can retrieve their event info
//  */
// router.get('/', auth, (req, res, next) => {
//   let fields = ['name', 'datetime', 'location', 'description']

//   req.db('event')
//     .select(fields)
//     .then(events => {
//       res.json(events)

//     })
//     .catch(e => next(e))
// })

// /**
//  * The endpoint at which the user or an admin can edit the event's details
//  */
// router.put('/:id', auth, verifyEventData, (req, res, next) => {
//   const { name, datetime, location, description } = req.body

//   // Check if such a event exists
//   req.db('event')
//     .select('*')
//     .where("event_id", req.params.id)
//     .then(event => {
//       if (event == []) {
//         let e = Error("Event not found")
//         e.status = 404
//         throw e

//       }

//       if (req.user_id != event[0].user_id && req.role != "admin") {
//         let e = Error("Forbidden")
//         e.status = 403
//         throw e

//       }

//       return req.db('event')
//         .where("event_id", req.params.id)
//         .update({ name, email, cohort, role })

//     })
//     .then(() => {
//       res.json({ message: `Event with ID ${req.params.id} has been updated` })

//     })
//     .catch(e => next(e))
// })

// /**
//  * The endpoint at which the user or an admin can delete the event
//  */
// router.delete('/:id', auth, (req, res, next) => {
//   req.db.from("user")
//     .select("user_id")
//     .where("email", req.email)
//     .then(user => {
//       if (req.user_id != user[0].user_id && req.role != "admin") {
//         let e = Error("Forbidden")
//         e.status = 403
//         throw e

//       }

//       return req.db('event')
//         .where('email', req.params.email)
//         .del()

//     })
//     .then(count => {
//       // Check if such an event exists
//       if (count != 1) {
//         let e = Error("Event not found")
//         e.status = 404
//         throw e

//       }

//       res.json({ message: `Event with email ${req.params.email} has been deleted` })

//     })
//     .catch(e => next(e))
// })

// /**
//  * The endpoint at which a pending event can be confirmed by the invited user
//  */
// router.put('/:id/confirm', auth, (req, res, next) => {
//   req.db.from("event_member")
//     .select("confirmed")
//     .where({
//       event_id: req.params.id,
//       user_id: req.user_id,
//       confirmed: 0
//     })
//     .update('confirmed', 1)
//     .then(result => {
//       if (result != 1) {
//         let e = Error("Event not found or is not pending confirmation")
//         e.status = 404
//         throw e

//       }

//       res.json({ message: `Event with id ${req.params.id} has been confirmed` })

//     })
//     .catch(e => next(e))
// })

export default router

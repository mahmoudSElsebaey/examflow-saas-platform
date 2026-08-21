import { Router } from 'express'
import * as certCtrl from '../controllers/certificate.controller.js'

const router = Router()

router.get('/certificates/verify/:code', certCtrl.verifyPublic)

export default router

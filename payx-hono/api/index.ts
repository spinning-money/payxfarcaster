// Vercel Serverless Function Entry Point
import { handle } from '@hono/node-server/vercel'
import app from '../src/index'

export default handle(app)


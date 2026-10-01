import { createStyleHandler } from './handler.ts'

Deno.serve(createStyleHandler(name => Deno.env.get(name)))

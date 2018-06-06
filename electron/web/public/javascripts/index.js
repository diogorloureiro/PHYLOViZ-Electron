'use strict'

import { flatten, direct } from 'graph-handler'
import forcedirected from 'forcedirected'
import grapetree from 'grapetree'
import radial from 'radial'

function init(canvas) {
    return {
        flatten,
        direct,
        forcedirected: forcedirected(canvas),
        grapetree: grapetree(canvas),
        radial: radial(canvas)
    }
}

export default init
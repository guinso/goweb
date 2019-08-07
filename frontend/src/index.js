import 'core-js/features/promise'
import 'regenerator-runtime/runtime'

import {jx} from "@guinso/jx"

async function main() {
    try {
        console.log('load GUI libraries')
        await loadGUILibs()

        console.log('load routing')
        await loadRouting()

        // console.log('start routing...')

    } catch(err) {
        console.error('failed to boot webpage: ' + err.message)
        console.error(err.stack)
    }
}

async function loadGUILibs() {
    await jx.tagLoader.addMultipleFilesPromise([
        '/lib/jquery-3.4.1.min.js',
        '/lib/popper.min.js',
        '/lib/bootstrap.min.js',
        '/css/bootstrap.min.css',
        '/css/bootstrap-grid.min.css',
        '/css/bootstrap-reboot.min.css'
    ])
}

async function loadRouting() {
    let module = await import('./Router.js')
    let router = new module.Router()

    router.initialize()

    window.addEventListener('hashchange',
        function() {
            try {
                router.resolve(decodeURI(location.hash))
            } catch (err) {
                JxHelper.showServerErrorMessage();
            }
        }, false)

    //start routing
    router.resolve(decodeURI(location.hash))
}

main()
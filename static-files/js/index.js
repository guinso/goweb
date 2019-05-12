(() => {
    const kk = new Promise(loadDependency2)

    kk.then(() => fetch('js/script.js'))
        .then(response => response.text())
        .then(text => {
            const element = document.createElement('script')
            element.type = 'module'
            element.innerHTML = text

            document.getElementsByTagName("body")[0].appendChild(element)
        })
        .catch(() =>
            triggerFailMessage())
})()

function loadDependency2(resolve, reject) {
    const jquery = fetch('js/jquery-3.2.1.min.js')
    const popper = fetch('js/popper.min.js')
    const bootstrapJS = fetch('js/bootstrap.min.js')

    const bsMain = fetch('css/bootstrap.min.css')
    const bsGrid = fetch('css/bootstrap-grid.min.css')
    const bsReboot = fetch('css/bootstrap-reboot.min.css')

    //const jxhelper = fetch('js/jxhelper.js').then(response => response.text())
    //const router = fetch('js/router.js').then(response => response.text())
    //const btHelper = fetch('js/btsHelper.js').then(response => response.text())

    Promise.all([jquery, popper, bootstrapJS, bsMain, bsGrid, bsReboot])
        .then(values => {

            const errorCount = values.filter(value => !value.ok).length
            if (errorCount > 0) {
                throw Error("Failed to fetch file from server")
            }

            let textPromises = []
            for (let i = 0; i < values.length; i++) {
                textPromises.push(values[i].text())
            }

            Promise.all(textPromises).then(values => {

                addJSTag(values[0])
                addJSTag(values[1])
                addJSTag(values[2])

                addCSSTag(values[3])
                addCSSTag(values[4])
                addCSSTag(values[5])

                resolve(values)

            }).catch(err => {
                reject(err)
            })
        })
        .catch(err => {
            reject(err)
        })
}

function addCSSTag(source) {
    const element = document.createElement("style")
    element.setAttribute('rel', 'stylesheet')
    element.setAttribute('type', 'text/css')
    element.innerHTML = source

    document.getElementsByTagName("body")[0].appendChild(element)
}

function addJSTag(innerHTML) {
    const element = document.createElement('script')
    element.type = 'text/javascript'
    element.innerHTML = innerHTML

    document.getElementsByTagName("body")[0].appendChild(element)
}

function appendElement(body, tagName, innerHTML) {
    var element = document.createElement(tagName);
    element.innerHTML = innerHTML;

    body.appendChild(element);
}

function triggerFailMessage() {
    //handle error exception
    document.getElementsByClassName("special-loading")[0].className += " visible";
    document.getElementsByClassName("special-loading")[0].innerHTML =
        "<p>Ops, something going wrong when try connect to server</p>";
}
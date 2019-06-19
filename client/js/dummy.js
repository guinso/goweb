if ('serviceWorker' in navigator) {
    console.log('service worker found, registering serviceWorker.js ...')
    navigator.serviceWorker.register('/js/serviceWorker.js')
        .then(() => console.log('register serviceWorker.js done'))
        
} else {
    console.log('service worker not available')
    
}
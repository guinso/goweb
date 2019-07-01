seaMap.prototype.getPartial = function(successFN, failureFN) {
    var thisInstance = this

    this._fetchPartial(function(partial) {
        thisInstance._initGUI(partial)

        successFN(partial)
    }, failureFN)
};

seaMap.prototype._fetchPartial = function(successFN, failureFN) {
    var thisInstance = this

    if (this._isPartialEmpty()) {
        JxLoader.loadPartial('/js/seaMap/partial.html',
            function(partial) {
                thisInstance.partial = partial

                successFN(partial)
            },
            failureFN)
    } else {
        successFN(thisInstance.partial)
    }
};

seaMap.prototype._isPartialEmpty = function() {
    return !(this.partial && this.partial.innerHTML !== '')
};

seaMap.prototype.drawMap = function() {
    var map = new ol.Map({
        target: 'demoMap',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([100.3327, 5.4164]),
            zoom: 10
        })
    });
};

(function() {
    if (typeof SeaMap === 'undefined') {
        window.SeaMap = new seaMap()
    }
})()
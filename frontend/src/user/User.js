import rawPartial from '!!raw-loader!./partial.html'
import * as JxHelper from '../helper/jxHelper'

export class User {
    constructor() {
        this.partial = null
    }

    async getPartial() {
        if(!this.partial) {
            this.partial = JxHelper.parseHTMLString(rawPartial)
        }

        return this.partial
    };
}
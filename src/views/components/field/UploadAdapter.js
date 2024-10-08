import { upload } from "../../../api/api";
import {getAbsoluteUrl} from "../../../utils/utils"

export default class UploadAdapter {
    constructor(loader,folderid) {
        this.loader = loader
        this.folderid = folderid
    }

    upload() {
        return this.loader.file
            .then(file => new Promise((resolve, reject) => {
                let filename = file.name
                upload(this.folderid,filename, file, (progress,loaded, total) => {
                    this.loader.uploadTotal = total;
                    this.loader.uploaded = loaded;
                }, data => { 
                    resolve({
                        default: getAbsoluteUrl(data[0].url)
                    })
                }, error => {
                    reject(err)
                 })
            }));
    }
}
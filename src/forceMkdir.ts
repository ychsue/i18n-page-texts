import * as fs from "fs";

export function forceMkdir(path:string):void{
    const regex = RegExp("/","g");
    let isEndWithSlash = path.lastIndexOf('/')===(path.length-1);
    while (true) {
        let searchResult = regex.exec(path);
        let lastIndex;
        if(searchResult!=null){
            lastIndex = regex.lastIndex;
        } else if(!isEndWithSlash){
            lastIndex = path.length;
            isEndWithSlash = true;
        } else {
            break;
        }
        let bufPath = path.substr(0,lastIndex);
        let buf;
        try {
            buf = fs.openSync(bufPath,0);
        } catch (error) {
            fs.mkdirSync(bufPath);
        }

        if(searchResult==null && isEndWithSlash){
            break;
        }
    }
}

export async function forceMkdirAsync(path:string):Promise<void>{
    return forceMkdir(path);
}
import { writeFileSync } from "fs";
import { forceMkdir } from "./forceMkdir";

export function forceWriteFile(path:string,data:any, options?: { encoding?: string | null; mode?: number | string; flag?: string; } | string | null):void{
    if(path.lastIndexOf('/')===path.length-1) {
        throw `${path} is a directory not a file.`;        
    }
    try {
        let index = path.lastIndexOf('/');
        if(index>=0) {
            forceMkdir(path.substring(0,index));
        }

        if(options===null) {
            options = {encoding: "utf8", flag:"w+"};
        }
        writeFileSync(path,data,options);
    } catch (error) {
        throw error;
    }
}

export async function forceWriteFileAsync(path:string,data:any, options?: { encoding?: string | null; mode?: number | string; flag?: string; } | string | null): Promise<void>{
    return forceWriteFile(path,data,options);
}
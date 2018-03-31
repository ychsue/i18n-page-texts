const translate:any = require("google-translate-api");

export async function updatePageTexts(inObj:any, outObj:any,opts:IoptPTs={from:"auto",to:"en",ignore:[]})
    : Promise<any> {
    for (const key in inObj) {
        if(opts.ignore.findIndex(st=>st===key)>=0) {
            continue;
        }
        if (inObj.hasOwnProperty(key)) {
            const element:any = inObj[key];
            // console.log(`typeof ${typeof element} & element = ${key}`);
            // console.log(JSON.stringify(outObj));
            let hasTheKey:any = outObj[key];
            if(element instanceof Array) {
                if(!hasTheKey || !(outObj[key] instanceof Array)) {outObj[key]=[];}
                await updatePageTexts(element,outObj[key],opts);
            } else if(typeof element ==="object") {
                if(!hasTheKey || (typeof outObj[key] !== "object")) {
                    outObj[key]= {};
                    // console.log(`Before Update: outObj=${JSON.stringify(outObj)},${key}, ${!hasTheKey}, ${typeof outObj[key]}`);
                }
                await updatePageTexts(element,outObj[key],opts);
            } else if (typeof element ==="string") {
                if(!hasTheKey || (typeof outObj[key] !== "string")) {
                    outObj[key]= (opts.from===opts.to)?element:(await translate(element,opts)).text;
                }
            } else if (typeof element ==="number") {
                if(!hasTheKey || (typeof outObj[key] !== "number")) {outObj[key]=inObj[key];}
            } else if (typeof element ==="boolean") {
                if(!hasTheKey || (typeof outObj[key] !== "boolean")) {outObj[key]=inObj[key];}
            }
        }
    }
    return outObj;
}

export interface IoptPTs {
    from: string;
    to: string;
    ignore: Array<string>;
}
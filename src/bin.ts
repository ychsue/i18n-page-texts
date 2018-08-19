#!/usr/bin/env node

import * as fs from 'fs';
// const translate = require("google-translate-api");
import * as translate from "./update-pageTexts";
import * as minimist from "minimist";
import * as colors from 'colors/safe';
// const json2ts = require("json-ts");
import { forceMkdir } from "./forceMkdir";
import { forceWriteFile } from "./forceWriteFile";
import * as json2ts from "json-ts";
// import minimist = require("minimist"); //The same as above
const argv: minimist.ParsedArgs = minimist(process.argv.slice(2));

let config: Iconfig ={
    inJsonObj:{
        homePage: {
            welcome: "Welcome to use this package",
            contact: "Go to Contact page"
        },
        contactPage: {
            address: "my address is *****"
        }
    },
    defaultLang: "en",
    folderPrefix: "",
    ignoreProperties:["address"],
    outI18nDir: "src/assets/i18n",
    outDefaultFile: "src/defaultPTS.ts",
    outInterfaceFile: "src/IPageTexts.ts",
    interfaceName: "PageTexts",
    eachJsonFileName: "pageTexts.json"
};
var parameters: Iparameters = {
    init: false,
    config: "i18n-page-texts.json",
    help: false,
    langs:false
};

const pkgName:string = "i18n-page-texts";

const helpMsg = 
`Parameters:
    --init
        Generate the "config" file ${parameters.config}.
    --config
        Declare the "config" file name.
    --help
        Show this help.
    --langs
        List all supported languages.
Usage:
    ${pkgName} --init
        Generate a needed config file for you to modify.
    
        ${pkgName}     or
    ${pkgName} --config *FILE.json*
        Generate needed files as declared in the config file; however, if the file does not exist, it will show this help information.
    
    ${pkgName} --help 
        Show this help.
`;

//* [2018-03-31 19:41] Check the parameters
let errors =[];
for (const key in argv) {
    if(!parameters.hasOwnProperty(key) && key!="_"){
        errors.push(`"${key}" is not the allowed parameter.`);
    }
}
if(errors.length>0){
    console.log('Note:');
    errors.map(err =>console.log(err));
    console.log(helpMsg);
    process.exit(1);
}
//* [2018-04-03 21:11] After checking, update the parameters.
parameters ={
    ...parameters,
    ...argv
};
//* [2018-04-03 15:01] Actions for each parameters
if(parameters.help===true) {
    console.log(helpMsg);
    process.exit(0);
} else if(parameters.langs) {
    console.log(JSON.stringify(translate.languages,null,2));
    process.exit(0);
} else if(parameters.init) {
    try {
        fs.writeFileSync(parameters.config,JSON.stringify(config,null,2),{encoding: "utf8", flag:"w+"});
        console.log(`file ${parameters.config} has been output.`);
        process.exit(0);
    } catch (error) {
        console.error(error);
    }
}

//* [2018-04-03 15:15] Check whether the config.json file is there and update the config
try {
    config = JSON.parse(fs.readFileSync(parameters.config,{encoding:"utf8"})) as Iconfig;
    console.log(`read config from file ${parameters.config}`);
} catch (error) {
    console.log(colors.red(colors.bold(`Error Message`))+`: ${error}`);
    console.log(
        `
You may not have the file `+ colors.green(`"${parameters.config}"`)+ `or that file does not written in JSON format. 

You can generate a default one by running 
`+
colors.magenta(`"${pkgName} --init"`)+`
,or
`+colors.magenta(`"${pkgName} --config SomeFile.json"`)+`
to specify a specific config JSON file.`
    );
    process.exit(1);
}

//* [2018-04-04 13:01] **************** MAIN PART ******************************
//* [2018-04-06 11:42] Make sure whether the language code declared in config is correct
if(!translate.languages.hasOwnProperty(config.defaultLang)) {
    console.log(`Sorry, the language code "${config.defaultLang}" is not allowed. They should be one of ${Object.keys(translate.languages)}. Please correct it in your config file "${parameters.config}"`);
    process.exit(1);
}
//** [2018-04-04 13:01] Generate the pageTexts.js or defaultPTS.ts */
let defaultPTS =config.outDefaultFile||config.outJsFile;
if(!!config.outJsFile) {
    console.log(`Warning: the parameter "outJsFile" in the config file "${parameters.config}" will be discarded since I hope that it can be the typescript output, either. Therefore, use "outDefaultFile" instead of it and that file will be in typescript format if its extension is ".ts".`);
}
if(!!defaultPTS) { 
    let data:string= JSON.stringify(config.inJsonObj,null,2);
    let fileName = defaultPTS.slice(defaultPTS.lastIndexOf('/')+1);
    let index =fileName.lastIndexOf('.'); 
    let ext = "";
    if(index>0) {
        ext = fileName.slice(index);
        fileName = fileName.slice(0,index);
    }

    if(ext.toLowerCase()===".ts"){
        data = `export const ${fileName}:I${config.interfaceName} =`+data;
    } else {
        data = `module.exports = `+data;
    }

    try {
    fs.writeFileSync(defaultPTS,
        data,{encoding: "utf8", flag:"w+"});
    console.log(`file ${defaultPTS} is outputted`);
} catch (error) {
    console.error(error);
    process.exit(1);
}
}
//** [2018-04-04 16:07] Generate the IPageTexts */
try {
    let data = json2ts.json2ts(JSON.stringify(config.inJsonObj),{rootName: config.interfaceName});
    fs.writeFileSync(config.outInterfaceFile,
        data,
        {encoding:"utf8",flag:"w+"}
    );
    console.log(`file ${config.outInterfaceFile} is outputted`);
} catch (error) {
    console.error(error);
    process.exit(1);
}
//** [2018-04-04 21:13] Output JSON files into each i18n sub-folders */
//*** [2018-04-05 15:54] Check or create i18n folder*/
try {
    forceMkdir(config.outI18nDir);
} catch (error) {
    console.error(error);
    process.exit(1);
}
//*** [2018-04-05 20:06] Check sub-folders*/
let dirs = fs.readdirSync(config.outI18nDir,{encoding:"utf8"});
if(config.outI18nDir.lastIndexOf('/')!=(config.outI18nDir.length-1)) {
    config.outI18nDir+='/';
}

try {
    // *** [2018-08-19 17:12] For folderPrefix
    let prefix = ((!!config.folderPrefix === true) ? config.folderPrefix : '') as string;
    const pLength = prefix.length;

    if(dirs.length==0){
        //**** [2018-04-05 20:15] Create a sub-folder with default language*/
        forceWriteFile(`${config.outI18nDir}${prefix}${config.defaultLang}/${config.eachJsonFileName}`,JSON.stringify(config.inJsonObj,null,2));  
        console.log(`${config.outI18nDir}${prefix}${config.defaultLang}/${config.eachJsonFileName} is generated.`);  
    } else{
        dirs.forEach(code=>{
            let trueCode = (code.search(prefix)===0) ? code.slice(pLength) : code;
            console.log(`trueCode is = ${trueCode}`);
            if(translate.languages.hasOwnProperty(trueCode)) {
                let outObj={};
                let fPath = `${config.outI18nDir}${code}/${config.eachJsonFileName}`;
                try {
                    outObj = JSON.parse(fs.readFileSync(fPath,{encoding:"utf8"}));
                } catch (error) {
                    ; // ****** TODO ******
                }
                translate.updatePageTexts(config.inJsonObj,outObj,{from:config.defaultLang,to:trueCode,ignore:config.ignoreProperties}).then(
                    data => {
                        forceWriteFile(fPath,JSON.stringify(data,null,2));
                        console.log(`${fPath} is updated`);
                    });
            } else {
                console.log(`code=${code} does not allowed.`);
            }
        });
    }        
} catch (error) {
    console.error(error);
}

interface Iconfig {
    inJsonObj:Object,
    defaultLang: string,
    ignoreProperties:Array<string>,
    outI18nDir: string,
    outJsFile?: string,  //discarded
    folderPrefix?: string, // because windows uwp will use different way to deal with folders whose names are isoCode, I need to use this folderPrefix to change it. Such as 'zh-tw' becomes 'iso_zh-tw' if folderPrefix = 'iso_'.
    outDefaultFile: string,
    outInterfaceFile: string,
    eachJsonFileName: string,
    interfaceName: string
};
interface Iparameters {
    init: boolean,
    config: string,
    help: boolean,
    langs: boolean,
    [arg: string]: any
};

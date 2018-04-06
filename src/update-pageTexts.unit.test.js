const upt = require("../dist/update-pageTexts");
const inObj = {
    "isoCode": "zh-tw",
    "dir": "lr",
    "HomePage":{
        "Hello": "歡迎"
    }
};
const outObj = {
    "isoCode": "en",
    "dir": "lr",
    "HomePage":{
        "Hello": "welcome"
    }
};

test('Test the translation: default opts', async ()=>{
    expect(
        JSON.stringify(await upt.updatePageTexts(
            inObj
            ,{}
        ))
    ).toBe(JSON.stringify(
        (()=> {
            let buf = JSON.parse(JSON.stringify(outObj));
            buf.isoCode = "j-tv"
            return buf;})()
    ));
});

const opts = {from: "en", to: "zh-tw", ignore:["isoCode", "dir"]};

test(`Test the translation: ${JSON.stringify(opts)}`, async ()=>{
    expect(
        JSON.stringify(await upt.updatePageTexts(outObj,{},opts))
    ).toBe(JSON.stringify(
        (()=> {
            let buf = JSON.parse(JSON.stringify(inObj));
            buf["isoCode"]="en";
            buf["dir"]="lr";
            return buf;})()
    ));
});
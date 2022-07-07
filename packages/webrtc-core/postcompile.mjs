import * as fs from 'fs';
import { config as envConfig } from "dotenv";
envConfig();

const replace = function(config){
    for(let file of config.files){
        var fileString = fs.readFileSync(file.input, 'utf-8');
        let values = file.values;
        for(let placeholder in values){
            fileString = fileString.replace(new RegExp(`${placeholder}`,'g'), values[placeholder]);
        }
        fs.writeFileSync(file.output, fileString);
    }
}

const replacerConfig = {
    files:[
        {
            input: 'dist/transpiled/Media/Effects/BNR/Bnr.js',
            output: 'dist/transpiled/Media/Effects/BNR/Bnr.js',
            values:{
                'process.env.NOISE_REDUCTION_PROCESSOR_URL': `'${process.env.NOISE_REDUCTION_PROCESSOR_URL}'`
            }
        }
    ]
}

replace(replacerConfig);

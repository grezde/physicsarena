const fs = require('fs');

const readJson = path => JSON.parse(fs.readFileSync(path).toString());

const transpileOlympiadSimple = (file, dir) => {
    const obj = readJson(`../archive/${file}.json`).values;
    if(!fs.existsSync(`../data/${dir}`))
        fs.mkdirSync(`../data/${dir}`);

    str = '';
    for(let yr of obj) {
        str += `${yr.year}:\n`;
        if(yr.country)
            str += `\t-c ${yr.country}\n`;
        if(yr.link)
            str += `\t-w ${yr.link}\n`;
        for(let p of yr.problems) {
            if(p.topics)
                str += `\t-t ${p.topics.join(' ')}\n`;
            else
                str += '\t-t \n';
        }
        str += '\n';
    }
    fs.writeFileSync(`../data/${dir}/th.ol`, str);
    
    str = '';
    for(let yr of obj) {
        str += `${yr.year}:\n`;
        for(let p of yr.problems) {
            if(p.title)
                str += `\t-n ${p.title}\n`;
            else
                str += `\t-n \n`;
            if(p.jaan) {
                let i=0;
                for(let prop in p.jaan) {
                    if(i==0)
                        str += `\t-d ${p.jaan[prop]}\n`;
                    else
                        str += `\t+  ${p.jaan[prop]}\n`;
                    i++;
                }
            }
        }
        str += '\n';
    }
    fs.writeFileSync(`../data/${dir}/th-en.ol`, str);
}



//transpileOlympiadSimple('theory/eupho', 'eupho')
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


const transpileOlympiadGrade = (file, dir) => {
    const obj = readJson(`../archive/${file}.json`).values;

    let stra = '', strb = '';
    let found = false;
    const transfi = cl => {
        switch(cl) {
            case '09': return 'IX';
            case '10': return 'X';
            case '11': return 'XI';
            case '12': return 'XII';
            case 'baraj': return 'b';
        }
    }
    for(let yr of obj) {
        stra += `${yr.year}:\n`;
        strb += `${yr.year}:\n`;
        if(yr.place) {
            stra += `\t-c ${yr.place}\n`;
            strb += `\t-c ${yr.place}\n`;
        }
        if(yr.link) {
            stra += `\t-w ${yr.link}\n`;
            strb += `\t-w ${yr.link}\n`;
        }
        for(let c of yr.classes) {
            if(c['class'] == 'baraj') {
                found=true;
                for(let p of c.problems)
                    if(p.topics)
                        strb += `\t-t ${p.topics.join(' ')}\n`;
                    else
                        strb += `\t-t \n`;
                strb += '\n';
                continue;
            }
            stra += `\t${yr.year}.${transfi(c['class'])}:\n`;
            for(let p of c.problems)
                if(p.topics)
                    stra += `\t\t-t ${p.topics.join(' ')}\n`;
                else
                    stra += `\t\t-t \n`;
        }
        stra += '\n';
    }

    if(!fs.existsSync(`../data/${dir}`))
        fs.mkdirSync(`../data/${dir}`);
    if(!fs.existsSync(`../data/baraj`))
        fs.mkdirSync(`../data/baraj`);
    fs.writeFileSync(`../data/${dir}/th.ol`, stra);
    if(found)
        fs.writeFileSync(`../data/baraj/th.ol`, strb);
    
    found = false;
    strb = '';
    stra = '';
    for(let yr of obj) {
        for(let c of yr.classes) {
            if(c['class'] == 'baraj') {
                strb += `${yr.year}:\n`;
                let i=1;
                found = true;
                for(let p of c.problems) {
                    if(p.title)
                        strb += `\t-n ${p.title}\n`;
                    else
                        strb += `\t-n Problema ${i}\n`;
                    i++;
                }
                strb += '\n';
                continue;
            }
            stra += `${yr.year}.${transfi(c['class'])}:\n`;
            let i=1;
            for(let p of c.problems) {
                if(p.title)
                    stra += `\t-n ${p.title}\n`;
                else
                    stra += `\t-n Problema ${i}\n`;
                i++;
            }
            stra += '\n';
        }
    }
    fs.writeFileSync(`../data/${dir}/th-ro.ol`, stra);
    if(found)
        fs.writeFileSync(`../data/baraj/th-ro.ol`, strb);
}

//transpileOlympiadGrade('one/ojf', 'ojf');
transpileOlympiadGrade('theory/onf', 'onf');

//transpileOlympiadSimple('theory/eupho', 'eupho')
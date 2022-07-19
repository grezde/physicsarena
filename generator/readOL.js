#!/bin/node

const fs = require('fs');

const rmWhitespace = str => {
    let i = 0, j = str.length;
    const ws = ' \t\n\r';
    while(i < str.length && ws.includes(str[i]))
        i++;
    while(j > i && ws.includes(str[j-1]))
        j--;
    return str.substring(i, j);
};
const deepCopy = obj => {
    if(typeof obj != 'object' || obj === null)
        return obj;
    let newobj = {};
    for(let prop in obj)
        if(typeof obj[prop] == 'object')
            newobj[prop] = deepCopy(obj[prop]);
        else
            newobj[prop] = obj[prop];
    return newobj;
};

const readOL = (folder, filename) => {
    let lns = fs.readFileSync(`../data/${folder}/${filename}.ol`).toString().split('\n').map(rmWhitespace);
    let objs = [];
    for(let ln of lns) {
        if(ln[0] == '-') {
            let c = ln[1], d = ln.substring(3);
            objs[objs.length-1][1].push([c, d]);
        }
        if(ln[0] == '+') {
            let d = ln.substring(3);
            objs[objs.length-1][1][1] += d;
        }
        if(ln[ln.length-1] == ':')
            objs.push([ln.substring(0, ln.length-1), []]);
    }
    return objs;
};

const readOLE = (folder, filename, extr) => {
    let objs = readOL(folder, filename);
    objs = objs.map(x => ({
        [extr.globalFlag]: x[0],
        [extr.iterFlag]: [],
        params: x[1],
    }));
    for(let x of objs) {
        for(let p of x.params) {
            if(extr.globalOptions[p[0]])
                x[extr.globalOptions[p[0]]] = p[1];
            if(extr.iterOptions[p[0]]) {
                let ar = x[extr.iterFlag];
                let name = extr.iterOptions[p[0]];
                if(ar.length == 0 || ar[ar.length-1][name])
                    ar.push({ [name]: p[1], id: ar.length });
                else    
                    ar[ar.length-1][name] = p[1];
            }
        }
        delete x.params;
    }
    //objs = objs.sort((x, y) => x[extr.globalFlag] == y[extr.globalFlag] ? 0 : x[extr.globalFlag] > y[extr.globalFlag] ? -1 : 1);
    return objs;
};

const combineOLE = (oleA, oleB, ex) => {
    let oleC = [];
    for(let e of oleA) {
        // get element out of second object
        let e2 = oleB.filter(x => x[ex.globalFlag] == e[ex.globalFlag]);
        if(e2.length == 0) {
            oleC.push(e);
            continue;
        }
        e2 = e2[0];
        oleB = oleB.filter(x => x != e2);
        // combine global properties
        for(let prop in e2)
            if(prop != ex.globalFlag && prop != ex.iterFlag)
                e[prop] = e2[prop];
        // combine iterators
        let ar = e[ex.iterFlag], ar2 = e2[ex.iterFlag];
        let ar3 = [];
        for(let p of ar) {
            // get element out of second object iterator
            let p2 = ar2.filter(x => x.id == p.id);
            if(p2.length == 0) {
                ar3.push(p);
                continue;
            }
            p2 = p2[0];
            ar2 = ar2.filter(x => x != p2);
            // combine iterator properties
            for(let iprop in p2)
                if(iprop != 'id')
                    p[iprop] = p2[iprop];
            ar3.push(p);
        }
        ar3.push(...ar2);
        e[ex.iterFlag] = ar3;
        oleC.push(e);
    }
    oleC.push(...oleB);
    return oleC;
};

module.exports = {
    readOL, readOLE, combineOLE
};
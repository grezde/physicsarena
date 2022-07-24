#!/bin/bash

cd ..

if [ "$1" == "files" ]
then

    rm -rf build
    mkdir temp
    cd generator
    ./genAll.js build
    cd ..
    mkdir build
    cp -rv files/* temp/* build
    cd public
    cp -rv images ../build
    cp index.html index.js main.css ../build
    cd ..
    rm -rf ./temp

elif [ "$1" == "no-files" ]
then

    rm -rf build
    mkdir temp
    cd generator
    ./genAll.js build
    cd ..
    mv temp build
    cd public
    cp -rv images ../build
    cp index.js main.css ../build

else
    echo "Options: files / no-files"
fi

#!/bin/bash

mkdir apho
cd apho

dir="2002"
link="02"

function download () {
    curl "https://apho2022.in/wp-content/uploads/2022/01/APhO$link-Experimental-Exam.zip" > temp.zip
    # if ! unzip -l temp.zip
    # then
    #     curl "https://apho2022.in/wp-content/uploads/2022/01/APhO$link-Experimental-exam.zip" > temp.zip
    # fi
    mkdir $dir
    unzip temp.zip -d $dir 
    rm temp.zip
}

for i in {19..21}
do
    if [ $i = 0 ]
    then
        dir="2000"
        link="2000"
    elif [ $i -lt 10 ]
    then
        dir="200$i"
        link="0$i"
    else
        dir="20$i"
        link="$i"
    fi
    download
done

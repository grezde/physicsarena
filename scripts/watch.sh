#!/bin/bash

cd ../generator
ls *.js ../data/*/*.ol | entr ./genAll.js
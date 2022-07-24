#!/bin/bash

cd ../files/ro
mkdir -p efizica/th
cd efizica/th

curl "https://efizica.ro/files/eFizica_28feb_2021.pdf" > 2021-feb-p.pdf
curl "https://efizica.ro/files/eFizica_28mart_2021.pdf" > 2021-mar-p.pdf
curl "https://efizica.ro/files/eFizica_28%20aprilie_2021.pdf" > 2021-apr-p.pdf
curl "https://efizica.ro/files/eFizica_30%20mai_2021.pdf" > 2021-may-p.pdf
curl "https://efizica.ro/files/eFizica_26%20Sept_2021.pdf" > 2021-sep-p.pdf
curl "https://efizica.ro/files/eFizica_31oct_2021.pdf" > 2021-oct-p.pdf
curl "https://efizica.ro/files/eFizica_28nov2021.pdf" > 2021-nov-p.pdf
curl "https://efizica.ro/files/eFizica_30%20ian_2022.pdf" > 2022-jan-p.pdf
curl "https://efizica.ro/files/eFizica_27_feb_2022.pdf" > 2022-feb-p.pdf
curl "https://efizica.ro/files/eFizica_27%20mart_2022_Determinarea%20parametrilor%20unei%20diode_Subiect.pdf" > 2022-mar-p.pdf
curl "https://efizica.ro/files/eFizica_2%20mai_2022_Subiect.pdf" > 2022-may-p.pdf


#!/bin/bash

uwsgi --http 0.0.0.0:3000 --master -p 4 -w results-upload:app
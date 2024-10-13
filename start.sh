#!/bin/bash

node client.js &
uvicorn hltbWrapper:app --port 8000
wait
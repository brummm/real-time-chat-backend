#!/bin/bash
echo "Stopping any node servers/processes"
if pgrep node; then pkill node; fi
#
# This script sets up the local shell environment.
#

#
# Do NOT run this script (`./environment.sh` or `bash
# environment.sh`); instead source it (`source environment.sh`).
# 
SCRIPT_NAME=$(basename "$0")
SOURCE_NAME=$(basename "$BASH_SOURCE")
if [ "$SCRIPT_NAME" = "$SOURCE_NAME" ]; then
    echo 'ERROR: Do not execute (`bash environment.sh`) this script! Source it instead (`source environment.sh`)'
    exit 1
fi

#
# PATH
#
#
# We need to add this application's 'node_modules/.bin' dir to PATH.
#
NODE_BIN_DIR="$(pwd)/node_modules/.bin"
if [ -z $(echo $PATH | grep "$NODE_BIN_DIR") ]; then
    echo "[path]    Adding $NODE_BIN_DIR to PATH (${PATH})"
    export PATH="${PATH}:${NODE_BIN_DIR}"
else
    echo "[path]       $NODE_BIN_DIR already on PATH (${PATH})"
fi


#
# Python virtualenv
#

VENV_DIR="$(pwd)/.virtualenv"
if [ -d "$VENV_DIR" ]; then
    echo "[virtualenv] Entering Python virtualenv at ${VENV_DIR}"
    . "${VENV_DIR}/bin/activate"
else
    echo "ERROR: Python virtualenv directory (${VENV_DIR}) does not exist.  Did you run 'make' yet?"
fi


#
# Alias
#

echo "[alias]      Adding shell aliases" 
alias truffle='./node_modules/.bin/truffle'
alias myth='./.virtualenv/bin/myth'

#This script takes care of committing changes and pushing it to the remote.
#Pass the commit message as the first argument.
#If applicable, send author's name as the second argument.
#Comment modification 1: Using this file to test this same file.
#Comment modification 2:
# Updated 2026-08-07: git add -A (was 'git add *'); set -e. See README for the modern Python tooling.
set -e
message=$1;
git add -A;
if [[ $# -eq 2 ]] ; then
    author=$2;
    git commit --author="$author <>" -m "$1";
else
    git commit -m "$1";
fi
git push

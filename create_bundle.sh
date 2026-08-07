# LEGACY (2026-08-07): bundles removed from the working tree; this script recreates
# them if needed (zips are preserved in git tags/history).
#The way to run this is by passing two arguments: The first one being the amendment number and the second one is date in ddmmyyyy format.
#This bundles up all the files from PART1 to PART22 and the PREAMBLE.
#So, essentially, this is like a RELEASE.
amendment_number=$1
date_of_enforcement=$2
#echo $#
#echo $amendment_number
#echo $date_of_enforcement
if [[ $# -ne 2 ]] ; then
    echo 'Error in passing command line arguments. Check HELP at the top of this file.'
    exit 1
fi

# Content text files are markdown now; the bundles up to the 106th (historical) use txt.
find . \( -type f -name "*.pdf" -o -name "*.md" \) -exec zip -g AMENDMENT_"$amendment_number"_"$date_of_enforcement".zip {} \;

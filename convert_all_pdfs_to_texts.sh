#This convers all the pdf files to corresponding text files.
# LEGACY (2026-08-07): content is now Markdown (.md); this script extracts .txt via pdftotext for reference only. Requires poppler.
find . -type f -name "*.pdf" -exec pdftotext {} \;

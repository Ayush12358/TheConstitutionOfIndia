#!/usr/bin/env python3
"""gen_amendments_table.py — regenerate docs/amendments-table.md.

Usage: python gen_amendments_table.py

Source of truth: docs/amendments.csv (also consumed by verify_repo.py and
download_amendments.py); docs/amendments-table.md is the generated
human-readable view. Running this tool on an unchanged CSV must produce a
byte-identical docs/amendments-table.md.
"""
import csv
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
CSV = os.path.join(ROOT, 'docs', 'amendments.csv')
OUT = os.path.join(ROOT, 'docs', 'amendments-table.md')

COMMENT = ('<!-- Generated 2026-08-07 from docs/amendments.csv (machine source of truth for '
           'verify_repo.py and download_amendments.py; docs/amendments-table.md is the '
           'human-readable view). -->')


def cell(value):
    return ' %s ' % value.replace('|', '\\|')


def file_cell(value, prefix):
    """MISSING/empty stays plain text; otherwise a clickable relative link."""
    if not value or value == 'MISSING':
        return value
    return '[%s](%s%s)' % (value, prefix, value)


def main():
    with open(CSV, newline='', encoding='utf-8') as f:
        rows = [r for r in csv.reader(f) if r and not r[0].startswith('#')]
    header = rows[0]
    if header != ['number', 'title', 'assent_date', 'key_changes', 'bill_file',
                  'act_file', 'bill_url', 'act_url', 'zip_file', 'status']:
        raise SystemExit('unexpected CSV header: %r' % (header,))
    lines = [COMMENT, '', '| ' + ' | '.join(header) + ' |',
             '|' + '---|' * len(header)]
    for r in rows[1:]:
        if len(r) != len(header):
            raise SystemExit('row %r has %d fields (want %d)'
                             % (r[0], len(r), len(header)))
        out = list(r)
        out[4] = file_cell(r[4], '../AMENDMENTS/')
        out[5] = file_cell(r[5], '../AMENDMENTS/')
        out[8] = file_cell(r[8], '../')
        lines.append('|' + '|'.join(cell(c) for c in out) + '|')
    with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(lines) + '\n')


if __name__ == '__main__':
    main()

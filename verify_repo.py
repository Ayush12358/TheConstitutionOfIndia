#!/usr/bin/env python3
"""verify_repo.py — completeness checker for TheConstitutionOfIndia.

Python 3, stdlib only. Exits 0 only when every check passes; otherwise lists
every failure and exits 1.

Checks:
  a. all 39 content dirs exist with both .md and .pdf (>100 bytes each):
     PREAMBLE, PART_1..PART_22, PART_4_A, PART_9_A, PART_9_B, PART_14_A,
     SCHEDULE_1..SCHEDULE_12 (file naming mirrors the bundle zips:
     dir "PART_4_A" holds "PART4A.md/.pdf"; PREAMBLE holds "Preamble.md/.pdf")
  b. AMENDMENTS/: for every amendment 1..106 an ACT pdf exists (%PDF magic,
     >10KB) and a BILL pdf exists OR docs/amendments.csv marks that number
     MISSING_BILL (CSV is the source of truth for filenames + status)
  c. every AMENDMENT_*.zip at repo root passes zipfile.testzip() and contains
     a PREAMBLE member; the 97-106 bundles (new convention) must additionally
     have 78 members including PART_9_B/PART9B.txt
  d. docs/amendments.csv parses and is consistent with the filesystem
     (zip_file matches an actual file for 1..96); every row carries a title,
     key changes, and a YYYY-MM-DD assent date
  e. docs/ deliverables exist: amendments.csv, amendments-table.md, AMENDMENTS.md, INVENTORY.md,
     bill_gaps.md, bundle_reconstruction_97_106.md
"""
import csv
import glob
import os
import re
import sys
import zipfile

ROOT = os.path.dirname(os.path.abspath(__file__))
MIN_SIZE = 100          # content files must exceed this many bytes
ACT_MIN_SIZE = 10240    # 10 KB
ZIP_PREAMBLE_MEMBER = 'PREAMBLE/Preamble.txt'

# Files that are legitimately smaller than MIN_SIZE and must not fail the size
# check: PART_7 is repealed (Part VII, States in Part B of the First Schedule,
# deleted by the 7th Amendment, 1956) — its file is heading-only, 134 bytes (md).
# SCHEDULE_8 (344 B as md, the 22-languages list) passes the >100 B threshold.
KNOWN_SMALL = {'PART_7/PART7.md'}


def content_dirs():
    """dir name -> expected file stem (mirrors the AMENDMENT_96_23092011.zip layout)."""
    d = {'PREAMBLE': 'Preamble'}
    for i in range(1, 23):
        d['PART_%d' % i] = 'PART%d' % i
    d.update({'PART_4_A': 'PART4A', 'PART_9_A': 'PART9A',
              'PART_9_B': 'PART9B', 'PART_14_A': 'PART14A'})
    for i in range(1, 13):
        d['SCHEDULE_%d' % i] = 'SCHEDULE%d' % i
    return d


def is_pdf(path):
    try:
        with open(path, 'rb') as f:
            return f.read(4) == b'%PDF'
    except OSError:
        return False


def check_content():
    fails = []
    for d, stem in sorted(content_dirs().items()):
        for ext in ('.md', '.pdf'):
            p = os.path.join(ROOT, d, stem + ext)
            rel = os.path.join(d, stem + ext)
            if not os.path.isfile(p):
                fails.append('content: missing %s' % rel)
            elif rel not in KNOWN_SMALL and os.path.getsize(p) <= MIN_SIZE:
                fails.append('content: %s too small (%d bytes <= %d)'
                             % (rel, os.path.getsize(p), MIN_SIZE))
    return fails


def load_csv():
    path = os.path.join(ROOT, 'docs', 'amendments.csv')
    rows = []
    with open(path, newline='', encoding='utf-8') as f:
        for r in csv.reader(f):
            if not r or r[0].startswith('#'):
                continue
            rows.append(r)
    return rows


def check_csv():
    fails = []
    path = os.path.join(ROOT, 'docs', 'amendments.csv')
    if not os.path.isfile(path):
        return ['csv: %s missing' % path]
    rows = load_csv()
    if len(rows) != 107:  # header + 106 data rows
        fails.append('csv: expected header + 106 rows, got %d' % len(rows))
        return fails
    header = rows[0]
    if header != ['number', 'title', 'assent_date', 'key_changes', 'bill_file',
                  'act_file', 'bill_url', 'act_url', 'zip_file', 'status']:
        fails.append('csv: unexpected header %r' % header)
        return fails
    by_number = {}
    for r in rows[1:]:
        if len(r) != 10:
            fails.append('csv: row %r has %d fields (want 10)' % (r[0], len(r)))
            continue
        if r[9] not in ('OK', 'MISSING_BILL'):
            fails.append('csv: row %s status %r not in {OK, MISSING_BILL}' % (r[0], r[9]))
        by_number[r[0]] = r
    # zip_file consistency: every non-empty zip_file must exist at repo root
    for num, r in sorted(by_number.items()):
        z = r[8]
        if z and not os.path.isfile(os.path.join(ROOT, z)):
            fails.append('csv: zip_file %r (row %s) not found at repo root' % (z, num))
    # manifest fields: every data row needs a title, key changes, and a valid
    # YYYY-MM-DD assent date (manifest completed 2026-08-07; guards regressions)
    for num, r in sorted(by_number.items()):
        if not r[1].strip():
            fails.append('csv: row %s has empty title' % num)
        if not r[3].strip():
            fails.append('csv: row %s has empty key_changes' % num)
        if not re.match(r'^\d{4}-\d{2}-\d{2}$', r[2]):
            fails.append('csv: row %s assent_date %r not YYYY-MM-DD' % (num, r[2]))
    return fails


def check_amendments(by_number):
    fails = []
    amdir = os.path.join(ROOT, 'AMENDMENTS')
    if not os.path.isdir(amdir):
        return ['amendments: AMENDMENTS/ directory missing']
    for num, r in sorted(by_number.items()):
        act = os.path.join(amdir, r[5])
        if not os.path.isfile(act):
            fails.append('amendments: act %s (row %s) missing' % (r[5], num))
        elif not is_pdf(act):
            fails.append('amendments: act %s (row %s) is not a PDF' % (r[5], num))
        elif os.path.getsize(act) <= ACT_MIN_SIZE:
            fails.append('amendments: act %s (row %s) too small (%d bytes <= %d)'
                         % (r[5], num, os.path.getsize(act), ACT_MIN_SIZE))
        if r[9] != 'MISSING_BILL':
            bill = os.path.join(amdir, r[4])
            if not os.path.isfile(bill):
                fails.append('amendments: bill %s (row %s, status %s) missing'
                             % (r[4], num, r[9]))
    return fails


def check_docs():
    """docs/ deliverables: the files the README points at must exist."""
    fails = []
    for name in ('amendments.csv', 'amendments-table.md', 'AMENDMENTS.md', 'INVENTORY.md',
                 'bill_gaps.md', 'bundle_reconstruction_97_106.md'):
        if not os.path.isfile(os.path.join(ROOT, 'docs', name)):
            fails.append('docs: %s missing at docs/' % name)
    return fails


ZIP_97_106_MEMBERS = 78   # 39 content dirs x (txt+pdf)
ZIP_97_106_PART9B = 'PART_9_B/PART9B.txt'  # Part IXB inserted by the 97th Amendment


def check_zips():
    fails = []
    zips = sorted(glob.glob(os.path.join(ROOT, 'AMENDMENT_*.zip')))
    for z in zips:
        name = os.path.basename(z)
        try:
            with zipfile.ZipFile(z) as zf:
                bad = zf.testzip()
                if bad is not None:
                    fails.append('zips: %s corrupt member %s' % (name, bad))
                names = zf.namelist()
                if ZIP_PREAMBLE_MEMBER not in names:
                    fails.append('zips: %s has no %s member' % (name, ZIP_PREAMBLE_MEMBER))
                m = re.match(r'AMENDMENT_(\d+)', name)
                if m and 97 <= int(m.group(1)) <= 106:
                    if len(names) != ZIP_97_106_MEMBERS:
                        fails.append('zips: %s has %d members (want %d, 97-106 convention)'
                                     % (name, len(names), ZIP_97_106_MEMBERS))
                    if ZIP_97_106_PART9B not in names:
                        fails.append('zips: %s missing %s' % (name, ZIP_97_106_PART9B))
        except (zipfile.BadZipFile, OSError) as e:
            fails.append('zips: %s unreadable: %s' % (name, e))
    return fails


def main():
    print('verify_repo.py — TheConstitutionOfIndia completeness check (%s)\n' % ROOT)
    csv_fails = check_csv()
    rows = load_csv() if not csv_fails else []
    by_number = {r[0]: r for r in rows[1:]} if rows else {}
    groups = [
        ('a. content dirs (39 x md+pdf >100B)', check_content()),
        ('b. AMENDMENTS/ acts+bills (106 acts, bills per CSV)', check_amendments(by_number)),
        ('c. bundle zips (all testzip + PREAMBLE; 97-106: 78 members + PART_9_B)', check_zips()),
        ('d. docs/amendments.csv (parse + filesystem consistency)', csv_fails),
        ('e. docs/ deliverables (amendments.csv, amendments-table.md, AMENDMENTS.md, INVENTORY.md, bill_gaps.md, bundle_reconstruction_97_106.md)', check_docs()),
    ]
    all_fail = []
    for title, fails in groups:
        status = 'PASS' if not fails else 'FAIL (%d)' % len(fails)
        print('%-55s %s' % (title, status))
        for f in fails:
            print('    - %s' % f)
            all_fail.append(f)
    print()
    if all_fail:
        print('RESULT: FAIL — %d problem(s). See lines above.' % len(all_fail))
        return 1
    print('RESULT: PASS — repo is complete.')
    return 0


if __name__ == '__main__':
    sys.exit(main())

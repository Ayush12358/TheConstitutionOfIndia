#!/usr/bin/env python3
"""verify_repo.py — completeness checker for TheConstitutionOfIndia.

Python 3, stdlib only. Exits 0 only when every check passes; otherwise lists
every failure and exits 1.

Checks:
  a. all 39 content dirs exist with the .md file (>100 bytes each):
     PREAMBLE, PART_1..PART_22, PART_4_A, PART_9_A, PART_9_B, PART_14_A,
     SCHEDULE_1..SCHEDULE_12 (file naming mirrors the bundle zips:
     dir "PART_4_A" holds "PART4A.md"; PREAMBLE holds "Preamble.md").
     Content PDFs were removed 2026-08-07 (markdown-first repo); they are
     re-extractable from the official 2024 pocket edition, so only the .md is
     required here.
  b. AMENDMENTS/: for every amendment 1..106 an ACT pdf exists (%PDF magic,
     >10KB) and a BILL pdf exists OR docs/amendments.csv marks that number
     MISSING_BILL (CSV is the source of truth for filenames + status)
  c. no AMENDMENT_*.zip exists in the working tree: the 108 bundle zips were
     removed 2026-08-07 and are preserved in the git tag trees
     STABLE_AMENDMENT_01..106 (each tag tree still contains its bundle zip)
     and in history — this check guards that invariant
  d. docs/amendments.csv parses and is consistent with the manifest: the
     zip_file column is a HISTORICAL reference since 2026-08-07 (the zips live
     in git tags, not on disk) and is NOT required to exist on disk; every row
     still carries a title, key changes, and a YYYY-MM-DD assent date
  e. docs/ deliverables exist: amendments.csv, amendments-table.md, AMENDMENTS.md, INVENTORY.md,
     bill_gaps.md, bundle_reconstruction_97_106.md; every relative markdown link in README.md,
     AMENDMENTS/README.md and docs/*.md resolves to a file on disk
"""
import csv
import glob
import os
import re
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
MIN_SIZE = 100          # content files must exceed this many bytes
ACT_MIN_SIZE = 10240    # 10 KB

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
    # Content PDFs were removed 2026-08-07 (markdown-first repo; the .pdf files
    # are re-extractable from the official 2024 pocket edition), so only the
    # .md is required here — the old %PDF/%%EOF truncation guard went with them.
    fails = []
    for d, stem in sorted(content_dirs().items()):
        p = os.path.join(ROOT, d, stem + '.md')
        rel = os.path.join(d, stem + '.md')
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
    # zip_file is a HISTORICAL reference since 2026-08-07: the bundle zips were
    # removed from the working tree and are preserved in the git tag trees
    # STABLE_AMENDMENT_01..106 and in history — so no on-disk existence check is
    # performed for them; the column is kept for provenance and restore docs.
    # All other CSV checks below remain fully enforced.
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
    """docs/ deliverables: the files the README points at must exist, and every
    relative markdown link in README.md, AMENDMENTS/README.md and docs/*.md must
    resolve to a file on disk (http(s)://, mailto: and #anchor links skipped)."""
    fails = []
    for name in ('amendments.csv', 'amendments-table.md', 'AMENDMENTS.md', 'INVENTORY.md',
                 'bill_gaps.md', 'bundle_reconstruction_97_106.md'):
        if not os.path.isfile(os.path.join(ROOT, 'docs', name)):
            fails.append('docs: %s missing at docs/' % name)
    link_re = re.compile(r'\[[^\]]*\]\(([^)#]+)\)')
    for rel in ['README.md', os.path.join('AMENDMENTS', 'README.md')] \
            + sorted(glob.glob(os.path.join('docs', '*.md'))):
        path = os.path.join(ROOT, rel)
        if not os.path.isfile(path):
            continue
        try:
            with open(path, encoding='utf-8') as f:
                text = f.read()
        except OSError as e:
            fails.append('docs: %s unreadable: %s' % (rel, e))
            continue
        for m in link_re.finditer(text):
            target = m.group(1)
            if (target.startswith(('http://', 'https://', 'mailto:'))
                    or target.startswith('#')):
                continue
            if not os.path.isfile(os.path.join(os.path.dirname(path), target)):
                fails.append('docs link: %s -> %s not found'
                             % (rel.replace(os.sep, '/'), target))
    return fails


def check_zips():
    """Bundle zips were removed from the working tree 2026-08-07 (markdown-first
    repo). They are preserved in the git tag trees STABLE_AMENDMENT_01..106
    (each tag tree still contains its bundle zip) and in history; this check
    guards the invariant that none are re-added to the tree."""
    fails = []
    for z in sorted(glob.glob(os.path.join(ROOT, 'AMENDMENT_*.zip'))):
        fails.append('zips: %s must not exist in the working tree (removed '
                     '2026-08-07; preserved in git tags/history)'
                     % os.path.basename(z))
    return fails


def main():
    print('verify_repo.py — TheConstitutionOfIndia completeness check (%s)\n' % ROOT)
    csv_fails = check_csv()
    rows = load_csv() if not csv_fails else []
    by_number = {r[0]: r for r in rows[1:]} if rows else {}
    groups = [
        ('a. content dirs (39 x md >100B; content PDFs removed 2026-08-07)', check_content()),
        ('b. AMENDMENTS/ acts+bills (106 acts, bills per CSV)', check_amendments(by_number)),
        ('c. bundle zips (none in working tree; preserved in git tags/history)', check_zips()),
        ('d. docs/amendments.csv (parse + manifest; zip_file historical)', csv_fails),
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

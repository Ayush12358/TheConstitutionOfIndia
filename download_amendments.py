#!/usr/bin/env python3
"""download_amendments.py — download Amendment Bill/Act PDFs into AMENDMENTS/.

Python 3, stdlib only (urllib). Works on Windows and POSIX.

Usage:
    python download_amendments.py 106 --bill <url> --act <url>
    python download_amendments.py 106 --act <url>          # bill only if given
    python download_amendments.py --auto 106               # print expected filenames
    python download_amendments.py 106 --bill <url> --act <url> --force   # overwrite

Filenames follow the repo convention: AMENDMENT_NN_BILL.pdf / AMENDMENT_NN_ACT.pdf
with zero-padded numbers (2-digit for amendments 01-96, 3-digit for 97+).

Every download is verified: %PDF magic bytes and size > 10 KB. Existing files
are never overwritten unless --force is given.
"""
import argparse
import os
import sys
import urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
AMENDMENTS_DIR = os.path.join(ROOT, 'AMENDMENTS')
MIN_ACT_SIZE = 10240  # 10 KB
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) download_amendments.py/1.0'


def file_stem(number):
    n = int(number)
    return 'AMENDMENT_%02d' % n if n <= 96 else 'AMENDMENT_%03d' % n


def expected_filenames(number):
    stem = file_stem(number)
    return stem + '_BILL.pdf', stem + '_ACT.pdf'


def fetch(url, dest, force=False):
    if os.path.exists(dest) and not force:
        print('SKIP: %s already exists (use --force to overwrite)' % dest)
        return True
    print('GET  %s' % url)
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = resp.read()
    except Exception as e:
        print('FAIL: %s: %s' % (dest, e))
        return False
    if not data.startswith(b'%PDF'):
        print('FAIL: %s: downloaded data is not a PDF (magic %r)' % (dest, data[:8]))
        return False
    if len(data) <= MIN_ACT_SIZE:
        print('FAIL: %s: suspiciously small (%d bytes <= %d)' % (dest, len(data), MIN_ACT_SIZE))
        return False
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, 'wb') as f:
        f.write(data)
    print('OK   %s (%d bytes)' % (dest, len(data)))
    return True


def main(argv=None):
    ap = argparse.ArgumentParser(
        description='Download a Constitution Amendment bill/act PDF into AMENDMENTS/.')
    ap.add_argument('number', nargs='?', type=int,
                    help='amendment number (1..106); with --auto, prints the expected filenames')
    ap.add_argument('--bill', help='URL of the bill PDF')
    ap.add_argument('--act', help='URL of the act PDF')
    ap.add_argument('--auto', action='store_true',
                    help='print the expected filenames for NUMBER and exit')
    ap.add_argument('--force', action='store_true',
                    help='overwrite existing files')
    args = ap.parse_args(argv)

    if not args.number:
        ap.error('amendment NUMBER is required')
    if args.auto:
        bill, act = expected_filenames(args.number)
        print(bill)
        print(act)
        return 0
    if not args.bill and not args.act:
        ap.error('nothing to download: pass --bill and/or --act (or --auto to list filenames)')

    os.makedirs(AMENDMENTS_DIR, exist_ok=True)
    bill, act = expected_filenames(args.number)
    ok = True
    if args.bill:
        ok = fetch(args.bill, os.path.join(AMENDMENTS_DIR, bill), args.force) and ok
    if args.act:
        ok = fetch(args.act, os.path.join(AMENDMENTS_DIR, act), args.force) and ok
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())

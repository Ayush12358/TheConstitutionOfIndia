> The bundle zips described here were removed from the working tree on 2026-08-07; they are preserved in the git tag trees STABLE_AMENDMENT_97..106 and in history.

# Bundle reconstruction for amendments 97-106 (2026-08-07) — audit log of the reverse-chain edits, each verified against the corresponding Amendment Act text (AMENDMENTS/AMENDMENT_NN_ACT.pdf) and the closed-loop gate (stage 97 diff vs AMENDMENT_96_23092011.zip)

## Method

The bundles for amendments 97–106 were reconstructed by a reverse chain anchored on
the official post-96 bundle: `stage_97` = unzip of `AMENDMENT_96_23092011.zip`
(`zip96/`) plus the 97th Amendment Act's changes; each subsequent `stage_N` is a
copy of `stage_(N-1)` plus the N-th Amendment Act's changes. Every edit is a
whitespace-insensitive phrase match (`find_span` in `chain.py`) applied by
`edit_file`, and each op carries a cite naming the act section it implements
(e.g. `[97th s.2]`, `[101st s.17]`). Where a stage's law changed through a
non-amendment statute, the cite names that act instead (AP Reorg 2014 s.10/s.12
inside stage 99; J&K Reorg 2019 s.6/s.8 and DNH-DD Merger 2019 s.4/s.5 inside
stage 104). Two special `[repair: …]` entries fix defects inherited from the
zip96 bundle itself (missing First Schedule UT entries 6/7 Puducherry/Chandigarh,
from the official text). The 97th's new Part IXB (243ZH–243ZT) was taken from the
live post-106 text with one correction: 243ZJ(1) 2nd proviso reads "class or
category" per the gazette, not "class of category".

Verification gates: (1) each edit is cited to, and checked against, the
corresponding Amendment Act text in `AMENDMENTS/AMENDMENT_NN_ACT.pdf` (extracted
to `acts/`); (2) closed loop — the stage-97 diff against the official
`AMENDMENT_96_23092011.zip` bundle yields exactly the 97th Amendment's changes,
proving the chain is anchored correctly; (3) the final `stage_106` tree is the
content of bundles `AMENDMENT_97_12012012.zip` … `AMENDMENT_106_28092023.zip`
(78 members each, incl. `PART_9_B/PART9B.txt`), checked by `verify_repo.py`.

## Audit log — 92 edits, verbatim

This list is the runtime `LOG` of `chain.py` / `chain_stages.py` (the builder
scripts), captured by re-running `build_97..build_106` against the preserved
stages. Format: `<file>: [<cite>] '<matched phrase>' -> '<replacement>'`, where
phrases/replacements are truncated to their first 60 characters exactly as the
scripts logged them; `-> ''` marks a deletion. File names are basenames as
logged (`PART3.txt` = `PART_3/PART3.txt`).

### Stage 97 (3 edits)

- PART3.txt: [97th s.2] '(c) to form associations or unions;' -> '(c) to form associations or unions or co-operative societies'
- PART4.txt: [97th s.3] '43A. Participation of workers in management of industries.—T' -> '43A. Participation of workers in management of industries.—T'
- PART_9_B/PART9B.txt: [97th s.4] new Part IXB (243ZH-243ZT)

### Stage 98 (3 edits)

- PART21.txt: [98th s.2] '371-I. Special provision with respect to the State of Goa.—N' -> '371-I. Special provision with respect to the State of\nGoa.—N'
- SCHEDULE1.txt: [repair: zip96 lacked UT entries 6/7 (official text)] '5. Daman and Diu' -> '5. Daman and Diu 6. Puducherry 7. Chandigarh'
- SCHEDULE1.txt: [repair: zip96 lacked UT entries 6/7 (official text)] 'The territories specified in section 4 of the Goa, Daman and' -> 'The territories specified in section 4 of the Goa, Daman and'

### Stage 99 (16 edits)

- PART5.txt: [99th s.2(a)] 'after consultation with such of the Judges of the Supreme Co' -> 'on the recommendation of the National Judicial Appointments '
- PART5.txt: [99th s.2(c)] 'the Chief Justice of India shall always be consulted: Provid' -> 'the Chief Justice of India shall always be consulted: Provid'
- PART5.txt: [99th s.2(b)] 'Provided that in the case of appointment of a Judge other th' -> ''
- PART5.txt: [99th s.3] '125. Salaries, etc., of Judges.—' -> '124A. (1) There shall be a Commission to be known as the Nat'
- PART5.txt: [99th s.4] 'the Chief Justice of India may, with the previous consent of' -> 'the National Judicial Appointments Commission on a reference'
- PART5.txt: [99th s.5] 'Notwithstanding anything in this Chapter, the Chief Justice ' -> 'Notwithstanding anything in this Chapter, the National Judic'
- PART6.txt: [99th s.6] 'after consultation with the Chief Justice of India, the Gove' -> 'on the recommendation of the National Judicial Appointments '
- PART6.txt: [99th s.7] 'The President may, after consultation with the Chief Justice' -> 'The President may, on the recommendation of the National Jud'
- PART6.txt: [99th s.8] 'the President may appoint duly qualified persons to be addit' -> 'the President may, in consultation with the National Judicia'
- PART6.txt: [99th s.8] 'the President may appoint a duly qualified person to act as ' -> 'the President may, in consultation with the National Judicia'
- PART6.txt: [99th s.9] 'the Chief Justice of a High Court for any State may at any t' -> 'the National Judicial Appointments Commission on a reference'
- PART6.txt: [99th s.10] '(a) the reference in article 217 to the Governor of the Stat' -> ''
- SCHEDULE1.txt: [AP Reorg 2014 s.10] 'but excluding the territories specified in the Second Schedu' -> 'but excluding the territories specified in the Second Schedu'
- SCHEDULE1.txt: [AP Reorg 2014 s.10] '28. Jharkhand' -> '28. Jharkhand 29. Telangana'
- SCHEDULE1.txt: [AP Reorg 2014 s.10] 'The territories specified in section 3 of the Bihar Reorgani' -> 'The territories specified in section 3 of the Bihar Reorgani'
- SCHEDULE4.txt: [AP Reorg 2014 s.12 (Fourth Schedule)] 'TABLE' -> 'TABLE 1. Andhra Pradesh ………………………………………… 11 2. Telangana\n………'

### Stage 100 (4 edits)

- SCHEDULE1.txt: [100th s.3(a)-(d)] 'territories specified in sections 5, 6 and 7 of the North-Ea' -> 'territories specified in sections 5, 6 and 7 of the North-Ea'
- SCHEDULE1.txt: [100th s.3(a)-(d)] 'territories specified in sub-section (1) of section 3 of the' -> 'territories specified in sub-section (1) of section 3 of the'
- SCHEDULE1.txt: [100th s.3(a)-(d)] 'territories specified in section 5 of the North-Eastern Area' -> 'territories specified in section 5 of the North-Eastern Area'
- SCHEDULE1.txt: [100th s.3(a)-(d)] 'being administered as if it were a Chief Commissioner’s Prov' -> 'being administered as if it were a Chief Commissioner’s Prov'

### Stage 101 (25 edits)

- PART11.txt: [101st s.2] '247. Power of Parliament to provide for the establishment of' -> '246A. Special provision with respect to goods and services t'
- PART11.txt: [101st s.3] '248. Residuary powers of legislation.—(1) Parliament has exc' -> '248. Residuary powers of legislation.—(1) Subject to article'
- PART11.txt: [101st s.4] 'that Parliament should make laws with respect to any matter ' -> 'that Parliament should make laws with respect to goods and s'
- PART11.txt: [101st s.5] 'have power to make laws for the whole or any part of the ter' -> 'have power to make laws for the whole or any part of the ter'
- PART12.txt: [101st s.6] 'Such stamp duties and such duties of excise on medicinal and' -> 'Such stamp duties as are mentioned in the Union List'
- PART12.txt: [101st s.8] 'Taxes on the sale or purchase of goods and taxes on the cons' -> 'Taxes on the sale or purchase of goods and taxes on the cons'
- PART12.txt: [101st s.9] '270. Taxes levied and distributed between the Union and the ' -> '269A. Levy and collection of goods and services tax in cours'
- PART12.txt: [101st s.10(i)] 'except the duties and taxes referred to in articles 268 and ' -> 'except the duties and taxes referred to in articles 268, 269'
- PART12.txt: [101st s.10(ii)] 'shall be levied and collected by the Government of India and' -> 'shall be levied and collected by the Government of India and'
- PART12.txt: [101st s.11] 'increase any of the duties or taxes referred to in those art' -> 'increase any of the duties or taxes referred to in those art'
- PART12.txt: [101st s.12] '280. Finance Commission.—(1) The President shall, within two' -> '279A. Goods and Services Tax Council.—(1) The President shal'
- PART12.txt: [101st s.13] 'a tax on the sale or purchase of goods where such sale or pu' -> 'a tax on the supply of goods or of services or both, where s'
- PART12.txt: [101st s.13] 'in the course of the import of the goods into, or export of ' -> 'in the course of the import of the goods or of services or b'
- PART12.txt: [101st s.13] 'when a sale or purchase of goods takes place in any of the w' -> 'when a supply of goods or of services or both in any of the '
- PART12.txt: [101st s.13] '(3) Any law of a State shall, in so far as it imposes, or au' -> ''
- PART19.txt: [101st s.14] '(12) “goods” includes all materials, commodities, and articl' -> '(12) “goods” includes all materials, commodities, and articl'
- PART19.txt: [101st s.14] '(26) “securities” includes stock;' -> '(26) “securities” includes stock; (26A) “Services” means any'
- PART20.txt: [101st s.15] 'article 54, article 55, article 73, article 162 or article 2' -> 'article 54, article 55, article 73, article 162, article 241'
- SCHEDULE6.txt: [101st s.16] 'tolls on passengers and goods carried in ferries; and (d) ta' -> 'tolls on passengers and goods carried in ferries; (d) taxes '
- SCHEDULE7.txt: [101st s.17] '84. Duties of excise on tobacco and other goods manufactured' -> '84. Duties of excise on the following goods manufactured or '
- SCHEDULE7.txt: [101st s.17] '92. Taxes on the sale or purchase of newspapers and on adver' -> ''
- SCHEDULE7.txt: [101st s.17] '52. Taxes on the entry of goods into a local area for consum' -> ''
- SCHEDULE7.txt: [101st s.17] '54. Taxes on the sale or purchase of goods other than newspa' -> '54. Taxes on the sale of petroleum crude, high speed diesel,'
- SCHEDULE7.txt: [101st s.17] '55. Taxes on advertisements other than advertisements publis' -> ''
- SCHEDULE7.txt: [101st s.17] '62. Taxes on luxuries, including taxes on entertainments, am' -> '62. Taxes on entertainments and amusements to the extent lev'

### Stage 102 (4 edits)

- PART16.txt: [102nd s.2] 'references to such other backward classes as the President m' -> 'references to the Anglo-Indian community'
- PART16.txt: [102nd s.3] '339. Control of the Union over the administration of Schedul' -> '338B. National Commission for Backward Classes.—(1) There sh'
- PART16.txt: [102nd s.4] 'any tribe or tribal community or part of or group within any' -> 'any tribe or tribal community or part of or group within any'
- PART19.txt: [102nd s.5] '(26B) “State” with reference to articles 246A, 268, 269, 269' -> '(26B) “State” with reference to articles 246A, 268, 269, 269'

### Stage 103 (2 edits)

- PART3.txt: [103rd s.2] 'other than the minority educational institutions referred to' -> 'other than the minority educational institutions referred to'
- PART3.txt: [103rd s.3] 'the incumbent of an office in connection with the affairs of' -> 'the incumbent of an office in connection with the affairs of'

### Stage 104 (27 edits)

- PART16.txt: [104th s.2(a)] 'Reservation of seats and special representation to cease aft' -> 'Reservation of seats and special representation to cease aft'
- PART16.txt: [104th s.2(b)] 'shall cease to have effect on the expiration of a period of ' -> 'shall cease to have effect on the expiration of a period of '
- SCHEDULE1.txt: [J&K Reorg 2019 s.6] '15. Jammu and Kashmir' -> ''
- SCHEDULE1.txt: [J&K Reorg 2019 s.6] '16. Nagaland' -> '15. Nagaland'
- SCHEDULE1.txt: [J&K Reorg 2019 s.6] '17. Haryana' -> '16. Haryana'
- SCHEDULE1.txt: [J&K Reorg 2019 s.6] '18. Himachal Pradesh' -> '17. Himachal Pradesh'
- SCHEDULE1.txt: [J&K Reorg 2019 s.6] '19. Manipur' -> '18. Manipur'
- SCHEDULE1.txt: [J&K Reorg 2019 s.6] '20.Tripura' -> '19. Tripura'
- SCHEDULE1.txt: [J&K Reorg 2019 s.6] '21. Meghalaya' -> '20. Meghalaya'
- SCHEDULE1.txt: [J&K Reorg 2019 s.6] '22. Sikkim' -> '21. Sikkim'
- SCHEDULE1.txt: [J&K Reorg 2019 s.6] '23. Mizoram' -> '22. Mizoram'
- SCHEDULE1.txt: [J&K Reorg 2019 s.6] '24. Arunachal Pradesh' -> '23. Arunachal Pradesh'
- SCHEDULE1.txt: [J&K Reorg 2019 s.6] '25. Goa' -> '24. Goa'
- SCHEDULE1.txt: [J&K Reorg 2019 s.6] '26. Chhattisgarh' -> '25. Chhattisgarh'
- SCHEDULE1.txt: [J&K Reorg 2019 s.6] '27.Uttarakhand' -> '26. Uttarakhand'
- SCHEDULE1.txt: [J&K Reorg 2019 s.6] '28. Jharkhand' -> '27. Jharkhand'
- SCHEDULE1.txt: [J&K Reorg 2019 s.6] '29. Telangana' -> '28. Telangana'
- SCHEDULE1.txt: [J&K Reorg 2019 s.6] 'The territory which immediately before the commencement of t' -> ''
- SCHEDULE1.txt: [J&K Reorg 2019 s.6] '7. Chandigarh' -> '7. Chandigarh 8. Jammu and Kashmir 9. Ladakh'
- SCHEDULE1.txt: [J&K Reorg 2019 s.6] 'The territories specified in section 4 of the Punjab Reorgan' -> 'The territories specified in section 4 of the Punjab Reorgan'
- PART8.txt: [DNH-DD Merger 2019 s.4] '(c) Dadra and Nagar Haveli;' -> '(c) Dadra and Nagar Haveli and Daman and Diu;'
- PART8.txt: [DNH-DD Merger 2019 s.4] '(d) Daman and Diu;' -> ''
- SCHEDULE1.txt: [DNH-DD Merger 2019 s.5] '4. Dadra and Nagar Haveli' -> '4. Dadra and Nagar Haveli and Daman and Diu'
- SCHEDULE1.txt: [DNH-DD Merger 2019 s.5] '5. Daman and Diu' -> ''
- SCHEDULE1.txt: [DNH-DD Merger 2019 s.5] 'The territory which immediately before the eleventh day of A' -> 'The territory which immediately before the eleventh day of A'
- SCHEDULE1.txt: [DNH-DD Merger 2019 s.5] 'The territories specified in section 4 of the Goa, Daman and' -> ''
- SCHEDULE4.txt: [J&K Reorg 2019 s.8 (Fourth Schedule)] 'TABLE' -> 'TABLE 1. Andhra Pradesh ………………………………………… 11 2. Telangana\n………'

### Stage 105 (4 edits)

- PART16.txt: [105th s.2] 'The Union and every State Government shall consult the Commi' -> 'The Union and every State Government shall consult the Commi'
- PART16.txt: [105th s.3(a)] 'the socially and educationally backward classes which shall ' -> 'the socially and educationally backward classes in the Centr'
- PART16.txt: [105th s.3(b)] 'any socially and educationally backward class, but save as a' -> 'but save as aforesaid a notification issued under the said c'
- PART19.txt: [105th s.4] '(26C) “socially and educationally backward classes” means su' -> '(26C) “socially and educationally backward classes” means su'

### Stage 106 (4 edits)

- PART8.txt: [106th s.2] '(b) The total number of seats in the Legislative Assembly, t' -> '(b) The total number of seats in the Legislative Assembly, t'
- PART16.txt: [106th s.3] '331. Representation of the Anglo-Indian Community in the Hou' -> '330A. Reservation of seats for women in the House of the Peo'
- PART16.txt: [106th s.4] '333. Representation of the Anglo-Indian community in the Leg' -> '332A. Reservation of seats for women in the Legislative Asse'
- PART16.txt: [106th s.5] '335. Claims of Scheduled Castes and Scheduled Tribes to serv' -> '334A. Reservation of seats for women take effect.—(1) Notwit'

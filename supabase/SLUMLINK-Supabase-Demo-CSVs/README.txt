SLUMLINK Supabase demo CSV pack

All records are fictional and intended only for screenshots and development.

Upload in this exact order:
1. 01_organizations.csv
2. 02_slum_dwellers.csv
3. 03_spouses.csv
4. 04_children.csv
5. 05_documents.csv
6. 06_complaints.csv
7. 07_campaigns.csv
8. 08_campaign_targets.csv
9. 09_notifications.csv
10. 10_distribution_sessions.csv
11. 11_distribution_entries.csv

In Supabase: Table Editor > select the matching table > Insert > Import data from CSV.
Use the table name after the numeric prefix. Keep "First row is header" enabled.
Do not upload these files twice unless you first remove the earlier demo rows with IDs 900001 and above.

The aid_types table is intentionally omitted. The migration already creates:
1 Food, 2 Clothing, 3 Medicine, 4 Cash, 5 Skill Training, 6 Job Placement.

Demo resident login: SR900001 / ResidentDemo@123
Demo NGO login: contact@alorpoth-demo.example / NgoDemo@123

-- Synthetic SLUMLINK demonstration data for screenshots and development.
-- Every person, identifier, contact detail, and document below is fictional.
-- Additive and repeatable: this script never deletes existing project data.

begin;

insert into organizations
  (org_id, org_type, org_name, email, phone, org_age, password, status,
   license_filename, license_mimetype, license_size, license_file)
values
  (900001,'ngo','Alor Pothe Foundation','contact@alorpoth-demo.example','01900910001',12,'NgoDemo@123','accepted','demo-license.txt','text/plain',31,convert_to('Synthetic license - not valid','UTF8')),
  (900002,'ngo','Nabodisha Community Trust','hello@nabodisha-demo.example','01900910002',8,'NgoDemo@123','accepted','demo-license.txt','text/plain',31,convert_to('Synthetic license - not valid','UTF8')),
  (900003,'ngo','Shobuj Shathi Initiative','office@shobuj-demo.example','01900910003',6,'NgoDemo@123','accepted','demo-license.txt','text/plain',31,convert_to('Synthetic license - not valid','UTF8')),
  (900004,'localauthority','Dhaka North Community Support Cell','support@dncc-demo.example','01900910004',15,'AuthorityDemo@123','accepted','demo-authorization.txt','text/plain',37,convert_to('Synthetic authorization - not valid','UTF8')),
  (900005,'ngo','Uttoron Welfare Network','apply@uttoron-demo.example','01900910005',3,'NgoDemo@123','pending','demo-license.txt','text/plain',31,convert_to('Synthetic license - not valid','UTF8')),
  (900006,'ngo','Prottasha Aid Society','info@prottasha-demo.example','01900910006',4,'NgoDemo@123','suspended','demo-license.txt','text/plain',31,convert_to('Synthetic license - not valid','UTF8'))
on conflict do nothing;

-- Create the household keys first so the related demo rows satisfy foreign keys.
insert into slum_dwellers (id,slum_code,password_hash,full_name)
select 900000+n, 'SR' || (900000+n)::text,
       '$2b$10$ol.iOBj702aMLB//8ygb/eE3733QPSUpWNpt1gWpsWTMie7Nf7kMa',
       'Demo Household ' || n
from generate_series(1,18) as n
on conflict do nothing;

insert into spouses
  (id,slum_id,name,dob,gender,nid,education,job,income,mobile,status,skills_1,skills_2)
values
  (900001,'SR900001','Shirin Akter','1989-07-02','Female','99800000000000001','Class 7','Home-based Worker','7000','01900800001','active','Sewing','Cooking'),
  (900002,'SR900003','Jahanara Begum','1983-12-18','Female','99800000000000002','Primary','Homemaker','0','01900800002','active','Cooking','Poultry Rearing'),
  (900003,'SR900004','Azizul Haque','1984-05-09','Male','99800000000000003','Class 8','Mechanic Helper','15500','01900800003','active','Mechanical Repair','Driving'),
  (900004,'SR900005','Rehana Begum','1986-01-20','Female','99800000000000004','Class 5','Homemaker','0','01900800004','active','Cooking','Sewing'),
  (900005,'SR900007','Kulsum Akter','1985-08-08','Female','99800000000000005','Primary','Domestic Worker','8500','01900800005','active','Cleaning','Cooking'),
  (900006,'SR900008','Shahidul Islam','1986-03-14','Male','99800000000000006','Class 8','Security Guard','14500','01900800006','active','Security','Driving'),
  (900007,'SR900009','Tania Akter','1998-09-06','Female','99800000000000007','SSC','Garment Worker','15000','01900800007','active','Garment Sewing','Quality Checking'),
  (900008,'SR900011','Monowara Begum','1988-10-22','Female','99800000000000008','Class 6','Homemaker','0','01900800008','active','Cooking','Handicrafts'),
  (900009,'SR900012','Rubel Hossain','1990-04-17','Male','99800000000000009','SSC','Bus Helper','15000','01900800009','active','Driving','Vehicle Cleaning'),
  (900010,'SR900013','Amena Khatun','1991-06-12','Female','99800000000000010','Class 8','Tailor','11000','01900800010','active','Sewing','Embroidery'),
  (900011,'SR900014','Masud Rana','1988-11-29','Male','99800000000000011','Class 9','Restaurant Worker','16000','01900800011','pending_add','Cooking','Customer Service')
on conflict do nothing;

insert into children
  (id,slum_id,name,dob,gender,education,job,income,preferred_job,
   birth_certificate_number,age_group,status,skills_1,skills_2)
values
  (900001,'SR900001','Sadia Rahman','2011-03-11','Female','Class 8',null,'0','Teacher','DEMO-BC-900001','child','active','Drawing','Reading'),
  (900002,'SR900001','Rifat Rahman','2016-08-24','Male','Class 3',null,'0','Engineer','DEMO-BC-900002','child','active','Sports','Math'),
  (900003,'SR900002','Mim Akter','2014-01-15','Female','Class 5',null,'0','Nurse','DEMO-BC-900003','child','active','Reading','Singing'),
  (900004,'SR900003','Sujon Hossain','2005-07-19','Male','Class 10','Apprentice','6000','Electrician','DEMO-BC-900004','adult','active','Electrical Repair','Cycling'),
  (900005,'SR900003','Jannat Hossain','2010-10-04','Female','Class 9',null,'0','Teacher','DEMO-BC-900005','child','active','Reading','Computer Basics'),
  (900006,'SR900004','Sumaiya Haque','2012-09-09','Female','Class 7',null,'0','Doctor','DEMO-BC-900006','child','active','Science','Reading'),
  (900007,'SR900004','Sakib Haque','2018-02-13','Male','Class 1',null,'0','Police Officer','DEMO-BC-900007','child','active','Sports','Drawing'),
  (900008,'SR900005','Arif Mia','2007-12-01','Male','Class 9','Shop Assistant','5000','Business Owner','DEMO-BC-900008','adult','active','Sales','Smartphone Use'),
  (900009,'SR900005','Runa Akter','2013-06-16','Female','Class 6',null,'0','Nurse','DEMO-BC-900009','child','active','Reading','Sewing'),
  (900010,'SR900006','Nusrat Jahan','2015-11-30','Female','Class 4',null,'0','Teacher','DEMO-BC-900010','child','active','Drawing','Reading'),
  (900011,'SR900007','Shanto Sheikh','2006-04-23','Male','Class 8','Day Labourer','6500','Mechanic','DEMO-BC-900011','adult','active','Mechanical Repair','Cycling'),
  (900012,'SR900007','Rima Akter','2009-08-05','Female','Class 10',null,'0','Garment Supervisor','DEMO-BC-900012','child','active','Sewing','Computer Basics'),
  (900013,'SR900008','Rasel Islam','2010-03-26','Male','Class 9',null,'0','Technician','DEMO-BC-900013','child','active','Electrical Repair','Sports'),
  (900014,'SR900010','Taslima Akter','2004-10-10','Female','HSC','Tailoring Assistant','7000','Tailor','DEMO-BC-900014','adult','active','Sewing','Embroidery'),
  (900015,'SR900011','Mahin Karim','2012-01-07','Male','Class 7',null,'0','Engineer','DEMO-BC-900015','child','active','Math','Computer Basics'),
  (900016,'SR900012','Lamisa Sultana','2016-04-21','Female','Class 3',null,'0','Doctor','DEMO-BC-900016','child','pending_add','Reading','Drawing'),
  (900017,'SR900013','Fahim Islam','2008-06-28','Male','Class 10',null,'0','Driver','DEMO-BC-900017','adult','active','Driving','Smartphone Use'),
  (900018,'SR900014','Anika Akter','2013-02-14','Female','Class 6',null,'0','Chef','DEMO-BC-900018','child','active','Cooking','Drawing')
on conflict do nothing;

insert into documents
  (id,slum_id,document_type,document_title,file_blob,file_mimetype,file_size,
   status,uploaded_at,reviewed_by,reviewed_at,rejection_reason)
select 900000 + row_number() over (order by id), slum_code,
       case when id % 3 = 0 then 'Skills Certificate' when id % 2 = 0 then 'Utility Bill' else 'National ID' end,
       case when id % 3 = 0 then 'Verified skills record' when id % 2 = 0 then 'Residence verification' else 'Household identity record' end,
       convert_to('Synthetic demo document - not valid','UTF8'),'text/plain',35,
       case when status='pending' then 'pending' when status='rejected' then 'rejected' else 'approved' end,
       created_at + interval '30 minutes',
       case when status='pending' then null else 'SLUMLINK Admin' end,
       case when status='pending' then null else created_at + interval '1 day' end,
       case when status='rejected' then 'The uploaded copy was incomplete.' else null end
from slum_dwellers where id between 900001 and 900018
on conflict do nothing;

insert into slum_dwellers
  (id,slum_code,password_hash,full_name,mobile,nid,dob,gender,education,
   occupation,income,area,district,division,family_members,status,skills_1,skills_2,created_at)
values
  (900001,'SR900001','$2b$10$ol.iOBj702aMLB//8ygb/eE3733QPSUpWNpt1gWpsWTMie7Nf7kMa','Rahim Uddin','01900900001','99900000000000001','1985-04-12','Male','Class 8','Rickshaw Puller','15000','Korail','Dhaka','Dhaka',4,'accepted','Driving','Basic Repair','2026-05-04 09:15+06'),
  (900002,'SR900002','$2b$10$ol.iOBj702aMLB//8ygb/eE3733QPSUpWNpt1gWpsWTMie7Nf7kMa','Nasima Akter','01900900002','99900000000000002','1990-08-21','Female','Class 5','Domestic Worker','12000','Korail','Dhaka','Dhaka',3,'accepted','Cooking','Sewing','2026-05-08 11:20+06'),
  (900003,'SR900003','$2b$10$ol.iOBj702aMLB//8ygb/eE3733QPSUpWNpt1gWpsWTMie7Nf7kMa','Jamal Hossain','01900900003','99900000000000003','1978-02-09','Male','Primary','Construction Worker','18000','Sattola','Dhaka','Dhaka',5,'accepted','Masonry','Painting','2026-05-12 14:05+06'),
  (900004,'SR900004','$2b$10$ol.iOBj702aMLB//8ygb/eE3733QPSUpWNpt1gWpsWTMie7Nf7kMa','Shahana Begum','01900900004','99900000000000004','1987-11-03','Female','Class 7','Garment Worker','16500','Sattola','Dhaka','Dhaka',4,'accepted','Garment Sewing','Quality Checking','2026-05-18 10:10+06'),
  (900005,'SR900005','$2b$10$ol.iOBj702aMLB//8ygb/eE3733QPSUpWNpt1gWpsWTMie7Nf7kMa','Kamal Mia','01900900005','99900000000000005','1982-06-17','Male','Class 6','Street Vendor','14000','Kallyanpur','Dhaka','Dhaka',4,'accepted','Sales','Food Preparation','2026-06-02 08:45+06'),
  (900006,'SR900006','$2b$10$ol.iOBj702aMLB//8ygb/eE3733QPSUpWNpt1gWpsWTMie7Nf7kMa','Rokeya Khatun','01900900006','99900000000000006','1992-01-26','Female','SSC','Tailor','13000','Kallyanpur','Dhaka','Dhaka',3,'accepted','Sewing','Embroidery','2026-06-05 13:25+06'),
  (900007,'SR900007','$2b$10$ol.iOBj702aMLB//8ygb/eE3733QPSUpWNpt1gWpsWTMie7Nf7kMa','Babul Sheikh','01900900007','99900000000000007','1980-09-15','Male','Class 5','Day Labourer','12500','Bauniabadh','Dhaka','Dhaka',6,'accepted','Construction','Loading','2026-06-11 16:00+06'),
  (900008,'SR900008','$2b$10$ol.iOBj702aMLB//8ygb/eE3733QPSUpWNpt1gWpsWTMie7Nf7kMa','Farida Yasmin','01900900008','99900000000000008','1989-03-30','Female','Class 8','Home-based Worker','10500','Bauniabadh','Dhaka','Dhaka',4,'accepted','Handicrafts','Cooking','2026-06-18 09:40+06'),
  (900009,'SR900009','$2b$10$ol.iOBj702aMLB//8ygb/eE3733QPSUpWNpt1gWpsWTMie7Nf7kMa','Selim Reza','01900900009','99900000000000009','1995-12-08','Male','SSC','Delivery Rider','19000','Duip Colony','Dhaka','Dhaka',2,'accepted','Motorcycle Driving','Smartphone Use','2026-07-01 12:10+06'),
  (900010,'SR900010','$2b$10$ol.iOBj702aMLB//8ygb/eE3733QPSUpWNpt1gWpsWTMie7Nf7kMa','Momena Begum','01900900010','99900000000000010','1975-05-19','Female','Primary','Vegetable Seller','11500','Duip Colony','Dhaka','Dhaka',3,'accepted','Retail Sales','Budgeting','2026-07-03 15:30+06'),
  (900011,'SR900011','$2b$10$ol.iOBj702aMLB//8ygb/eE3733QPSUpWNpt1gWpsWTMie7Nf7kMa','Abdul Karim','01900900011','99900000000000011','1984-10-11','Male','Class 8','Electrician Helper','17000','Tongi Rail Colony','Gazipur','Dhaka',4,'accepted','Electrical Repair','Wiring','2026-07-09 10:55+06'),
  (900012,'SR900012','$2b$10$ol.iOBj702aMLB//8ygb/eE3733QPSUpWNpt1gWpsWTMie7Nf7kMa','Salma Sultana','01900900012','99900000000000012','1993-07-07','Female','SSC','Cleaner','13500','Tongi Rail Colony','Gazipur','Dhaka',3,'accepted','Cleaning','Child Care','2026-07-12 11:35+06'),
  (900013,'SR900013','$2b$10$ol.iOBj702aMLB//8ygb/eE3733QPSUpWNpt1gWpsWTMie7Nf7kMa','Nurul Islam','01900900013','99900000000000013','1988-01-05','Male','Class 7','Van Driver','16000','Sholoshohor Colony','Chattogram','Chattogram',5,'accepted','Driving','Logistics','2026-07-19 09:00+06'),
  (900014,'SR900014','$2b$10$ol.iOBj702aMLB//8ygb/eE3733QPSUpWNpt1gWpsWTMie7Nf7kMa','Parvin Akter','01900900014','99900000000000014','1991-04-28','Female','Class 9','Food Stall Assistant','12500','Sholoshohor Colony','Chattogram','Chattogram',4,'accepted','Cooking','Customer Service','2026-07-22 13:15+06'),
  (900015,'SR900015','$2b$10$ol.iOBj702aMLB//8ygb/eE3733QPSUpWNpt1gWpsWTMie7Nf7kMa','Hasan Ali','01900900015','99900000000000015','1997-09-14','Male','HSC','Unemployed','0','Korail','Dhaka','Dhaka',1,'pending','Computer Basics','Data Entry','2026-08-26 10:20+06'),
  (900016,'SR900016','$2b$10$ol.iOBj702aMLB//8ygb/eE3733QPSUpWNpt1gWpsWTMie7Nf7kMa','Ayesha Siddika','01900900016','99900000000000016','1998-06-02','Female','HSC','Unemployed','0','Kallyanpur','Dhaka','Dhaka',2,'pending','Sewing','Computer Basics','2026-09-02 14:50+06'),
  (900017,'SR900017','$2b$10$ol.iOBj702aMLB//8ygb/eE3733QPSUpWNpt1gWpsWTMie7Nf7kMa','Rafiq Molla','01900900017','99900000000000017','1972-12-25','Male','None','Day Labourer','9000','Bauniabadh','Dhaka','Dhaka',5,'suspended','Loading','None','2026-08-11 16:25+06'),
  (900018,'SR900018','$2b$10$ol.iOBj702aMLB//8ygb/eE3733QPSUpWNpt1gWpsWTMie7Nf7kMa','Laila Begum','01900900018','99900000000000018','1986-02-16','Female','Class 4','Domestic Worker','10000','Duip Colony','Dhaka','Dhaka',4,'rejected','Cooking','None','2026-08-18 09:30+06')
on conflict (id) do update set
  slum_code=excluded.slum_code,password_hash=excluded.password_hash,
  full_name=excluded.full_name,mobile=excluded.mobile,nid=excluded.nid,
  dob=excluded.dob,gender=excluded.gender,education=excluded.education,
  occupation=excluded.occupation,income=excluded.income,area=excluded.area,
  district=excluded.district,division=excluded.division,
  family_members=excluded.family_members,status=excluded.status,
  skills_1=excluded.skills_1,skills_2=excluded.skills_2,
  created_at=excluded.created_at;

update documents d set
  status=case when s.status='pending' then 'pending'
              when s.status='rejected' then 'rejected' else 'approved' end,
  uploaded_at=s.created_at+interval '30 minutes',
  reviewed_by=case when s.status='pending' then null else 'SLUMLINK Admin' end,
  reviewed_at=case when s.status='pending' then null else s.created_at+interval '1 day' end,
  rejection_reason=case when s.status='rejected' then 'The uploaded copy was incomplete.' else null end
from slum_dwellers s
where d.slum_id=s.slum_code and d.id between 900001 and 900018;

insert into complaints
  (complaint_id,slum_id,title,category,description,attachment_filename,
   attachment_mimetype,attachment_size,attachment_file,division,district,area,
   status,responded_by,created_at,updated_at)
values
  (900001,'SR900001','Damaged community water point','Water and Sanitation','The main water point has been leaking for three days and pressure is low in the morning.','demo.txt','text/plain',30,convert_to('Synthetic complaint evidence','UTF8'),'Dhaka','Dhaka','Korail','in progress','Dhaka North Community Support Cell','2026-09-05 08:20+06','2026-09-07 12:00+06'),
  (900002,'SR900002','Blocked drainage beside lane 4','Drainage','Rainwater remains in the lane because the nearest drain is blocked with waste.','demo.txt','text/plain',30,convert_to('Synthetic complaint evidence','UTF8'),'Dhaka','Dhaka','Korail','resolved','Dhaka North Community Support Cell','2026-08-19 15:10+06','2026-08-24 10:30+06'),
  (900003,'SR900003','Streetlight not working','Electricity','Two streetlights near the community learning centre are not working at night.','demo.txt','text/plain',30,convert_to('Synthetic complaint evidence','UTF8'),'Dhaka','Dhaka','Sattola','pending',null,'2026-09-12 19:10+06','2026-09-12 19:10+06'),
  (900004,'SR900004','Irregular waste collection','Waste Management','Household waste has not been collected on the regular schedule this week.','demo.txt','text/plain',30,convert_to('Synthetic complaint evidence','UTF8'),'Dhaka','Dhaka','Sattola','in progress','Ward Support Desk','2026-09-08 09:45+06','2026-09-09 11:20+06'),
  (900005,'SR900005','Unsafe footbridge','Infrastructure','Several boards on the footbridge are loose and unsafe for children.','demo.txt','text/plain',30,convert_to('Synthetic complaint evidence','UTF8'),'Dhaka','Dhaka','Kallyanpur','resolved','Dhaka North Community Support Cell','2026-08-10 13:30+06','2026-08-16 16:10+06'),
  (900006,'SR900006','Need evening literacy class','Education','Several adult women want an evening literacy class near the community centre.','demo.txt','text/plain',30,convert_to('Synthetic complaint evidence','UTF8'),'Dhaka','Dhaka','Kallyanpur','pending',null,'2026-09-13 17:40+06','2026-09-13 17:40+06'),
  (900007,'SR900007','Mosquito control required','Health and Sanitation','Mosquitoes have increased around standing water near blocks B and C.','demo.txt','text/plain',30,convert_to('Synthetic complaint evidence','UTF8'),'Dhaka','Dhaka','Bauniabadh','in progress','Ward Health Team','2026-09-01 18:25+06','2026-09-03 09:15+06'),
  (900008,'SR900008','Community toilet needs repair','Water and Sanitation','One door and two taps in the women community toilet need repair.','demo.txt','text/plain',30,convert_to('Synthetic complaint evidence','UTF8'),'Dhaka','Dhaka','Bauniabadh','resolved','Ward Support Desk','2026-08-27 07:55+06','2026-09-02 15:00+06'),
  (900009,'SR900009','Road becomes muddy after rain','Infrastructure','The entrance road becomes difficult for schoolchildren and riders after rainfall.','demo.txt','text/plain',30,convert_to('Synthetic complaint evidence','UTF8'),'Dhaka','Dhaka','Duip Colony','pending',null,'2026-09-11 10:05+06','2026-09-11 10:05+06'),
  (900010,'SR900010','Request health screening camp','Healthcare','Older residents would benefit from blood pressure and diabetes screening.','demo.txt','text/plain',30,convert_to('Synthetic complaint evidence','UTF8'),'Dhaka','Dhaka','Duip Colony','resolved','Community Health Team','2026-08-04 14:20+06','2026-08-12 12:40+06'),
  (900011,'SR900011','Exposed electrical cable','Electricity','An exposed cable is hanging beside the main path and needs urgent attention.','demo.txt','text/plain',30,convert_to('Synthetic complaint evidence','UTF8'),'Dhaka','Gazipur','Tongi Rail Colony','in progress','Local Electrical Team','2026-09-10 16:35+06','2026-09-10 18:00+06'),
  (900012,'SR900012','School supply support needed','Education','Families need notebooks and basic school supplies before the next term.','demo.txt','text/plain',30,convert_to('Synthetic complaint evidence','UTF8'),'Dhaka','Gazipur','Tongi Rail Colony','pending',null,'2026-09-09 11:15+06','2026-09-09 11:15+06'),
  (900013,'SR900013','Waterlogging near rail crossing','Drainage','Water remains near the crossing for several days after heavy rain.','demo.txt','text/plain',30,convert_to('Synthetic complaint evidence','UTF8'),'Chattogram','Chattogram','Sholoshohor Colony','in progress','City Response Desk','2026-09-06 08:50+06','2026-09-08 10:10+06'),
  (900014,'SR900014','Need covered waste bins','Waste Management','Covered bins are needed near the food stalls to reduce odor and insects.','demo.txt','text/plain',30,convert_to('Synthetic complaint evidence','UTF8'),'Chattogram','Chattogram','Sholoshohor Colony','resolved','City Response Desk','2026-08-15 12:25+06','2026-08-21 09:45+06')
on conflict do nothing;

insert into campaigns
  (campaign_id,org_id,title,category,division,district,slum_area,start_date,
   end_date,start_time,target_gender,age_group,education_required,skills_required,
   description,status,created_at)
values
  (900001,900001,'Monsoon Family Food Support','Food Assistance','Dhaka','Dhaka','Korail','2026-08-05','2026-08-07','09:00','all','both','None','None','Essential food packs for verified families affected by monsoon income disruption.','completed','2026-07-26 10:00+06'),
  (900002,900002,'Women Tailoring and Enterprise Workshop','Skill Development','Dhaka','Dhaka','Kallyanpur','2026-09-10','2026-09-24','10:00','female','adult','Class 5','Sewing','Practical tailoring, costing, and small-business training for home-based income.','in_progress','2026-08-29 11:30+06'),
  (900003,900003,'Child Wellness and Nutrition Camp','Healthcare','Dhaka','Dhaka','Bauniabadh','2026-09-14','2026-09-16','08:30','all','child','None','None','Free health screening, nutrition assessment, and caregiver guidance for children.','in_progress','2026-09-03 09:20+06'),
  (900004,900004,'Community Drainage Response Drive','Infrastructure','Dhaka','Dhaka','Sattola','2026-09-18','2026-09-20','07:30','all','both','None','None','Community cleanup and drainage maintenance coordinated with the local support cell.','pending','2026-09-08 15:45+06'),
  (900005,900001,'Digital Basics for Youth','Education and Training','Dhaka','Gazipur','Tongi Rail Colony','2026-09-25','2026-10-09','15:00','all','adult','SSC','Computer Basics','Digital literacy, online safety, CV preparation, and entry-level data work.','pending','2026-09-10 10:15+06'),
  (900006,900002,'Winter Clothing Preparation','Clothing Assistance','Chattogram','Chattogram','Sholoshohor Colony','2026-10-10','2026-10-12','09:30','all','both','None','None','Registration and distribution planning for family winter clothing packages.','pending','2026-09-11 14:00+06'),
  (900007,900003,'Safe Water Awareness Session','Water and Sanitation','Dhaka','Dhaka','Duip Colony','2026-08-20','2026-08-20','11:00','all','both','None','None','Training on safe water storage, purification, and waterborne illness prevention.','completed','2026-08-08 12:30+06'),
  (900008,900001,'Emergency Heat Relief Point','Emergency Relief','Dhaka','Dhaka','Korail','2026-07-12','2026-07-13','10:00','all','both','None','None','A proposed relief point cancelled after weather conditions improved.','cancelled','2026-07-09 16:20+06'),
  (900009,900002,'Mobile Job Matching Desk','Employment','Dhaka','Dhaka','Bauniabadh','2026-08-28','2026-08-28','10:00','all','adult','Class 8','None','Skills profiling, CV support, and referrals to verified employers.','not_executed','2026-08-16 09:40+06')
on conflict do nothing;

insert into campaign_targets (campaign_id,slum_code,matched_at)
values
  (900001,'SR900001','2026-07-26 10:05+06'),(900001,'SR900002','2026-07-26 10:05+06'),
  (900002,'SR900005','2026-08-29 11:35+06'),(900002,'SR900006','2026-08-29 11:35+06'),
  (900003,'SR900007','2026-09-03 09:25+06'),(900003,'SR900008','2026-09-03 09:25+06'),
  (900004,'SR900003','2026-09-08 15:50+06'),(900004,'SR900004','2026-09-08 15:50+06'),
  (900005,'SR900011','2026-09-10 10:20+06'),(900005,'SR900012','2026-09-10 10:20+06'),
  (900006,'SR900013','2026-09-11 14:05+06'),(900006,'SR900014','2026-09-11 14:05+06'),
  (900007,'SR900009','2026-08-08 12:35+06'),(900007,'SR900010','2026-08-08 12:35+06'),
  (900008,'SR900001','2026-07-09 16:25+06'),(900008,'SR900002','2026-07-09 16:25+06'),
  (900009,'SR900007','2026-08-16 09:45+06'),(900009,'SR900008','2026-08-16 09:45+06')
on conflict (campaign_id,slum_code) do nothing;

insert into notifications
  (notification_id,slum_code,campaign_id,org_id,type,title,message,is_read,created_at)
select 900000 + row_number() over (order by ct.campaign_id,ct.slum_code),
       ct.slum_code,ct.campaign_id,c.org_id,
       case when c.status='cancelled' then 'campaign_cancelled' else 'campaign_created' end,
       case when c.status='cancelled' then 'Campaign cancelled' else 'New campaign matched your household' end,
       case when c.status='cancelled' then c.title || ' has been cancelled.'
            else 'Your household matched: ' || c.title || '.' end,
       (ct.campaign_id in (900001,900007)),ct.matched_at + interval '1 minute'
from campaign_targets ct join campaigns c using (campaign_id)
where ct.campaign_id between 900001 and 900009
on conflict do nothing;

insert into distribution_sessions
  (session_id,campaign_id,org_id,aid_type_id,status,started_at,finished_at,performed_by)
select v.session_id,v.campaign_id,v.org_id,a.aid_type_id,v.status,v.started_at,v.finished_at,v.performed_by
from (values
  (900001::bigint,900001::bigint,900001::bigint,'Food','CLOSED','2026-08-05 09:05+06'::timestamptz,'2026-08-05 13:40+06'::timestamptz,'Nusrat Chowdhury'),
  (900002,900001,900001,'Cash','CLOSED','2026-08-06 10:00+06','2026-08-06 12:30+06','Mahmud Hasan'),
  (900003,900007,900003,'Medicine','CLOSED','2026-08-20 11:10+06','2026-08-20 14:00+06','Dr. Samia Rahman'),
  (900004,900002,900002,'Skill Training','OPEN','2026-09-10 10:05+06',null,'Farhana Islam'),
  (900005,900003,900003,'Medicine','OPEN','2026-09-14 08:35+06',null,'Health Camp Team')
) as v(session_id,campaign_id,org_id,aid_name,status,started_at,finished_at,performed_by)
join aid_types a on a.name=v.aid_name
on conflict do nothing;

insert into distribution_entries
  (entry_id,session_id,campaign_id,org_id,family_code,round_no,quantity,
   comment,distributed_at,verification_method)
values
  (900001,900001,900001,900001,'SR900001',1,2,'Two essential food packs issued.','2026-08-05 09:35+06','QR'),
  (900002,900001,900001,900001,'SR900002',1,2,'Two essential food packs issued.','2026-08-05 09:48+06','CODE'),
  (900003,900001,900001,900001,'SR900003',1,3,'Three food packs for a larger household.','2026-08-05 10:12+06','QR'),
  (900004,900001,900001,900001,'SR900004',1,2,'Verified household food support.','2026-08-05 10:27+06','CODE'),
  (900005,900001,900001,900001,'SR900005',1,2,'Verified household food support.','2026-08-05 11:05+06','QR'),
  (900006,900001,900001,900001,'SR900006',1,2,'Verified household food support.','2026-08-05 11:25+06','CODE'),
  (900007,900002,900001,900001,'SR900001',1,1500,'Emergency cash assistance in BDT.','2026-08-06 10:20+06','QR'),
  (900008,900002,900001,900001,'SR900002',1,1500,'Emergency cash assistance in BDT.','2026-08-06 10:38+06','CODE'),
  (900009,900002,900001,900001,'SR900003',1,2000,'Larger-household cash assistance.','2026-08-06 11:04+06','QR'),
  (900010,900003,900007,900003,'SR900009',1,3,'Oral saline and water purification supplies.','2026-08-20 11:35+06','CODE'),
  (900011,900003,900007,900003,'SR900010',1,3,'Oral saline and water purification supplies.','2026-08-20 12:10+06','QR'),
  (900012,900004,900002,900002,'SR900005',1,null,'Attended tailoring workshop orientation.','2026-09-10 10:30+06','QR'),
  (900013,900004,900002,900002,'SR900006',1,null,'Attended tailoring workshop orientation.','2026-09-10 10:42+06','CODE'),
  (900014,900004,900002,900002,'SR900010',1,null,'Completed the first practical session.','2026-09-12 11:15+06','QR'),
  (900015,900005,900003,900003,'SR900007',1,2,'Child wellness kit and basic medicine.','2026-09-14 09:05+06','QR'),
  (900016,900005,900003,900003,'SR900008',1,2,'Child wellness kit and basic medicine.','2026-09-14 09:22+06','CODE'),
  (900017,900005,900003,900003,'SR900003',1,3,'Nutrition supplements after screening.','2026-09-14 10:10+06','QR')
on conflict do nothing;

commit;

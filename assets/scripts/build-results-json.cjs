#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const out = path.join(__dirname, '..', '..', 'assets', 'json', 'results');
fs.mkdirSync(out, { recursive: true });

function write(id, cls, year, totalMarks, students) {
  const seen = new Set();
  const list = [];
  students.forEach((s) => {
    const name = String(s.name || s[0]).replace(/\s+/g, ' ').trim();
    const marks = Number(s.marks !== undefined ? s.marks : s[1]);
    const key = name.toLowerCase() + '|' + marks;
    if (!name || seen.has(key)) return;
    seen.add(key);
    list.push({ name, marks });
  });
  list.sort((a, b) => b.marks - a.marks || a.name.localeCompare(b.name));
  const data = { id, class: cls, year, subject: 'Chemistry', totalMarks, students: list };
  fs.writeFileSync(path.join(out, id + '.json'), JSON.stringify(data, null, 2));
  console.log(id, list.length, 'students');
  return id;
}

const ids = [];

/* 10th-2021 */
ids.push(write('10th-2021', '10th', 2021, 60, [
  ['Asawra Noor', 60], ['Fatima Bibi', 60], ['Fatima Batool', 60], ['Fatima Zahra', 60],
  ['Hadia Aslam', 60], ['Hadia Sidique', 60], ['Humaira Bibi', 60], ['Javeria Haq Nawaz', 60],
  ['Aiman Fatima', 60], ['Ayesha Khalid', 60], ['Amara Asif', 60], ['Asia Arshad', 60],
  ['Farah Arshad', 60], ['Misbah Aslam', 60], ['Sajal Aslam', 60], ['Sania Mazhar', 60],
  ['Zahra Ayub', 60], ['Zoya Qasim', 60], ['Mubarak Altaf', 60], ['Kishwar Qasim', 60],
  ['Humaira Shaheen', 60], ['Qalsoom Sabir', 60], ['Salma Fazal', 60], ['Zeeshan Javed', 60],
  ['Aqsa Maryam', 60], ['Mashal Sattar', 60], ['Fatima Aslam', 60], ['Sidra Batool', 59],
  ['Nosheen Sattar', 59], ['Sadia Bibi', 59], ['Sadia Kanwal', 59], ['Samavia Rehan', 59],
  ['Sehrish Fazal', 59], ['Shabana Bibi', 59], ['Shanawar Batool', 59], ['Anila Shabaz', 59],
  ['Uzma Abdul Sattar', 59], ['M Waqas', 59], ['M Ejaz', 59], ['M Arbi', 59],
  ['M Ahmad', 59], ['Areeba Fatima', 59], ['Iqra Yaseen', 59], ['Shumaila Naaz', 59],
  ['Iqra Khalid', 59], ['Sumaira Bibi', 59], ['Afshaan Shamshad', 59], ['Elham', 59],
  ['Sibgha Hakim', 59], ['Khadija Rubab', 59], ['Khadija Ubaid', 59], ['Madiha', 59],
  ['Maryam Abid', 59], ['Najma Malik', 59], ['Samra Rafeeeq', 59], ['Shaista Shabeer', 59],
  ['Alishba Fiaz', 59], ['Shanza Batool', 59]
]));

/* 9th-2021 */
ids.push(write('9th-2021', '9th', 2021, 60, [
  ['Mahjabeen', 60], ['Mahtab', 60], ['Irtaza', 60], ['Afnan', 60], ['Misbah Fiyaz', 60],
  ['Somia Mujeeb', 60], ['Sitara Basheer', 60], ['Shazma Aslam', 60], ['Iqra Azam', 60],
  ['Nidba Sajjad', 60], ['Saira Khadim', 60], ['Parveen Fiyaz', 60], ['Ishrat Akbar', 60],
  ['Dua Fatima', 60], ['Zunaira', 60], ['Areeqa Javed', 60], ['Sadia Bibi', 60],
  ['Zainab Nadeem', 60], ['Iqra Ubaid', 60], ['Zahra Imdad', 60], ['Zainab Ayub', 60],
  ['Javed', 60], ['Asma Sajjad', 60], ['Aneesha', 60], ['Ayesha Irshad', 60],
  ['Alia Fatima', 60], ['Fatima Haroon', 60], ['Hijab Shareef', 60], ['Fatima Imran', 60],
  ['Fatima Hameed', 60], ['Emaan Asif', 60], ['Hafsa Ayaz', 59], ['Alia Bibi', 59],
  ['Emaan Hameed', 59], ['Kiran Fatima', 59], ['Maryam Naem', 59], ['Rukhsana Abbas', 59],
  ['Shan', 59], ['Zahra Imtyaz', 59], ['Sawera Nadeem', 59], ['Maryam Shahid', 59],
  ['Mehak Sattar', 59], ['Sawera Hussain', 59], ['Sara Fahad', 59], ['Musarat Waseem', 59],
  ['Freeha Bibi', 59], ['Areesha Batool', 59], ['Qudsia Saed', 59], ['Sara Fatima', 59],
  ['Sadia Shabeer', 59]
]));

/* 9th-2019 */
ids.push(write('9th-2019', '9th', 2019, 60, [
  ['Zaira Akram', 60, 'زنیرا اکرم'], ['Alishba Tariq', 60, 'علشبہ طارق'], ['Ismat Afzal', 60, 'عصمت افضل'],
  ['Humaira Farooq', 60, 'حمیرا فاروق'], ['Hudhaifa Khalid', 60, 'حذیفہ خالد'], ['Nimra Khalid', 60, 'نمرہ خالد'],
  ['Saniya Arooj', 60, 'ثانیہ عروج'], ['Ghulam Zainab', 60, 'غلام زینب'], ['Abdul Qadeer', 60, 'عبد القدیر'],
  ['Muhammad Uwais', 60, 'محمد اویس'], ['Ahmad Mureed', 60, 'احمد مرید'], ['Mahboob-ul-Hassan', 60, 'محبوب الحسن'],
  ['Muhammad Ahmad', 60, 'محمد احمد'], ['Sher Bilal', 60, 'شیر بلال'], ['Shoaib Akbar', 60, 'شعیب اکبر'],
  ['Effat Alam', 59, 'عفت عالم'], ['Iqra Maqbool', 59, 'اقرا مقبول'], ['Lareeb Nadeem', 59, 'لاريب نديم'],
  ['Saira Niaz', 59, 'سويرانياز'], ['Uzma Satar', 59, 'عظمى ستار'], ['Zeeshan Farooq', 59, 'ذیشان فاروق'],
  ['Muhammad Abdullah', 59, 'محمد عبدالله'], ['Muhammad Ehtasham Farooq', 59, 'محمد احتشام فاروق'],
  ['Hamza Ijaz Malik', 59, 'حمزه اعجاز ملک'], ['Muhammad Mudassir Sajjad', 59, 'محمد مدثر سجاد'],
  ['Muhammad Muzammil', 59, 'محمد مزمل']
]));

/* 10th-2020 */
ids.push(write('10th-2020', '10th', 2020, 60, [
  ['Ismat Afzal', 60, 'عصمت افضل'], ['Zunira Akram', 60, 'زنیرا اکرم'], ['Alishba Tariq', 60, 'علشبہ طارق'],
  ['Marwa Zafar', 60, 'مروبه ظفر'], ['Ghulam Zainab', 60, 'غلام زينب'], ['Hudhaifa Khalid', 60, 'حذيقة خالد'],
  ['Iqra Maqbool', 60, 'اقرا مقبول'], ['Arrij Fatima', 60, 'اررج فاطمه'], ['Nimra Khalid', 60, 'نمرہ خالد'],
  ['Somia Majeed', 60, 'سومیہ مجید'], ['Azmi Sattar', 60, 'عظمی ستار'], ['Abdul Qadeer Aziz', 60, 'عبد القدير عزيز'],
  ['Muhammad Abdullah', 60, 'محمد عبدالله'], ['Ehtasham Farooq', 60, 'احتشام فاروق'],
  ['Muhammad Owais Shafi', 60, 'محمد اویس شفیع'], ['Muhammad Hannan', 60, 'محمد حنان'],
  ['Muhammad Junaid', 60, 'محمد جنید'], ['Muhammad Mohsin Ali', 60, 'محمد محسن علی'],
  ['Muzammil Maqsood', 60, 'مزمل مقصود'], ['Muhammad Muzammil', 60, 'محمد مزمل'],
  ['Muzammil Yousaf', 60, 'مزمل يوسف'], ['Waqas Abid', 60, 'وقاس عابد'], ['Zeeshan Farooq', 60, 'ذیشان فاروق'],
  ['Sher Bilal', 60, 'شربلال'], ['Shoaib Akbar', 60, 'شعیب اکبر'], ['Romana Ashfaq', 60, 'رومانه اشفاق'],
  ['Muhammad Yameen', 60, 'محمد يمين'], ['Muhammad Yameen Qureshi', 60, 'محمد يمين قريشي'],
  ['Muhammad Bilal', 60, 'محمد بلال'], ['Muhammad Waqas', 60, 'محمد وقاص'], ['Zunira Nazeer', 60, 'زنیرا نذیر'],
  ['Kausar Manzoor', 60, 'کوثر منظور'], ['Iqrar Rafiq', 60, 'اقرار رفیق'], ['Shahida Bibi', 60, 'شاہدہ بی بی'],
  ['Salma Gul', 60, 'سلمی گل'], ['Ahmed Hassan', 60, 'احمد حسن'], ['Waqar Hameed', 60, 'وقار حمید'],
  ['Muhammad Naeem', 60, 'محمد نعیم'], ['Alishba Asghar', 60, 'علشبہ اصغر'], ['Muhammad Naqeeb', 60, 'محمد نقیب'],
  ['Saadullah', 60, 'سعد الله'], ['Shehzad', 60, 'شہزاد'], ['Muhammad Rashid', 60, 'محمد راشد'],
  ['Muhammad Nadeem', 60, 'محمد ندیم'], ['Asima Bibi', 60, 'عاصمہ بی بی'], ['Aliza Shahid', 60, 'علیہ شاہد'],
  ['Iman Muneer', 60, 'ایمان منیر'], ['Iman Ashraf', 60, 'ایمان اشرف'], ['Fatima Al-Zahra', 60, 'فاطمہ الزہرہ'],
  ['Khadija Zafar', 60, 'خدیجہ ظفر'], ['Khushbu Hameed', 60, 'خوشبو حمید'], ['Maria Sabir', 60, 'ماريه صابر'],
  ['Moomina Batool', 60, 'مومنہ بتول'], ['Sameera Niaz', 60, 'سمیرہ نیاز'], ['Shahroz', 60, 'شہروز'],
  ['Soaira Niaz', 60, 'سوئیرانیاز'], ['Sadia Zaman', 60, 'سعدیہ زمان'], ['Saniya Arooj', 60, 'ثانیہ عروج'],
  ['Ahsan Kareem', 60, 'احسان كريم'], ['Mahboob-ul-Hassan', 60, 'محبوب الحسن'], ['Muhammad Anees', 60, 'محمد انيس'],
  ['Muhammad Ghufran Nadeem', 60, 'محمد غفران نديم'], ['Muhammad Hassan', 59, 'محمد حسان'],
  ['Muhammad Ismail', 59, 'محمد اسماعیل'], ['Muhammad Hussain', 59, 'محمد حسین']
]));

/* 10th-2018 — merge both sheets (section 3 + 4) */
ids.push(write('10th-2018', '10th', 2018, 60, [
  ['Adnan Sajjad', 60, 'عدنان سجاد'], ['Kashif Rana', 60, 'كاشف رانا'], ['Saryab Amjad', 60, 'سيراب امجد'],
  ['Asia Ashiq', 60, 'آسيه عاشق'], ['Muhammad Madni', 60, 'محمد مدني'], ['Muhammad Numan', 60, 'محمد نعمان'],
  ['Muhammad Tanveer', 60, 'محمد تنوير'], ['Zain-ul-Abideen', 60, 'زين العابدين'],
  ['Muhammad Abdullah Iqbal', 60, 'محمد عبدالله اقبال'], ['Muhammad Usama', 60, 'محمد اسامه'],
  ['Muhammad Waseem', 60, 'محمد وسیم'], ['Muhammad Zubair', 60, 'محمد زبیر'], ['Rajab Ali', 60, 'رجب علی'],
  ['Rayyan Rafiq', 60, 'ريان رفيق'], ['Shoaib Akhtar', 60, 'شعیب اختر'], ['Syed Qaim Ali Shah', 60, 'سید قائم علی شاہ'],
  ['Zain Ayyub', 60, 'زين ايوب'], ['Mahboob Hussain', 60, 'محبوب حسین'], ['Ghulam Jafar', 59, 'غلام جعفر'],
  ['Zubair Wajid', 59, 'زبیر واجد'],
  ['Alisha Shah', 58, 'علية شاه'], ['Sadia Ijaz', 58, 'سعدیہ اعجاز'], ['Muhammad Ismail', 58, 'محمد اسماعیل'],
  ['Muhammad Adnan', 58, 'محمد عدنان'], ['Muhammad Mohsin Ali', 58, 'محمد محسن علی'],
  ['Muhammad Rehan Farid', 58, 'محمد ريحان فريد'], ['Muhammad Waqas', 58, 'محمد وقاص'],
  ['Muhammad Yunus', 58, 'محمد يونس'], ['Arif Kausar', 57, 'عارض کوثر'], ['Marwa Zafar', 57, 'مروبه ظفر'],
  ['Iman Ashraf', 57, 'ایمان اشرف'], ['Suira Amjed', 57, 'سويرة امجد'],
  ['Muhammad Idris Safdar', 57, 'محمد ادريس صفدر'], ['Muhammad Junaid', 57, 'محمد جنيد'],
  ['Muhammad Naqeeb', 57, 'محمد نقیب'], ['Muhammad Shan Bilal', 57, 'محمد شان بلال'],
  ['Ahmad Atta', 57, 'احمد عطا'], ['Muhammad Aqib', 57, 'محمد عاقب'], ['Usama Tariq', 57, 'اسامہ طارق']
]));

/* 10th-2019 */
ids.push(write('10th-2019', '10th', 2019, 60, [
  ['Iqra Ijaz Malik', 60, 'اقراء اعجاز ملک'], ['Kiran Sajjad', 60, 'كرن سجاد'], ['Rima Khan', 60, 'ريما خان'],
  ['Sana Qayyum', 60, 'ثناء قيوم'], ['Saira Afzal', 60, 'سويرة افضل'], ['Yusra Javed', 60, 'يسترى جاويد'],
  ['Afshan Arshad', 60, 'افشان ارشد'], ['Iqra Abid', 60, 'اقراء عابد'], ['Maryam Zahra', 60, 'مريم زهره'],
  ['Qurat-ul-Ain', 60, 'قراۃ العين'], ['Suira Manzoor', 60, 'سويرة منظور'], ['Muhammad Kashif', 60, 'محمد كاشف'],
  ['Muhammad Zubair', 60, 'محمد زبیر'], ['Izhar Ahmad', 60, 'اظهار احمد'], ['Adnan Qasim', 60, 'عدنان قاسم'],
  ['Adnan Manzoor', 60, 'عدنان منظور'], ['Muhammad Ahmad', 60, 'محمد احمد'],
  ['Muhammad Ali Hamza', 60, 'محمد علي حمزه'], ['Muhammad Asghar', 60, 'محمد اصغر'],
  ['Muhammad Asif', 60, 'محمد آصف'], ['Muhammad Atif Farid', 60, 'محمد عاطف فريد'],
  ['Muhammad Owais', 60, 'محمد اوويس'], ['Abdul Hameed', 60, 'عبدالحميد'], ['Muhammad Faraz', 60, 'محمد فراز'],
  ['Muhammad Mohsin Ali', 60, 'محمد محسن علي'], ['Muhammad Saleem', 60, 'محمد سليم'],
  ['Muhammad Shahzaib', 60, 'محمد شاه زييب'], ['Muhammad Umair Hassan', 60, 'محمد عمير حسن'],
  ['Muhammad Younis', 60, 'محمد يونس'], ['Muhammad Yousuf', 60, 'محمد يوسف'], ['Tarsaleem', 60, 'ترسليم'],
  ['Muhammad Rizwan', 60, 'محمد رضوان'], ['Muhammad Hassan', 60, 'محمد حسن'], ['Ali Hassan', 60, 'علي حسن'],
  ['Muhammad Imran', 60, 'محمد عمران'], ['Muhammad Waseem', 60, 'محمد وسيم']
]));

/* 9th-2018 */
ids.push(write('9th-2018', '9th', 2018, 60, [
  ['Muhammad Saleem', 60, 'محمد سليم'], ['Aftab Khadim', 60, 'آفتاب خادم'], ['Imran Asghar', 60, 'عمران اصغر'],
  ['Mubeen Asghar', 60, 'مبین اصغر'], ['Muhammad Imran', 60, 'محمد عمران'], ['Ali Hassan', 60, 'علی حسن'],
  ['Ahmad Raza', 60, 'احمد رضا'], ['Asif Sajjad', 60, 'آصف سجاد'], ['Saniya Mukhtiyar', 60, 'ثانیہ مختيار'],
  ['Muhammad Adnan', 60, 'محمد عدنان'], ['Muhammad Zubair', 60, 'محمد زبیر'], ['Muhammad Faheem', 60, 'محمد فہیم'],
  ['Muhammad Adeel', 60, 'محمد عدیل'], ['Muhammad Ansar', 60, 'محمد انصر'], ['Muhammad Ahmad', 60, 'محمد احمد'],
  ['Muhammad Hamza', 60, 'محمد حمزه'], ['Muhammad Asad', 59, 'محمد اسد'],
  ['Muhammad Zubair', 59, 'محمد زبیر'], ['Iqra Majeed', 59, 'اقراء مجید'], ['Sabeel Nawaz', 59, 'سبیل نواز'],
  ['Ayaz Aslam', 59, 'اي از اسلم'], ['Muhammad Zeeshan', 59, 'محمد ذيشان'], ['Muhammad Waseem', 59, 'محمد وسيم'],
  ['Muhammad Ali Hassan', 59, 'محمد علي حسن'], ['Kiran Sajjad', 59, 'كرن سجاد'], ['Miza Kareem', 59, 'مايزه كريم'],
  ['Kainat Fatima', 59, 'کائنات فاطمه'], ['Muhammad Younis', 59, 'محمد يونس'], ['Muhammad Umair', 59, 'محمد عمير'],
  ['Zubair', 59, 'زبیر'], ['Sajjad Majeed', 59, 'سجاد مجيد'], ['Mohsin Talib', 59, 'محسن طالب'],
  ['Muhammad Tariq', 59, 'محمد طارق'], ['Muhammad Wasim', 59, 'محمد وسيم']
]));

/* 10th-2017 */
ids.push(write('10th-2017', '10th', 2017, 60, [
  ['Kausar Parveen', 60, 'کوثر پروین'], ['Usman Ejaz', 60, 'عثمان اعجاز'], ['Qaiser', 60, 'قيصر'],
  ['Irfan', 60, 'عرفان'], ['Salman Akhtar', 60, 'سلمان اختر'], ['Saima Abdul Alta', 59, 'صائمہ عبد الھتا'],
  ['Iman Arshad', 59, 'ایمان ارشاد'], ['Nazia Malik', 59, 'نازیہ ملک'], ['Laiba Saeed', 59, 'لائبہ سعید'],
  ['Saira Azam', 59, 'سائرہ اعظم'], ['Mahboob Hussain', 59, 'محبوب حسین']
]));

/* 9th-2017 */
ids.push(write('9th-2017', '9th', 2017, 60, [
  ['Sher Afzal', 60, 'شير افضل'], ['Yasmin Iqbal', 60, 'ياسمين اقبال'], ['Muhammad Shakeel', 60, 'محمد شکیل'],
  ['Nazim Hussain', 60, 'ناظم حسين'], ['Amir Riaz', 60, 'عامر رياض'], ['Muhammad Kashif', 60, 'محمد كاشف'],
  ['Shaheen Shafi', 60, 'شاهين شفيع'], ['Ammar Yasir', 60, 'عمار ياسر'], ['Muhammad Faisal', 60, 'محمد فيصل'],
  ['Arooj Tariq', 59, 'عروج طارق'], ['Sajjad Raza', 59, 'سجاد رضا'], ['Zohaib Nawaz', 59, 'زوهيب نواز'],
  ['Afra Kaleem', 59, 'عفراء كليم'], ['Rania Rani', 59, 'رانية راني'], ['Mohsin Bilal', 59, 'محسن بلال'],
  ['Mubashir Khalil', 59, 'مبشر خليل'], ['Asadullah', 59, 'اسد الله'], ['Muhammad Aslam', 59, 'محمد اسلم'],
  ['Muhammad Naveed', 59, 'محمد نوید'], ['Muhammad Babar', 59, 'محمد بابر'], ['Muhammad Numan', 59, 'محمد نعمان'],
  ['Muhammad Sadaqat', 59, 'محمد صداقت']
]));

/* 10th-2016 — detailed 75-mark paper + summary sheet names (marks kept as listed) */
ids.push(write('10th-2016', '10th', 2016, 75, [
  ['Shoaib Ibrahim', 75, 'شعیب ابراھیم'], ['Anisa Tariq', 75, 'انیسہ طارق'], ['Nimra Rahim', 75, 'نمرہ رحیم'],
  ['Tania Ghafoor', 75, 'ثانیہ غفور'], ['Aisha Siddiqa', 75, 'عائشہ صدیقہ'], ['Humayun Nazeer', 75, 'ہمایوں نذیر'],
  ['Muhammad Junaid', 75, 'محمد جنید'], ['Muhammad Shoaib', 75, 'محمد شعیب'], ['Ayaz Hussain', 75, 'ایاز حسین'],
  ['Dawood', 75, 'داؤد'], ['Muhammad Hamza', 75, 'محمد حمزہ'], ['Muhammad Hassan', 75, 'محمد حسن'],
  ['Muhammad Imran', 75, 'محمد عمران'], ['Muhammad Nasir', 75, 'محمد ناصر'], ['Muhammad Sibtayn', 75, 'محمد سبطین'],
  ['Muhammad Shakeel', 75, 'محمد شکیل'], ['Muhammad Shehzad', 75, 'محمد شہزاد'], ['Sarfaraz Ahmad', 75, 'سرفراز احمد'],
  ['Waseem Hameed', 75, 'وسیم حمید'], ['Tangi Madni', 74, 'تگی مدنی'], ['Badar Saeed', 74, 'بدر سعید'],
  ['Muhammad Abu Bakr', 74, 'محمد ابوبکر'], ['Muhammad Matloob', 74, 'محمد مطلوب'],
  ['Muhammad Usama', 74, 'محمد اسامہ'], ['Muhammad Waheed', 74, 'محمد وحید'], ['Muneeza Ramzan', 74, 'منیضہ رمضان'],
  ['Saira Hassan', 74, 'سائرہ حسن'], ['Samina Khadim', 74, 'سمینہ خادم'], ['Sabana Nasir', 74, 'صبانا ناصر'],
  ['Saima Khan', 74, 'صائمہ خان'], ['Sidra Saleem', 74, 'سدرہ سلیم'], ['Hira Asghar', 74, 'حرا اصغر'],
  ['Iqra Akhtar', 74, 'اقراء اختر'], ['Iqra Batool', 74, 'اقراء بتول'], ['Shaukat Ali', 74, 'شوکت علی'],
  ['Muhammad Yasir Nazeer', 74, 'محمد یاسر نذیر'],
  ['Sher Afzal', 60, 'شیر افضل'], ['Kashif Ali', 60, 'کاشف علی'], ['Zohaib Nawaz', 60, 'زویب نواز'],
  ['Nusrat Fatima', 60, 'نصرت فاطمہ'], ['Rabab Zahra', 60, 'رباب زہرہ'], ['Nousheen Basheer', 60, 'نوشین بشیر'],
  ['Sadia Manzoor', 60, 'سعدیہ منظور'], ['Saima Asghar', 60, 'صائمہ اصغر'], ['Muhammad Shahab', 60, 'محمد شباب'],
  ['Bushra Zahid', 60, 'بشریٰ زاہد'], ['Safia Iqbal', 60, 'صفیہ اقبال'], ['Aliya Batool', 60, 'آلیہ بتول'],
  ['Aasia Bano', 60, 'آسیہ بانو'], ['Malaika Bibi', 60, 'ملائکہ بی بی'], ['Rania Rafi', 60, 'رانیہ رافی']
]));

const index = { subject: 'Chemistry', sets: ids.sort() };
fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify(index, null, 2));
console.log('index.json', ids.length, 'sets');

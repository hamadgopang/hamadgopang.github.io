/**
 * Periodic Table Explorer - UI text (English and Urdu).
 * Exposes window.PT_TEXT = { en: {...}, ur: {...} }.
 * Placeholders such as {n} are filled in by periodic-table.js.
 */
(function () {
  'use strict';
  window.PT_TEXT = {
en:{backHome:"Back to portfolio",loading:"Loading the periodic table...",loadError:"The periodic table data could not be loaded. Please open this page through a web server (or the live website) and reload.",appTitle:"Periodic Table Explorer",appSub:"Tap any element, learn how the table is organised, then test yourself.",
tabExplore:"Explore",tabLessons:"Lessons",tabQuiz:"Quiz",searchPh:"Search name, symbol or number",colourBy:"Colour by",
schCategory:"Family",schState:"State",schBlock:"Block",tip:"Tip: tap a group number (top) or period number (left) to highlight it.",
showing:"Showing {n} of 118 elements",clear:"Show all",close:"Close",
dZ:"Atomic number",dMass:"Atomic mass",dGroup:"Group",dPeriod:"Period",dBlock:"Block",dState:"State at room temp.",dShells:"Electrons per shell",dOuter:"Outer electrons",dLatin:"Older name",dPart:"Protons = electrons",varies:"Varies",none:"–",factHead:"Did you know?",famHead:"About this family",blk:"{b} block",
solid:"Solid",liquid:"Liquid",gas:"Gas",unknown:"Unknown",
cat_alkali:"Alkali metals",cat_alkaline:"Alkaline earth metals",cat_transition:"Transition metals",cat_post:"Post-transition metals",cat_metalloid:"Metalloids",cat_nonmetal:"Nonmetals",cat_halogen:"Halogens",cat_noble:"Noble gases",cat_lanthanide:"Lanthanides",cat_actinide:"Actinides",
kMetal:"All metals",kMetalloid:"Metalloids",kNonmetal:"All nonmetals",
lessonOf:"Lesson {i} of {n}",prev:"Back",next:"Next",startQuiz:"Start the quiz",periodN:"Period {n}",aZ:"Atomic number",aSym:"Symbol",aName:"Name",aMass:"Average atomic mass",upto:"Elements 1 to {n}: ends at {name}",
s0t:"Elements and atomic number",s0b:"Everything around you is made from about 118 elements. Each has a unique atomic number: the number of protons in the nucleus of its atoms. The table lists elements in that order. Drag the slider to count up.",
s1t:"Reading one box",s1b:"Each box tells you four things. The small number is the atomic number. The large letters are the symbol, a short code for the element. Below it is the name, and the last number is the average atomic mass.",
s2t:"Periods are rows",s2b:"There are 7 rows, called periods. Moving from left to right, the atomic number grows by one each step and elements change gradually from reactive metals to nonmetals. The row number usually tells you how many electron shells an atom has.",
s3t:"Groups are columns",s3b:"There are 18 columns, called groups. In the main groups (1, 2 and 13 to 18), elements in a column have the same number of outer electrons, so they react in similar ways. That is why sodium and potassium both react fiercely with water. Hydrogen sits in group 1 but is a nonmetal, not an alkali metal. Transition metals in the middle are not described by that simple outer-electron rule.",
s4t:"Metals, metalloids, nonmetals",s4b:"A staircase line starting at boron splits the table. Metals on the left are shiny and conduct electricity. Nonmetals on the right are mostly gases or brittle solids. Metalloids along the staircase, like silicon, sit in between and are the basis of electronics.",
s5t:"Families with famous personalities",s5b:"Some groups have names. Alkali metals (group 1, not including hydrogen) are soft and very reactive. Halogens (group 17) are reactive nonmetals that form salts. Noble gases (group 18) hardly react at all. Helium is used in balloons; neon and argon are used in lamps.",
s6t:"Blocks: s, p, d, f",s6b:"The table is also split into blocks, named after the orbital where an atom's last electron goes. The s block is groups 1 and 2 plus helium, the p block is on the right, the d block holds the transition metals, and the f block is the two rows pulled out below.",
s7t:"Why some symbols look odd",s7b:"Most symbols come from English names, but a few come from older Latin or German names. Sodium is Na from natrium, gold is Au from aurum, tungsten is W from wolfram. Tap one to see its older name.",
s8t:"Solid, liquid or gas?",s8b:"At room temperature most elements are solids. Only bromine and mercury are liquid, and eleven are gases, including hydrogen, oxygen, nitrogen and most noble gases. The heaviest elements are made in laboratories in tiny amounts, so their state is not known.",
qMode:"Question type",qPool:"Elements",qm_sym2name:"Symbol → name",qm_name2sym:"Name → symbol",qm_z:"Atomic number",qm_cat:"Family",qm_find:"Find on table",qp20:"First 20",qp54:"First 54",qp118:"All 118",
p_sym2name:"Which element has the symbol {s}?",p_name2sym:"What is the symbol for {n}?",p_z:"What is the atomic number of {n}?",p_cat:"Which family does {n} belong to?",p_find:"Find {n} on the table.",
findHint:"Tap the element on the table below.",correct:"Correct!",wrong:"Not quite. The answer is {a}.",nextQ:"Next question",seeRes:"See result",qnum:"Question {i} of {n}",score:"Score",streak:"Streak",done:"Round complete",res:"You scored {s} out of {n}.",again:"Play again",review:"Review lessons"},
ur:{backHome:"پورٹ فولیو پر واپس",loading:"دوری جدول لوڈ ہو رہا ہے...",loadError:"دوری جدول کا ڈیٹا لوڈ نہیں ہو سکا۔ براہِ کرم اس صفحے کو ویب سرور (یا لائیو ویب سائٹ) کے ذریعے کھولیں اور دوبارہ لوڈ کریں۔",appTitle:"دوری جدول",appSub:"کسی بھی عنصر پر ٹیپ کریں، جدول کا نظام سمجھیں اور پھر خود کو آزمائیں۔",
tabExplore:"دریافت",tabLessons:"اسباق",tabQuiz:"آزمائش",searchPh:"نام، علامت یا عدد تلاش کریں",colourBy:"رنگ بلحاظ",
schCategory:"خاندان",schState:"حالت",schBlock:"بلاک",tip:"ٹپ: گروپ کے نمبر (اوپر) یا پیریڈ کے نمبر (بائیں) پر ٹیپ کر کے اسے نمایاں کریں۔",
showing:"118 میں سے {n} عناصر نمایاں ہیں",clear:"سب دکھائیں",close:"بند کریں",
dZ:"ایٹمی عدد",dMass:"ایٹمی کمیت",dGroup:"گروپ",dPeriod:"پیریڈ",dBlock:"بلاک",dState:"کمرے کے درجہ حرارت پر حالت",dShells:"ہر خول میں الیکٹران",dOuter:"بیرونی الیکٹران",dLatin:"پرانا نام",dPart:"پروٹون = الیکٹران",varies:"مختلف",none:"–",factHead:"کیا آپ جانتے ہیں؟",famHead:"اس خاندان کے بارے میں",blk:"{b} بلاک",
solid:"ٹھوس",liquid:"مائع",gas:"گیس",unknown:"نامعلوم",
cat_alkali:"الکلی دھاتیں",cat_alkaline:"الکلائن ارتھ دھاتیں",cat_transition:"ٹرانزیشن دھاتیں",cat_post:"پوسٹ ٹرانزیشن دھاتیں",cat_metalloid:"نیم دھاتیں",cat_nonmetal:"غیر دھاتیں",cat_halogen:"ہیلوجنز",cat_noble:"نوبل گیسیں",cat_lanthanide:"لینتھینائیڈز",cat_actinide:"ایکٹینائیڈز",
kMetal:"تمام دھاتیں",kMetalloid:"نیم دھاتیں",kNonmetal:"تمام غیر دھاتیں",
lessonOf:"سبق {i} از {n}",prev:"پیچھے",next:"آگے",startQuiz:"آزمائش شروع کریں",periodN:"پیریڈ {n}",aZ:"ایٹمی عدد",aSym:"علامت",aName:"نام",aMass:"اوسط ایٹمی کمیت",upto:"عناصر 1 سے {n} تک: آخری عنصر {name}",
s0t:"عناصر اور ایٹمی عدد",s0b:"آپ کے اردگرد ہر چیز تقریباً 118 عناصر سے بنی ہے۔ ہر عنصر کا ایک منفرد ایٹمی عدد ہوتا ہے، یعنی اس کے ایٹم کے مرکزے میں پروٹونوں کی تعداد۔ دوری جدول میں عناصر اسی ترتیب سے درج ہوتے ہیں۔ سلائیڈر کھینچ کر گنتی بڑھائیں۔",
s1t:"ایک خانہ کیسے پڑھیں",s1b:"ہر خانہ چار باتیں بتاتا ہے۔ چھوٹا عدد ایٹمی عدد ہے۔ بڑے حروف عنصر کی علامت ہیں، جو اس کا مختصر کوڈ ہوتا ہے۔ اس کے نیچے نام ہے اور آخری عدد اوسط ایٹمی کمیت ہے۔",
s2t:"پیریڈ یعنی افقی قطاریں",s2b:"جدول میں 7 افقی قطاریں ہیں جنہیں پیریڈ کہتے ہیں۔ بائیں سے دائیں چلنے پر ہر قدم پر ایٹمی عدد ایک بڑھتا ہے اور عناصر آہستہ آہستہ فعال دھاتوں سے غیر دھاتوں کی طرف بدلتے ہیں۔ قطار کا نمبر عموماً بتاتا ہے کہ ایٹم میں الیکٹرانوں کے کتنے خول ہیں۔",
s3t:"گروپ یعنی عمودی کالم",s3b:"جدول میں 18 عمودی کالم ہیں جنہیں گروپ کہتے ہیں۔ مرکزی گروپوں (1، 2 اور 13 سے 18) میں ایک کالم کے عناصر کے بیرونی الیکٹرانوں کی تعداد ایک جیسی ہوتی ہے، اس لیے ان کا ردِعمل ملتا جلتا ہوتا ہے۔ سوڈیم اور پوٹاشیم دونوں پانی کے ساتھ شدید ردِعمل کرتے ہیں۔ ہائیڈروجن گروپ 1 میں ہے مگر یہ غیر دھات ہے، الکلی دھات نہیں۔ درمیان کی ٹرانزیشن دھاتیں اس سادہ اصول سے نہیں بیان ہوتیں۔",
s4t:"دھاتیں، نیم دھاتیں اور غیر دھاتیں",s4b:"بورون سے شروع ہونے والی زینے نما لکیر جدول کو تقسیم کرتی ہے۔ بائیں طرف کی دھاتیں چمکدار ہوتی ہیں اور بجلی گزارتی ہیں۔ دائیں طرف کی غیر دھاتیں زیادہ تر گیسیں یا ٹوٹنے والے ٹھوس ہیں۔ زینے کے ساتھ موجود نیم دھاتیں، جیسے سلیکون، دونوں کے درمیان ہیں اور الیکٹرانکس کی بنیاد ہیں۔",
s5t:"مشہور خاندان",s5b:"کچھ گروپوں کے خاص نام ہیں۔ الکلی دھاتیں (گروپ 1، ہائیڈروجن کے علاوہ) نرم اور بہت فعال ہوتی ہیں۔ ہیلوجنز (گروپ 17) فعال غیر دھاتیں ہیں جو نمک بناتی ہیں۔ نوبل گیسیں (گروپ 18) بمشکل ہی ردِعمل کرتی ہیں۔ ہیلیم غباروں میں استعمال ہوتی ہے اور نیون و آرگون لیمپوں میں۔",
s6t:"بلاک: s, p, d, f",s6b:"جدول کو بلاکوں میں بھی بانٹا جاتا ہے، جن کے نام اس مدار (آربیٹل) پر ہیں جس میں ایٹم کا آخری الیکٹران بھرتا ہے۔ s بلاک میں گروپ 1، 2 اور ہیلیم ہیں، p بلاک دائیں طرف ہے، d بلاک میں ٹرانزیشن دھاتیں ہیں اور f بلاک نیچے الگ دکھائی گئی دو قطاریں ہیں۔",
s7t:"کچھ علامتیں عجیب کیوں لگتی ہیں",s7b:"زیادہ تر علامتیں انگریزی ناموں سے بنی ہیں، مگر چند پرانے لاطینی یا جرمن ناموں سے آئی ہیں۔ سوڈیم کی علامت Na ہے جو natrium سے ہے، سونے کی Au ہے جو aurum سے ہے اور ٹنگسٹن کی W ہے جو wolfram سے ہے۔ کسی پر ٹیپ کر کے اس کا پرانا نام دیکھیں۔",
s8t:"ٹھوس، مائع یا گیس؟",s8b:"کمرے کے درجہ حرارت پر زیادہ تر عناصر ٹھوس ہیں۔ صرف برومین اور مرکری مائع ہیں اور گیارہ عناصر گیسیں ہیں، جن میں ہائیڈروجن، آکسیجن، نائٹروجن اور زیادہ تر نوبل گیسیں شامل ہیں۔ بہت بھاری عناصر لیبارٹری میں انتہائی کم مقدار میں بنتے ہیں، اس لیے ان کی حالت معلوم نہیں۔",
qMode:"سوال کی قسم",qPool:"عناصر",qm_sym2name:"علامت سے نام",qm_name2sym:"نام سے علامت",qm_z:"ایٹمی عدد",qm_cat:"خاندان",qm_find:"جدول میں تلاش کریں",qp20:"پہلے 20",qp54:"پہلے 54",qp118:"تمام 118",
p_sym2name:"علامت {s} کس عنصر کی ہے؟",p_name2sym:"{n} کی علامت کیا ہے؟",p_z:"{n} کا ایٹمی عدد کیا ہے؟",p_cat:"{n} کس خاندان سے تعلق رکھتا ہے؟",p_find:"جدول میں {n} تلاش کریں۔",
findHint:"نیچے جدول میں عنصر پر ٹیپ کریں۔",correct:"درست!",wrong:"درست نہیں۔ صحیح جواب {a} ہے۔",nextQ:"اگلا سوال",seeRes:"نتیجہ دیکھیں",qnum:"سوال {i} از {n}",score:"اسکور",streak:"مسلسل درست",done:"راؤنڈ مکمل",res:"آپ نے {n} میں سے {s} نمبر حاصل کیے۔",again:"دوبارہ کھیلیں",review:"اسباق دہرائیں"}
};
})();

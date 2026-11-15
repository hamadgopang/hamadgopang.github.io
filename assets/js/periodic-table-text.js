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
ur:{backHome:"پورٹ فولیو پر واپس",loading:"پیریوڈک ٹیبل لوڈ ہو رہا ہے...",loadError:"پیریوڈک ٹیبل کا ڈیٹا لوڈ نہیں ہو سکا۔ براہِ کرم اس پیج کو ویب سرور (یا لائیو ویب سائٹ) سے کھولیں اور ری لوڈ کریں۔",appTitle:"پیریوڈک ٹیبل ایکسپلورر",appSub:"کسی بھی ایلیمنٹ پر ٹیپ کریں، ٹیبل کا سسٹم سمجھیں، پھر خود کو ٹیسٹ کریں۔",
tabExplore:"ایکسپلور",tabLessons:"لیسنز",tabQuiz:"کوئز",searchPh:"نام، سمبل یا نمبر تلاش کریں",colourBy:"کلر بائی",
schCategory:"فیملی",schState:"سٹیٹ",schBlock:"بلاک",tip:"ٹپ: گروپ نمبر (اوپر) یا پیریڈ نمبر (بائیں) پر ٹیپ کر کے اسے ہائی لائٹ کریں۔",
showing:"118 میں سے {n} ایلیمنٹس ہائی لائٹ ہیں",clear:"سب دکھائیں",close:"بند کریں",
dZ:"اٹامک نمبر",dMass:"اٹامک ماس",dGroup:"گروپ",dPeriod:"پیریڈ",dBlock:"بلاک",dState:"روم ٹمپریچر پر سٹیٹ",dShells:"ہر شیل میں الیکٹران",dOuter:"آؤٹر الیکٹران",dLatin:"پرانا نام",dPart:"پروٹون = الیکٹران",varies:"مختلف",none:"–",factHead:"کیا آپ جانتے ہیں؟",famHead:"اس فیملی کے بارے میں",blk:"{b} بلاک",
solid:"سالڈ",liquid:"لیکویڈ",gas:"گیس",unknown:"ان نون",
cat_alkali:"الکلی میٹلز",cat_alkaline:"الکلائن ارتھ میٹلز",cat_transition:"ٹرانزیشن میٹلز",cat_post:"پوسٹ ٹرانزیشن میٹلز",cat_metalloid:"میٹلائڈز",cat_nonmetal:"نان میٹلز",cat_halogen:"ہیلوجنز",cat_noble:"نوبل گیسز",cat_lanthanide:"لینتھینائیڈز",cat_actinide:"ایکٹینائیڈز",
kMetal:"تمام میٹلز",kMetalloid:"میٹلائڈز",kNonmetal:"تمام نان میٹلز",
lessonOf:"لیسن {i} از {n}",prev:"بیک",next:"نیکسٹ",startQuiz:"کوئز شروع کریں",periodN:"پیریڈ {n}",aZ:"اٹامک نمبر",aSym:"سمبل",aName:"نام",aMass:"ایوریج اٹامک ماس",upto:"ایلیمنٹس 1 سے {n} تک: آخری ایلیمنٹ {name}",
s0t:"ایلیمنٹس اور اٹامک نمبر",s0b:"آپ کے ارد گرد تقریباً ہر چیز تقریباً 118 ایلیمنٹس سے بنی ہے۔ ہر ایلیمنٹ کا ایک یونیک اٹامک نمبر ہوتا ہے، یعنی اس کے ایٹم کے نیوکلیئس میں پروٹونز کی تعداد۔ پیریوڈک ٹیبل میں ایلیمنٹس اسی آرڈر میں ہوتے ہیں۔ سلائیڈر کھینچ کر گنتی بڑھائیں۔",
s1t:"ایک باکس کیسے پڑھیں",s1b:"ہر باکس چار چیزیں بتاتا ہے۔ چھوٹا نمبر اٹامک نمبر ہے۔ بڑے حروف ایلیمنٹ کا سمبل ہیں، یعنی اس کا شارٹ کوڈ۔ نیچے نام ہے، اور آخری نمبر ایوریج اٹامک ماس ہے۔",
s2t:"پیریڈز یعنی روز",s2b:"ٹیبل میں 7 روز ہیں جنہیں پیریڈ کہتے ہیں۔ بائیں سے دائیں ہر سٹیپ پر اٹامک نمبر ایک بڑھتا ہے، اور ایلیمنٹس آہستہ آہستہ ری ایکٹو میٹلز سے نان میٹلز کی طرف بدلتے ہیں۔ روز نمبر عموماً بتاتا ہے کہ ایٹم میں الیکٹران شیلز کتنے ہیں۔",
s3t:"گروپس یعنی کالمز",s3b:"ٹیبل میں 18 کالمز ہیں جنہیں گروپ کہتے ہیں۔ مین گروپس (1، 2 اور 13 سے 18) میں ایک کالم کے ایلیمنٹس کے آؤٹر الیکٹرانز کی تعداد ایک جیسی ہوتی ہے، اس لیے ان کی ری ایکشن بھی ملتی جلتی ہوتی ہے۔ سوڈیم اور پوٹاشیم دونوں پانی کے ساتھ تیزی سے ری ایکٹ کرتے ہیں۔ ہائیڈروجن گروپ 1 میں ہے مگر یہ نان میٹل ہے، الکلی میٹل نہیں۔ درمیان کی ٹرانزیشن میٹلز اس سادہ رول سے نہیں سمجھائی جاتیں۔",
s4t:"میٹلز، میٹلائڈز، نان میٹلز",s4b:"بورون سے شروع ہونے والی سٹیر کیس لائن ٹیبل کو تقسیم کرتی ہے۔ بائیں طرف میٹلز چمکدار ہوتے ہیں اور بجلی کنڈکٹ کرتے ہیں۔ دائیں طرف نان میٹلز زیادہ تر گیسز یا برٹل سالڈز ہیں۔ سٹیر کیس پر میٹلائڈز، جیسے سلیکون، دونوں کے درمیان ہیں اور الیکٹرانکس کی بنیاد ہیں۔",
s5t:"مشہور فیملیز",s5b:"کچھ گروپس کے خاص نام ہیں۔ الکلی میٹلز (گروپ 1، ہائیڈروجن کے علاوہ) نرم اور بہت ری ایکٹو ہوتے ہیں۔ ہیلوجنز (گروپ 17) ری ایکٹو نان میٹلز ہیں جو سالٹس بناتی ہیں۔ نوبل گیسز (گروپ 18) تقریباً ری ایکٹ نہیں کرتیں۔ ہیلیم بیلونز میں استعمال ہوتا ہے، اور نیون و آرگون لیمپس میں۔",
s6t:"بلاکس: s, p, d, f",s6b:"ٹیبل کو بلاکس میں بھی تقسیم کیا جاتا ہے، جن کے نام اس آربیٹل پر ہیں جہاں ایٹم کا آخری الیکٹران جاتا ہے۔ s بلاک میں گروپ 1، 2 اور ہیلیم ہیں، p بلاک دائیں طرف ہے، d بلاک میں ٹرانزیشن میٹلز ہیں، اور f بلاک نیچے الگ دکھائی گئی دو روز ہیں۔",
s7t:"کچھ سمبلز عجیب کیوں لگتے ہیں",s7b:"زیادہ تر سمبلز انگریزی ناموں سے بنے ہیں، مگر کچھ پرانے لاطینی یا جرمن ناموں سے آئے ہیں۔ سوڈیم کا سمبل Na ہے جو natrium سے ہے، گولڈ کا Au ہے جو aurum سے ہے، اور ٹنگسٹن کا W ہے جو wolfram سے ہے۔ کسی پر ٹیپ کر کے اس کا پرانا نام دیکھیں۔",
s8t:"سالڈ، لیکویڈ یا گیس؟",s8b:"روم ٹمپریچر پر زیادہ تر ایلیمنٹس سالڈ ہیں۔ صرف برومین اور مرکری لیکویڈ ہیں، اور گیارہ ایلیمنٹس گیسز ہیں، جن میں ہائیڈروجن، آکسیجن، نائٹروجن اور زیادہ تر نوبل گیسز شامل ہیں۔ بہت ہیوی ایلیمنٹس لیبارٹری میں بہت کم مقدار میں بنتے ہیں، اس لیے ان کی سٹیٹ معلوم نہیں۔",
qMode:"سوال کی قسم",qPool:"ایلیمنٹس",qm_sym2name:"سمبل → نام",qm_name2sym:"نام → سمبل",qm_z:"اٹامک نمبر",qm_cat:"فیملی",qm_find:"ٹیبل پر تلاش کریں",qp20:"پہلے 20",qp54:"پہلے 54",qp118:"تمام 118",
p_sym2name:"سمبل {s} کس ایلیمنٹ کا ہے؟",p_name2sym:"{n} کا سمبل کیا ہے؟",p_z:"{n} کا اٹامک نمبر کیا ہے؟",p_cat:"{n} کس فیملی سے تعلق رکھتا ہے؟",p_find:"ٹیبل پر {n} تلاش کریں۔",
findHint:"نیچے ٹیبل میں ایلیمنٹ پر ٹیپ کریں۔",correct:"درست!",wrong:"درست نہیں۔ صحیح جواب {a} ہے۔",nextQ:"اگلا سوال",seeRes:"ریزلٹ دیکھیں",qnum:"سوال {i} از {n}",score:"اسکور",streak:"اسٹریک",done:"راؤنڈ مکمل",res:"آپ نے {n} میں سے {s} اسکور کیا۔",again:"دوبارہ کھیلیں",review:"لیسنز دہرائیں"}
};
})();

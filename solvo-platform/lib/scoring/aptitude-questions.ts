// =============================================================================
// SOLVO — Aptitude Question Bank
// File: aptitude-questions.ts
// Path: lib/scoring/aptitude-questions.ts
// Purpose: Complete 30-item Aptitude inventory (10 Numerical, 10 Verbal, 10 Logical)
// =============================================================================

export type AptitudeCategory = 'Numerical' | 'Verbal' | 'Logical';

export interface AptitudeQuestion {
  id: string;
  category: AptitudeCategory;
  text_en: string;
  text_hi: string;
  options_en: [string, string, string, string];
  options_hi: [string, string, string, string];
  correctIndex: number; // 0, 1, 2, or 3 corresponds to the correct option
}

export const aptitudeQuestions: AptitudeQuestion[] = [
  // ==========================================
  // NUMERICAL APTITUDE (10 Questions)
  // ==========================================
  {
    id: 'NUM1',
    category: 'Numerical',
    text_en: 'What is 20% of 150?',
    text_hi: '150 का 20% कितना होता है?',
    options_en: ['20', '30', '40', '50'],
    options_hi: ['20', '30', '40', '50'],
    correctIndex: 1
  },
  {
    id: 'NUM2',
    category: 'Numerical',
    text_en: 'What is the average of 10, 20, 30, 40, and 50?',
    text_hi: '10, 20, 30, 40 और 50 का औसत क्या है?',
    options_en: ['25', '30', '35', '40'],
    options_hi: ['25', '30', '35', '40'],
    correctIndex: 1
  },
  {
    id: 'NUM3',
    category: 'Numerical',
    text_en: 'A 100m long train passes a pole in 10 seconds. What is its speed?',
    text_hi: 'एक 100 मीटर लंबी ट्रेन 10 सेकंड में एक खंभे को पार करती है। इसकी गति क्या है?',
    options_en: ['5 m/s', '10 m/s', '15 m/s', '20 m/s'],
    options_hi: ['5 m/s', '10 m/s', '15 m/s', '20 m/s'],
    correctIndex: 1
  },
  {
    id: 'NUM4',
    category: 'Numerical',
    text_en: 'Two numbers are in the ratio 3:4. If their sum is 70, what are the numbers?',
    text_hi: 'दो संख्याएँ 3:4 के अनुपात में हैं। यदि उनका योग 70 है, तो वे संख्याएँ क्या हैं?',
    options_en: ['20 and 50', '30 and 40', '40 and 30', '35 and 35'],
    options_hi: ['20 और 50', '30 और 40', '40 और 30', '35 और 35'],
    correctIndex: 1
  },
  {
    id: 'NUM5',
    category: 'Numerical',
    text_en: 'If an item is bought for ₹400 and sold for ₹500, what is the profit percentage?',
    text_hi: 'यदि कोई वस्तु ₹400 में खरीदी जाती है और ₹500 में बेची जाती है, तो लाभ प्रतिशत क्या है?',
    options_en: ['20%', '25%', '30%', '35%'],
    options_hi: ['20%', '25%', '30%', '35%'],
    correctIndex: 1
  },
  {
    id: 'NUM6',
    category: 'Numerical',
    text_en: 'Person A can complete a job in 10 days, and Person B in 15 days. How many days will it take if they work together?',
    text_hi: 'व्यक्ति A किसी काम को 10 दिनों में और व्यक्ति B 15 दिनों में पूरा कर सकता है। यदि वे एक साथ काम करते हैं तो कितने दिन लगेंगे?',
    options_en: ['5 days', '6 days', '8 days', '12 days'],
    options_hi: ['5 दिन', '6 दिन', '8 दिन', '12 दिन'],
    correctIndex: 1
  },
  {
    id: 'NUM7',
    category: 'Numerical',
    text_en: 'What is the simple interest on ₹1,000 at 5% per annum for 2 years?',
    text_hi: '₹1,000 पर 5% प्रति वर्ष की दर से 2 वर्ष का साधारण ब्याज कितना होगा?',
    options_en: ['₹50', '₹100', '₹150', '₹200'],
    options_hi: ['₹50', '₹100', '₹150', '₹200'],
    correctIndex: 1
  },
  {
    id: 'NUM8',
    category: 'Numerical',
    text_en: 'What is the area of a rectangle with length 10cm and width 5cm?',
    text_hi: '10 सेमी लंबाई और 5 सेमी चौड़ाई वाले आयत का क्षेत्रफल क्या है?',
    options_en: ['15 sq cm', '30 sq cm', '50 sq cm', '100 sq cm'],
    options_hi: ['15 वर्ग सेमी', '30 वर्ग सेमी', '50 वर्ग सेमी', '100 वर्ग सेमी'],
    correctIndex: 2
  },
  {
    id: 'NUM9',
    category: 'Numerical',
    text_en: 'Calculate: 50% of 200 + 20% of 100.',
    text_hi: 'गणना करें: 200 का 50% + 100 का 20%।',
    options_en: ['100', '110', '120', '130'],
    options_hi: ['100', '110', '120', '130'],
    correctIndex: 2
  },
  {
    id: 'NUM10',
    category: 'Numerical',
    text_en: 'What is the square root of 144?',
    text_hi: '144 का वर्गमूल क्या है?',
    options_en: ['10', '12', '14', '16'],
    options_hi: ['10', '12', '14', '16'],
    correctIndex: 1
  },

  // ==========================================
  // VERBAL APTITUDE (10 Questions)
  // ==========================================
  {
    id: 'VER1',
    category: 'Verbal',
    text_en: 'What is a synonym for the word "Abundant"?',
    text_hi: '"Abundant" शब्द का पर्यायवाची क्या है?',
    options_en: ['Scarce', 'Plentiful', 'Rare', 'Empty'],
    options_hi: ['Scarce', 'Plentiful', 'Rare', 'Empty'],
    correctIndex: 1
  },
  {
    id: 'VER2',
    category: 'Verbal',
    text_en: 'What is the antonym of the word "Expand"?',
    text_hi: '"Expand" शब्द का विलोम (antonym) क्या है?',
    options_en: ['Enlarge', 'Contract', 'Widen', 'Stretch'],
    options_hi: ['Enlarge', 'Contract', 'Widen', 'Stretch'],
    correctIndex: 1
  },
  {
    id: 'VER3',
    category: 'Verbal',
    text_en: 'Complete the analogy: Bird is to Fly as Fish is to...',
    text_hi: 'सादृश्य पूरा करें: जैसे Bird का संबंध Fly से है, वैसे ही Fish का संबंध किससे है...',
    options_en: ['Walk', 'Swim', 'Run', 'Fly'],
    options_hi: ['Walk', 'Swim', 'Run', 'Fly'],
    correctIndex: 1
  },
  {
    id: 'VER4',
    category: 'Verbal',
    text_en: 'Which of the following is spelled correctly?',
    text_hi: 'निम्नलिखित में से किसकी वर्तनी (spelling) सही है?',
    options_en: ['Acomodation', 'Accommodation', 'Accomodation', 'Accommodasion'],
    options_hi: ['Acomodation', 'Accommodation', 'Accomodation', 'Accommodasion'],
    correctIndex: 1
  },
  {
    id: 'VER5',
    category: 'Verbal',
    text_en: 'What does the idiom "Bite the bullet" mean?',
    text_hi: '"Bite the bullet" मुहावरे का क्या अर्थ है?',
    options_en: ['To eat metal', 'To face a difficult situation bravely', 'To run away', 'To hide from danger'],
    options_hi: ['धातु खाना', 'कठिन परिस्थिति का बहादुरी से सामना करना', 'भाग जाना', 'खतरे से छिपना'],
    correctIndex: 1
  },
  {
    id: 'VER6',
    category: 'Verbal',
    text_en: 'What is the plural form of "Child"?',
    text_hi: '"Child" का बहुवचन (plural) क्या है?',
    options_en: ['Childs', 'Children', 'Childrens', 'Childes'],
    options_hi: ['Childs', 'Children', 'Childrens', 'Childes'],
    correctIndex: 1
  },
  {
    id: 'VER7',
    category: 'Verbal',
    text_en: 'What is the opposite of "Courage"?',
    text_hi: '"Courage" (साहस) का विपरीत शब्द क्या है?',
    options_en: ['Bravery', 'Cowardice', 'Strength', 'Fearless'],
    options_hi: ['Bravery', 'Cowardice', 'Strength', 'Fearless'],
    correctIndex: 1
  },
  {
    id: 'VER8',
    category: 'Verbal',
    text_en: 'Fill in the blank: "I have been waiting ___ two hours."',
    text_hi: 'रिक्त स्थान भरें: "I have been waiting ___ two hours."',
    options_en: ['since', 'for', 'from', 'by'],
    options_hi: ['since', 'for', 'from', 'by'],
    correctIndex: 1
  },
  {
    id: 'VER9',
    category: 'Verbal',
    text_en: 'Fill in the blank: "She is very good ___ mathematics."',
    text_hi: 'रिक्त स्थान भरें: "She is very good ___ mathematics."',
    options_en: ['in', 'at', 'on', 'with'],
    options_hi: ['in', 'at', 'on', 'with'],
    correctIndex: 1
  },
  {
    id: 'VER10',
    category: 'Verbal',
    text_en: 'What is a synonym for the word "Rapid"?',
    text_hi: '"Rapid" शब्द का पर्यायवाची क्या है?',
    options_en: ['Slow', 'Quick', 'Lazy', 'Dull'],
    options_hi: ['Slow', 'Quick', 'Lazy', 'Dull'],
    correctIndex: 1
  },

  // ==========================================
  // LOGICAL APTITUDE (10 Questions)
  // ==========================================
  {
    id: 'LOG1',
    category: 'Logical',
    text_en: 'Find the next number in the series: 1, 3, 5, 7, ?',
    text_hi: 'श्रृंखला में अगली संख्या खोजें: 1, 3, 5, 7, ?',
    options_en: ['8', '9', '10', '11'],
    options_hi: ['8', '9', '10', '11'],
    correctIndex: 1
  },
  {
    id: 'LOG2',
    category: 'Logical',
    text_en: 'Find the next letter in the series: A, C, E, G, ?',
    text_hi: 'श्रृंखला में अगला अक्षर खोजें: A, C, E, G, ?',
    options_en: ['H', 'I', 'J', 'K'],
    options_hi: ['H', 'I', 'J', 'K'],
    correctIndex: 1
  },
  {
    id: 'LOG3',
    category: 'Logical',
    text_en: 'You walk 5km North, turn right and walk 5km, then turn right again and walk 5km. In which direction are you from the starting point?',
    text_hi: 'आप 5 किमी उत्तर की ओर चलते हैं, दाएं मुड़ते हैं और 5 किमी चलते हैं, फिर से दाएं मुड़ते हैं और 5 किमी चलते हैं। आप प्रारंभिक बिंदु से किस दिशा में हैं?',
    options_en: ['North', 'East', 'South', 'West'],
    options_hi: ['उत्तर', 'पूर्व', 'दक्षिण', 'पश्चिम'],
    correctIndex: 1
  },
  {
    id: 'LOG4',
    category: 'Logical',
    text_en: 'Your mother\'s brother\'s son is your...',
    text_hi: 'आपकी माँ के भाई का बेटा आपका क्या लगता है?',
    options_en: ['Uncle', 'Brother', 'Cousin', 'Nephew'],
    options_hi: ['चाचा/मामा', 'भाई', 'चचेरा/ममेरा भाई', 'भतीजा/भांजा'],
    correctIndex: 2
  },
  {
    id: 'LOG5',
    category: 'Logical',
    text_en: 'Find the odd one out: Apple, Banana, Carrot, Orange.',
    text_hi: 'विषम (Odd one out) चुनें: Apple, Banana, Carrot, Orange.',
    options_en: ['Apple', 'Banana', 'Carrot', 'Orange'],
    options_hi: ['सेब', 'केला', 'गाजर', 'संतरा'],
    correctIndex: 2
  },
  {
    id: 'LOG6',
    category: 'Logical',
    text_en: 'Find the next number: 2, 6, 12, 20, ?',
    text_hi: 'अगली संख्या खोजें: 2, 6, 12, 20, ?',
    options_en: ['24', '28', '30', '32'],
    options_hi: ['24', '28', '30', '32'],
    correctIndex: 2
  },
  {
    id: 'LOG7',
    category: 'Logical',
    text_en: 'If CAT is coded as 3-1-20, how is DOG coded?',
    text_hi: 'यदि CAT को 3-1-20 के रूप में कोड किया गया है, तो DOG को कैसे कोड किया जाएगा?',
    options_en: ['4-15-7', '4-14-7', '4-15-8', '3-15-7'],
    options_hi: ['4-15-7', '4-14-7', '4-15-8', '3-15-7'],
    correctIndex: 0
  },
  {
    id: 'LOG8',
    category: 'Logical',
    text_en: 'Syllogism: If "All A are B" and "All B are C", is it true that "All A are C"?',
    text_hi: 'न्यायनिगमन: यदि "सभी A, B हैं" और "सभी B, C हैं", तो क्या यह सत्य है कि "सभी A, C हैं"?',
    options_en: ['True', 'False', 'Cannot Determine', 'None of the above'],
    options_hi: ['सत्य', 'असत्य', 'निर्धारित नहीं किया जा सकता', 'इनमें से कोई नहीं'],
    correctIndex: 0
  },
  {
    id: 'LOG9',
    category: 'Logical',
    text_en: 'Arrange in logical order: 1. Seed, 2. Plant, 3. Tree, 4. Fruit',
    text_hi: 'तार्किक क्रम में व्यवस्थित करें: 1. बीज, 2. पौधा, 3. पेड़, 4. फल',
    options_en: ['1-3-2-4', '1-2-3-4', '2-1-3-4', '3-2-1-4'],
    options_hi: ['1-3-2-4', '1-2-3-4', '2-1-3-4', '3-2-1-4'],
    correctIndex: 1
  },
  {
    id: 'LOG10',
    category: 'Logical',
    text_en: 'Find the odd one out: Circle, Square, Triangle, Sphere.',
    text_hi: 'विषम (Odd one out) चुनें: Circle, Square, Triangle, Sphere.',
    options_en: ['Circle', 'Square', 'Triangle', 'Sphere'],
    options_hi: ['वृत्त', 'वर्ग', 'त्रिभुज', 'गोला (Sphere)'],
    correctIndex: 3
  }
];
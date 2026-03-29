// =============================================================================
// SOLVO — Interest Question Bank (RIASEC)
// File: interest-questions.ts
// Path: lib/scoring/interest-questions.ts
// Purpose: Complete 42-item RIASEC inventory with bilingual text and type mapping
// =============================================================================

export type RiasecType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export interface InterestQuestion {
  id: string;
  text_en: string;
  text_hi: string;
  type: RiasecType;
}

export const interestQuestions: InterestQuestion[] = [
  // REALISTIC (R) - Doers
  { id: 'R1', text_en: 'I would like to fix electrical appliances.', text_hi: 'मुझे बिजली के उपकरण ठीक करना पसंद आएगा।', type: 'R' },
  { id: 'R2', text_en: 'I would like to build or repair furniture.', text_hi: 'मुझे फर्नीचर बनाना या उसकी मरम्मत करना पसंद आएगा।', type: 'R' },
  { id: 'R3', text_en: 'I would like to operate heavy machinery.', text_hi: 'मुझे भारी मशीनरी चलाना पसंद आएगा।', type: 'R' },
  { id: 'R4', text_en: 'I prefer working outdoors rather than in an office.', text_hi: 'मुझे कार्यालय के बजाय बाहर काम करना अधिक पसंद है।', type: 'R' },
  { id: 'R5', text_en: 'I would like to assemble electronic parts.', text_hi: 'मुझे इलेक्ट्रॉनिक पुर्जों को जोड़ना पसंद आएगा।', type: 'R' },
  { id: 'R6', text_en: 'I would like to repair cars or bikes.', text_hi: 'मुझे कारों या बाइक की मरम्मत करना पसंद आएगा।', type: 'R' },
  { id: 'R7', text_en: 'I enjoy working with my hands using tools.', text_hi: 'मुझे औजारों का उपयोग करके अपने हाथों से काम करने में मज़ा आता है।', type: 'R' },

  // INVESTIGATIVE (I) - Thinkers
  { id: 'I1', text_en: 'I would like to solve complex math problems.', text_hi: 'मुझे जटिल गणितीय समस्याओं को हल करना पसंद आएगा।', type: 'I' },
  { id: 'I2', text_en: 'I would like to conduct scientific experiments.', text_hi: 'मुझे वैज्ञानिक प्रयोग करना पसंद आएगा।', type: 'I' },
  { id: 'I3', text_en: 'I enjoy analyzing data to find patterns.', text_hi: 'मुझे पैटर्न खोजने के लिए डेटा का विश्लेषण करने में मज़ा आता है।', type: 'I' },
  { id: 'I4', text_en: 'I would like to read scientific or technical journals.', text_hi: 'मुझे वैज्ञानिक या तकनीकी पत्रिकाएँ पढ़ना पसंद आएगा।', type: 'I' },
  { id: 'I5', text_en: 'I would like to do laboratory research.', text_hi: 'मुझे प्रयोगशाला अनुसंधान करना पसंद आएगा।', type: 'I' },
  { id: 'I6', text_en: 'I enjoy studying how things work biologically or chemically.', text_hi: 'जैविक या रासायनिक रूप से चीजें कैसे काम करती हैं, इसका अध्ययन करने में मुझे मज़ा आता है।', type: 'I' },
  { id: 'I7', text_en: 'I would like to investigate the cause of a problem.', text_hi: 'मुझे किसी समस्या के कारण की जांच करना पसंद आएगा।', type: 'I' },

  // ARTISTIC (A) - Creators
  { id: 'A1', text_en: 'I would like to write stories, poems, or scripts.', text_hi: 'मुझे कहानियाँ, कविताएँ या स्क्रिप्ट लिखना पसंद आएगा।', type: 'A' },
  { id: 'A2', text_en: 'I would like to paint, draw, or create artwork.', text_hi: 'मुझे पेंटिंग, ड्राइंग या कलाकृतियां बनाना पसंद आएगा।', type: 'A' },
  { id: 'A3', text_en: 'I would like to design graphics or user interfaces.', text_hi: 'मुझे ग्राफिक्स या यूजर इंटरफेस डिजाइन करना पसंद आएगा।', type: 'A' },
  { id: 'A4', text_en: 'I would like to play a musical instrument professionally.', text_hi: 'मुझे पेशेवर रूप से कोई वाद्य यंत्र बजाना पसंद आएगा।', type: 'A' },
  { id: 'A5', text_en: 'I would like to act in a play or movie.', text_hi: 'मुझे किसी नाटक या फिल्म में अभिनय करना पसंद आएगा।', type: 'A' },
  { id: 'A6', text_en: 'I enjoy expressing my creativity freely.', text_hi: 'मुझे अपनी रचनात्मकता को स्वतंत्र रूप से व्यक्त करने में मज़ा आता है।', type: 'A' },
  { id: 'A7', text_en: 'I would like to direct a short film or video.', text_hi: 'मुझे एक लघु फिल्म या वीडियो निर्देशित करना पसंद आएगा।', type: 'A' },

  // SOCIAL (S) - Helpers
  { id: 'S1', text_en: 'I would like to teach or train others.', text_hi: 'मुझे दूसरों को पढ़ाना या प्रशिक्षित करना पसंद आएगा।', type: 'S' },
  { id: 'S2', text_en: 'I would like to help people with their personal problems.', text_hi: 'मुझे लोगों की उनकी व्यक्तिगत समस्याओं में मदद करना पसंद आएगा।', type: 'S' },
  { id: 'S3', text_en: 'I would like to volunteer at a charity or NGO.', text_hi: 'मुझे किसी चैरिटी या एनजीओ में स्वेच्छा से काम करना पसंद आएगा।', type: 'S' },
  { id: 'S4', text_en: 'I would like to provide counseling or guidance.', text_hi: 'मुझे परामर्श या मार्गदर्शन प्रदान करना पसंद आएगा।', type: 'S' },
  { id: 'S5', text_en: 'I would like to care for sick or injured people.', text_hi: 'मुझे बीमार या घायल लोगों की देखभाल करना पसंद आएगा।', type: 'S' },
  { id: 'S6', text_en: 'I enjoy mediating disputes and resolving conflicts.', text_hi: 'मुझे विवादों में मध्यस्थता करने और संघर्षों को सुलझाने में मज़ा आता है।', type: 'S' },
  { id: 'S7', text_en: 'I would like to lead community group discussions.', text_hi: 'मुझे सामुदायिक समूह चर्चाओं का नेतृत्व करना पसंद आएगा।', type: 'S' },

  // ENTERPRISING (E) - Persuaders
  { id: 'E1', text_en: 'I would like to start and run my own business.', text_hi: 'मुझे अपना खुद का व्यवसाय शुरू करना और चलाना पसंद आएगा।', type: 'E' },
  { id: 'E2', text_en: 'I would like to manage a team or department.', text_hi: 'मुझे किसी टीम या विभाग का प्रबंधन करना पसंद आएगा।', type: 'E' },
  { id: 'E3', text_en: 'I would like to sell products or services.', text_hi: 'मुझे उत्पादों या सेवाओं को बेचना पसंद आएगा।', type: 'E' },
  { id: 'E4', text_en: 'I would like to negotiate contracts or business deals.', text_hi: 'मुझे अनुबंधों या व्यावसायिक सौदों पर बातचीत करना पसंद आएगा।', type: 'E' },
  { id: 'E5', text_en: 'I enjoy giving speeches to large audiences.', text_hi: 'मुझे बड़े दर्शकों के सामने भाषण देने में मज़ा आता है।', type: 'E' },
  { id: 'E6', text_en: 'I would like to lead a political or marketing campaign.', text_hi: 'मुझे राजनीतिक या मार्केटिंग अभियान का नेतृत्व करना पसंद आएगा।', type: 'E' },
  { id: 'E7', text_en: 'I am good at convincing others to see my point of view.', text_hi: 'मैं दूसरों को अपना दृष्टिकोण समझाने में माहिर हूँ।', type: 'E' },

  // CONVENTIONAL (C) - Organizers
  { id: 'C1', text_en: 'I would like to organize files, documents, or data.', text_hi: 'मुझे फ़ाइलों, दस्तावेज़ों या डेटा को व्यवस्थित करना पसंद आएगा।', type: 'C' },
  { id: 'C2', text_en: 'I would like to manage accounting or financial records.', text_hi: 'मुझे लेखांकन या वित्तीय रिकॉर्ड का प्रबंधन करना पसंद आएगा।', type: 'C' },
  { id: 'C3', text_en: 'I enjoy using spreadsheet software to track information.', text_hi: 'मुझे जानकारी ट्रैक करने के लिए स्प्रेडशीट सॉफ़्टवेयर का उपयोग करने में मज़ा आता है।', type: 'C' },
  { id: 'C4', text_en: 'I would like to check data and reports for errors.', text_hi: 'मुझे त्रुटियों के लिए डेटा और रिपोर्ट की जांच करना पसंद आएगा।', type: 'C' },
  { id: 'C5', text_en: 'I prefer following strict rules and established procedures.', text_hi: 'मुझे सख्त नियमों और स्थापित प्रक्रियाओं का पालन करना अधिक पसंद है।', type: 'C' },
  { id: 'C6', text_en: 'I would like to keep detailed inventory records.', text_hi: 'मुझे विस्तृत इन्वेंट्री रिकॉर्ड रखना पसंद आएगा।', type: 'C' },
  { id: 'C7', text_en: 'I like working in a highly structured environment.', text_hi: 'मुझे अत्यधिक संरचित वातावरण में काम करना पसंद है।', type: 'C' }
];
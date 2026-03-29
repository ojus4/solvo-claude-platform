// =============================================================================
// SOLVO — EQ & Soft Skills Question Bank
// File: eq-questions.ts
// Path: lib/scoring/eq-questions.ts
// Purpose: 30-item EQ inventory with bilingual text and polarity mapping
// =============================================================================

export type EqCategory = 'SA' | 'ER' | 'CI' | 'EI' | 'AD';

export interface EqQuestion {
  id: string;
  category: EqCategory;
  text_en: string;
  text_hi: string;
  polarity: 1 | -1;
}

export const eqQuestions: EqQuestion[] = [
  // SELF-AWARENESS (SA)
  { id: 'EQ01', category: 'SA', polarity: 1, text_en: 'I can easily identify the specific emotions I am feeling at any given moment.', text_hi: 'मैं किसी भी समय महसूस की जा रही विशिष्ट भावनाओं को आसानी से पहचान सकता हूँ।' },
  { id: 'EQ02', category: 'SA', polarity: -1, text_en: 'I often realize too late that I have been acting out of anger or frustration.', text_hi: 'मुझे अक्सर बहुत देर से एहसास होता है कि मैं गुस्से या निराशा में काम कर रहा था।' },
  { id: 'EQ03', category: 'SA', polarity: 1, text_en: 'I have a clear understanding of my core strengths and personal weaknesses.', text_hi: 'मुझे अपनी मुख्य ताकतों और व्यक्तिगत कमजोरियों की स्पष्ट समझ है।' },
  { id: 'EQ04', category: 'SA', polarity: -1, text_en: 'I am frequently surprised by how other people perceive my behavior.', text_hi: 'मैं अक्सर इस बात से हैरान रह जाता हूँ कि दूसरे लोग मेरे व्यवहार को कैसे देखते हैं।' },
  { id: 'EQ05', category: 'SA', polarity: 1, text_en: 'I understand how my mood affects the people around me.', text_hi: 'मैं समझता हूँ कि मेरा मूड मेरे आस-पास के लोगों को कैसे प्रभावित करता है।' },
  { id: 'EQ06', category: 'SA', polarity: -1, text_en: 'I struggle to articulate exactly why I feel a certain way.', text_hi: 'मुझे यह बताने में संघर्ष करना पड़ता है कि मैं एक निश्चित तरीके से क्यों महसूस करता हूँ।' },

  // EMOTIONAL REGULATION (ER)
  { id: 'EQ07', category: 'ER', polarity: 1, text_en: 'I can stay calm and focused even in high-pressure situations.', text_hi: 'मैं अत्यधिक दबाव वाली स्थितियों में भी शांत और केंद्रित रह सकता हूँ।' },
  { id: 'EQ08', category: 'ER', polarity: -1, text_en: 'I tend to panic or shut down when faced with an unexpected crisis.', text_hi: 'अप्रत्याशित संकट का सामना करने पर मैं घबरा जाता हूँ या सुन्न पड़ जाता हूँ।' },
  { id: 'EQ09', category: 'ER', polarity: 1, text_en: 'I bounce back quickly after experiencing a professional setback or failure.', text_hi: 'मैं किसी पेशेवर झटके या विफलता का अनुभव करने के बाद जल्दी वापसी करता हूँ।' },
  { id: 'EQ10', category: 'ER', polarity: -1, text_en: 'I let minor annoyances ruin my mood for the rest of the day.', text_hi: 'मैं छोटी-छोटी बातों को दिन भर के लिए अपना मूड खराब करने देता हूँ।' },
  { id: 'EQ11', category: 'ER', polarity: 1, text_en: 'I can accept constructive criticism without getting defensive.', text_hi: 'मैं बचाव की मुद्रा में आए बिना रचनात्मक आलोचना स्वीकार कर सकता हूँ।' },
  { id: 'EQ12', category: 'ER', polarity: -1, text_en: 'I find it very difficult to control my temper when someone disagrees with me.', text_hi: 'जब कोई मुझसे असहमत होता है तो मुझे अपने गुस्से पर काबू पाना बहुत मुश्किल लगता है।' },

  // COMMUNICATION & INFLUENCE (CI)
  { id: 'EQ13', category: 'CI', polarity: 1, text_en: 'I am good at clearly expressing my thoughts and ideas to others.', text_hi: 'मैं अपने विचारों और भावनाओं को दूसरों के सामने स्पष्ट रूप से व्यक्त करने में अच्छा हूँ।' },
  { id: 'EQ14', category: 'CI', polarity: -1, text_en: 'I often feel misunderstood when I try to explain a concept.', text_hi: 'जब मैं किसी अवधारणा को समझाने की कोशिश करता हूँ तो अक्सर मुझे लगता है कि लोग मुझे गलत समझ रहे हैं।' },
  { id: 'EQ15', category: 'CI', polarity: 1, text_en: 'I feel confident delivering presentations or speaking in front of a group.', text_hi: 'मैं समूह के सामने बोलने या प्रस्तुतीकरण देने में आत्मविश्वास महसूस करता हूँ।' },
  { id: 'EQ16', category: 'CI', polarity: -1, text_en: 'I avoid having difficult conversations, even when they are necessary.', text_hi: 'मैं मुश्किल बातचीत करने से बचता हूँ, भले ही वे आवश्यक हों।' },
  { id: 'EQ17', category: 'CI', polarity: 1, text_en: 'I am usually able to persuade others to see things from my perspective.', text_hi: 'मैं आमतौर पर दूसरों को अपने दृष्टिकोण से चीजों को देखने के लिए राजी करने में सक्षम हूँ।' },
  { id: 'EQ18', category: 'CI', polarity: -1, text_en: 'I struggle to keep people\'s attention when I am speaking.', text_hi: 'जब मैं बोल रहा होता हूँ तो लोगों का ध्यान बनाए रखने में मुझे संघर्ष करना पड़ता है।' },

  // EMPATHY & INTERPERSONAL (EI)
  { id: 'EQ19', category: 'EI', polarity: 1, text_en: 'I can easily tell how someone is feeling just by observing their body language.', text_hi: 'मैं केवल किसी की शारीरिक भाषा देखकर आसानी से बता सकता हूँ कि वह कैसा महसूस कर रहा है।' },
  { id: 'EQ20', category: 'EI', polarity: -1, text_en: 'I sometimes say the wrong thing because I don\'t "read the room" well.', text_hi: 'मैं कभी-कभी गलत बात कह देता हूँ क्योंकि मैं माहौल को अच्छी तरह समझ नहीं पाता।' },
  { id: 'EQ21', category: 'EI', polarity: 1, text_en: 'I actively listen to others without interrupting them.', text_hi: 'मैं दूसरों को बिना टोके सक्रिय रूप से सुनता हूँ।' },
  { id: 'EQ22', category: 'EI', polarity: -1, text_en: 'I find it hard to relate to people whose life experiences are different from mine.', text_hi: 'मुझे उन लोगों से जुड़ना मुश्किल लगता है जिनके जीवन के अनुभव मेरे अनुभवों से अलग हैं।' },
  { id: 'EQ23', category: 'EI', polarity: 1, text_en: 'I genuinely enjoy collaborating with others to achieve a common goal.', text_hi: 'मैं एक सामान्य लक्ष्य प्राप्त करने के लिए दूसरों के साथ सहयोग करने का वास्तव में आनंद लेता हूँ।' },
  { id: 'EQ24', category: 'EI', polarity: -1, text_en: 'I prefer to work alone because dealing with other people\'s emotions is exhausting.', text_hi: 'मैं अकेले काम करना पसंद करता हूँ क्योंकि दूसरे लोगों की भावनाओं से निपटना थका देने वाला होता है।' },

  // ADAPTABILITY (AD)
  { id: 'EQ25', category: 'AD', polarity: 1, text_en: 'I quickly adjust my approach when a project\'s requirements suddenly change.', text_hi: 'जब किसी प्रोजेक्ट की आवश्यकताएं अचानक बदल जाती हैं तो मैं जल्दी से अपना दृष्टिकोण समायोजित कर लेता हूँ।' },
  { id: 'EQ26', category: 'AD', polarity: -1, text_en: 'I get very stressed when my daily routine is disrupted.', text_hi: 'जब मेरी दिनचर्या बाधित होती है तो मैं बहुत तनावग्रस्त हो जाता हूँ।' },
  { id: 'EQ27', category: 'AD', polarity: 1, text_en: 'I can mediate conflicts between team members and find a middle ground.', text_hi: 'मैं टीम के सदस्यों के बीच संघर्ष में मध्यस्थता कर सकता हूँ और बीच का रास्ता खोज सकता हूँ।' },
  { id: 'EQ28', category: 'AD', polarity: -1, text_en: 'I tend to freeze up when I don\'t have clear instructions on what to do next.', text_hi: 'जब मेरे पास स्पष्ट निर्देश नहीं होते कि आगे क्या करना है तो मैं सुन्न पड़ जाता हूँ।' },
  { id: 'EQ29', category: 'AD', polarity: 1, text_en: 'I proactively look for solutions rather than complaining about a problem.', text_hi: 'मैं किसी समस्या के बारे में शिकायत करने के बजाय सक्रिय रूप से समाधान ढूंढता हूँ।' },
  { id: 'EQ30', category: 'AD', polarity: -1, text_en: 'I find it hard to let go of the way things have "always been done."', text_hi: 'मुझे उस तरीके को छोड़ना मुश्किल लगता है जिस तरह से चीजें "हमेशा से की जाती रही हैं"।' }
];
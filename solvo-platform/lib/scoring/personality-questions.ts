// =============================================================================
// SOLVO — Personality Question Bank
// File: personality-questions.ts
// Path: lib/scoring/personality-questions.ts
// Purpose: Complete 50-item Big Five inventory with bilingual text and polarities
// =============================================================================

export type BigFiveTrait = 'O' | 'C' | 'E' | 'A' | 'N';

export interface PersonalityQuestion {
  id: string;
  text_en: string;
  text_hi: string;
  trait: BigFiveTrait;
  polarity: 1 | -1;
}

export const personalityQuestions: PersonalityQuestion[] = [
  // EXTRAVERSION (E)
  { id: 'E1', text_en: 'I am the life of the party.', text_hi: 'मैं पार्टी की जान हूँ।', trait: 'E', polarity: 1 },
  { id: 'E2', text_en: 'I feel comfortable around people.', text_hi: 'मैं लोगों के बीच सहज महसूस करता हूँ।', trait: 'E', polarity: 1 },
  { id: 'E3', text_en: 'I start conversations.', text_hi: 'मैं बातचीत शुरू करता हूँ।', trait: 'E', polarity: 1 },
  { id: 'E4', text_en: 'I talk to a lot of different people at parties.', text_hi: 'मैं पार्टियों में कई अलग-अलग लोगों से बात करता हूँ।', trait: 'E', polarity: 1 },
  { id: 'E5', text_en: 'I don\'t mind being the center of attention.', text_hi: 'मुझे ध्यान का केंद्र बनने में कोई परेशानी नहीं है।', trait: 'E', polarity: 1 },
  { id: 'E6', text_en: 'I don\'t talk a lot.', text_hi: 'मैं ज्यादा बात नहीं करता।', trait: 'E', polarity: -1 },
  { id: 'E7', text_en: 'I keep in the background.', text_hi: 'मैं पीछे रहना पसंद करता हूँ।', trait: 'E', polarity: -1 },
  { id: 'E8', text_en: 'I have little to say.', text_hi: 'मेरे पास कहने को बहुत कम होता है।', trait: 'E', polarity: -1 },
  { id: 'E9', text_en: 'I don\'t like to draw attention to myself.', text_hi: 'मुझे अपनी ओर ध्यान आकर्षित करना पसंद नहीं है।', trait: 'E', polarity: -1 },
  { id: 'E10', text_en: 'I am quiet around strangers.', text_hi: 'मैं अजनबियों के बीच शांत रहता हूँ।', trait: 'E', polarity: -1 },

  // AGREEABLENESS (A)
  { id: 'A1', text_en: 'I sympathize with others\' feelings.', text_hi: 'मैं दूसरों की भावनाओं के प्रति सहानुभूति रखता हूँ।', trait: 'A', polarity: 1 },
  { id: 'A2', text_en: 'I have a soft heart.', text_hi: 'मेरा दिल नरम है।', trait: 'A', polarity: 1 },
  { id: 'A3', text_en: 'I take time out for others.', text_hi: 'मैं दूसरों के लिए समय निकालता हूँ।', trait: 'A', polarity: 1 },
  { id: 'A4', text_en: 'I feel others\' emotions.', text_hi: 'मैं दूसरों की भावनाओं को महसूस करता हूँ।', trait: 'A', polarity: 1 },
  { id: 'A5', text_en: 'I make people feel at ease.', text_hi: 'मैं लोगों को सहज महसूस कराता हूँ।', trait: 'A', polarity: 1 },
  { id: 'A6', text_en: 'I am not really interested in others.', text_hi: 'मुझे वास्तव में दूसरों में कोई दिलचस्पी नहीं है।', trait: 'A', polarity: -1 },
  { id: 'A7', text_en: 'I insult people.', text_hi: 'मैं लोगों का अपमान करता हूँ।', trait: 'A', polarity: -1 },
  { id: 'A8', text_en: 'I am not interested in other people\'s problems.', text_hi: 'मुझे दूसरे लोगों की समस्याओं में कोई दिलचस्पी नहीं है।', trait: 'A', polarity: -1 },
  { id: 'A9', text_en: 'I feel little concern for others.', text_hi: 'मुझे दूसरों की बहुत कम चिंता होती है।', trait: 'A', polarity: -1 },
  { id: 'A10', text_en: 'I am hard to get to know.', text_hi: 'मुझे जानना मुश्किल है।', trait: 'A', polarity: -1 },

  // CONSCIENTIOUSNESS (C)
  { id: 'C1', text_en: 'I am always prepared.', text_hi: 'मैं हमेशा तैयार रहता हूँ।', trait: 'C', polarity: 1 },
  { id: 'C2', text_en: 'I pay attention to details.', text_hi: 'मैं छोटी-छोटी बातों पर ध्यान देता हूँ।', trait: 'C', polarity: 1 },
  { id: 'C3', text_en: 'I get chores done right away.', text_hi: 'मैं काम तुरंत पूरा करता हूँ।', trait: 'C', polarity: 1 },
  { id: 'C4', text_en: 'I like order.', text_hi: 'मुझे व्यवस्था पसंद है।', trait: 'C', polarity: 1 },
  { id: 'C5', text_en: 'I follow a schedule.', text_hi: 'मैं एक कार्यक्रम का पालन करता हूँ।', trait: 'C', polarity: 1 },
  { id: 'C6', text_en: 'I leave my belongings around.', text_hi: 'मैं अपना सामान इधर-उधर छोड़ देता हूँ।', trait: 'C', polarity: -1 },
  { id: 'C7', text_en: 'I make a mess of things.', text_hi: 'मैं चीजों को अस्त-व्यस्त कर देता हूँ।', trait: 'C', polarity: -1 },
  { id: 'C8', text_en: 'I often forget to put things back in their proper place.', text_hi: 'मैं अक्सर चीजों को उनकी सही जगह पर वापस रखना भूल जाता हूँ।', trait: 'C', polarity: -1 },
  { id: 'C9', text_en: 'I shirk my duties.', text_hi: 'मैं अपने कर्तव्यों से जी चुराता हूँ।', trait: 'C', polarity: -1 },
  { id: 'C10', text_en: 'I waste my time.', text_hi: 'मैं अपना समय बर्बाद करता हूँ।', trait: 'C', polarity: -1 },

  // NEUROTICISM (N)
  { id: 'N1', text_en: 'I get stressed out easily.', text_hi: 'मैं आसानी से तनावग्रस्त हो जाता हूँ।', trait: 'N', polarity: 1 },
  { id: 'N2', text_en: 'I worry about things.', text_hi: 'मैं चीजों के बारे में चिंता करता हूँ।', trait: 'N', polarity: 1 },
  { id: 'N3', text_en: 'I am easily disturbed.', text_hi: 'मैं आसानी से परेशान हो जाता हूँ।', trait: 'N', polarity: 1 },
  { id: 'N4', text_en: 'I get upset easily.', text_hi: 'मैं आसानी से उदास हो जाता हूँ।', trait: 'N', polarity: 1 },
  { id: 'N5', text_en: 'I change my mood a lot.', text_hi: 'मेरा मूड बहुत बदलता है।', trait: 'N', polarity: 1 },
  { id: 'N6', text_en: 'I am relaxed most of the time.', text_hi: 'मैं ज्यादातर समय तनावमुक्त रहता हूँ।', trait: 'N', polarity: -1 },
  { id: 'N7', text_en: 'I seldom feel blue.', text_hi: 'मैं शायद ही कभी उदास महसूस करता हूँ।', trait: 'N', polarity: -1 },
  { id: 'N8', text_en: 'I am not easily bothered by things.', text_hi: 'मैं चीजों से आसानी से परेशान नहीं होता।', trait: 'N', polarity: -1 },
  { id: 'N9', text_en: 'I remain calm under pressure.', text_hi: 'मैं दबाव में शांत रहता हूँ।', trait: 'N', polarity: -1 },
  { id: 'N10', text_en: 'I don\'t fret over small things.', text_hi: 'मैं छोटी-छोटी बातों पर परेशान नहीं होता।', trait: 'N', polarity: -1 },

  // OPENNESS (O)
  { id: 'O1', text_en: 'I have a rich vocabulary.', text_hi: 'मेरी शब्दावली समृद्ध है।', trait: 'O', polarity: 1 },
  { id: 'O2', text_en: 'I have a vivid imagination.', text_hi: 'मेरी कल्पनाशक्ति बहुत अच्छी है।', trait: 'O', polarity: 1 },
  { id: 'O3', text_en: 'I have excellent ideas.', text_hi: 'मेरे पास बेहतरीन विचार हैं।', trait: 'O', polarity: 1 },
  { id: 'O4', text_en: 'I am quick to understand things.', text_hi: 'मैं चीजों को जल्दी समझ लेता हूँ।', trait: 'O', polarity: 1 },
  { id: 'O5', text_en: 'I spend time reflecting on things.', text_hi: 'मैं चीजों पर विचार करने में समय बिताता हूँ।', trait: 'O', polarity: 1 },
  { id: 'O6', text_en: 'I have difficulty understanding abstract ideas.', text_hi: 'मुझे अमूर्त विचारों को समझने में कठिनाई होती है।', trait: 'O', polarity: -1 },
  { id: 'O7', text_en: 'I am not interested in abstract ideas.', text_hi: 'मुझे अमूर्त विचारों में कोई दिलचस्पी नहीं है।', trait: 'O', polarity: -1 },
  { id: 'O8', text_en: 'I do not have a good imagination.', text_hi: 'मेरी कल्पनाशक्ति अच्छी नहीं है।', trait: 'O', polarity: -1 },
  { id: 'O9', text_en: 'I try to avoid complex people.', text_hi: 'मैं जटिल लोगों से बचने की कोशिश करता हूँ।', trait: 'O', polarity: -1 },
  { id: 'O10', text_en: 'I am not interested in theoretical discussions.', text_hi: 'मुझे सैद्धांतिक चर्चाओं में कोई दिलचस्पी नहीं है।', trait: 'O', polarity: -1 }
];
/* extra-text.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   Sample texts for the tools that used to show "your writing goes here": the Moon, Numerology and the tarot
   birth cards, Chinese astrology, the Maya calendar and both Compatibility modes. Written for this demo in plain
   English; on a live site the reader edits or replaces them. Each tool's page reads its own section. */
window.TD = window.TD || {};
window.TD.EXTRA = {

/* moon.html: the phase (longer) and the sign the Moon is in (shorter). */
moonPhase: {
  'New Moon': 'The dark of the moon: the sky resets and so can you. This is the quietest point of the month, good for choosing what you want the next four weeks to be about. Write one intention, short and specific, and keep it somewhere you will see it. Start small; seeds do not need an audience.',
  'Waxing Crescent': 'The first sliver of light. The intention you set needs a first practical step now: the email, the sign-up, the first page. Energy is still fragile, so protect new plans from too much opinion. Do one thing each day that moves the idea forward, however small.',
  'First Quarter': 'Half lit and building. The first real test of the month arrives: an obstacle, a delay, a decision you cannot postpone. Push through rather than starting over. This is the phase for effort, commitment and adjusting the plan without abandoning it.',
  'Waxing Gibbous': 'Almost full. Refine and polish. Look at what you have built since the new moon and improve it: edit the draft, practise the skill, tidy the details. Patience matters here, because the result is close but not quite ready.',
  'Full Moon': 'The month at its brightest. Things come to light: results, feelings, truths you could not see before. Celebrate what has worked and notice what has not. Emotions run high, so pause before reacting. A good night for gratitude and for letting something go.',
  'Waning Gibbous': 'The light begins to fade. Share what you learned this month, teach it, write it down, thank the people who helped. It is a generous phase, good for passing things on and for taking stock of what the full moon showed you.',
  'Last Quarter': 'Half dark and clearing. Time for an honest audit: what to keep, what to cut, what to finish. Clear clutter, close loops, end a habit that is not helping. Making space now is what lets the next cycle start clean.',
  'Waning Crescent': 'The last thin light before the dark. Rest. Sleep more, schedule less, and let your mind wander. Dreams and quiet insights are strong. Nothing needs starting now; you are getting ready for the next new moon.'
},
moonSign: {
  Aries: 'With the Moon in Aries, feelings are quick and direct. Energy rises and patience drops. Good for starting, moving and speaking up.',
  Taurus: 'With the Moon in Taurus, comfort matters. Slow down, eat well, enjoy your senses. Good for steady work and anything you can touch.',
  Gemini: 'With the Moon in Gemini, the mind is restless and sociable. Talk, read, message, learn. Good for errands and conversations.',
  Cancer: 'With the Moon in Cancer, home and family pull at you. Feelings are tender. Good for cooking, caring and time with people close to you.',
  Leo: 'With the Moon in Leo, you want warmth and attention. Play, create, celebrate. Good for anything that lets you shine a little.',
  Virgo: 'With the Moon in Virgo, details call. Tidy, plan, fix, improve. Good for health routines and practical help.',
  Libra: 'With the Moon in Libra, harmony matters. Seek balance, beauty and good company. Good for partnerships and making peace.',
  Scorpio: 'With the Moon in Scorpio, feelings run deep. Honesty and privacy matter. Good for research, intimacy and letting go.',
  Sagittarius: 'With the Moon in Sagittarius, you want space and meaning. Explore, travel, think big. Good for learning and adventure.',
  Capricorn: 'With the Moon in Capricorn, you feel serious and focused. Good for work, plans and responsibilities you have been avoiding.',
  Aquarius: 'With the Moon in Aquarius, you want freedom and fresh ideas. Good for friends, groups, technology and thinking differently.',
  Pisces: 'With the Moon in Pisces, the mood is dreamy and sensitive. Good for rest, art, music, kindness and listening to intuition.'
},

/* numerology.html: each number in each position. Master numbers 11, 22 and 33 have their own text. */
lifePath: {
  1: 'Life Path 1: the pioneer. You are here to lead, start and stand on your own feet. Independence comes naturally, and so does impatience. Your growth lies in trusting your own direction while learning that asking for help is not weakness.',
  2: 'Life Path 2: the peacemaker. You read people well and build bridges between them. Partnership, patience and tact are your strengths. Your growth lies in valuing your own needs as much as you value harmony.',
  3: 'Life Path 3: the communicator. Words, art, humour and company come easily to you. You are at your best when you express yourself. Your growth lies in focus: finishing what you start and taking your talent seriously.',
  4: 'Life Path 4: the builder. Hard work, order and reliability are your gifts. People trust you to get it done. Your growth lies in flexibility, rest, and remembering that not everything has to be earned.',
  5: 'Life Path 5: the free spirit. You need change, travel and variety. You learn by doing and adapt fast. Your growth lies in commitment: choosing a few things to go deep on instead of scattering your energy.',
  6: 'Life Path 6: the caretaker. Home, family and responsibility shape your life. You are generous and protective. Your growth lies in caring without controlling, and letting others carry their own weight.',
  7: 'Life Path 7: the seeker. You want to understand how things really work. Study, solitude and inner life feed you. Your growth lies in trust: letting people in and sharing what you know.',
  8: 'Life Path 8: the achiever. Ambition, money, power and results are your arena. You can build a great deal. Your growth lies in balance: success that leaves room for people and for your own peace.',
  9: 'Life Path 9: the humanitarian. You are wise, compassionate and drawn to the bigger picture. Endings and letting go recur in your life. Your growth lies in giving without losing yourself.',
  11: 'Life Path 11: the intuitive. A master number of insight and inspiration. You sense things before others do and can light the way for them. Your growth lies in grounding: turning sensitivity into steady, practical action.',
  22: 'Life Path 22: the master builder. You can turn large visions into real structures that serve many. The pressure can feel heavy. Your growth lies in pacing yourself and trusting the long game.',
  33: 'Life Path 33: the master teacher. Compassion, healing and guidance are your calling. You give a great deal. Your growth lies in caring for yourself as carefully as you care for others.'
},
expression: {
  1: 'Expression 1: you come across as capable and self-directed, made to lead and to start things.',
  2: 'Expression 2: your gift is cooperation; you work best alongside others and smooth the way.',
  3: 'Expression 3: you are expressive and creative, at your best with words, art or an audience.',
  4: 'Expression 4: you are practical and dependable, the one who builds the systems that last.',
  5: 'Expression 5: you are versatile and quick, made for variety, travel and persuasion.',
  6: 'Expression 6: you are responsible and caring, drawn to teaching, healing or serving a community.',
  7: 'Expression 7: you are analytical and thoughtful, suited to research, expertise and depth.',
  8: 'Expression 8: you have executive talent; managing money, people and big projects comes naturally.',
  9: 'Expression 9: you are broad-minded and generous, drawn to work that helps many people.',
  11: 'Expression 11: you inspire others; your words and ideas can carry unusual insight.',
  22: 'Expression 22: you can organize large undertakings and make ambitious ideas practical.',
  33: 'Expression 33: you are a natural guide, at your best when uplifting and teaching others.'
},
soulUrge: {
  1: 'Soul Urge 1: deep down you want independence and the freedom to do things your way.',
  2: 'Soul Urge 2: deep down you want love, closeness and a peaceful partnership.',
  3: 'Soul Urge 3: deep down you want joy, self-expression and to be heard.',
  4: 'Soul Urge 4: deep down you want security, order and a life built on solid ground.',
  5: 'Soul Urge 5: deep down you want freedom, adventure and new experiences.',
  6: 'Soul Urge 6: deep down you want a loving home and people who need you.',
  7: 'Soul Urge 7: deep down you want truth, quiet and time to think.',
  8: 'Soul Urge 8: deep down you want achievement, recognition and control over your life.',
  9: 'Soul Urge 9: deep down you want to make the world a little kinder.',
  11: 'Soul Urge 11: deep down you want spiritual meaning and to follow your inner light.',
  22: 'Soul Urge 22: deep down you want to build something lasting that matters.',
  33: 'Soul Urge 33: deep down you want to heal and to serve with an open heart.'
},
personality: {
  1: 'Personality 1: others see you as confident, direct and ready to take charge.',
  2: 'Personality 2: others see you as gentle, approachable and easy to talk to.',
  3: 'Personality 3: others see you as warm, funny and lively company.',
  4: 'Personality 4: others see you as steady, organized and trustworthy.',
  5: 'Personality 5: others see you as exciting, adaptable and a little unpredictable.',
  6: 'Personality 6: others see you as kind, responsible and protective.',
  7: 'Personality 7: others see you as reserved, thoughtful and a little mysterious.',
  8: 'Personality 8: others see you as strong, capable and successful.',
  9: 'Personality 9: others see you as generous, worldly and compassionate.',
  11: 'Personality 11: others see you as sensitive, inspiring and slightly otherworldly.',
  22: 'Personality 22: others see you as powerful, grounded and able to handle big things.',
  33: 'Personality 33: others see you as nurturing and wise, someone people turn to.'
},
personalYear: {
  1: 'Personal Year 1: a new nine-year cycle begins. Start things, take initiative, plant seeds. What you begin now sets the tone for years.',
  2: 'Personal Year 2: a slower year of patience and partnership. Cooperate, listen, let things grow. Relationships take centre stage.',
  3: 'Personal Year 3: a social, creative year. Express yourself, enjoy people, say yes to fun. Watch for scattered energy.',
  4: 'Personal Year 4: a year of hard work and foundations. Organize, build, commit. Effort now pays for years to come.',
  5: 'Personal Year 5: a year of change and freedom. Travel, move, try new things. Expect surprises and stay flexible.',
  6: 'Personal Year 6: a year of home, family and responsibility. Care for others, settle in, tend relationships.',
  7: 'Personal Year 7: a quieter year of reflection and study. Rest, learn, look inward. Answers come with patience.',
  8: 'Personal Year 8: a year of ambition, money and results. Push for recognition and manage resources well.',
  9: 'Personal Year 9: a year of endings and completion. Finish, release, forgive. Make room for the new cycle ahead.',
  11: 'Personal Year 11: a year of heightened intuition and inspiration. Trust your insights and share them.',
  22: 'Personal Year 22: a year for building something big and practical. Think long term and lay strong foundations.',
  33: 'Personal Year 33: a year of service and teaching. Your care makes a real difference to others.'
},

/* numerology.html: the tarot birth cards (Mary K. Greer's method), by card id. */
birthCard: {
  'major-00': 'The Fool: you meet life with open hands. Your path asks for trust, curiosity and the courage to start again whenever it is needed.',
  'major-01': 'The Magician: you have the tools and the will to make things happen. Your path is about focus and using your skills with intent.',
  'major-02': 'The High Priestess: you know more than you say. Your path is about intuition, inner knowing and trusting what you sense.',
  'major-03': 'The Empress: you create, nurture and enjoy. Your path is about abundance, beauty and care for growing things.',
  'major-04': 'The Emperor: you build order and protect it. Your path is about structure, leadership and responsibility.',
  'major-05': 'The Hierophant: you learn and you teach. Your path is about tradition, guidance and finding what you believe.',
  'major-06': 'The Lovers: your life turns on choices of the heart. Your path is about relationships and living by your values.',
  'major-07': 'The Chariot: you move forward by will. Your path is about determination, direction and holding opposing forces together.',
  'major-08': 'Strength: your power is quiet and patient. Your path is about courage, compassion and taming what is wild in you.',
  'major-09': 'The Hermit: you find answers alone. Your path is about solitude, wisdom and becoming a light for others.',
  'major-10': 'Wheel of Fortune: you live through cycles of change. Your path is about timing, luck and adapting to what turns.',
  'major-11': 'Justice: you care about what is fair. Your path is about truth, balance and owning the results of your choices.',
  'major-12': 'The Hanged Man: you see what others miss by pausing. Your path is about surrender, new perspectives and patience.',
  'major-13': 'Death: you transform again and again. Your path is about endings that clear space for real beginnings.',
  'major-14': 'Temperance: you blend and balance. Your path is about moderation, healing and finding the middle way.',
  'major-15': 'The Devil: you know the pull of attachment. Your path is about seeing your chains clearly and choosing freedom.',
  'major-16': 'The Tower: you grow through upheaval. Your path is about letting false structures fall and rebuilding honestly.',
  'major-17': 'The Star: you carry hope. Your path is about healing, inspiration and trusting the future.',
  'major-18': 'The Moon: you live close to dreams and feelings. Your path is about intuition, imagination and facing illusions.',
  'major-19': 'The Sun: you bring warmth and joy. Your path is about confidence, success and letting yourself be seen.',
  'major-20': 'Judgement: you hear the call to rise. Your path is about awakening, renewal and answering your purpose.',
  'major-21': 'The World: you seek wholeness. Your path is about completion, integration and feeling at home in the world.'
},

/* chinese.html: the animal and the element, and the relationship lines (triads and opposites). */
animal: {
  Rat: 'The Rat is clever, resourceful and quick to spot an opportunity. Charming in company, careful with money, and always a step ahead. Watch a tendency to worry or to keep score.',
  Ox: 'The Ox is patient, strong and dependable. Slow to start but impossible to stop, loyal to the people it loves. Watch stubbornness and a habit of carrying too much alone.',
  Tiger: 'The Tiger is brave, passionate and magnetic. It hates being caged and loves a challenge. Watch impulsiveness and a quick temper.',
  Rabbit: 'The Rabbit is gentle, elegant and diplomatic. It values peace, comfort and good taste. Watch a habit of avoiding conflict until it grows.',
  Dragon: 'The Dragon is confident, ambitious and full of life. It inspires others and thinks big. Watch pride and impatience with slower people.',
  Snake: 'The Snake is wise, intuitive and private. It thinks deeply and moves with purpose. Watch suspicion and a reluctance to share feelings.',
  Horse: 'The Horse is energetic, free-spirited and sociable. It loves movement and new horizons. Watch restlessness and a tendency to leave things unfinished.',
  Goat: 'The Goat is gentle, creative and kind. It thrives in harmony and beauty. Watch worry and a reliance on others for reassurance.',
  Monkey: 'The Monkey is witty, inventive and playful. It solves problems fast and loves a puzzle. Watch mischief and a short attention span.',
  Rooster: 'The Rooster is observant, honest and hardworking. It takes pride in doing things properly. Watch bluntness and perfectionism.',
  Dog: 'The Dog is loyal, fair and protective. It stands up for what is right and for the people it loves. Watch anxiety and a tendency to expect the worst.',
  Pig: 'The Pig is generous, warm and sincere. It enjoys life and trusts easily. Watch naivety and overindulgence.'
},
element: {
  Wood: 'Wood adds growth, kindness and vision: a builder of people and plans who needs room to expand.',
  Fire: 'Fire adds passion, warmth and leadership: bright, persuasive and quick, needing an outlet for its energy.',
  Earth: 'Earth adds stability, patience and practicality: the steady centre others rely on.',
  Metal: 'Metal adds determination, discipline and clear standards: strong-willed, precise and loyal.',
  Water: 'Water adds intuition, flexibility and depth: perceptive, persuasive and good at finding the way round.'
},
chineseTriad: 'Your natural allies are the {a} and the {b}: the three of you share a rhythm and tend to understand each other without much effort.',
chineseClash: 'Your opposite is the {a}. Opposites can attract, but expect friction over pace and priorities; it works best with respect for the difference.',

/* maya.html: the 20 day signs and the 13 numbers of the Tzolk'in (traditional count, not Dreamspell). */
mayaSign: {
  Imix: 'Imix, the crocodile or water lily: beginnings, nourishment and the source. A day for starting and for caring for what is new.',
  Ik: 'Ik, the wind: breath, spirit and communication. A day for speaking, singing and clearing the air.',
  Akbal: 'Akbal, the night: darkness, the inner house, dreams. A day for rest, reflection and listening inward.',
  Kan: 'Kan, the seed or maize: growth, abundance and potential. A day for planting ideas and tending them.',
  Chicchan: 'Chicchan, the serpent: life force, instinct and vitality. A day for the body and for strong feelings.',
  Cimi: 'Cimi, death: endings, ancestors and transformation. A day for letting go and honouring what came before.',
  Manik: 'Manik, the deer: healing hands, the tools of work, steadiness. A day for helping and for skilled effort.',
  Lamat: 'Lamat, the star or rabbit: harmony, abundance and the cycles of Venus. A day for beauty and balance.',
  Muluc: 'Muluc, water: emotions, offering and purification. A day for feeling, giving and cleansing.',
  Oc: 'Oc, the dog: loyalty, friendship and guidance. A day for companionship and for keeping faith.',
  Chuen: 'Chuen, the monkey: play, art and craft. A day for creativity, humour and weaving things together.',
  Eb: 'Eb, the road or grass: the path of life, service and community. A day for walking your path with care.',
  Ben: 'Ben, the reed: growth, home and authority. A day for building and for standing tall.',
  Ix: 'Ix, the jaguar: the earth, magic and the night sun. A day for intuition and inner strength.',
  Men: 'Men, the eagle: vision, ambition and the view from above. A day for big plans and clear sight.',
  Cib: 'Cib, the owl or vulture: wisdom, the ancestors and forgiveness. A day for learning from the past.',
  Caban: 'Caban, the earth: movement, thought and synchronicity. A day for noticing signs and staying grounded.',
  Etznab: 'Etznab, the flint knife: truth, clarity and cutting away. A day for honesty and clean decisions.',
  Cauac: 'Cauac, the storm: renewal, cleansing and sudden change. A day for clearing what is stale.',
  Ahau: 'Ahau, the sun or lord: wholeness, light and the completion of a cycle. A day for celebration and gratitude.'
},
mayaTone: {
  1: 'Number 1 is unity and beginning: the seed of the thirteen-day cycle.',
  2: 'Number 2 is duality and choice: two forces finding balance.',
  3: 'Number 3 is movement and action: energy starting to flow.',
  4: 'Number 4 is stability and form: the four directions, a firm base.',
  5: 'Number 5 is the centre and empowerment: gathering strength.',
  6: 'Number 6 is flow and rhythm: things moving in their natural way.',
  7: 'Number 7 is reflection and the turning point at the heart of the cycle.',
  8: 'Number 8 is harmony and justice: putting things in order.',
  9: 'Number 9 is patience and completion of a stage: seeing the larger pattern.',
  10: 'Number 10 is manifestation: the plan taking real form.',
  11: 'Number 11 is release and resolution: letting go of what is finished.',
  12: 'Number 12 is understanding: gathering what the cycle taught.',
  13: 'Number 13 is completion and transcendence: the cycle closes and opens again.'
},

/* compatibility.html, full mode: what each body stands for, and what each kind of contact does. */
compatRole: {
  Sun: 'core self', Moon: 'feelings and needs', Mercury: 'way of thinking and talking', Venus: 'way of loving',
  Mars: 'drive and desire', Jupiter: 'generosity and faith', Saturn: 'sense of duty and limits', Uranus: 'need for freedom',
  Neptune: 'dreams and ideals', Pluto: 'depth and power', Ascendant: 'outward manner', Midheaven: 'direction in life',
  'North Node': 'sense of purpose', Chiron: 'old wounds and healing'
},
compatKind: {
  conjunction: 'These two merge: strong, impossible to ignore, and as good as the two of you make it.',
  trine: 'An easy flow: this part of you and this part of them understand each other without effort.',
  sextile: 'A friendly opening: it helps when you both make a little effort to use it.',
  square: 'Friction that pushes you both to grow: it can feel like a challenge, and it keeps things alive.',
  opposition: 'A pull between opposites: attraction and tension together, best handled by meeting in the middle.'
},

/* compatibility.html, quick mode: element pairing, animal relationship and modality mix. */
quickElement: {
  'Fire|Fire': 'Two fire signs: passion, energy and fun, with sparks when both want to lead.',
  'Earth|Earth': 'Two earth signs: steady, loyal and practical. Make room for romance and surprise.',
  'Air|Air': 'Two air signs: endless conversation and shared ideas. Make sure feelings get airtime too.',
  'Water|Water': 'Two water signs: deep emotional understanding. Keep some boundaries so moods do not swamp you both.',
  'Air|Fire': 'Air feeds fire: lively, inspiring and social. One of the classic easy pairings.',
  'Earth|Water': 'Water nourishes earth: caring, secure and loyal. Another classic easy pairing.',
  'Earth|Fire': 'Fire and earth: drive meets patience. It works when you respect each other’s pace.',
  'Fire|Water': 'Fire and water: strong feelings and strong reactions. Steam, in both senses.',
  'Air|Earth': 'Air and earth: ideas meet practicality. Good partners in a project if you value each other’s way.',
  'Air|Water': 'Air and water: head meets heart. Patience turns difference into balance.'
},
quickAnimal: {
  triad: 'Your Chinese animals belong to the same triad: an easy, natural understanding.',
  clash: 'Your Chinese animals sit opposite each other on the wheel: lively, with friction to manage.',
  other: 'Your Chinese animals are neither allies nor opposites: the relationship is what you build.'
},
quickModality: {
  same: 'You share a modality, so you approach life at a similar tempo, and can both dig in at the same time.',
  mixed: 'Your modalities differ, so one tends to start, settle or adapt where the other does not: a useful mix.'
}
};

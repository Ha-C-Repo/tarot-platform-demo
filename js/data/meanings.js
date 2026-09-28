/* meanings.js — classic script; assigns to window.TD. No ES modules, so file:// works.
   The card-meanings database the pull page reads from.

   SOURCE: Arthur Edward Waite, "The Pictorial Key to the Tarot" (London: William Rider & Son, 1911),
   Part III, sections 2 to 5. Transcribed from archive.sacred-texts.com/tarot/pkt/ (the older
   sacred-texts archive, whose terms allow commercial use of public-domain files).
   COPYRIGHT: public domain in the US (published before 1931) and in life+70 countries
   (Waite died 1942). Text is verbatim, including Waite's period spelling and his own typos.

   Each card: [upright, reversed, additional upright, additional reversed].
   "Additional" is Waite's own second list (Part III section 4). Majors have none.
   Waite gives no reversed meaning on the Two of Cups page; his additional list supplies one.

   These are generic, traditional meanings. Nothing here is personalised, and nothing about the
   visitor changes which text is shown: the card and its orientation decide it, nothing else. */
window.TD = window.TD || {};
(function(NS){
'use strict';
NS.MEANINGS_SOURCE = {
  title: 'The Pictorial Key to the Tarot',
  author: 'A.E. Waite', year: 1911,
  url: 'https://archive.sacred-texts.com/tarot/pkt/index.htm',
  licence: 'Public domain'
};
NS.MEANINGS = {
'major-00': ["Folly, mania, extravagance, intoxication, delirium, frenzy, bewrayment.", "Negligence, absence, distribution, carelessness, apathy, nullity, vanity.", "", ""],
'major-01': ["Skill, diplomacy, address, subtlety; sickness, pain, loss, disaster, snares of enemies; self-confidence, will; the Querent, if male.", "Physician, Magus, mental disease, disgrace, disquiet.", "", ""],
'major-02': ["Secrets, mystery, the future as yet unrevealed; the woman who interests the Querent, if male; the Querent herself, if female; silence, tenacity; mystery, wisdom, science.", "Passion, moral or physical ardour, conceit, surface knowledge.", "", ""],
'major-03': ["Fruitfulness, action, initiative, length of days; the unknown, clandestine; also difficulty, doubt, ignorance.", "Light, truth, the unravelling of involved matters, public rejoicings; according to another reading, vacillation.", "", ""],
'major-04': ["Stability, power, protection, realization; a great person; aid, reason, conviction; also authority and will.", "Benevolence, compassion, credit; also confusion to enemies, obstruction, immaturity.", "", ""],
'major-05': ["Marriage, alliance, captivity, servitude; by another account, mercy and goodness; inspiration; the man to whom the Querent has recourse.", "Society, good understanding, concord, overkindness, weakness.", "", ""],
'major-06': ["Attraction, love, beauty, trials overcome.", "Failure, foolish designs. Another account speaks of marriage frustrated and contrarieties of all kinds.", "", ""],
'major-07': ["Succour, providence also war, triumph, presumption, vengeance, trouble.", "Riot, quarrel, dispute, litigation, defeat.", "", ""],
'major-08': ["Power, energy, action, courage, magnanimity; also complete success and honours.", "Despotism, abuse if power, weakness, discord, sometimes even disgrace.", "", ""],
'major-09': ["Prudence, circumspection; also and especially treason, dissimulation, roguery, corruption.", "Concealment, disguise, policy, fear, unreasoned caution.", "", ""],
'major-10': ["Destiny, fortune, success, elevation, luck, felicity.", "Increase, abundance, superfluity.", "", ""],
'major-11': ["Equity, rightness, probity, executive; triumph of the deserving side in law.", "Law in all its departments, legal complications, bigotry, bias, excessive severity.", "", ""],
'major-12': ["Wisdom, circumspection, discernment, trials, sacrifice, intuition, divination, prophecy.", "Selfishness, the crowd, body politic.", "", ""],
'major-13': ["End, mortality, destruction, corruption also, for a man, the loss of a benefactor for a woman, many contrarieties; for a maid, failure of marriage projects.", "Inertia, sleep, lethargy, petrifaction, somnambulism; hope destroyed.", "", ""],
'major-14': ["Economy, moderation, frugality, management, accommodation.", "Things connected with churches, religions, sects, the priesthood, sometimes even the priest who will marry the Querent; also disunion, unfortunate combinations, competing interests.", "", ""],
'major-15': ["Ravage, violence, vehemence, extraordinary efforts, force, fatality; that which is predestined but is not for this reason evil.", "Evil fatality, weakness, pettiness, blindness.", "", ""],
'major-16': ["Misery, distress, indigence, adversity, calamity, disgrace, deception, ruin. It is a card in particular of unforeseen catastrophe.", "According to one account, the same in a lesser degree also oppression, imprisonment, tyranny.", "", ""],
'major-17': ["Loss, theft, privation, abandonment; another reading says-hope and bright prospects,", "Arrogance, haughtiness, impotence.", "", ""],
'major-18': ["Hidden enemies, danger, calumny, darkness, terror, deception, occult forces, error.", "Instability, inconstancy, silence, lesser degrees of deception and error.", "", ""],
'major-19': ["Material happiness, fortunate marriage, contentment.", "The same in a lesser sense.", "", ""],
'major-20': ["Change of position, renewal, outcome. Another account specifies total loss though lawsuit.", "Weakness, pusillanimity, simplicity; also deliberation, decision, sentence.", "", ""],
'major-21': ["Assured success, recompense, voyage, route, emigration, flight, change of place.", "Inertia, fixity, stagnation, permanence.", "", ""],

'wands-01': ["Creation, invention, enterprise, the powers which result in these; principle, beginning, source; birth, family, origin, and in a sense the virility which is behind them; the starting point of enterprises; according to another account, money, fortune, inheritance.", "Fall, decadence, ruin, perdition, to perish also a certain clouded joy.", "Calamities of all kinds.", "A sign of birth."],
'wands-02': ["Between the alternative readings there is no marriage possible; on the one hand, riches, fortune, magnificence; on the other, physical suffering, disease, chagrin, sadness, mortification. The design gives one suggestion; here is a lord overlooking his dominion and alternately contemplating a globe; it looks like the malady, the mortification, the sadness of Alexander amidst the grandeur of this world's wealth.", "Surprise, wonder, enchantment, emotion, trouble, fear.", "A young lady may expect trivial disappointments.", ""],
'wands-03': ["He symbolizes established strength, enterprise, effort, trade, commerce, discovery; those are his ships, bearing his merchandise, which are sailing over the sea. The card also signifies able co-operation in business, as if the successful merchant prince were looking from his side towards yours with a view to help you.", "The end of troubles, suspension or cessation of adversity, toil and disappointment.", "A very good card; collaboration will favour enterprise.", ""],
'wands-04': ["They are for once almost on the surface--country life, haven of refuge, a species of domestic harvest-home, repose, concord, harmony, prosperity, peace, and the perfected work of these.", "The meaning remains unaltered; it is prosperity, increase, felicity, beauty, embellishment.", "Unexpected good fortune.", "A married woman will have beautiful children."],
'wands-05': ["Imitation, as, for example, sham fight, but also the strenuous competition and struggle of the search after riches and fortune. In this sense it connects with the battle of life. Hence some attributions say that it is a card of gold, gain, opulence.", "Litigation, disputes, trickery, contradiction.", "Success in financial speculation.", "Quarrels may be turned to advantage."],
'wands-06': ["The card has been so designed that it can cover several significations; on the surface, it is a victor triumphing, but it is also great news, such as might be carried in state by the King's courier; it is expectation crowned with its own desire, the crown of hope, and so forth.", "Apprehension, fear, as of a victorious enemy at the gate; treachery, disloyalty, as of gates being opened to the enemy; also indefinite delay.", "Servants may lose the confidence of their masters; a young lady may be betrayed by a friend.", "Fulfilment of deferred hope."],
'wands-07': ["It is a card of valour, for, on the surface, six are attacking one, who has, however, the vantage position. On the intellectual plane, it signifies discussion, wordy strife; in business--negotiations, war of trade, barter, competition. It is further a card of success, for the combatant is on the top and his enemies may be unable to reach him.", "Perplexity, embarrassments, anxiety. It is also a caution against indecision.", "A dark child.", ""],
'wands-08': ["Activity in undertakings, the path of such activity, swiftness, as that of an express messenger; great haste, great hope, speed towards an end which promises assured felicity; generally, that which is on the move; also the arrows of love.", "Arrows of jealousy, internal dispute, stingings of conscience, quarrels; and domestic disputes for persons who are married.", "Domestic disputes for a married person.", ""],
'wands-09': ["The card signifies strength in opposition. If attacked, the person will meet an onslaught boldly; and his build shews, that he may prove a formidable antagonist. With this main significance there are all its possible adjuncts--delay, suspension, adjournment.", "Obstacles, adversity, calamity.", "Generally speaking, a bad card.", ""],
'wands-10': ["A card of many significances, and some of the readings cannot be harmonized. I set aside that which connects it with honour and good faith. The chief meaning is oppression simply, but it is also fortune, gain, any kind of success, and then it is the oppression of these things. It is also a card of false-seeming, disguise, perfidy. The place which the figure is approaching may suffer from the rods that he carries. Success is stultified if the Nine of Swords follows, and if it is a question of a lawsuit, there will be certain loss.", "Contrarieties, difficulties, intrigues, and their analogies.", "Difficulties and contradictions, if near a good card.", ""],
'wands-11': ["Dark young man, faithful, a lover, an envoy, a postman. Beside a man, he will bear favourable testimony concerning him. A dangerous rival, if followed by the Page of Cups. Has the chief qualities of his suit. He may signify family intelligence.", "Anecdotes, announcements, evil news. Also indecision and the instability which accompanies it.", "Young man of family in search of young lady.", "Bad news."],
'wands-12': ["Departure, absence, flight, emigration. A dark young man, friendly. Change of residence.", "Rupture, division, interruption, discord.", "A bad card; according to some readings, alienation.", "For a woman, marriage, but probably frustrated."],
'wands-13': ["A dark woman, countrywoman, friendly, chaste, loving, honourable. If the card beside her signifies a man, she is well disposed towards him; if a woman, she is interested in the Querent. Also, love of money, or a certain success in business.", "Good, economical, obliging, serviceable. Signifies also--but in certain positions and in the neighbourhood of other cards tending in such directions--opposition, jealousy, even deceit and infidelity.", "A good harvest, which may be taken in several senses.", "Goodwill towards the Querent, but without the opportunity to exercise it."],
'wands-14': ["Dark man, friendly, countryman, generally married, honest and conscientious. The card always signifies honesty, and may mean news concerning an unexpected heritage to fall in before very long.", "Good, but severe; austere, yet tolerant.", "Generally favourable may signify a good marriage.", "Advice that should be followed."],

'cups-01': ["House of the true heart, joy, content, abode, nourishment, abundance, fertility; Holy Table, felicity hereof.", "House of the false heart, mutation, instability, revolution.", "Inflexible will, unalterable law.", "Unexpected change of position."],
'cups-02': ["Love, passion, friendship, affinity, union, concord, sympathy, the interrelation of the sexes, and--as a suggestion apart from all offices of divination--that desire which is not in Nature, but by which Nature is sanctified.", "", "Favourable in things of pleasure and business, as well as love; also wealth and honour.", "Passion."],
'cups-03': ["The conclusion of any matter in plenty, perfection and merriment; happy issue, victory, fulfilment, solace, healing,", "Expedition, dispatch, achievement, end. It signifies also the side of excess in physical enjoyment, and the pleasures of the senses.", "Unexpected advancement for a military man.", "Consolation, cure, end of the business."],
'cups-04': ["Weariness, disgust, aversion, imaginary vexations, as if the wine of this world had caused satiety only; another wine, as if a fairy gift, is now offered the wastrel, but he sees no consolation therein. This is also a card of blended pleasure.", "Novelty, presage, new instruction, new relations.", "Contrarieties.", "Presentiment."],
'cups-05': ["It is a card of loss, but something remains over; three have been taken, but two are left; it is a card of inheritance, patrimony, transmission, but not corresponding to expectations; with some interpreters it is a card of marriage, but not without bitterness or frustration.", "News, alliances, affinity, consanguinity, ancestry, return, false projects.", "Generally favourable; a happy marriage; also patrimony, legacies, gifts, success in enterprise.", "Return of some relative who has not been seen for long."],
'cups-06': ["A card of the past and of memories, looking back, as--for example--on childhood; happiness, enjoyment, but coming rather from the past; things that have vanished. Another reading reverses this, giving new relations, new knowledge, new environment, and then the children are disporting in an unfamiliar precinct.", "The future, renewal, that which will come to pass presently.", "Pleasant memories.", "Inheritance to fall in quickly."],
'cups-07': ["Fairy favours, images of reflection, sentiment, imagination, things seen in the glass of contemplation; some attainment in these degrees, but nothing permanent or substantial is suggested.", "Desire, will, determination, project.", "Fair child; idea, design, resolve, movement.", "Success, if accompanied by the Three of Cups."],
'cups-08': ["The card speaks for itself on the surface, but other readings are entirely antithetical--giving joy, mildness, timidity, honour, modesty. In practice, it is usually found that the card shews the decline of a matter, or that a matter which has been thought to be important is really of slight consequence--either for good or evil.", "Great joy, happiness, feasting.", "Marriage with a fair woman.", "Perfect satisfaction."],
'cups-09': ["Concord, contentment, physical bien-être; also victory, success, advantage; satisfaction for the Querent or person for whom the consultation is made.", "Truth, loyalty, liberty; but the readings vary and include mistakes, imperfections, etc.", "Of good augury for military men.", "Good business."],
'cups-10': ["Contentment, repose of the entire heart; the perfection of that state; also perfection of human love and friendship; if with several picture-cards, a person who is taking charge of the Querent's interests; also the town, village or country inhabited by the Querent.", "Repose of the false heart, indignation, violence.", "For a male Querent, a good marriage and one beyond his expectations.", "Sorrow; also a serious quarrel."],
'cups-11': ["Fair young man, one impelled to render service and with whom the Querent will be connected; a studious youth; news, message; application, reflection, meditation; also these things directed to business.", "Taste, inclination, attachment, seduction, deception, artifice.", "Good augury; also a young man who is unfortunate in love.", "Obstacles of all kinds."],
'cups-12': ["Arrival, approach--sometimes that of a messenger; advances, proposition, demeanour, invitation, incitement.", "Trickery, artifice, subtlety, swindling, duplicity, fraud.", "A visit from a friend, who will bring unexpected money to the Querent.", "Irregularity."],
'cups-13': ["Good, fair woman; honest, devoted woman, who will do service to the Querent; loving intelligence, and hence the gift of vision; success, happiness, pleasure; also wisdom, virtue; a perfect spouse and a good mother.", "The accounts vary; good woman; otherwise, distinguished woman but one not to be trusted; perverse woman; vice, dishonour, depravity.", "Sometimes denotes a woman of equivocal character.", "A rich marriage for a man and a distinguished one for a woman."],
'cups-14': ["Fair man, man of business, law, or divinity; responsible, disposed to oblige the Querent; also equity, art and science, including those who profess science, law and art; creative intelligence.", "Dishonest, double-dealing man; roguery, exaction, injustice, vice, scandal, pillage, considerable loss.", "Beware of ill-will on the part of a man of position, and of hypocrisy pretending to help.", "Loss."],

'swords-01': ["Triumph, the excessive degree in everything, conquest, triumph of force. It is a card of great force, in love as well as in hatred. The crown may carry a much higher significance than comes usually within the sphere of fortune-telling.", "The same, but the results are disastrous; another account says--conception, childbirth, augmentation, multiplicity.", "Great prosperity or great misery.", "Marriage broken off, for a woman, through her own imprudence."],
'swords-02': ["Conformity and the equipoise which it suggests, courage, friendship, concord in a state of arms; another reading gives tenderness, affection, intimacy. The suggestion of harmony and other favourable readings must be considered in a qualified manner, as Swords generally are not symbolical of beneficent forces in human affairs.", "Imposture, falsehood, duplicity, disloyalty.", "Gifts for a lady, influential protection for a man in search of help.", "Dealings with rogues."],
'swords-03': ["Removal, absence, delay, division, rupture, dispersion, and all that the design signifies naturally, being too simple and obvious to call for specific enumeration.", "Mental alienation, error, loss, distraction, disorder, confusion.", "For a woman, the flight of her lover.", "A meeting with one whom the Querent has compromised; also a nun."],
'swords-04': ["Vigilance, retreat, solitude, hermit's repose, exile, tomb and coffin. It is these last that have suggested the design.", "Wise administration, circumspection, economy, avarice, precaution, testament.", "A bad card, but if reversed a qualified success may be expected by wise administration of affairs.", "A certain success following wise administration."],
'swords-05': ["Degradation, destruction, revocation, infamy, dishonour, loss, with the variants and analogues of these.", "The same; burial and obsequies.", "An attack on the fortune of the Querent.", "A sign of sorrow and mourning."],
'swords-06': ["journey by water, route, way, envoy, commissionary, expedient.", "Declaration, confession, publicity; one account says that it is a proposal of love.", "The voyage will be pleasant.", "Unfavourable issue of lawsuit."],
'swords-07': ["Design, attempt, wish, hope, confidence; also quarrelling, a plan that may fail, annoyance. The design is uncertain in its import, because the significations are widely at variance with each other.", "Good advice, counsel, instruction, slander, babbling.", "Dark girl; a good card; it promises a country life after a competence has been secured.", "Good advice, probably neglected."],
'swords-08': ["Bad news, violent chagrin, crisis, censure, power in trammels, conflict, calumny; also sickness.", "Disquiet, difficulty, opposition, accident, treachery; what is unforeseen; fatality.", "For a woman, scandal spread in her respect.", "Departure of a relative."],
'swords-09': ["Death, failure, miscarriage, delay, deception, disappointment, despair.", "Imprisonment, suspicion, doubt, reasonable fear, shame.", "An ecclesiastic, a priest; generally, a card of bad omen.", "Good ground for suspicion against a doubtful person."],
'swords-10': ["Whatsoever is intimated by the design; also pain, affliction, tears, sadness, desolation. It is not especially a card of violent death.", "Advantage, profit, success, favour, but none of these are permanent; also power and authority.", "Followed by Ace and King, imprisonment; for girl or wife, treason on the part of friends.", "Victory and consequent fortune for a soldier in war."],
'swords-11': ["Authority, overseeing, secret service, vigilance, spying, examination, and the qualities thereto belonging.", "More evil side of these qualities; what is unforeseen, unprepared state; sickness is also intimated.", "An indiscreet person will pry into the Querent's secrets.", "Astonishing news."],
'swords-12': ["Skill, bravery, capacity, defence, address, enmity, wrath, war, destruction, opposition, resistance, ruin. There is therefore a sense in which the card signifies death, but it carries this meaning only in its proximity to other cards of fatality.", "Imprudence, incapacity, extravagance.", "A soldier, man of arms, satellite, stipendiary; heroic action predicted for soldier.", "Dispute with an imbecile person; for a woman, struggle with a rival, who will be conquered."],
'swords-13': ["Widowhood, female sadness and embarrassment, absence, sterility, mourning, privation, separation.", "Malice, bigotry, artifice, prudery, bale, deceit.", "A widow.", "A bad woman, with ill-will towards the Querent."],
'swords-14': ["Whatsoever arises out of the idea of judgment and all its connexions-power, command, authority, militant intelligence, law, offices of the crown, and so forth.", "Cruelty, perversity, barbarity, perfidy, evil intention.", "A lawyer, senator, doctor.", "A bad man; also a caution to put an end to a ruinous lawsuit."],

'pentacles-01': ["Perfect contentment, felicity, ecstasy; also speedy intelligence; gold.", "The evil side of wealth, bad intelligence; also great riches. In any case it shews prosperity, comfortable material conditions, but whether these are of advantage to the possessor will depend on whether the card is reversed or not.", "The most favourable of all cards.", "A share in the finding of treasure."],
'pentacles-02': ["On the one hand it is represented as a card of gaiety, recreation and its connexions, which is the subject of the design; but it is read also as news and messages in writing, as obstacles, agitation, trouble, embroilment.", "Enforced gaiety, simulated enjoyment, literal sense, handwriting, composition, letters of exchange.", "Troubles are more imaginary than real.", "Bad omen, ignorance, injustice."],
'pentacles-03': ["Métier, trade, skilled labour; usually, however, regarded as a card of nobility, aristocracy, renown, glory.", "Mediocrity, in work and otherwise, puerility, pettiness, weakness.", "If for a man, celebrity for his eldest son.", "Depends on neighbouring cards."],
'pentacles-04': ["The surety of possessions, cleaving to that which one has, gift, legacy, inheritance.", "Suspense, delay, opposition.", "For a bachelor, pleasant news from a lady.", "Observation, hindrances."],
'pentacles-05': ["The card foretells material trouble above all, whether in the form illustrated--that is, destitution--or otherwise. For some cartomancists, it is a card of love and lovers-wife, husband, friend, mistress; also concordance, affinities. These alternatives cannot be harmonized.", "Disorder, chaos, ruin, discord, profligacy.", "Conquest of fortune by reason.", "Troubles in love."],
'pentacles-06': ["Presents, gifts, gratification another account says attention, vigilance now is the accepted time, present prosperity, etc.", "Desire, cupidity, envy, jealousy, illusion.", "The present must not be relied on.", "A check on the Querent's ambition."],
'pentacles-07': ["These are exceedingly contradictory; in the main, it is a card of money, business, barter; but one reading gives altercation, quarrels--and another innocence, ingenuity, purgation.", "Cause for anxiety regarding money which it may be proposed to lend.", "Improved position for a lady's future husband.", "Impatience, apprehension, suspicion."],
'pentacles-08': ["Work, employment, commission, craftsmanship, skill in craft and business, perhaps in the preparatory stage.", "Voided ambition, vanity, cupidity, exaction, usury. It may also signify the possession of skill, in the sense of the ingenious mind turned to cunning and intrigue.", "A young man in business who has relations with the Querent; a dark girl.", "The Querent will be compromised in a matter of money-lending."],
'pentacles-09': ["Prudence, safety, success, accomplishment, certitude, discernment.", "Roguery, deception, voided project, bad faith.", "Prompt fulfilment of what is presaged by neighbouring cards.", "Vain hopes."],
'pentacles-10': ["Gain, riches; family matters, archives, extraction, the abode of a family.", "Chance, fatality, loss, robbery, games of hazard; sometimes gift, dowry, pension.", "Represents house or dwelling, and derives its value from other cards.", "An occasion which may be fortunate or otherwise."],
'pentacles-11': ["Application, study, scholarship, reflection another reading says news, messages and the bringer thereof; also rule, management.", "Prodigality, dissipation, liberality, luxury; unfavourable news.", "A dark youth; a young officer or soldier; a child.", "Sometimes degradation and sometimes pillage."],
'pentacles-12': ["Utility, serviceableness, interest, responsibility, rectitude-all on the normal and external plane.", "inertia, idleness, repose of that kind, stagnation; also placidity, discouragement, carelessness.", "An useful man; useful discoveries.", "A brave man out of employment."],
'pentacles-13': ["Opulence, generosity, magnificence, security, liberty.", "Evil, suspicion, suspense, fear, mistrust.", "Dark woman; presents from a rich relative; rich and happy marriage for a young man.", "An illness."],
'pentacles-14': ["Valour, realizing intelligence, business and normal intellectual aptitude, sometimes mathematical gifts and attainments of this kind; success in these paths.", "Vice, weakness, ugliness, perversity, corruption, peril.", "A rather dark man, a merchant, master, professor.", "An old and vicious man."]
};

/* Waite, Part III section 5, "The Recurrence of Cards in Dealing". Verbatim.
   Keyed by rank, then [four of them, three of them, two of them]. */
NS.RECURRENCE = {
  upright: {
    King:['great honour','consultation','minor counsel'],
    Queen:['great debate','deception by women','sincere friends'],
    Knight:['serious matters','lively debate','intimacy'],
    Page:['dangerous illness','dispute','disquiet'],
    Ten:['condemnation','new condition','change'],
    Nine:['a good friend','success','receipt'],
    Eight:['reverse','marriage','new knowledge'],
    Seven:['intrigue','infirmity','news'],
    Six:['abundance','success','irritability'],
    Five:['regularity','determination','vigils'],
    Four:['journey near at hand','a subject of reflection','insomnia'],
    Three:['progress','unity','calm'],
    Two:['contention','security','accord'],
    Ace:['favourable chance','small success','trickery']
  },
  reversed: {
    King:['celerity','commerce','projects'],
    Queen:['bad company','gluttony','work'],
    Knight:['alliance','a duel, or personal encounter','susceptibility'],
    Page:['privation','idleness','society'],
    Ten:['event, happening','disappointment','expectation justified'],
    Nine:['usury','imprudence','a small profit'],
    Eight:['error','a spectacle','misfortune'],
    Seven:['quarrellers','joy','women of no repute'],
    Six:['care','satisfaction','downfall'],
    Five:['order','hesitation','reverse'],
    Four:['walks abroad','disquiet','dispute'],
    Three:['great success','serenity','safety'],
    Two:['reconciliation','apprehension','mistrust'],
    Ace:['dishonour','debauchery','enemies']
  }
};

/* Spread-level conventions. These are NOT from Waite. They are the reading habits most
   commonly taught today, summarised in our own words: what it usually means when one suit,
   the Major Arcana, the court cards or reversals dominate a spread. */
NS.SPREAD_NOTES = {
  majors:   'Mostly Major Arcana: the reading is usually taken to be about larger, longer-running themes rather than day-to-day matters.',
  minors:   'All Minor Arcana: usually read as everyday matters that will pass; nothing here is marked as a turning point.',
  wands:    'Wands lead: energy, drive, ambition and work already in motion.',
  cups:     'Cups lead: feelings, relationships and what the heart wants.',
  swords:   'Swords lead: thought, conflict, hard decisions and difficult truths.',
  pentacles:'Pentacles lead: money, work, the body and practical, material matters.',
  courts:   'Several court cards: other people are involved, or the cards describe roles you are playing.',
  reversed: 'Mostly reversed: commonly read as energy that is blocked, delayed, turned inward or running to excess, rather than simply as the opposite meaning.',
  upright:  'All upright: the energies are usually read as open and flowing freely.'
};
NS.POSITION_NOTES = {
  Past: 'What has shaped the question: the ground it grew from.',
  Present: 'Where things stand now.',
  Future: 'Where things are heading if nothing changes. A direction, not a sentence.'
};
})(window.TD);

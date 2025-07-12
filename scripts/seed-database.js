import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

const sampleNovels = [
  {
    title: "The Magic Academy Chronicles",
    slug: "the-magic-academy-chronicles",
    description:
      "Follow the journey of a young mage as they navigate the complexities of magical education, friendship, and ancient mysteries that threaten the very fabric of their world.",
    coverImage: "/placeholder.svg?height=400&width=300",
    author: "Luna Starweaver",
    status: "ongoing",
    createdAt: new Date(),
    updatedAt: new Date(),
    chapterCount: 3,
  },
  {
    title: "Reborn as a Dragon Lord",
    slug: "reborn-as-a-dragon-lord",
    description:
      "After dying in a car accident, our protagonist finds themselves reincarnated as a powerful dragon in a fantasy world filled with magic, adventure, and political intrigue.",
    coverImage: "/placeholder.svg?height=400&width=300",
    author: "Flame Emperor",
    status: "ongoing",
    createdAt: new Date(),
    updatedAt: new Date(),
    chapterCount: 2,
  },
  {
    title: "The System Apocalypse",
    slug: "the-system-apocalypse",
    description:
      "When a mysterious system appears and transforms Earth into a game-like world, humanity must adapt or perish. Follow survivors as they level up and fight for their lives.",
    coverImage: "/placeholder.svg?height=400&width=300",
    author: "Digital Survivor",
    status: "completed",
    createdAt: new Date(),
    updatedAt: new Date(),
    chapterCount: 1,
  },
]

const sampleChapters = [
  // Magic Academy Chronicles chapters
  {
    title: "The Acceptance Letter",
    slug: "the-acceptance-letter",
    content: `The morning sun filtered through the dusty windows of the small cottage as Elena stared at the letter in her trembling hands. The seal bore the emblem of the Royal Magic Academy - a phoenix rising from flames, surrounded by ancient runes that seemed to shimmer with their own inner light.

"I can't believe it," she whispered, reading the elegant script for the tenth time. "I've been accepted."

Her grandmother looked up from her morning tea, a knowing smile creasing her weathered face. "I told you, child. The magic in your bloodline runs deeper than you know."

Elena had always known she was different. Strange things happened around her - flowers bloomed out of season when she was happy, storms seemed to calm at her touch, and sometimes, just sometimes, she could hear the whispers of the wind itself.

But the Royal Magic Academy? That was for the elite, the noble families who had practiced magic for generations. Not for a simple village girl whose parents had died when she was barely old enough to remember them.

"When do you leave?" her grandmother asked, though her voice carried a note of sadness.

"Next week," Elena replied, her excitement tempered by the realization that she would be leaving the only home she had ever known. "Grandmother, what if I'm not good enough? What if they realize they made a mistake?"

The old woman stood and placed a gentle hand on Elena's shoulder. "Magic chooses its own, dear one. The Academy doesn't make mistakes. You belong there, just as much as any duke's daughter or prince's son."

As Elena looked out at the familiar fields and forests of her childhood, she felt a mixture of fear and anticipation. Tomorrow, her real journey would begin.`,
    novelSlug: "the-magic-academy-chronicles",
    chapterNumber: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "First Day Trials",
    slug: "first-day-trials",
    content: `The Royal Magic Academy loomed before Elena like something out of a fairy tale. Towering spires reached toward the clouds, their surfaces covered in moving murals that depicted the great magical battles of history. Students in flowing robes hurried across the courtyard, some levitating their luggage, others accompanied by familiar spirits that took the form of exotic creatures.

Elena clutched her simple cloth bag tighter, suddenly very aware of how out of place she looked among these obviously wealthy and well-trained young mages.

"First years, gather here!" called a stern-looking professor with silver hair and piercing blue eyes. "I am Professor Aldrich, and I will be conducting your initial assessments."

Elena joined the group of nervous-looking students, trying not to stare at the boy whose hair seemed to be made of actual flames, or the girl who cast no shadow despite the bright morning sun.

"The trials will test not just your magical ability, but your creativity, problem-solving skills, and character," Professor Aldrich continued. "Remember, raw power means nothing without wisdom and control."

The first trial took place in a vast chamber filled with floating platforms. Students had to navigate from one end to the other using only their magical abilities. Elena watched as her classmates demonstrated impressive feats - creating bridges of ice, growing vines to swing from, even transforming into birds to fly across.

When her turn came, Elena closed her eyes and reached out with her senses. She could feel the air currents in the room, the way they moved and flowed. Instead of fighting against them, she asked them to carry her, and to her amazement, gentle winds lifted her up and guided her safely across.

Professor Aldrich made a note on his scroll, his expression unreadable. "Interesting technique, Miss Elena. Very... intuitive."

As the day progressed through various trials, Elena began to realize that her magic was indeed different from the others. Where they commanded and controlled, she seemed to communicate and cooperate with the magical forces around her. It was a distinction that would prove more important than she could possibly imagine.`,
    novelSlug: "the-magic-academy-chronicles",
    chapterNumber: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "The Forbidden Library",
    slug: "the-forbidden-library",
    content: `Three weeks into her studies at the Academy, Elena had settled into a routine of classes, study sessions, and trying not to feel overwhelmed by the sheer scope of magical knowledge she was expected to absorb. Her unique approach to magic had earned her both admirers and skeptics among her classmates, but she was slowly finding her place.

It was during a late-night study session in the main library that she first noticed the door.

Hidden behind a tapestry depicting the founding of the Academy, a narrow wooden door stood slightly ajar. Strange symbols were carved into its surface, and Elena could swear she heard whispers coming from beyond it.

"You shouldn't be here."

Elena spun around to find Marcus, one of her classmates, emerging from the shadows between the bookshelves. His flame-red hair seemed dimmed in the library's soft magical lighting.

"I was just studying," Elena said, gesturing to the pile of books on her table.

Marcus glanced at the hidden door, then back at her. "That's the entrance to the Forbidden Library. Students aren't allowed inside."

"What's in there?" Elena asked, unable to keep the curiosity out of her voice.

"Dangerous knowledge. Books of dark magic, forbidden spells, histories that the Academy would rather keep buried." Marcus moved closer, lowering his voice. "They say some of the books are cursed, that they can drive readers mad with the secrets they contain."

Elena felt drawn to the door despite the warning. The whispers seemed to be calling her name, and the symbols on the door's surface appeared to be shifting and changing when she wasn't looking directly at them.

"Have you ever been inside?" she asked.

Marcus shook his head quickly. "Of course not. The penalties for unauthorized entry are severe. Expulsion at minimum."

But as Elena gathered her books to leave, she couldn't shake the feeling that whatever lay beyond that door was connected to her somehow. The magic she wielded, so different from her classmates', seemed to resonate with the energy emanating from the Forbidden Library.

That night, she lay awake in her dormitory bed, staring at the ceiling and wondering what secrets the Academy was keeping. And more importantly, why those secrets seemed to be calling to her.

Little did she know that her questions would soon be answered in ways she never expected, and that the path to those answers would change not just her understanding of magic, but the fate of the Academy itself.`,
    novelSlug: "the-magic-academy-chronicles",
    chapterNumber: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Dragon Lord chapters
  {
    title: "Death and Rebirth",
    slug: "death-and-rebirth",
    content: `The last thing Kenji remembered was the blinding headlights and the screech of brakes. Then darkness, followed by a strange floating sensation and a voice that seemed to come from everywhere and nowhere at once.

"Your life has ended, but your story is far from over."

When consciousness returned, everything was different. The world around him was vast and alien - towering mountains wreathed in mist, forests that stretched beyond the horizon, and a sky painted in shades of purple and gold that no earthly sunset had ever achieved.

But the most shocking change was his own body. Where once he had been a twenty-five-year-old office worker, he now possessed scales that gleamed like polished obsidian, claws that could rend stone, and wings that cast shadows across the mountainside.

He was a dragon.

Not just any dragon, but according to the strange knowledge that had been implanted in his mind along with his new form, he was a Dragon Lord - one of the most powerful magical beings in this world.

"Fascinating," he rumbled, his voice now a deep bass that seemed to make the very air vibrate. "I've been reincarnated into what appears to be a fantasy world, and I'm at the top of the food chain."

As he experimented with his new abilities - breathing streams of dark fire, manipulating shadows, and sensing the magical energies that flowed through this world like invisible rivers - Kenji began to understand the scope of his transformation.

He possessed not just physical power, but magical abilities that defied comprehension. He could speak with all creatures, understand any language, and most remarkably, he retained all his memories and knowledge from his previous life.

"This world operates on different rules," he mused, watching a group of adventurers in the distance flee from what appeared to be a pack of wolf-like creatures with too many eyes. "Magic is real, monsters roam the land, and if the knowledge in my head is correct, there are kingdoms, guilds, and political structures that would make medieval Europe look simple."

As the sun set on his first day in this new world, Kenji - now calling himself Draconis - began to plan. He had been given a second chance at life, and this time, he intended to make the most of it.

But first, he needed to understand this world better. And perhaps find out why he had been chosen for this transformation, and what greater purpose might await a Dragon Lord in a realm where magic and monsters were the norm rather than the exception.`,
    novelSlug: "reborn-as-a-dragon-lord",
    chapterNumber: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "First Encounters",
    slug: "first-encounters",
    content: `Three days had passed since Draconis's awakening, and he had spent the time exploring his new domain - a vast mountain range that seemed to be his territory by some ancient right he didn't fully understand yet.

It was on the fourth day that he encountered his first humans.

A caravan of merchants had been attacked by bandits in the valley below his mountain. From his perch on a high cliff, Draconis could see the desperate battle unfolding. The merchants were clearly outmatched, their guards falling one by one to the superior numbers and ruthless tactics of their attackers.

In his previous life, Kenji might have called the police or tried to help in some small way. But now, as a Dragon Lord, he had options that defied conventional thinking.

"Interesting moral dilemma," he mused to himself. "Do I intervene? These people mean nothing to me, but those bandits are operating in what appears to be my territory."

The decision was made for him when he noticed a small figure among the merchants - a child, no more than ten years old, cowering behind an overturned wagon as a bandit approached with a cruel grin and a bloodied sword.

Draconis launched himself from the cliff.

His arrival was nothing short of apocalyptic from the humans' perspective. A massive shadow fell across the battlefield as his wings blocked out the sun, and when he landed, the very ground shook with the impact.

"ENOUGH," his voice boomed across the valley, carrying with it an authority that seemed to resonate in the very bones of everyone present.

The bandits froze in terror. Several dropped their weapons and fell to their knees. The merchants weren't much better, though their fear was mixed with desperate hope.

"This territory is under my protection," Draconis continued, his golden eyes fixing on the bandit leader. "You have two choices: leave now and never return, or become a cautionary tale for the next group of fools who think to prey upon travelers in my domain."

The bandit leader, to his credit, managed to find his voice. "Y-you're just one dragon! We are many!"

Draconis tilted his massive head, almost amused. "Are you volunteering to test that theory?"

He breathed out a small stream of his dark fire, not at the bandits, but at a nearby boulder. The stone didn't just melt - it was consumed entirely, leaving nothing but a small crater of glass where it had been.

The bandits fled.

As Draconis turned his attention to the merchants, he was surprised to see the child he had noticed earlier step forward, no longer cowering but looking up at him with wide, curious eyes.

"Thank you, Lord Dragon," the child said in a clear, brave voice. "My name is Aria. Will you be our protector now?"

Looking down at the small human who showed no fear of his terrible form, Draconis felt something stir in his chest - a sense of responsibility he hadn't expected.

"Perhaps," he rumbled softly. "Perhaps I will."

And so began the legend of the Dragon Lord who protected the innocent and brought order to the chaotic borderlands. Though Draconis didn't know it yet, this simple act of mercy would set in motion events that would reshape the political landscape of the entire continent.`,
    novelSlug: "reborn-as-a-dragon-lord",
    chapterNumber: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // System Apocalypse chapter
  {
    title: "The System Awakens",
    slug: "the-system-awakens",
    content: `Sarah was in the middle of her morning jog when the world ended.

Not in the traditional sense of nuclear fire or alien invasion, but in a way that was somehow both more subtle and more terrifying. One moment she was running through Central Park, earbuds in, focused on her breathing and the rhythm of her feet on the path. The next moment, reality itself seemed to stutter.

A blue screen appeared in her vision, translucent but undeniably there, following her gaze no matter where she looked.

[SYSTEM INITIALIZATION COMPLETE]
[WELCOME TO THE INTEGRATION]
[SCANNING SUBJECT...]
[SCAN COMPLETE]

Name: Sarah Chen
Level: 1
Class: Unassigned
Health: 100/100
Mana: 50/50
Stamina: 75/100

Attributes:
Strength: 8
Agility: 12
Intelligence: 14
Wisdom: 11
Constitution: 10
Luck: 7

[TUTORIAL BEGINNING IN 3... 2... 1...]

Sarah stumbled to a halt, frantically waving her hands in front of her face, but the screen remained fixed in her vision. Around her, she could hear other joggers and park-goers crying out in confusion and fear as they presumably experienced the same phenomenon.

"What the hell is happening?" she gasped, but her question was answered almost immediately as new text appeared.

[EARTH HAS BEEN SELECTED FOR INTEGRATION INTO THE MULTIVERSAL SYSTEM]
[ALL INHABITANTS WILL NOW HAVE ACCESS TO LEVELS, SKILLS, AND MAGICAL ABILITIES]
[SURVIVAL IS NOT GUARANTEED]
[MONSTERS WILL BEGIN SPAWNING IN 24 HOURS]
[GOOD LUCK]

The casual "Good Luck" at the end of what was essentially a death sentence struck Sarah as particularly cruel. But before she could process the full implications, another screen appeared.

[TUTORIAL QUEST ACTIVATED]
[OBJECTIVE: SURVIVE THE FIRST MONSTER ENCOUNTER]
[REWARD: CLASS SELECTION]
[FAILURE: DEATH]

Around the park, Sarah could see other people staring at empty air, their faces showing the same mixture of confusion and terror she felt. Some were trying to interact with what she assumed were their own system screens, poking at the air with their fingers.

A businessman in a suit was shouting into his phone, "The stock market is the least of our problems right now!" while a group of teenagers seemed to be treating the whole thing like some kind of augmented reality game.

Sarah, however, had read enough science fiction and played enough video games to understand the gravity of the situation. If this was real - and the evidence suggested it was - then humanity had just been thrust into a survival scenario that most people were completely unprepared for.

She opened what appeared to be a status menu and began to study her options. If she was going to survive the next twenty-four hours, she needed to understand this "System" as quickly as possible.

The world had become a game, and the stakes were life and death.

As sirens began to wail in the distance and the first reports of "impossible creatures" started appearing on social media, Sarah realized that her morning jog had become the first step in humanity's fight for survival.

The System had awakened, and nothing would ever be the same.`,
    novelSlug: "the-system-apocalypse",
    chapterNumber: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db("novel-reader")

    // Clear existing data
    await db.collection("novels").deleteMany({})
    await db.collection("chapters").deleteMany({})
    console.log("Cleared existing data")

    // Insert novels
    const novelResult = await db.collection("novels").insertMany(sampleNovels)
    console.log(`Inserted ${novelResult.insertedCount} novels`)

    // Insert chapters
    const chapterResult = await db.collection("chapters").insertMany(sampleChapters)
    console.log(`Inserted ${chapterResult.insertedCount} chapters`)

    console.log("Database seeded successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await client.close()
  }
}

seedDatabase()

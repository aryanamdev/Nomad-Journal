// src/services/demoService.ts
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "@/models/userModel";
import Journal from "@/models/journalModel";
import Entry from "@/models/entryModel";

export const DEMO_EMAIL = "demo@nomadjournal.app";

/** Demo content is restored to its original state at most this often. */
const RESEED_AFTER_MS = 6 * 60 * 60 * 1000;
/** Bump when the sample data changes so existing demo accounts pick it up. */
const SEED_VERSION = 2;

type SeedEntry = {
  title: string;
  content: string;
  daysAgo: number;
  mood?: string;
  weather?: string;
  place?: string;
  coords?: [number, number]; // [lng, lat]
  tags?: string[];
};

type SeedJournal = {
  title: string;
  description: string;
  color: string;
  entries: SeedEntry[];
};

const SEED: SeedJournal[] = [
  {
    title: "Spiti Valley Road Trip",
    description: "Two weeks driving the high road from Shimla to Kaza and back over Kunzum La.",
    color: "#b4532a",
    entries: [
      {
        title: "Into the mountains",
        content:
          "Left Shimla before sunrise. The road narrows after Narkanda and the apple orchards give way to pine. Stopped at a dhaba in Rampur for rajma chawal and the best chai of the trip so far.",
        daysAgo: 21,
        mood: "excited",
        weather: "sunny",
        place: "Rampur, Himachal Pradesh",
        coords: [77.6343, 31.4497],
        tags: ["roadtrip", "food"],
      },
      {
        title: "Nako lake at dusk",
        content:
          "Nako is tiny: a lake, a monastery and stone houses stacked on the hillside. Walked the loop around the lake as the light turned gold on the peaks. Village kids challenged us to a cricket match and won easily.",
        daysAgo: 19,
        mood: "calm",
        weather: "windy",
        place: "Nako, Himachal Pradesh",
        coords: [78.6326, 31.8826],
        tags: ["village", "sunset"],
      },
      {
        title: "Key Monastery",
        content:
          "Climbed up to Key Gompa in the morning. A young monk showed us the prayer hall and poured butter tea. The view down to the Spiti river is unreal: a braided silver ribbon in a brown desert.",
        daysAgo: 17,
        mood: "grateful",
        weather: "sunny",
        place: "Key Monastery, Spiti",
        coords: [78.0122, 32.2977],
        tags: ["monastery", "culture"],
      },
      {
        title: "Chandratal under the stars",
        content:
          "Camped near Chandratal. It was well below freezing by 9pm, but the Milky Way was so bright it cast shadows. Didn't sleep much and didn't mind.",
        daysAgo: 15,
        mood: "happy",
        weather: "snowy",
        place: "Chandratal Lake",
        coords: [77.6164, 32.4757],
        tags: ["camping", "stars"],
      },
    ],
  },
  {
    title: "Lisbon Long Weekend",
    description: "Three days of trams, tiles and pastéis de nata.",
    color: "#2f7fa3",
    entries: [
      {
        title: "Getting lost in Alfama",
        content:
          "No map, just stairs. Every corner opens onto a miradouro with terracotta roofs and the river beyond. Heard fado drifting out of a tiny restaurant and stayed for two hours.",
        daysAgo: 60,
        mood: "happy",
        weather: "sunny",
        place: "Alfama, Lisbon",
        coords: [-9.1302, 38.7118],
        tags: ["walking", "music"],
      },
      {
        title: "Belém and the custard tart queue",
        content:
          "The queue at Pastéis de Belém moved faster than expected. Ate three warm from the oven with cinnamon on top, then walked it off along the river to the tower.",
        daysAgo: 59,
        mood: "excited",
        weather: "cloudy",
        place: "Belém, Lisbon",
        coords: [-9.2033, 38.6975],
        tags: ["food"],
      },
      {
        title: "Rainy day in Sintra",
        content:
          "Fog rolled over Pena Palace so we saw it in pieces: a yellow tower here, a tiled wall there. It felt like a fairy tale anyway. Dried off with ginjinha back in the city.",
        daysAgo: 58,
        mood: "calm",
        weather: "rainy",
        place: "Sintra, Portugal",
        coords: [-9.3904, 38.7876],
        tags: ["daytrip", "castles"],
      },
    ],
  },
  {
    title: "Everyday Notes",
    description: "Small moments worth remembering between trips.",
    color: "#3f7d5a",
    entries: [
      {
        title: "First run after the trip",
        content: "Slow 5k along the lake. Legs remembered the altitude even if the lungs didn't.",
        daysAgo: 4,
        mood: "tired",
        weather: "cloudy",
        place: "Bengaluru",
        coords: [77.5946, 12.9716],
        tags: ["running"],
      },
      {
        title: "Planning the next one",
        content:
          "Shortlist: Ladakh in June, or the Kumano Kodo in Japan in autumn. Started a packing list either way.",
        daysAgo: 1,
        mood: "excited",
        tags: ["planning"],
      },
    ],
  },
];

function daysAgo(days: number) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
}

async function seed(userId: unknown) {
  await Promise.all([Journal.deleteMany({ createdBy: userId }), Entry.deleteMany({ authorId: userId })]);

  for (const journal of SEED) {
    const created = await Journal.create({
      title: journal.title,
      description: journal.description,
      color: journal.color,
      createdBy: userId,
    });
    await Entry.insertMany(
      journal.entries.map((e) => ({
        title: e.title,
        content: e.content,
        mood: e.mood,
        weather: e.weather,
        placeName: e.place,
        location: e.coords ? { type: "Point", coordinates: e.coords } : undefined,
        tags: e.tags ?? [],
        entryDate: daysAgo(e.daysAgo),
        journalId: created._id,
        authorId: userId,
      }))
    );
  }

  await User.updateOne({ _id: userId }, { $set: { demoSeededAt: new Date(), demoSeedVersion: SEED_VERSION } });
}

export const demoService = {
  /** Returns the shared demo account, creating it and refreshing its sample data when stale. */
  async ensureDemoUser() {
    let user = await User.findOne({ email: DEMO_EMAIL });

    if (!user) {
      // Nobody logs in with this password; the demo is entered through /api/v2/users/demo.
      const password = await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 10);
      user = await User.create({
        email: DEMO_EMAIL,
        fullName: "Demo Traveller",
        bio: "Exploring Nomad Journal. Sample data resets every few hours.",
        password,
        isVerified: true,
        isDemo: true,
      });
    }

    const seededAt: Date | undefined = user.get("demoSeededAt");
    const stale = !seededAt || Date.now() - seededAt.getTime() > RESEED_AFTER_MS;
    if (stale || user.get("demoSeedVersion") !== SEED_VERSION) {
      await seed(user._id);
    }

    return user;
  },
};

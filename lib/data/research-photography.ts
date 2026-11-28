export type PhotoCredit = {
  author: string;
  sourceUrl: string;
  licenseUrl: string;
};

export type ResearchPhoto = {
  src: string;
  alt: string;
  credit: PhotoCredit;
};

function unsplash(file: string, alt: string, author: string, sourceSlug: string): ResearchPhoto {
  return {
    src: `/images/research/${file}.webp`,
    alt,
    credit: { author, sourceUrl: `https://unsplash.com/photos/${sourceSlug}`, licenseUrl: "https://unsplash.com/license" },
  };
}

export const hostingHeroPhoto = unsplash(
  "hosting-aisle", "A data center with black and white server cabinets beneath overhead cabling",
  "Taylor Vick", "server-room-with-network-cabinets-aWslrFhs1w4",
);

export const comparisonHeroPhoto = unsplash(
  "software-workshop", "Overhead view of people working at a shared table with several laptops and notebooks",
  "Marvin Meyer", "people-sitting-down-near-table-with-assorted-laptop-computers-SYTO3xs06fU",
);

const equipmentRacks = unsplash(
  "equipment-racks", "Closely spaced equipment racks with orange network cables in a server room",
  "Kevin Ache", "a-rack-of-servers-in-a-server-room-2JJ3wBHu4_0",
);

export const hostingCoverPhotos = {
  "vps-comparison": equipmentRacks,
  "publisher-workflow": unsplash(
    "publisher-office", "A laptop and an external monitor on a desk in a bright office",
    "Kevin Bhagat", "laptop-on-desk-edMu3cQKrho",
  ),
  "hosting-migration": unsplash(
    "server-patching", "Rows of network cables and ports inside dark equipment racks",
    "Taylor Vick", "cable-network-M5tzZtFCOfs",
  ),
  "hosting-costs": unsplash(
    "budget-desktop", "A calculator and pen beside blank papers on a desk",
    "Mediamodifier", "black-calculator-beside-black-pen-on-white-printer-paper-I3HPUolh5hA",
  ),
  "application-deployment": unsplash(
    "deployment-desk", "A laptop with source code open on a work desk",
    "Christopher Gower", "a-macbook-with-lines-of-code-on-its-screen-on-a-busy-desk-m_HRfLhgABo",
  ),
  "database-recovery": unsplash(
    "hard-drive", "A bare computer hard drive with its label visible",
    "Glen Carrie", "silver-and-black-hard-disk-drive-NZY3eCGZZEU",
  ),
  "wordpress-store": unsplash(
    "site-operator-desk", "A laptop, electronic equipment, and plants on a white worktable",
    "I'M ZION", "black-laptop-computer-on-white-table-PWCQR0y_Hpc",
  ),
  "hosting-network": unsplash(
    "network-cabling", "Network cables connected to equipment with blue and green status lights",
    "Massimo Botturi", "electronic-wire-lot-zFYUsLk_50Y",
  ),
  "editorial-publishing": unsplash(
    "editorial-desk", "A laptop and a cup of coffee on a wooden desk beside a window",
    "Toa Heftiba", "cup-of-coffee-laptop-computer-and-red-earphones-plugged-in-laptop-on-brown-wooden-table-W6q15ddqqJo",
  ),
  "cloud-location": {
    src: "/images/research/cern-data-centre.webp",
    alt: "Exterior of the CERN Data Centre building in Switzerland",
    credit: {
      author: "Mramoeba",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:CERN_Data_Centre.jpg",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    },
  },
  "page-performance": unsplash(
    "laptop-monitoring", "A laptop display with charts on a reporting dashboard",
    "Stephen Dawson", "turned-on-monitoring-screen-qwtCeJ5cLYs",
  ),
  "hosting-reliability": equipmentRacks,
} satisfies Record<string, ResearchPhoto>;

export type HostingCoverPhoto = keyof typeof hostingCoverPhotos;

export const guideIntro = 'A little home for the clothes you own. Start small, find a look you love, and make Almira feel like you. Every style and clothing category is open to everyone.'
export const guideStatus = 'In this version, wardrobe data stays on your device. Profile cloud saving is being tested, styling uses local combinations, and fashion stories are a labeled preview.'

export const guideSections = [
  {
    id: 'start', title: 'Your first few minutes',
    steps: [
      'Tap Get Started if you see the welcome screen. You can explore your wardrobe without creating an account.',
      'Tap Add item and add a few pieces you already own. A top and a bottom, or a dress, are a useful starting point. A photo is optional.',
      'On Today, tap Style me, choose an occasion and tap Find my looks. Save a combination you like.',
      'Open Settings and tap Set up my style whenever you want to add preferences. Everything in your profile is optional.',
    ],
    note: 'Use the bottom navigation on a phone and the top navigation on desktop: Today, Wardrobe, Outfits, Insights and Settings.',
  },
  {
    id: 'pieces', title: 'Add, find and edit your clothes',
    steps: [
      'Tap Add item, or Add New Item in Wardrobe. Enter a name and choose a category. Add color, occasion, season and purchase price if you want.',
      'Choose a JPEG, PNG or WebP photo under 12 MB, or leave the photo empty. The app makes a smaller copy for your wardrobe.',
      'Tap Add to wardrobe. Find it in Wardrobe using the search box or category filters. When editing a piece, tap Save changes.',
      'Use the heart to mark a favorite, the pencil to edit, and Wore it to record a wear.',
    ],
    note: 'The delete button removes the piece from your wardrobe and saved looks. Export a backup first if you might want it back; there is no undo button yet.',
  },
  {
    id: 'profile', title: 'Make your style profile yours',
    steps: [
      'On Today or in Settings, tap Set up my style. Once a profile is saved, use Edit my style.',
      'In Your style, add styles, favorite brands and what fashion means to you. Fashion Preference is optional: Womenswear, Menswear, Unisex, Mix of all or Prefer not to say.',
      'In Comfort & color, add colors you love or avoid, preferred fits and comfort notes. Separate color and brand names with commas.',
      'In Your everyday, add occasions, region, usual climate and how adventurous you want to be. You can switch personalization off here.',
      'Tap Save my style to keep changes on this device. Closing the sheet or choosing Maybe later discards unsaved changes.',
    ],
    note: 'Quick styling can use recorded colors. Fit, fabric, comfort and coverage are not guaranteed yet. The likes-and-saves learning switch is prepared for the future feed; automatic learning is not running.',
  },
  {
    id: 'memory', title: 'Choose what Almira remembers',
    steps: [
      'Open your style profile and select Your memory.',
      'Write a preference, such as “I prefer relaxed fits for college.” Choose All occasions or a specific occasion, then tap Remember this.',
      'Use Edit and Update memory to change a note. The trash button forgets it; Reset remembered preferences clears the memory list in your draft.',
      'Tap Save my style to apply your changes. Finish or clear a pending memory note before saving.',
    ],
    note: 'You can keep up to 20 confirmed notes. These are preferences you choose, not automatic rules inferred from a click. Local quick styling does not read these notes yet; AI use is being connected.',
  },
  {
    id: 'looks', title: 'Find a look or build your own',
    steps: [
      'For suggestions, open Today → Style me. Choose an occasion, a mood and an optional starting piece, then tap Find my looks.',
      'Tap Save look to keep a suggestion in Outfits. Tap Wore this only when you want to log wearing it.',
      'To make your own, open Outfits, select pieces in Build a look, add a look name and occasion, then tap Save this look.',
      'Saved outfits appear under My Looks. Use Wore this to record a wear, or the trash button to delete the saved look.',
    ],
    note: 'Styling currently uses local rules, not live generative AI. Fewer pieces can mean fewer suggestions. If nothing fits, change the starting piece or review avoided colors. Scheduling and outfit editing are still coming.',
  },
  {
    id: 'insights', title: 'Track wears and rediscover favorites',
    steps: [
      'Use Wore it on a wardrobe piece or Wore this on an outfit after wearing it.',
      'Open Insights to see wardrobe totals, saved looks, logged item wears and category counts.',
      'Look at Ready for a rewear for pieces with fewer logged wears. Its arrow records a wear for that piece.',
    ],
    note: 'Item wears counts each piece: wearing a three-piece outfit adds three item wears. The app relies on what you log; it does not detect what you are wearing automatically.',
  },
  {
    id: 'account', title: 'Accounts and using another device',
    steps: [
      'In Settings, choose Create account for a new Almira account, or Sign in for an existing one. Enter your email and password in the app, and confirm your email when requested.',
      'Guest data and each account’s device data are separate. After signing in, Bring my device wardrobe copies this browser’s guest wardrobe and style into the account’s device copy. The original guest copy stays available.',
      'Save my style saves locally. When signed in, use the separate Save profile to account button to save profile and memories online.',
      'On another device, sign in to the same account and use Load saved profile. If another device changed the cloud profile, load its latest version before saving again.',
      'Export & sign out downloads a backup and clears that account’s wardrobe/profile cache on this device. Keep the downloaded file so you can restore locally stored clothes.',
    ],
    note: 'Cloud profile saving/loading still needs live verification. Clothes, outfits, wear history and photos do not sync automatically yet; use a backup to move them between devices. Public signup and password recovery are still being prepared. If confirmation fails, ask the app owner for help.',
  },
  {
    id: 'backup', title: 'Keep a backup or restore your wardrobe',
    steps: [
      'Go to Settings → Export backup. Keep the downloaded JSON file somewhere you can find it. It contains the current device copy, including clothes, outfits, wear history, profile and memories.',
      'On the destination device, open Settings → Import backup, choose that file and review the replacement confirmation.',
      'Import replaces the current device copy; it does not merge wardrobes or automatically update the cloud profile. Export the destination copy first if you want to keep it.',
    ],
    note: 'Export before clearing browser data, switching browsers or importing another backup. The file can contain your clothing photos and private preferences; keep it private. Older Almira wardrobe backups are also supported.',
  },
  {
    id: 'inspiration', title: 'Explore Today in Style',
    steps: [
      'On Today, tap a story title or illustration to read it. Use See all for the preview collection and its filters.',
      'Tap Wear it with mine to open styling with that story’s inspiration tags. Results use pieces from your wardrobe.',
    ],
    note: 'The current stories are samples with original illustrations, not today’s news or event photos. Live sourced stories, approved photography and post likes/saves are being connected.',
  },
  {
    id: 'help', title: 'When something feels stuck',
    steps: [
      'An empty wardrobe after signing in can mean you are viewing a separate account copy. Use Bring my device wardrobe to copy guest items from this browser, or import your backup.',
      'No search results? Clear the search and choose All pieces. No styling results? Add more pieces, change the starting piece or review avoided colors.',
      'A cloud profile conflict? Export your device copy if you want to keep its edits, then Load saved profile and make the changes again.',
      'A message says changes could not save? Export a backup before closing the page. Check that your browser allows site storage.',
      'On a phone, use your browser’s Add to Home Screen or Install option if it is available. Accounts and cloud requests need a connection; a fully verified offline experience is still being prepared.',
    ],
    note: 'When reporting a problem, share the action you tried and the error message. Keep passwords and API keys out of screenshots.',
  },
] as const

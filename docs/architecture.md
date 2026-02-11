```TEXT
DataForge/
├── .github/
│   └── workflows/          # GitHub Actions for Auto-deploy
├── docs/                   # Detailed documentation
│   ├── architecture.md
│   └── custom-blueprints.md
├── public/                 # Static assets (logo, etc.)
├── src/
│   ├── assets/             # Images/Styles
│   ├── components/         # Small UI pieces (Buttons, Inputs)
│   ├── core/               # THE BRAIN: Logic to parse blueprints
│   │   ├── generator.js    # Function that loops through schemas
│   │   └── faker-bridge.js # Mapping strings to Faker methods
│   ├── modules/            # UI Sections (Sidebar, Editor, Previewer)
│   ├── store/              # State management (Zustand or Context)
│   │   └── blueprintStore.js
│   ├── App.jsx
│   └── main.jsx
├── .gitignore
├── Dockerfile              # For local testing
├── docker-compose.yml      # For easy "one-command" startup
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```
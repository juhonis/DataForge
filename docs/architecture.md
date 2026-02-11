```TEXT
DataForge/
├── application/             # All React/Vite/Tailwind code
│   ├── src/
│   │   ├── components/      # UI primitives (Buttons, Inputs)
│   │   ├── core/            # The logic engine
│   │   ├── modules/         # High-level features (Editor, Preview)
│   │   └── store/           # State management
│   ├── package.json
│   ├── vite.config.js
│   └── ... (other Vite files)
├── docs/                    # Architecture and User Guides
├── .github/                 # Workflows (updated to point to /application)
├── Dockerfile               # Updated to build from /application
├── docker-compose.yml       # Orchestrates the container
├── LICENSE
└── README.md
```
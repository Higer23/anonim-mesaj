# anonim-mesaj

An anonymous message web app built with Next.js (App Router), React and Supabase.

## Tech Stack

- Next.js 16, React 19
- Supabase (`@supabase/supabase-js`) for data storage
- Framer Motion for animations, Tailwind CSS for styling

## Getting Started

```bash
git clone https://github.com/Higer23/anonim-mesaj.git
cd anonim-mesaj
npm install
```

Create a `.env.local` file with your Supabase project credentials (use your own values):

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Start the development server:

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Scripts

| Command         | Description                 |
| --------------- | --------------------------- |
| `npm run dev`   | Start the development server |
| `npm run build` | Create a production build    |
| `npm start`     | Run the production build     |
| `npm run lint`  | Run ESLint                   |

## License

No license has been specified yet.

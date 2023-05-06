# WebGIS-DATN
install node > v16.7
python 3.10
install virtualenv for python library, modules (create virtualenv inside folder backend with command: python -m venv env)
how to run nuxt-frontend
go to frontend folder, run command: npm run dev

how to run nuxt-app:
Nuxt project is created with v3 template. Next steps:
 › cd app
 › Install dependencies with npm install or yarn install or pnpm install
 › Start development server with npm run dev or yarn dev or pnpm run dev

 How to host express server:
  generate a prisma client: npx prisma generate
  yarn start:rest  (it will run on port 3000 by default)
  if you want to access to prisma database, run: npx prisma studio
  migrate: npx  prisma migrate dev (--create-only, -skip-generate)
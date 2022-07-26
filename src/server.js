import "dotenv/config";
import { getApp } from "@spotify/lighthouse-audit-service";
import pkg from "pg";
import passport from "passport";
import { Strategy as BearerStrategy } from "passport-http-bearer";
import { findUserByToken } from "./users.js";

let pgConf = {
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
  host: process.env.PGHOST,
};
if (process.env.DATABASE_URL) {
  pgConf.ssl = true;
}
const { Pool } = pkg;
const conn = new Pool(pgConf);

passport.use(
  new BearerStrategy(function (token, done) {
    findUserByToken(token, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false);
      }
      return done(null, user, { scope: "all" });
    });
  })
);

const lasApp = await getApp({}, conn);

lasApp.use(passport.authenticate("bearer", { session: false }));

lasApp.listen(process.env.LAS_PORT, () => {
  console.log(`Lightouse agent listening on port ${process.env.LAS_PORT}`);
});
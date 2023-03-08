#!/usr/bin/env ts-node

import * as cheerio from "cheerio";
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { readdir, readFile, symlink, unlink, writeFile } from "fs/promises";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

(async () => {
  const argv = await yargs(hideBin(process.argv))
    .option("command", {
      alias: ["c", "cmd"],
      type: "string",
    })
    .parseAsync();

  if (existsSync("/www")) {
    await unlink("/www");
  }

  const buildDir = path.join("/builds", process.env["BUILD"] ?? "production");
  await symlink(buildDir, "/www", "dir");

  const configPath = path.join("/configs", process.env["CONFIG"] ?? "config.json");
  const config = await readFile(configPath, { encoding: "utf-8" });

  const indexPath = path.join(buildDir, "index.html");

  console.info("Starting Web App");
  console.info("build:", buildDir);
  console.info("index:", indexPath);

  const $ = cheerio.load(await readFile(indexPath, { encoding: "utf-8" }));
  const head = $("html > head");
  let scriptTag = head.find('> script[id="config"][type="application/json"]');
  if (!scriptTag.length) {
    scriptTag = $(`<script id="config" type="application/json"></script>`) as cheerio.Cheerio<cheerio.Element>;
    head.append(scriptTag);
  }
  scriptTag.text(config);

  const modIndexSrc = $.html();

  console.info("Modified", indexPath);
  console.info(modIndexSrc);
  console.info();
  console.info(await readdir("/www"));

  writeFile(indexPath, modIndexSrc, { encoding: "utf-8" });

  console.info(await readFile(indexPath, { encoding: "utf-8" }));

  spawnSync(`/docker-entrypoint.sh ${argv.command!}`, { shell: true, stdio: "inherit" });
})();

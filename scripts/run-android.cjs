const { execFileSync, spawn, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const MIN_JAVA = 17;
const MAX_JAVA = 23; // Gradle 8.14 supports up to Java 23 (prefers 17 or 21)

function getJavaMajorVersion(javaHome) {
  const javaBin = javaHome
    ? path.join(
        javaHome,
        "bin",
        process.platform === "win32" ? "java.exe" : "java",
      )
    : "java";

  if (javaHome && !fs.existsSync(javaBin)) return null;

  const res = spawnSync(javaBin, ["-version"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return parseVersionOutput(`${res.stdout || ""}\n${res.stderr || ""}`);
}

function parseVersionOutput(text) {
  const match = text.match(/version\s+"(\d+)(?:\.(\d+))?/i);
  if (!match) return null;
  const major = Number(match[1]);
  return major === 1 ? Number(match[2]) : major;
}

function isSupported(major) {
  return typeof major === "number" && major >= MIN_JAVA && major <= MAX_JAVA;
}

function findMacJavaHome(version) {
  try {
    const out = execFileSync("/usr/libexec/java_home", ["-v", String(version)], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (out && fs.existsSync(out)) return out;
  } catch {
    // Ignore if not found
  }
  return null;
}

function resolveCompatibleJavaHome() {
  // 1. Respect existing JAVA_HOME or PATH java if it's already compatible (17..23)
  if (process.env.JAVA_HOME) {
    const currentHomeVer = getJavaMajorVersion(process.env.JAVA_HOME);
    if (isSupported(currentHomeVer)) return process.env.JAVA_HOME;
  } else {
    const pathJavaVer = getJavaMajorVersion(null);
    if (isSupported(pathJavaVer)) return null;
  }

  const candidates = [];

  if (process.platform === "darwin") {
    for (const v of [21, 17, 22, 23]) {
      const found = findMacJavaHome(v);
      if (found) candidates.push(found);
    }
    candidates.push(
      "/Applications/Android Studio.app/Contents/jbr/Contents/Home",
      path.join(
        os.homedir(),
        "Applications/Android Studio.app/Contents/jbr/Contents/Home",
      ),
      "/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home",
      "/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home",
      "/usr/local/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home",
      "/usr/local/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home",
    );
  } else if (process.platform === "win32") {
    const programFiles = process.env.ProgramFiles || "C:\\Program Files";
    const localAppData = process.env.LOCALAPPDATA || "";
    candidates.push(
      path.join(programFiles, "Android", "Android Studio", "jbr"),
      path.join(localAppData, "Programs", "Android Studio", "jbr"),
    );
  } else {
    candidates.push(
      "/opt/android-studio/jbr",
      "/usr/local/android-studio/jbr",
      "/snap/android-studio/current/jbr",
      "/usr/lib/jvm/java-21-openjdk-amd64",
      "/usr/lib/jvm/java-17-openjdk-amd64",
    );
  }

  for (const candidate of candidates) {
    const ver = getJavaMajorVersion(candidate);
    if (isSupported(ver)) {
      return candidate;
    }
  }

  return null;
}

const env = { ...process.env };
const resolvedJavaHome = resolveCompatibleJavaHome();

if (resolvedJavaHome) {
  env.JAVA_HOME = resolvedJavaHome;
  const binDir = path.join(resolvedJavaHome, "bin");
  env.PATH = `${binDir}${path.delimiter}${env.PATH || ""}`;
  console.log(`› Using compatible JDK at: ${resolvedJavaHome}`);
}

const expoArgs = ["expo", "run:android", ...process.argv.slice(2)];
const child = spawn("npx", expoArgs, {
  stdio: "inherit",
  env,
  shell: process.platform === "win32",
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

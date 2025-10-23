// scripts/ts-check.js
// Scans src/**/*.{ts,tsx} and uses tsconfig.json compilerOptions (so JSX settings are respected).

const ts = require("typescript")
const glob = require("glob")
const path = require("path")

// 1) Collect files under /src
const files = glob.sync("src/**/*.{ts,tsx}", { absolute: true })

if (files.length === 0) {
  console.log("No TypeScript files found under /src.")
  process.exit(0)
}

// 2) Try to find and parse tsconfig.json to reuse compilerOptions (important for JSX)
let compilerOptions = {}
const configPath = ts.findConfigFile(
  process.cwd(),
  ts.sys.fileExists,
  "tsconfig.json"
)

if (configPath) {
  const parsed = ts.getParsedCommandLineOfConfigFile(configPath, {}, ts.sys)
  if (parsed && parsed.options) {
    compilerOptions = parsed.options
  } else {
    console.warn(
      "Warning: Couldn't fully parse tsconfig.json — falling back to defaults."
    )
  }
} else {
  console.warn("Warning: No tsconfig.json found. Using sensible defaults.")
}

// 3) Ensure we don't emit and skip noisy lib checks
compilerOptions = Object.assign({}, compilerOptions, {
  noEmit: true,
  skipLibCheck: true,
})

// 4) Create program with the explicit file list (so we ignore tsconfig includes/excludes)
const program = ts.createProgram(files, compilerOptions)

// 5) Collect diagnostics
const diagnostics = ts.getPreEmitDiagnostics(program)

if (diagnostics.length === 0) {
  console.log(`✅ No TypeScript errors found in ${files.length} files.`)
  process.exit(0)
}

// 6) Print diagnostics in "file:line:col - error TS..." form and collect stats
let errorCount = 0
const filesWithErrors = new Set()

diagnostics.forEach((diag) => {
  if (diag.file) {
    const { line, character } = diag.file.getLineAndCharacterOfPosition(
      diag.start
    )
    const message = ts.flattenDiagnosticMessageText(diag.messageText, "\n")
    const relativeFile = path.relative(process.cwd(), diag.file.fileName)

    console.log(
      `${relativeFile}:${line + 1}:${character + 1} - error TS${diag.code}: ${message}`
    )

    errorCount++
    filesWithErrors.add(relativeFile)
  } else {
    // global/unbound diagnostic
    console.log(
      `error TS${diag.code}: ${ts.flattenDiagnosticMessageText(diag.messageText, "\n")}`
    )
    errorCount++
  }
})

// 7) Summary
console.log("\n--- TypeScript Check Summary ---")
console.log(`Scanned files:      ${files.length}`)
console.log(`Files with errors:  ${filesWithErrors.size}`)
console.log(`Total errors:       ${errorCount}`)

process.exit(0)
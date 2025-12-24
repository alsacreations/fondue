/**
 * main.js - Variable Font Subsetter Logic
 */

import opentype from "opentype.js"

// --- State ---
let fontBuffer = null
let fontFileName = "custom-font.ttf"
let fontObj = null // OpenType.js font object
let axes = {}

// --- DOM Elements ---
const dropZone = document.getElementById("drop-zone")
const fileInput = document.getElementById("font-upload")
const fontInfoSection = document.getElementById("font-info-section")
const fontInfo = document.getElementById("font-info")
const axesContainer = document.getElementById("axes-container")
const previewText = document.getElementById("preview-text")
const previewSize = document.getElementById("preview-size")
const appWorkspace = document.getElementById("app-workspace")
const generateBtn = document.getElementById("btn-generate")
const exportStatus = document.getElementById("export-status")
const loadExampleBtn = document.getElementById("btn-load-example")

// --- Initialization ---
function init() {
  setupDragDrop()
  setupPreviewControls()
  setupExampleLoader()
}

function setupExampleLoader() {
  if (!loadExampleBtn) return
  loadExampleBtn.addEventListener("click", async () => {
    try {
      // Show loading state if needed, or just fetch
      const response = await fetch("fonts/Roboto-VariableFont_wdth,wght.ttf")
      if (!response.ok)
        throw new Error("Impossible de charger la police d'exemple")
      const buffer = await response.arrayBuffer()
      await loadFontBuffer(buffer, "Roboto-VariableFont_wdth,wght.ttf")
    } catch (error) {
      console.error("Erreur chargement exemple:", error)
      alert("Erreur lors du chargement de l'exemple Roboto.")
    }
  })
}

// --- Font Loading Logic ---
async function loadFontBuffer(buffer, name) {
  try {
    fontBuffer = buffer
    fontFileName = name

    // Parse with OpenType.js
    fontObj = opentype.parse(buffer)
    console.log("Font loaded:", fontObj)

    // Extract comprehensive metadata
    const fontName =
      fontObj.names.fullName?.en || fontObj.names.fontFamily?.en || name
    const fontFamily = fontObj.names.fontFamily?.en || "Unknown"
    const manufacturer = fontObj.names.manufacturer?.en || "Unknown"
    const designer = fontObj.names.designer?.en || "Unknown"

    // File info
    const fileSizeKB = Math.round(buffer.byteLength / 1024)
    const fileFormat = name.split(".").pop().toUpperCase()

    // Variable font detection
    const fvar = fontObj.tables.fvar
    const isVariableFont = fvar && fvar.axes && fvar.axes.length > 0
    const axesCount = isVariableFont ? fvar.axes.length : 0

    // Character and glyph counts
    const glyphCount = fontObj.numGlyphs
    // Count actual characters (glyphs with unicode values)
    let charCount = 0
    for (let i = 0; i < fontObj.numGlyphs; i++) {
      const glyph = fontObj.glyphs.get(i)
      if (glyph.unicode !== undefined) {
        charCount++
      }
    }

    // Update UI with detailed info
    fontInfo.innerHTML = `
      <dl class="font-info-list">
        <div class="font-info-item">
          <dt>Nom</dt>
          <dd><strong>${fontName}</strong></dd>
        </div>
        <div class="font-info-item">
          <dt>Fonte Variable</dt>
          <dd>${isVariableFont ? `Oui (${axesCount} axe${axesCount > 1 ? "s" : ""})` : "Non"}</dd>
        </div>
        <div class="font-info-item">
          <dt>Poids</dt>
          <dd>${fileSizeKB} KB</dd>
        </div>
        <div class="font-info-item">
          <dt>Format</dt>
          <dd>${fileFormat}</dd>
        </div>
        <div class="font-info-item">
          <dt>Caractères</dt>
          <dd>${charCount}</dd>
        </div>
        <div class="font-info-item">
          <dt>Manufacturer</dt>
          <dd>${manufacturer}</dd>
        </div>
      </dl>
    `
    fontInfoSection.classList.remove("hidden-aria")
    fontInfoSection.removeAttribute("aria-hidden")
    appWorkspace.classList.remove("hidden-aria")
    appWorkspace.removeAttribute("aria-hidden")

    // Generate and display @font-face CSS immediately
    generateFontFaceCSS()

    // Extract Axes
    renderAxes()

    // Setup Preview
    updatePreviewFont()

    // Initial stats update
    updateStats()
  } catch (err) {
    console.error(err)
    fontInfo.innerHTML = `<p class="text-error">Erreur lors du chargement de la police : ${err.message}</p>`
  }
}

// --- Drag & Drop ---
function setupDragDrop() {
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault()
    dropZone.classList.add("drag-over")
  })

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("drag-over")
  })

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault()
    dropZone.classList.remove("drag-over")
    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
  })

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0]
    handleFileSelect(file)
  })
}

function handleFileSelect(file) {
  if (!file) return

  // Check extension
  const ext = file.name.split(".").pop().toLowerCase()
  if (!["ttf", "otf", "woff", "woff2"].includes(ext)) {
    alert("Format non supporté. Veuillez utiliser .ttf, .otf, .woff ou .woff2.")
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    loadFontBuffer(e.target.result, file.name)
  }
  reader.readAsArrayBuffer(file)
}

// --- Axes & Preview ---
function renderAxes() {
  axesContainer.innerHTML = ""
  axes = {}

  // Get axes from fvar table if available
  const fvar = fontObj.tables.fvar
  if (!fvar || !fvar.axes || fvar.axes.length === 0) {
    axesContainer.innerHTML =
      '<p class="text-s color-dim">Aucun axe de variation détecté (la police n\'est pas variable).</p>'
    return
  }

  // Create CSS rule display container
  const cssRuleContainer = document.createElement("div")
  cssRuleContainer.className = "css-rule-display"
  cssRuleContainer.id = "css-rule-display"

  // Initial CSS rule
  const initialSettings = fvar.axes
    .map((axis) => `"${axis.tag}" ${axis.defaultValue}`)
    .join(", ")

  cssRuleContainer.innerHTML = `
    <code class="css-rule">font-variation-settings: ${initialSettings};</code>
  `

  axesContainer.appendChild(cssRuleContainer)

  // Create container for axis controls
  const controlsContainer = document.createElement("div")
  controlsContainer.className = "axis-control-container"

  fvar.axes.forEach((axis) => {
    axes[axis.tag] = axis.defaultValue // Init state

    const wrapper = document.createElement("div")
    wrapper.className = "axis-control"

    const labelRow = document.createElement("div")
    labelRow.className = "axis-label"
    labelRow.innerHTML = `<span><strong class="axis-name">${axis.tag}</strong> (${axis.name.en || axis.tag})</span> <span id="val-${axis.tag}">${axis.defaultValue}</span>`

    const slider = document.createElement("input")
    slider.type = "range"
    slider.min = axis.minValue
    slider.max = axis.maxValue
    slider.value = axis.defaultValue
    slider.step = axis.maxValue - axis.minValue > 100 ? 1 : 0.1
    slider.className = "width-100"

    slider.oninput = (e) => {
      const val = parseFloat(e.target.value)
      axes[axis.tag] = val
      document.getElementById(`val-${axis.tag}`).textContent = val
      updatePreviewFont()
      updateCSSRule()
    }

    wrapper.appendChild(labelRow)
    wrapper.appendChild(slider)
    controlsContainer.appendChild(wrapper)
  })

  axesContainer.appendChild(controlsContainer)
}

function updatePreviewFont() {
  if (!fontObj) return

  // Construct variation settings string
  // CSS format: "wght" 700, "wdth" 100
  const variationSettings = Object.entries(axes)
    .map(([tag, val]) => `"${tag}" ${val}`)
    .join(", ")

  // Create a Font Face API object to preview directly
  // Or simpler: convert buffer to base64 and set as @font-face
  // Blobs are better for memory
  const blob = new Blob([fontBuffer])
  const url = URL.createObjectURL(blob)
  const fontFace = new FontFace("PreviewFont", `url(${url})`)

  fontFace.load().then((loadedFace) => {
    document.fonts.add(loadedFace)
    previewText.style.fontFamily = "PreviewFont"
    previewText.style.fontVariationSettings = variationSettings
  })
}

function updateCSSRule() {
  const cssRuleDisplay = document.getElementById("css-rule-display")
  if (!cssRuleDisplay) return

  const variationSettings = Object.entries(axes)
    .map(([tag, val]) => `"${tag}" ${val}`)
    .join(", ")

  cssRuleDisplay.innerHTML = `
    <code class="css-rule">font-variation-settings: ${variationSettings};</code>
  `
}

function generateFontFaceCSS() {
  const container = document.getElementById("font-face-css-container")
  const codeElement = document.getElementById("font-face-css-code")
  const preloadElement = document.getElementById("preload-html-code")

  if (!container || !codeElement || !fontObj) return

  // Generate @font-face CSS for the optimized WOFF2 file
  const fontFamily = fontObj.names.fontFamily?.en || "CustomFont"
  const sanitizedFileName = fontFileName.replace(/\s+/g, "-").toLowerCase()
  const baseName = sanitizedFileName.replace(/\.(ttf|otf|woff|woff2)$/i, "")

  // Check if variable font
  const fvar = fontObj.tables.fvar
  const isVariableFont = fvar && fvar.axes && fvar.axes.length > 0

  let fontFaceCSS = ""

  if (isVariableFont) {
    // Get weight range from wght axis if available
    const wghtAxis = fvar.axes.find((axis) => axis.tag === "wght")
    const weightRange = wghtAxis
      ? `${Math.round(wghtAxis.minValue)} ${Math.round(wghtAxis.maxValue)}`
      : "100 900"

    fontFaceCSS = `@font-face {
  font-family: "${fontFamily} Variable";
  src: url("assets/fonts/subset-${baseName}.woff2") format("woff2") tech("variations"), url("assets/fonts/subset-${baseName}.woff2") format("woff2-variations");
  font-weight: ${weightRange};
  font-display: swap;
}`
  } else {
    // Get font weight from OS/2 table
    const os2Table = fontObj.tables.os2
    const fontWeight = os2Table?.usWeightClass || 400

    // Get font style
    const isItalic =
      fontObj.names.fontSubfamily?.en?.toLowerCase().includes("italic") || false
    const fontStyle = isItalic ? "italic" : "normal"

    fontFaceCSS = `@font-face {
  font-family: "${fontFamily}";
  src: url("assets/fonts/subset-${baseName}.woff2") format("woff2");
  font-weight: ${fontWeight};
  font-style: ${fontStyle};
  font-display: swap;
}`
  }

  // Generate Preload HTML
  const preloadHTML = `<link rel="preload" href="assets/fonts/subset-${baseName}.woff2" as="font" type="font/woff2" crossorigin="anonymous" />`

  // Display the CSS code
  codeElement.textContent = fontFaceCSS
  if (preloadElement) {
    preloadElement.textContent = preloadHTML
  }
  container.style.display = "block"
}

function setupPreviewControls() {
  previewSize.addEventListener("input", (e) => {
    previewText.style.fontSize = e.target.value + "px"
  })
}

// --- Subsetting Logic ---

let hbSubsetExports = null

async function loadHarfbuzzSubset() {
  if (hbSubsetExports) return hbSubsetExports
  // In Vite, files in 'public' are served at the root.
  // With base: '/caractere/', we should use a relative path or the full base path.
  // 'vendors/...' works if we are at the root of the app.
  // Using import.meta.env.BASE_URL ensures the path is correct regardless of deployment path.
  const response = await fetch(
    import.meta.env.BASE_URL + "vendors/hb-subset.wasm",
  )
  const result = await WebAssembly.instantiateStreaming(response)
  hbSubsetExports = result.instance.exports
  return hbSubsetExports
}

// Unicode Ranges Definitions
const UNICODE_RANGES = {
  latin: { name: "Latin Basic", range: [0x0020, 0x007f] },
  "latin-1-supp": { name: "Latin-1 Supplement", range: [0x0080, 0x00ff] },
  "latin-ext-a": { name: "Latin Extended-A", range: [0x0100, 0x017f] },
  "latin-ext-b": { name: "Latin Extended-B", range: [0x0180, 0x024f] },
  punctuation: { name: "Punctuation", range: [0x2000, 0x206f] },
  currency: { name: "Currency Symbols", range: [0x20a0, 0x20cf] },
}

function renderUnicodeCheckboxes() {
  const container = document.getElementById("unicode-ranges")
  container.innerHTML = ""

  Object.entries(UNICODE_RANGES).forEach(([key, data]) => {
    const label = document.createElement("label")
    label.className = "checkbox-card"
    const checked = ["latin", "latin-1-supp"].includes(key) ? "checked" : ""
    label.innerHTML = `
            <input type="checkbox" name="subset" value="${key}" ${checked}>
            <span>${data.name}</span>
        `
    container.appendChild(label)
  })

  // Add event listeners for live updates
  const checkboxes = container.querySelectorAll('input[name="subset"]')
  checkboxes.forEach((cb) => {
    cb.addEventListener("change", updateStats)
  })
}

async function runHarfbuzzSubsetting(buffer, ranges) {
  const exports = await loadHarfbuzzSubset()

  // Allocate memory for font in WASM memory
  const heapu8 = new Uint8Array(exports.memory.buffer)
  const fontPtr = exports.malloc(buffer.byteLength)
  heapu8.set(new Uint8Array(buffer), fontPtr)

  // Create Face
  const blob = exports.hb_blob_create(
    fontPtr,
    buffer.byteLength,
    2 /*HB_MEMORY_MODE_WRITABLE*/,
    0,
    0,
  )
  const face = exports.hb_face_create(blob, 0)
  exports.hb_blob_destroy(blob)

  // Collect unicodes
  let startUnicodes = []

  ranges.forEach((key) => {
    const data = UNICODE_RANGES[key]
    if (data) {
      for (let i = data.range[0]; i <= data.range[1]; i++) {
        startUnicodes.push(i)
      }
    }
  })

  if (startUnicodes.length === 0) {
    exports.hb_face_destroy(face)
    exports.free(fontPtr)
    throw new Error("Aucun caractère sélectionné.")
  }

  // Prepare Subset Input
  const input = exports.hb_subset_input_create_or_fail()
  const unicode_set = exports.hb_subset_input_unicode_set(input)

  // Add unicodes to set
  startUnicodes.forEach((cp) => {
    exports.hb_set_add(unicode_set, cp)
  })

  // Do Subsetting
  const subset = exports.hb_subset_or_fail(face, input)

  // Clean up input
  exports.hb_subset_input_destroy(input)

  if (!subset) {
    exports.hb_face_destroy(face)
    exports.free(fontPtr)
    throw new Error(
      "Echec critique du subsetting (hb_subset_or_fail returned null).",
    )
  }

  // Get result blob
  const resultBlob = exports.hb_face_reference_blob(subset)
  const offset = exports.hb_blob_get_data(resultBlob, 0)
  const subsetByteLength = exports.hb_blob_get_length(resultBlob)

  if (subsetByteLength === 0) {
    exports.hb_blob_destroy(resultBlob)
    exports.hb_face_destroy(subset)
    exports.hb_face_destroy(face)
    exports.free(fontPtr)
    throw new Error("Echec de la création du subset (taille 0).")
  }

  // Copy output data
  const resultView = new Uint8Array(
    exports.memory.buffer,
    offset,
    subsetByteLength,
  )
  const subsetBuffer = new Uint8Array(resultView) // Copy it out to safe JS array

  // Cleanup everything
  exports.hb_blob_destroy(resultBlob)
  exports.hb_face_destroy(subset)
  exports.hb_face_destroy(face)
  exports.free(fontPtr)

  return subsetBuffer
}

async function updateStats() {
  if (!fontBuffer) return
  const statsContainer = document.getElementById("subset-stats")
  statsContainer.classList.remove("hidden")
  statsContainer.innerHTML =
    '<p class="text-s color-dim">Calcul de l\'estimation...</p>'

  try {
    const checkboxes = document.querySelectorAll('input[name="subset"]:checked')
    const ranges = Array.from(checkboxes).map((cb) => cb.value)

    const subsetBuffer = await runHarfbuzzSubsetting(fontBuffer, ranges)

    const originalSize = fontBuffer.byteLength
    const subsetSize = subsetBuffer.byteLength
    // Estimation WOFF2 (~50% du TTF)
    const estimatedWoff2Size = Math.round(subsetSize * 0.5)
    const savedBytes = originalSize - estimatedWoff2Size
    const savedPercent = Math.round((savedBytes / originalSize) * 100)

    const formatSize = (bytes) => {
      if (bytes < 1024) return bytes + " B"
      return (bytes / 1024).toFixed(1) + " KB"
    }

    statsContainer.innerHTML = `
            <div class="stats-card">
                <h4 class="title-s">Estimation du gain</h4>
                <ul class="stats-list" role="list">
                    <li>Original : <strong>${formatSize(originalSize)}</strong></li>
                    <li>Subset (TTF) : <strong>${formatSize(subsetSize)}</strong></li>
                    <li>Estimation WOFF2 : <strong>${formatSize(estimatedWoff2Size)}</strong></li>
                    <li style="color: var(--color-success);">Gain : <strong>${savedPercent}%</strong></li>
                </ul>
            </div>
        `
  } catch (err) {
    // If no chars selected, just clear or show info
    if (err.message === "Aucun caractère sélectionné.") {
      statsContainer.innerHTML =
        '<p class="text-s color-dim">Sélectionnez des plages pour voir l\'estimation.</p>'
    } else {
      statsContainer.innerHTML = `<p class="text-error text-s">Erreur d'estimation: ${err.message}</p>`
    }
  }
}

async function generateSubset() {
  if (!fontBuffer) return

  generateBtn.disabled = true
  exportStatus.classList.remove("hidden")
  exportStatus.innerHTML = "Génération du subset..."

  try {
    const checkboxes = document.querySelectorAll('input[name="subset"]:checked')
    const ranges = Array.from(checkboxes).map((cb) => cb.value)

    const subsetBuffer = await runHarfbuzzSubsetting(fontBuffer, ranges)

    // Display success message
    exportStatus.innerHTML = `<p class="text-success">✓ Subset créé avec succès ! Téléchargement en cours...</p>`

    // Trigger download
    triggerDownload(subsetBuffer.buffer, `subset-${fontFileName}`)

    // Update message after download
    exportStatus.innerHTML = `<p class="text-success">✓ Fichier téléchargé avec succès !</p>`
  } catch (err) {
    console.error(err)
    exportStatus.innerHTML = `<span class="text-error">Erreur: ${err.message}</span>`
  } finally {
    generateBtn.disabled = false
  }
}

function triggerDownload(buffer, filename) {
  const blob = new Blob([buffer], { type: "font/ttf" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// --- Initialize ---
window.addEventListener("DOMContentLoaded", () => {
  init()
  renderUnicodeCheckboxes()
  generateBtn.addEventListener("click", generateSubset)
})

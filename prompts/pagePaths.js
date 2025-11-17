const routeMapping = [
  {
    mockuiFile: 'reference/redesign/mockui-landing-page.html',
    pagePath: 'src/app/page.tsx',
    relevantAPIs: ['GET /api/animals?q={query}&page={page}'],
    url: 'http://localhost:3000/',
    verified: true,
    notes: 'close visually, needs header bar logo, and spacing tweaks ',
  },
  {
    mockuiFile: 'reference/redesign/mockui-customer-detail.html',
    pagePath: 'src/app/customer/[id]/page.tsx',
    relevantAPIs: [
      'GET /api/customers/[id]',
      'PUT /api/customers/[id]',
      'DELETE /api/customers/[id]',
    ],
    url: 'http://localhost:3000/customer/5947',
    verified: true,
    notes: 'many visual differences including header bar logo etc.',
  },
  {
    mockuiFile: 'reference/redesign/mockui-add-customer.html',
    pagePath: 'src/app/customers/add/page.tsx',
    relevantAPIs: ['POST /api/customers'],
    url: 'http://localhost:3000/customers/add',
    verified: true,
    notes:
      'visually superior to mockui but needs header logo  and the bread brumbs are in the wrong spot.',
  },
  {
    mockuiFile: 'none',
    pagePath: 'src/app/customer/[id]/animals/page.tsx',
    relevantAPIs: [
      'GET /api/customers/[id]/animals',
      '<!--Suspect DELETE /api/animals/[id] is not relevant to this page-->',
    ],
    url: 'http://localhost:3000/customer/5947/animals',
    verified: false,
    notes:
      'I do not think this page is necessary, i think only an api endoint to api/customer/[id]/animals is necessary. This page is not in the mockui files, and the api endpoint is not in the relevantAPIs list.',
  },
  {
    mockuiFile: 'reference/redesign/mockui-add-animal.html',
    pagePath: 'src/app/customer/[id]/newAnimal/page.tsx',
    relevantAPIs: [
      'GET /api/customers/[id]',
      'GET /api/breeds',
      'POST /api/animals',
    ],
    url: 'http://localhost:3000/customer/5947/newAnimal',
    verified: true,
    notes: 'has header bar minus logo, has the input fields, looks terrible',
  },
  {
    mockuiFile: 'reference/redesign/mockui-animal-detail.html',
    pagePath: 'src/app/animals/[id]/page.tsx',
    relevantAPIs: [
      'GET /api/animals/[id]',
      'PUT /api/animals/[id]',
      'DELETE /api/animals/[id]',
      'GET /api/breeds',
      'POST /api/animals/[id]/notes',
      'DELETE /api/notes/[noteId]',
    ],
    url: 'http://localhost:3000/animals/10759',
    verified: true,
    notes: 'no visual styling what so ever, no header bar',
  },
  {
    mockuiFile: 'reference/redesign/mockui-service-history.html',
    pagePath: 'src/app/animals/[id]/notes/page.tsx',
    relevantAPIs: ['GET /api/animals/[id]/notes', 'GET /api/animals/[id]'],
    url: 'http://localhost:3000/animals/10759/notes',
    verified: false,
    notes: 'The url gives a 404 error.',
  },
  {
    mockuiFile: 'reference/redesign/breed_management_modern.html',
    pagePath: 'src/app/breeds/page.tsx',
    relevantAPIs: [
      'GET /api/breeds',
      'POST /api/breeds',
      'PUT /api/breeds/[id]',
      'DELETE /api/breeds/[id]',
    ],
    url: 'http://localhost:3000/breeds',
    verified: true,
    notes: 'no visual styling what so ever, no header bar',
  },
  {
    mockuiFile: 'reference/redesign/mockui-customer-history.html',
    pagePath: 'src/app/customers/history/page.tsx',
    relevantAPIs: ['GET /api/customers/history?months={12|24|36}&q={query}'],
    url: 'http://localhost:3000/customers/history',
    verified: true,
    notes: 'no visual styling what so ever, no header bar',
  },
  {
    mockuiFile: 'reference/redesign/mockui-daily-totals.html',
    pagePath: 'src/app/reports/daily-totals/page.tsx',
    relevantAPIs: [
      'GET /api/reports/daily-totals?startDate={date}&endDate={date}',
    ],
    url: 'http://localhost:3000/reports/daily-totals',
    verified: true,
    notes: 'no visual styling what so ever, no header bar',
  },
  {
    mockuiFile: 'none',
    pagePath: 'src/app/admin/backup/page.tsx',
    relevantAPIs: ['GET /api/admin/backup'],
    url: 'http://localhost:3000/admin/backup',
    verified: true,
    notes: 'no visual styling what so ever, no header bar',
  },
]

const fs = require('fs')
const path = require('path')

// Find all template variables in a string
function findTemplateVars(template) {
  const varPattern = /\$\{(\w+)\}/g
  const matches = []
  let match
  while ((match = varPattern.exec(template)) !== null) {
    if (!matches.includes(match[1])) {
      matches.push(match[1])
    }
  }
  return matches
}

// Convert pagePath to filename
// Example: src/app/customer/[id]/page.tsx -> src---app---customer---___id___---page.tsx.md
function pagePathToFilename(pagePath) {
  return (
    pagePath.replace(/\//g, '---').replace(/\[/g, '___').replace(/\]/g, '___') +
    '.md'
  )
}

// Load the template
const templatePath = path.join(__dirname, 'pagePaths_template.md')
const template = fs.readFileSync(templatePath, 'utf-8')

// Find all variables in the template
const templateVars = findTemplateVars(template)
console.log(
  `\nFound ${templateVars.length} template variables: ${templateVars.join(', ')}`
)

// Generate prompts and save to files
function generateAndSavePrompts() {
  const outputDir = __dirname
  let successCount = 0
  let errorCount = 0

  console.log(`\nGenerating prompts for ${routeMapping.length} routes...\n`)

  routeMapping.forEach((route, index) => {
    try {
      let prompt = template

      // Validate that all required variables are present in the route
      const missingVars = templateVars.filter(varName => !(varName in route))
      if (missingVars.length > 0) {
        console.warn(
          `⚠️  Route ${index + 1}: Missing variables: ${missingVars.join(', ')}`
        )
      }

      // Replace all template variables with values from the route mapping
      prompt = prompt.replace(/\$\{url\}/g, route.url)
      prompt = prompt.replace(/\$\{pagePath\}/g, route.pagePath)
      prompt = prompt.replace(/\$\{mockuiFile\}/g, route.mockuiFile)
      prompt = prompt.replace(
        /\$\{relevantAPIs\}/g,
        route.relevantAPIs.join(', ')
      )
      prompt = prompt.replace(/\$\{notes\}/g, route.notes)

      // Check if any unreplaced variables remain
      const remainingVars = findTemplateVars(prompt)
      if (remainingVars.length > 0) {
        console.warn(
          `⚠️  Route ${index + 1}: Unreplaced variables: ${remainingVars.join(', ')}`
        )
      }

      // Generate output filename
      const outputFilename = pagePathToFilename(route.pagePath)
      const outputPath = path.join(outputDir, outputFilename)

      // Save the file
      fs.writeFileSync(outputPath, prompt, 'utf-8')

      console.log(`✓ ${outputFilename}`)
      successCount++
    } catch (error) {
      console.error(
        `✗ Route ${index + 1} (${route.pagePath}): ${error.message}`
      )
      errorCount++
    }
  })

  console.log(
    `\nComplete: ${successCount} files generated, ${errorCount} errors`
  )
}

// Run the script if executed directly
if (require.main === module) {
  generateAndSavePrompts()
}

// Export for use as a module
module.exports = {
  generateAndSavePrompts,
  pagePathToFilename,
  findTemplateVars,
}

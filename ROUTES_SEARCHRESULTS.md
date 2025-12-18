# Query: export async function (POST|GET|UPDATE|DELETE)

# Flags: RegExp

# Excluding: \*.md

# ContextLines: 1

50 results - 34 files

src/app/api/admin/backup/route.ts:
97 // POST /api/admin/backup - Create a new backup
98: export async function POST() {
99 try {

179 // GET /api/admin/backup - List available backups
180: export async function GET() {
181 try {

src/app/api/admin/backup/download/[filename]/route.ts:
9  
 10: export async function GET(
11 request: NextRequest,

src/app/api/admin/notifications/route.ts:
13 \*/
14: export async function GET(request: Request) {
15 try {

55 \*/
56: export async function POST(request: Request) {
57 try {

src/app/api/admin/notifications/[id]/route.ts:
17 \*/
18: export async function GET(\_request: Request, { params }: Params) {
19 try {

102 \*/
103: export async function DELETE(\_request: Request, { params }: Params) {
104 try {

src/app/api/admin/scheduled-backup/route.ts:
103  
 104: export async function POST(request: Request) {
105 // Validate scheduler authentication

src/app/api/admin/updates/[id]/route.ts:
17 \*/
18: export async function GET(\_request: Request, { params }: Params) {
19 try {

46 \*/
47: export async function DELETE(\_request: Request, { params }: Params) {
48 try {

src/app/api/admin/updates/[id]/approve/route.ts:
25 \*/
26: export async function POST(request: Request, { params }: Params) {
27 try {

src/app/api/admin/updates/execute/route.ts:
39 \*/
40: export async function POST(request: Request) {
41 // Validate scheduler authentication

src/app/api/admin/updates/pending/route.ts:
13 \*/
14: export async function GET(request: Request) {
15 try {

src/app/api/admin/version-check/route.ts:
32  
 33: export async function POST(request: Request) {
34 // Validate scheduler authentication

174 \*/
175: export async function GET() {
176 try {

src/app/api/animals/route.ts:
207 // GET /api/animals?q=john+smith&page=1
208: export async function GET(request: NextRequest) {
209 return withRateLimit(

514 // POST /api/animals - Create new animal
515: export async function POST(request: NextRequest) {
516 return withRateLimit(

src/app/api/animals/[id]/route.ts:
7  
 8: export async function GET(
9 request: NextRequest,

180  
 181: export async function DELETE(
182 request: NextRequest,

src/app/api/animals/[id]/notes/route.ts:
6 // GET /api/animals/[id]/notes - List animal's service notes
7: export async function GET(
8 request: NextRequest,

35 // POST /api/animals/[id]/notes - Create service note for animal
36: export async function POST(
37 request: NextRequest,

src/app/api/animals/[id]/notes/count/route.ts:
5  
 6: export async function GET(
7 request: NextRequest,

src/app/api/breeds/route.ts:
5  
 6: export async function GET(request: NextRequest) {
7 return withRateLimit(

25  
 26: export async function POST(request: NextRequest) {
27 return withRateLimit(

src/app/api/breeds/[id]/route.ts:
5  
 6: export async function GET(
7 request: NextRequest,

96  
 97: export async function DELETE(
98 request: NextRequest,

src/app/api/breeds/[id]/animals/count/route.ts:
4  
 5: export async function GET(
6 request: Request,

src/app/api/breeds/pricing/route.ts:
23  
 24: export async function POST(request: NextRequest) {
25 try {

src/app/api/customers/route.ts:
57 // GET /api/customers?q=smith&page=1&limit=20
58: export async function GET(request: NextRequest) {
59 return withRateLimit(

199 // POST /api/customers - Create new customer
200: export async function POST(request: NextRequest) {
201 return withRateLimit(

src/app/api/customers/[id]/route.ts:
9 // GET /api/customers/[id] - Get single customer with all animals
10: export async function GET(
11 request: NextRequest,

250 // DELETE /api/customers/[id] - Delete customer (with optional selective animal migration)
251: export async function DELETE(
252 request: NextRequest,

src/app/api/customers/[id]/animals/count/route.ts:
4  
 5: export async function GET(
6 request: Request,

src/app/api/customers/history/route.ts:
18  
 19: export async function GET(request: NextRequest) {
20 const { searchParams } = new URL(request.url)

src/app/api/docs/openapi.json/route.ts:
9 \*/
10: export async function GET() {
11 const spec = {

src/app/api/health/route.ts:
69 \*/
70: export async function GET() {
71 try {

115 \*/
116: export async function POST() {
117 try {

src/app/api/notes/[noteId]/route.ts:
5  
 6: export async function GET(
7 request: NextRequest,

71  
 72: export async function DELETE(
73 request: NextRequest,

src/app/api/reports/analytics/route.ts:
18  
 19: export async function GET(request: NextRequest) {
20 return withRateLimit(

src/app/api/reports/daily-totals/route.ts:
24  
 25: export async function GET(request: NextRequest) {
26 return withRateLimit(

src/app/api/reports/staff-summary/route.ts:
26 \*/
27: export async function GET(request: NextRequest) {
28 return withRateLimit(

src/app/api/setup/import/route.ts:
64  
 65: export async function GET(request: NextRequest) {
66 const uploadId = request.nextUrl.searchParams.get('uploadId')

src/app/api/setup/upload/route.ts:
36  
 37: export async function POST(request: Request) {
38 try {

src/lib/docs.ts:
13  
 14: export async function getDocsTree(): Promise<DocNode[]> {
15 // If docs dir doesn't exist, return empty

src/lib/github-releases.ts:
68 \*/
69: export async function getReleaseNotes(
70 version: string

125 \*/
126: export async function getLatestRelease(): Promise<ReleaseInfo | null> {
127 const url = `${githubConfig.apiUrl}/repos/${githubConfig.owner}/${githubConfig.repo}/releases/latest`

166 \*/
167: export async function getReleases(limit: number = 10): Promise<ReleaseInfo[]> {
168 const url = `${githubConfig.apiUrl}/repos/${githubConfig.owner}/${githubConfig.repo}/releases?per_page=${limit}`

src/lib/middleware/rateLimit.ts:
69 _ ```ts
70: _ export async function GET(request: NextRequest) {
71 \* return withRateLimit(request, async () => {

src/lib/setup/tempDb.ts:
168 \*/
169: export async function getTempDbCounts(
170 tempPrisma: PrismaClient

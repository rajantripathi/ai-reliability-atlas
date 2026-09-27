/** Anonymous, read-only smoke check of the deployed site and release evidence. */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const origin='https://rajan-ai-reliability-atlas.rajantripathi22.chatgpt.site';
const manifest=JSON.parse(readFileSync(new URL('../public/evidence/atlas.json',import.meta.url),'utf8'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
async function check(name,url,expectedHash,expectedText){
  const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
  if(!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
  const bytes=Buffer.from(await response.arrayBuffer());
  if(expectedHash&&hash(bytes)!==expectedHash) throw new Error(`${name}: checksum mismatch`);
  if(expectedText&&!bytes.toString().includes(expectedText)) throw new Error(`${name}: expected content absent (possible sign-in page)`);
  return {name,status:response.status,verified:true};
}
const checks=[
  check('Public site',origin,undefined,'Watch a missing source change the result.'),
  check('Public code','https://github.com/rajantripathi/ai-reliability-atlas',undefined,'AI Reliability Atlas'),
  check('Reading notes',`${origin}/evidence/reading-notes.md`,undefined,'not be interpreted as validated perfect grounding'),
  check('Download bundle',`${origin}/evidence/source-bundle.zip`,hash(readFileSync(new URL('../public/evidence/source-bundle.zip',import.meta.url)))),
  ...manifest.sources.flatMap(source=>[
    check(`Site snapshot: ${source.name}`,`${origin}${source.snapshot}`,source.sha256),
    check(`Release snapshot: ${source.name}`,source.url.replace('github.com/','raw.githubusercontent.com/').replace('/blob/','/'),source.sha256),
  ]),
];
const results=await Promise.allSettled(checks);
console.log(JSON.stringify(results.map(r=>r.status==='fulfilled'?r.value:{error:r.reason.message}),null,2));
if(results.some(r=>r.status==='rejected')) process.exitCode=1;
